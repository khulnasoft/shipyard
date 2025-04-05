import * as ConfigHelpers from '@/utils/ConfigHelpers';
import ConfigAccumulator from '@/utils/ConfigAccumalator';
import filterUserSections from '@/utils/CheckSectionVisibility';
import { languages } from '@/utils/languages';
import {
  visibleComponents,
  localStorageKeys,
} from '@/utils/defaults';
import ErrorHandler from '@/utils/ErrorHandler';

// Mock dependencies
jest.mock('@/utils/ConfigAccumalator');
jest.mock('@/utils/CheckSectionVisibility');
jest.mock('@/utils/ErrorHandler');
jest.mock('@/utils/ConfigSchema.json', () => ({
  properties: {
    sections: {
      items: {
        properties: {
          items: {
            items: {
              properties: {
                target: {
                  enum: ['_blank', '_self', '_parent', '_top', 'iframe', 'newtab']
                }
              }
            }
          }
        }
      }
    }
  }
}));

// Skip the initialization of config
jest.mock('@/utils/ConfigHelpers', () => {
  const originalModule = jest.requireActual('@/utils/ConfigHelpers');
  return {
    ...originalModule,
    config: {
      appConfig: { language: 'en' },
      pageInfo: {},
      sections: []
    }
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ConfigHelpers', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock ConfigAccumulator implementation
    (ConfigAccumulator as jest.Mock).mockImplementation(() => ({
      appConfig: jest.fn().mockReturnValue({ language: 'en' }),
      pageInfo: jest.fn().mockReturnValue({}),
      sections: jest.fn().mockReturnValue([])
    }));
    
    // Mock filterUserSections to return the input
    (filterUserSections as jest.Mock).mockImplementation((sections) => sections);
  });

  describe('makePageName', () => {
    test('should convert page name to lowercase and replace spaces with hyphens', () => {
      expect(ConfigHelpers.makePageName('Page Name')).toBe('page-name');
    });

    test('should remove .yml extension', () => {
      expect(ConfigHelpers.makePageName('page.yml')).toBe('page');
    });

    test('should remove special characters', () => {
      expect(ConfigHelpers.makePageName('page-name!@#$%^&*()')).toBe('page-name');
    });

    test('should return default name if input is falsy', () => {
      expect(ConfigHelpers.makePageName('')).toBe('unnamed-page');
      expect(ConfigHelpers.makePageName(null as any)).toBe('unnamed-page');
      expect(ConfigHelpers.makePageName(undefined as any)).toBe('unnamed-page');
    });
  });

  describe('makePageSlug', () => {
    test('should create a page slug with pageType and formatted page name', () => {
      expect(ConfigHelpers.makePageSlug('Page Name', 'custom')).toBe('/custom/page-name');
    });

    test('should handle page names with special characters and extensions', () => {
      expect(ConfigHelpers.makePageSlug('Page.yml with @#$ chars', 'type')).toBe('/type/pageyml-with--chars');
    });
  });

  describe('formatConfigPath', () => {
    test('should return path as-is if it includes http', () => {
      expect(ConfigHelpers.formatConfigPath('http://example.com/config')).toBe('http://example.com/config');
      expect(ConfigHelpers.formatConfigPath('https://example.com/config')).toBe('https://example.com/config');
    });

    test('should add leading / if not present and not http', () => {
      expect(ConfigHelpers.formatConfigPath('api/config')).toBe('/api/config');
    });

    test('should return path as-is if it already has leading /', () => {
      expect(ConfigHelpers.formatConfigPath('/api/config')).toBe('/api/config');
    });
  });

  describe('componentVisibility', () => {
    const defaultVisibility = {
      pageTitle: visibleComponents.pageTitle,
      navigation: visibleComponents.navigation,
      searchBar: visibleComponents.searchBar,
      settings: visibleComponents.settings,
      footer: visibleComponents.footer,
    };

    test('should return default visibility when appConfig.hideComponents is undefined', () => {
      expect(ConfigHelpers.componentVisibility({})).toEqual(defaultVisibility);
    });

    test('should respect user choices when hideComponents is specified', () => {
      const appConfig = {
        hideComponents: {
          hideHeading: true,
          hideNav: false,
          hideSearch: true,
          hideSettings: false,
          hideFooter: true,
        }
      };
      
      expect(ConfigHelpers.componentVisibility(appConfig)).toEqual({
        pageTitle: false, // inverse of hideHeading
        navigation: true, // inverse of hideNav
        searchBar: false, // inverse of hideSearch
        settings: true, // inverse of hideSettings
        footer: false, // inverse of hideFooter
      });
    });

    test('should ignore non-boolean values in hideComponents', () => {
      const appConfig = {
        hideComponents: {
          hideHeading: 'true' as any, // Not a boolean
          hideNav: true,
        }
      };
      
      expect(ConfigHelpers.componentVisibility(appConfig)).toEqual({
        ...defaultVisibility,
        navigation: false, // Only this should change
      });
    });
  });

  describe('getCustomKeyShortcuts', () => {
    test('should extract items with hotkeys from sections', () => {
      const sections = [
        {
          name: 'Section 1',
          items: [
            { title: 'Item 1', url: 'url1', hotkey: 'a' },
            { title: 'Item 2', url: 'url2' },
          ]
        },
        {
          name: 'Section 2',
          items: [
            { title: 'Item 3', url: 'url3', hotkey: 'b' },
            { title: 'Item 4', url: 'url4', hotkey: 'c' },
          ]
        }
      ];
      
      const expected = [
        { hotkey: 'a', url: 'url1' },
        { hotkey: 'b', url: 'url3' },
        { hotkey: 'c', url: 'url4' },
      ];
      
      expect(ConfigHelpers.getCustomKeyShortcuts(sections)).toEqual(expected);
    });

    test('should return empty array if no items with hotkeys exist', () => {
      const sections = [
        {
          name: 'Section 1',
          items: [
            { title: 'Item 1', url: 'url1' },
            { title: 'Item 2', url: 'url2' },
          ]
        }
      ];
      
      expect(ConfigHelpers.getCustomKeyShortcuts(sections)).toEqual([]);
    });

    test('should handle empty sections array', () => {
      expect(ConfigHelpers.getCustomKeyShortcuts([])).toEqual([]);
    });
  });

  describe('getUsersLanguage', () => {
    beforeEach(() => {
      // Mock languages array
      Object.defineProperty(languages, 0, {
        value: { code: 'en', name: 'English', flag: '🇬🇧' },
        configurable: true
      });
      Object.defineProperty(languages, 1, {
        value: { code: 'fr', name: 'French', flag: '🇫🇷' },
        configurable: true
      });
      Object.defineProperty(languages, 'find', {
        value: jest.fn().mockImplementation((callback) => {
          if (callback({ code: 'en' })) return { code: 'en', name: 'English', flag: '🇬🇧' };
          if (callback({ code: 'fr' })) return { code: 'fr', name: 'French', flag: '🇫🇷' };
          return undefined;
        }),
        configurable: true
      });
    });

    test('should get language from localStorage if available', () => {
      localStorage.setItem(localStorageKeys.LANGUAGE, 'fr');
      expect(ConfigHelpers.getUsersLanguage()).toEqual({ code: 'fr', name: 'French', flag: '🇫🇷' });
    });

    test('should fall back to appConfig.language if localStorage not set', () => {
      // appConfig.language is set to 'en' in the beforeEach
      expect(ConfigHelpers.getUsersLanguage()).toEqual({ code: 'en', name: 'English', flag: '🇬🇧' });
    });
  });

  describe('targetValidator', () => {
    test('should return true for valid targets', () => {
      expect(ConfigHelpers.targetValidator('_blank')).toBe(true);
      expect(ConfigHelpers.targetValidator('_self')).toBe(true);
      expect(ConfigHelpers.targetValidator('iframe')).toBe(true);
    });

    test('should return false and call ErrorHandler for invalid targets', () => {
      expect(ConfigHelpers.targetValidator('invalid-target')).toBe(false);
      expect(ErrorHandler).toHaveBeenCalledWith('Unknown target value: invalid-target');
    });
  });
});

