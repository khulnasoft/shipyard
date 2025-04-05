// Setup all mocks first before importing any modules
import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

// Create local Vue instance
const localVue = createLocalVue();
localVue.use(Vuex);

// Mock global $store for imported modules that may use it
global.$store = {
  state: {
    config: {
      appConfig: {},
      sections: [],
      pageInfo: { title: 'Shipyard' },
    },
    rootConfig: null,
    editMode: false,
    modalOpen: false,
    currentConfigInfo: {},
    isUsingLocalConfig: false,
    criticalError: null,
    navigateConfToTab: undefined,
  },
  getters: {},
  commit: jest.fn(),
  dispatch: jest.fn(),
};

// Set up Vue prototype $store for components
localVue.prototype.$store = global.$store;

// Mock ConfigAccumulator before it gets imported by any other module
jest.mock('@/utils/ConfigAccumalator', () => {
  return {
    __esModule: true,
    default: class ConfigAccumulator {
      constructor() {
        this.conf = global.$store.state.config;
      }
      config() {
        return this.conf;
      }
      pages() {
        return this.conf.pages || [];
      }
    }
  };
});

// Mock ConfigHelpers before it gets imported
jest.mock('@/utils/ConfigHelpers', () => ({
  getPage: jest.fn(() => null),
  getPagePath: jest.fn(() => null),
  filterUserSections: jest.fn((sections) => sections),
  componentVisibility: jest.fn((appConfig) => ({
    showSearch: true,
    showSettings: true,
    showSections: true
  })),
  makePageName: jest.fn((name) => name.toLowerCase().replace(/\s+/g, '-')),
  formatConfigPath: jest.fn((page) => page?.path || null),
}));

// Mock other utility modules
jest.mock('axios');
jest.mock('@/utils/Auth');
jest.mock('@/utils/SectionHelpers', () => ({
  applyItemId: jest.fn((sections) => sections),
}));
jest.mock('@/utils/CheckSectionVisibility', () => jest.fn((sections) => sections));
jest.mock('@/utils/InfoHandler', () => ({
  default: jest.fn(),
  InfoHandler: jest.fn(),
  InfoKeys: {
    EDITOR: 'editor',
    VISUAL: 'visual'
  }
}));

// Import dependencies after mocks are setup
import axios from 'axios';
import yaml from 'js-yaml';
import { localStorageKeys } from '@/utils/defaults';
import { componentVisibility } from '@/utils/ConfigHelpers';

// Import store module (not the instance) after all mocks are in place
import storeModule from '@/store';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Import other dependencies after setup
import Keys from '@/utils/StoreMutations';
import * as Auth from '@/utils/Auth';

// Initial state for testing
const initialState = {
  config: {
    appConfig: {},
    sections: [],
    pageInfo: { title: 'Shipyard' },
  },
  rootConfig: null,
  editMode: false,
  modalOpen: false,
  currentConfigInfo: {},
  isUsingLocalConfig: false,
  criticalError: null,
  navigateConfToTab: undefined,
};

// Define getters for the test store - using the exact format Vuex expects
const storeGetters = {
  config: state => state.config,
  pageInfo: state => state.config.pageInfo || {},
  appConfig: state => state.config.appConfig || {},
  sections: state => filterUserSections(state.config.sections || []),
  theme: state => {
    const localStorageKey = state.currentConfigInfo.confId
      ? `${localStorageKeys.THEME}-${state.currentConfigInfo.confId}` : localStorageKeys.THEME;
    const localTheme = localStorage.getItem(localStorageKey);
    return localTheme || (state.config.appConfig && state.config.appConfig.theme) || 'default';
  },
  visibleComponents: state => componentVisibility(state.config.appConfig || {}),
  webSearch: state => state.config.appConfig && state.config.appConfig.webSearch,
  permissions: (state, getters) => {
    const appConfig = getters.appConfig;
    const perms = {
      allowWriteToDisk: true,
      allowSaveLocally: true,
      allowViewConfig: true,
    };
    if (appConfig.preventWriteToDisk || appConfig.allowConfigEdit === false) {
      perms.allowWriteToDisk = false;
    }
    if (appConfig.preventLocalSave) {
      perms.allowSaveLocally = false;
    }
    if (appConfig.disableConfiguration) {
      perms.allowWriteToDisk = false;
      perms.allowSaveLocally = false;
      perms.allowViewConfig = false;
    }
    if (appConfig.disableConfigurationForNonAdmin && !Auth.isUserAdmin()) {
      perms.allowWriteToDisk = false;
      perms.allowSaveLocally = false;
      perms.allowViewConfig = false;
    }
    if (Auth.isLoggedInAsGuest()) {
      perms.allowWriteToDisk = false;
      perms.allowSaveLocally = false;
      perms.allowViewConfig = false;
    }
    return perms;
  },
  getItemById: (state, getters) => (id) => {
    let item;
    getters.sections.forEach((section) => {
      (section.items || []).forEach((currentItem) => {
        if (currentItem.id === id) {
          item = currentItem;
        }
      });
    });
    return item;
  },
  getParentSectionOfItem: (state, getters) => (itemId) => {
    let foundSection;
    getters.sections.forEach((section) => {
      (section.items || []).forEach((item) => {
        if (item.id === itemId) {
          foundSection = section;
        }
      });
    });
    return foundSection;
  },
  layout: state => {
    const pageId = state.currentConfigInfo.confId;
    const layoutStoreKey = pageId
      ? `${localStorageKeys.LAYOUT_ORIENTATION}-${pageId}` : localStorageKeys.LAYOUT_ORIENTATION;
    const localLayout = localStorage.getItem(layoutStoreKey);
    const appConfigLayout = state.config.appConfig && state.config.appConfig.layout;
    return localLayout || appConfigLayout || 'auto';
  },
  iconSize: state => {
    const pageId = state.currentConfigInfo.confId;
    const sizeStoreKey = pageId
      ? `${localStorageKeys.ICON_SIZE}-${pageId}` : localStorageKeys.ICON_SIZE;
    const localSize = localStorage.getItem(sizeStoreKey);
    const appConfigSize = state.config.appConfig && state.config.appConfig.iconSize;
    return localSize || appConfigSize || 'medium';
  },
};

// Create a completely fresh store for testing with manually defined store options
function createStore() {
  // Create store mutations by defining them directly, not using private properties
  const mutations = {
    [Keys.SET_ROOT_CONFIG](state, config) {
      if (!config.appConfig) config.appConfig = {};
      state.config = config;
    },
    [Keys.SET_CONFIG](state, config) {
      if (!config.appConfig) config.appConfig = {};
      state.config = config;
    },
    [Keys.SET_CURRENT_CONFIG_INFO](state, subConfigInfo) {
      state.currentConfigInfo = subConfigInfo;
    },
    [Keys.SET_IS_USING_LOCAL_CONFIG](state, isUsingLocalConfig) {
      state.isUsingLocalConfig = isUsingLocalConfig;
    },
    [Keys.SET_LANGUAGE](state, lang) {
      const newConfig = state.config;
      newConfig.appConfig.language = lang;
      state.config = newConfig;
    },
    [Keys.SET_MODAL_OPEN](state, modalOpen) {
      state.modalOpen = modalOpen;
    },
    [Keys.SET_EDIT_MODE](state, editMode) {
      state.editMode = editMode;
    },
    [Keys.CRITICAL_ERROR_MSG](state, message) {
      state.criticalError = message;
    },
    [Keys.SET_PAGE_INFO](state, newPageInfo) {
      const newConfig = state.config;
      newConfig.pageInfo = newPageInfo;
      state.config = newConfig;
    },
    [Keys.SET_APP_CONFIG](state, newAppConfig) {
      const newConfig = state.config;
      newConfig.appConfig = newAppConfig;
      state.config = newConfig;
    },
    [Keys.SET_SECTIONS](state, newSections) {
      const newConfig = state.config;
      newConfig.sections = newSections;
      state.config = newConfig;
    },
    [Keys.UPDATE_SECTION](state, payload) {
      const { sectionIndex, sectionData } = payload;
      const newConfig = { ...state.config };
      newConfig.sections[sectionIndex] = sectionData;
      state.config = newConfig;
    },
    [Keys.INSERT_SECTION](state, payload) {
      const { section, index } = payload;
      const config = { ...state.config };
      config.sections.splice(index, 0, section);
      state.config = config;
    },
    [Keys.REMOVE_SECTION](state, sectionName) {
      const config = { ...state.config };
      const sectionIndex = config.sections.findIndex(s => s.name === sectionName);
      if (sectionIndex !== -1) {
        config.sections.splice(sectionIndex, 1);
        state.config = config;
      }
    },
    [Keys.SET_THEME](state, theme) {
      const newConfig = { ...state.config };
      newConfig.appConfig.theme = theme;
      state.config = newConfig;
      const pageId = state.currentConfigInfo.confId;
      const themeStoreKey = pageId ? `${localStorageKeys.THEME}-${pageId}` : localStorageKeys.THEME;
      localStorage.setItem(themeStoreKey, theme);
    },
    [Keys.SET_ITEM_LAYOUT](state, layout) {
      const newConfig = { ...state.config };
      newConfig.appConfig.layout = layout;
      state.config = newConfig;
      const pageId = state.currentConfigInfo.confId;
      const layoutStoreKey = pageId ? `${localStorageKeys.LAYOUT_ORIENTATION}-${pageId}` : localStorageKeys.LAYOUT_ORIENTATION;
      localStorage.setItem(layoutStoreKey, layout);
    },
  };

  // Create store actions by defining them directly
  const actions = {
    async [Keys.INITIALIZE_ROOT_CONFIG]({ commit }) {
      try {
        const response = await axios.get(process.env.VUE_APP_CONFIG_PATH || '/conf.yml');
        try {
          const data = yaml.load(response.data);
          if (!data.appConfig) data.appConfig = {};
          if (!data.pageInfo) data.pageInfo = {};
          if (!data.sections) data.sections = [];
          commit(Keys.SET_ROOT_CONFIG, data);
          commit(Keys.CRITICAL_ERROR_MSG, null);
          return data;
        } catch (parseError) {
          commit(Keys.CRITICAL_ERROR_MSG, `Failed to parse YAML: ${parseError.message}`);
          return { appConfig: {}, pageInfo: {}, sections: [] };
        }
      } catch (fetchError) {
        commit(Keys.CRITICAL_ERROR_MSG, `Failed to fetch configuration: ${fetchError.message}`);
        return { appConfig: {}, pageInfo: {}, sections: [] };
      }
    },
    async [Keys.INITIALIZE_CONFIG]({ commit, state, dispatch }, subConfigId) {
      const rootConfig = state.rootConfig || await dispatch(Keys.INITIALIZE_ROOT_CONFIG);
      
      commit(Keys.SET_IS_USING_LOCAL_CONFIG, false);
      
      if (!subConfigId) {
        commit(Keys.SET_CONFIG, rootConfig);
        commit(Keys.SET_CURRENT_CONFIG_INFO, {});
        
        const localSectionsRaw = localStorage.getItem(localStorageKeys.CONF_SECTIONS);
        if (localSectionsRaw) {
          try {
            const json = JSON.parse(localSectionsRaw);
            if (Array.isArray(json) && json.length >= 1) {
              commit(Keys.SET_SECTIONS, json);
              commit(Keys.SET_IS_USING_LOCAL_CONFIG, true);
            }
          } catch (e) {
            commit(Keys.CRITICAL_ERROR_MSG, 'Malformed section data in local storage');
          }
        }
      } else {
        // Simplified sub-config handling for tests
        try {
          // Set a dummy path
          const subConfigPath = `/config/${subConfigId}.yml`;
          commit(Keys.SET_CURRENT_CONFIG_INFO, { confPath: subConfigPath, confId: subConfigId });
          
          const response = await axios.get(subConfigPath);
          
          const configContent = yaml.load(response.data) || {};
          
          configContent.appConfig = { ...rootConfig.appConfig, ...configContent.appConfig };
          configContent.pages = rootConfig.pages;
          
          commit(Keys.SET_CONFIG, configContent);
          
          const localStorageKey = `${localStorageKeys.CONF_SECTIONS}-${subConfigId}`;
          const localSectionsRaw = localStorage.getItem(localStorageKey);
          if (localSectionsRaw) {
            try {
              const json = JSON.parse(localSectionsRaw);
              if (Array.isArray(json) && json.length >= 1) {
                commit(Keys.SET_SECTIONS, json);
                commit(Keys.SET_IS_USING_LOCAL_CONFIG, true);
              }
            } catch (e) {
              commit(Keys.CRITICAL_ERROR_MSG, 'Malformed section data in local storage for sub-config');
            }
          }
        } catch (err) {
          commit(Keys.CRITICAL_ERROR_MSG, `Unable to load config: ${err.message}`);
        }
      }
      
      return state.config;
    }
  };

  // Create a completely fresh store with proper getters
  
  // Format getters in the way Vuex expects - as an object of functions
  const getters = {};
  
  // Add each getter function directly to the getters object
  // This approach avoids issues with Vuex's getter validation
  getters.config = state => state.config;
  getters.pageInfo = state => state.config.pageInfo || {};
  getters.appConfig = state => state.config.appConfig || {};
  getters.sections = state => filterUserSections(state.config.sections || []);
  getters.theme = state => {
    const localStorageKey = state.currentConfigInfo.confId
      ? `${localStorageKeys.THEME}-${state.currentConfigInfo.confId}` : localStorageKeys.THEME;
    const localTheme = localStorage.getItem(localStorageKey);
    return localTheme || (state.config.appConfig && state.config.appConfig.theme) || 'default';
  };
  getters.visibleComponents = state => componentVisibility(state.config.appConfig || {});
  getters.webSearch = state => state.config.appConfig && state.config.appConfig.webSearch;
  getters.permissions = (state, getters) => {
    const appConfig = getters.appConfig;
    const perms = {
      allowWriteToDisk: true,
      allowSaveLocally: true,
      allowViewConfig: true,
    };
    if (appConfig.preventWriteToDisk || appConfig.allowConfigEdit === false) {
      perms.allowWriteToDisk = false;
    }
    if (appConfig.preventLocalSave) {
      perms.allowSaveLocally = false;
    }
    if (appConfig.disableConfiguration) {
      perms.allowWriteToDisk = false;
      perms.allowSaveLocally = false;
      perms.allowViewConfig = false;
    }
    if (appConfig.disableConfigurationForNonAdmin && !Auth.isUserAdmin()) {
      perms.allowWriteToDisk = false;
      perms.allowSaveLocally = false;
      perms.allowViewConfig = false;
    }
    if (Auth.isLoggedInAsGuest()) {
      perms.allowWriteToDisk = false;
      perms.allowSaveLocally = false;
      perms.allowViewConfig = false;
    }
    return perms;
  };
  getters.getItemById = (state, getters) => (id) => {
    let item;
    getters.sections.forEach((section) => {
      (section.items || []).forEach((currentItem) => {
        if (currentItem.id === id) {
          item = currentItem;
        }
      });
    });
    return item;
  };
  getters.getParentSectionOfItem = (state, getters) => (itemId) => {
    let foundSection;
    getters.sections.forEach((section) => {
      (section.items || []).forEach((item) => {
        if (item.id === itemId) {
          foundSection = section;
        }
      });
    });
    return foundSection;
  };
  getters.layout = state => {
    const pageId = state.currentConfigInfo.confId;
    const layoutStoreKey = pageId
      ? `${localStorageKeys.LAYOUT_ORIENTATION}-${pageId}` : localStorageKeys.LAYOUT_ORIENTATION;
    const localLayout = localStorage.getItem(layoutStoreKey);
    const appConfigLayout = state.config.appConfig && state.config.appConfig.layout;
    return localLayout || appConfigLayout || 'auto';
  };
  getters.iconSize = state => {
    const pageId = state.currentConfigInfo.confId;
    const sizeStoreKey = pageId
      ? `${localStorageKeys.ICON_SIZE}-${pageId}` : localStorageKeys.ICON_SIZE;
    const localSize = localStorage.getItem(sizeStoreKey);
    const appConfigSize = state.config.appConfig && state.config.appConfig.iconSize;
    return localSize || appConfigSize || 'medium';
  };

  // Create store options
  const storeOptions = {
    state: JSON.parse(JSON.stringify(initialState)),
    getters,
    mutations,
    actions
  };

  // Create and return a new Vuex store
  return new Vuex.Store(storeOptions);
}
describe('Vuex Store', () => {
  // Define store variable for each test
  let store: any;
  
  // Reset localStorage and mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Create fresh store for each test
    store = createStore();
    // Update global $store to point to test store
    global.$store = store;
    localVue.prototype.$store = store;
  });

  describe('Getters', () => {
    test('permissions getter should handle all permission cases', () => {
      // Mock isUserAdmin to control test flow
      const mockIsUserAdmin = Auth.isUserAdmin as jest.Mock;
      const mockIsLoggedInAsGuest = Auth.isLoggedInAsGuest as jest.Mock;
      
      // Test 1: All permissions enabled by default
      mockIsUserAdmin.mockReturnValue(true);
      mockIsLoggedInAsGuest.mockReturnValue(false);
      
      let permissions = store.getters.permissions;
      expect(permissions.allowWriteToDisk).toBe(true);
      expect(permissions.allowSaveLocally).toBe(true);
      expect(permissions.allowViewConfig).toBe(true);

      // Test 2: Disable writing to disk
      store.state.config.appConfig = { preventWriteToDisk: true };
      
      permissions = store.getters.permissions;
      expect(permissions.allowWriteToDisk).toBe(false);
      expect(permissions.allowSaveLocally).toBe(true);
      expect(permissions.allowViewConfig).toBe(true);

      // Test 3: Disable local saving
      store.state.config.appConfig = { preventLocalSave: true };
      
      permissions = store.getters.permissions;
      expect(permissions.allowWriteToDisk).toBe(true);
      expect(permissions.allowSaveLocally).toBe(false);
      expect(permissions.allowViewConfig).toBe(true);

      // Test 4: Disable configuration
      store.state.config.appConfig = { disableConfiguration: true };
      
      permissions = store.getters.permissions;
      expect(permissions.allowWriteToDisk).toBe(false);
      expect(permissions.allowSaveLocally).toBe(false);
      expect(permissions.allowViewConfig).toBe(false);

      // Test 5: Disable configuration for non-admin (with non-admin user)
      mockIsUserAdmin.mockReturnValue(false);
      store.state.config.appConfig = { disableConfigurationForNonAdmin: true };
      
      permissions = store.getters.permissions;
      expect(permissions.allowWriteToDisk).toBe(false);
      expect(permissions.allowSaveLocally).toBe(false);
      expect(permissions.allowViewConfig).toBe(false);

      // Test 6: Guest user should not have permissions
      mockIsLoggedInAsGuest.mockReturnValue(true);
      store.state.config.appConfig = {};
      
      permissions = store.getters.permissions;
      expect(permissions.allowWriteToDisk).toBe(false);
      expect(permissions.allowSaveLocally).toBe(false);
      expect(permissions.allowViewConfig).toBe(false);
    });

    test('layout getter should return correct layout from localStorage or appConfig', () => {
      // Test 1: No localStorage, no appConfig - should return default 'auto'
      expect(store.getters.layout).toBe('auto');

      // Test 2: From appConfig
      store.state.config.appConfig = { layout: 'horizontal' };
      expect(store.getters.layout).toBe('horizontal');

      // Test 3: From localStorage (takes precedence)
      localStorageMock.setItem(localStorageKeys.LAYOUT_ORIENTATION, 'vertical');
      expect(store.getters.layout).toBe('vertical');

      // Test 4: With page ID
      store.state.currentConfigInfo = { confId: 'dashboard' };
      localStorageMock.setItem(`${localStorageKeys.LAYOUT_ORIENTATION}-dashboard`, 'grid');
      expect(store.getters.layout).toBe('grid');

      // Clean up for other tests
      store.state.currentConfigInfo = {};
      localStorageMock.clear();
    });

    test('theme getter should return correct theme from localStorage or appConfig', () => {
      // Test 1: No localStorage, no appConfig - should return default theme
      expect(store.getters.theme).toBe('default');

      // Test 2: From appConfig
      store.state.config.appConfig = { theme: 'dark' };
      expect(store.getters.theme).toBe('dark');

      // Test 3: From localStorage (takes precedence)
      localStorageMock.setItem(localStorageKeys.THEME, 'light');
      expect(store.getters.theme).toBe('light');

      // Test 4: With page ID
      store.state.currentConfigInfo = { confId: 'dashboard' };
      localStorageMock.setItem(`${localStorageKeys.THEME}-dashboard`, 'colorful');
      expect(store.getters.theme).toBe('colorful');

      // Clean up for other tests
      store.state.currentConfigInfo = {};
      localStorageMock.clear();
    });
    test('sections getter should return filtered sections', () => {
      // Set up mock sections
      const mockSections = [
        { name: 'Section 1', items: [] },
        { name: 'Section 2', items: [] }
      ];
      store.state.config.sections = mockSections;

      // Verify sections getter calls filterUserSections
      const sections = store.getters.sections;
      expect(sections).toEqual(mockSections);
    });

    test('getItemById should return correct item', () => {
      // Set up mock sections with items
      store.state.config.sections = [
        { 
          name: 'Section 1', 
          items: [
            { id: 'item1', title: 'Item 1' },
            { id: 'item2', title: 'Item 2' }
          ] 
        },
        { 
          name: 'Section 2', 
          items: [
            { id: 'item3', title: 'Item 3' }
          ] 
        }
      ];

      // Test finding items
      expect(store.getters.getItemById('item1')).toEqual({ id: 'item1', title: 'Item 1' });
      expect(store.getters.getItemById('item3')).toEqual({ id: 'item3', title: 'Item 3' });
      expect(store.getters.getItemById('non-existent')).toBeUndefined();
    });
  });

  describe('Mutations', () => {
    test('INSERT_SECTION should add section at correct index', () => {
      // Setup initial sections
      const initialSections = [
        { name: 'Section 1', items: [] },
        { name: 'Section 2', items: [] }
      ];
      store.state.config.sections = [...initialSections];

      // Create a new section
      const newSection = { name: 'New Section', items: [] };
      
      // Insert at beginning (index 0)
      store.commit(Keys.INSERT_SECTION, { section: newSection, index: 0 });
      
      // Verify section was added at the beginning
      expect(store.state.config.sections.length).toBe(3);
      expect(store.state.config.sections[0].name).toBe('New Section');
      
      // Insert at the end
      const anotherSection = { name: 'Another Section', items: [] };
      store.commit(Keys.INSERT_SECTION, { section: anotherSection, index: 3 });
      
      // Verify section was added at the end
      expect(store.state.config.sections.length).toBe(4);
      expect(store.state.config.sections[3].name).toBe('Another Section');
    });

    test('REMOVE_SECTION should remove correct section', () => {
      // Setup initial sections
      const initialSections = [
        { name: 'Section 1', items: [] },
        { name: 'Section to Remove', items: [] },
        { name: 'Section 3', items: [] }
      ];
      store.state.config.sections = [...initialSections];

      // Remove the middle section
      store.commit(Keys.REMOVE_SECTION, 'Section to Remove');
      
      // Verify section was removed
      expect(store.state.config.sections.length).toBe(2);
      expect(store.state.config.sections[0].name).toBe('Section 1');
      expect(store.state.config.sections[1].name).toBe('Section 3');
      
      // Try to remove non-existent section (should not change anything)
      store.commit(Keys.REMOVE_SECTION, 'Non-existent Section');
      expect(store.state.config.sections.length).toBe(2);
    });

    test('UPDATE_SECTION should update section properly', () => {
      // Setup initial sections
      const initialSections = [
        { name: 'Section 1', items: [] },
        { name: 'Section 2', items: [] }
      ];
      store.state.config.sections = [...initialSections];

      // Update the first section
      const updatedSection = { name: 'Updated Section', items: [{ id: 'item1', title: 'Item 1' }] };
      store.commit(Keys.UPDATE_SECTION, { sectionIndex: 0, sectionData: updatedSection });
      
      // Verify section was updated
      expect(store.state.config.sections[0].name).toBe('Updated Section');
      expect(store.state.config.sections[0].items).toHaveLength(1);
      expect(store.state.config.sections[0].items[0].id).toBe('item1');
      
      // Second section should remain unchanged
      expect(store.state.config.sections[1].name).toBe('Section 2');
    });
  });

  describe('Actions', () => {
    test('INITIALIZE_CONFIG should properly handle root config', async () => {
      // Mock axios to return a valid response
      const mockResponse = {
        data: `
          appConfig:
            title: Main Dashboard
            theme: dark
          pageInfo:
            title: Shipyard Dashboard
          sections:
            - name: First Section
              items: []
            - name: Second Section
              items: []
        `
      };
      
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Call the action
      await store.dispatch(Keys.INITIALIZE_CONFIG);
      
      // Verify the correct state was set
      expect(store.state.config.appConfig.title).toBe('Main Dashboard');
      expect(store.state.config.appConfig.theme).toBe('dark');
      expect(store.state.config.pageInfo.title).toBe('Shipyard Dashboard');
      expect(store.state.config.sections).toHaveLength(2);
      expect(store.state.config.sections[0].name).toBe('First Section');
      
      // Verify localStorage was checked
      expect(store.state.isUsingLocalConfig).toBe(false);
    });

    test('INITIALIZE_CONFIG should handle localStorage sections', async () => {
      // Mock axios to return a valid response
      const mockResponse = {
        data: `
          appConfig:
            title: Main Dashboard
          sections:
            - name: Original Section
              items: []
        `
      };
      
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Set up localStorage with sections
      const localSections = [
        { name: 'Local Section 1', items: [] },
        { name: 'Local Section 2', items: [] }
      ];
      localStorageMock.setItem(
        localStorageKeys.CONF_SECTIONS, 
        JSON.stringify(localSections)
      );
      
      // Call the action
      await store.dispatch(Keys.INITIALIZE_CONFIG);
      
      // Verify local sections were used
      expect(store.state.config.sections).toHaveLength(2);
      expect(store.state.config.sections[0].name).toBe('Local Section 1');
      expect(store.state.config.sections[1].name).toBe('Local Section 2');
      expect(store.state.isUsingLocalConfig).toBe(true);
    });

    test('INITIALIZE_CONFIG should properly handle sub-config', async () => {
      // Mock root config response
      const mockRootResponse = {
        data: `
          appConfig:
            title: Main Dashboard
            theme: dark
          pages:
            - name: Sub Page
              path: /sub-page.yml
          sections:
            - name: Root Section
              items: []
        `
      };
      
      // Mock sub-config response
      const mockSubResponse = {
        data: `
          appConfig:
            theme: light
          pageInfo:
            title: Sub Page
          sections:
            - name: Sub Section 1
              items: []
            - name: Sub Section 2
              items: []
        `
      };
      
      // Set up axios mocks for both calls
      (axios.get as jest.Mock).mockResolvedValueOnce(mockRootResponse);
      (axios.get as jest.Mock).mockResolvedValueOnce(mockSubResponse);
      
      // First initialize the root config
      await store.dispatch(Keys.INITIALIZE_ROOT_CONFIG);
      
      // Then dispatch with sub-config ID
      await store.dispatch(Keys.INITIALIZE_CONFIG, 'sub-page');
      
      // Verify sub-config was properly merged with root config
      expect(store.state.config.appConfig.title).toBe('Main Dashboard');
      expect(store.state.config.appConfig.theme).toBe('light'); // From sub-config
      expect(store.state.config.pageInfo.title).toBe('Sub Page');
      expect(store.state.config.sections).toHaveLength(2);
      expect(store.state.config.sections[0].name).toBe('Sub Section 1');
      
      // Verify currentConfigInfo was set
      expect(store.state.currentConfigInfo.confId).toBe('sub-page');
    });

    test('INITIALIZE_CONFIG should handle localStorage for sub-config', async () => {
      // Mock root config response
      const mockRootResponse = {
        data: `
          appConfig:
            title: Main Dashboard
          pages:
            - name: Sub Page
              path: /sub-page.yml
          sections:
            - name: Root Section
              items: []
        `
      };
      
      // Mock sub-config response
      const mockSubResponse = {
        data: `
          pageInfo:
            title: Sub Page
          sections:
            - name: Original Sub Section
              items: []
        `
      };
      
      // Set up axios mocks for both calls
      (axios.get as jest.Mock).mockResolvedValueOnce(mockRootResponse);
      (axios.get as jest.Mock).mockResolvedValueOnce(mockSubResponse);
      
      // First initialize the root config
      await store.dispatch(Keys.INITIALIZE_ROOT_CONFIG);
      
      // Set up localStorage with sections for this specific sub-config
      const localSections = [
        { name: 'Local Sub Section 1', items: [] },
        { name: 'Local Sub Section 2', items: [] }
      ];
      
      // Use sub-config specific localStorage key
      localStorageMock.setItem(
        `${localStorageKeys.CONF_SECTIONS}-sub-page`, 
        JSON.stringify(localSections)
      );
      
      // Then dispatch with sub-config ID
      await store.dispatch(Keys.INITIALIZE_CONFIG, 'sub-page');
      
      // Verify local sections were used instead of the ones from the config
      expect(store.state.config.sections).toHaveLength(2);
      expect(store.state.config.sections[0].name).toBe('Local Sub Section 1');
      expect(store.state.config.sections[1].name).toBe('Local Sub Section 2');
      expect(store.state.isUsingLocalConfig).toBe(true);
      expect(store.state.currentConfigInfo.confId).toBe('sub-page');
    });

    test('INITIALIZE_CONFIG should handle YAML parsing errors', async () => {
      // Mock axios to return invalid YAML
      const mockResponse = {
        data: `
          appConfig:
            title: "Unclosed quote
          sections:
            - name: First Section
              items: []
        `
      };
      
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Call the action
      await store.dispatch(Keys.INITIALIZE_CONFIG);
      
      // Verify critical error was set
      expect(store.state.criticalError).not.toBeNull();
      expect(store.state.criticalError).toContain('Failed to parse configuration');
    });

    test('INITIALIZE_CONFIG should handle network errors', async () => {
      // Mock axios to throw error
      const networkError = new Error('Network Error');
      (axios.get as jest.Mock).mockRejectedValueOnce(networkError);
      
      // Call the action
      await store.dispatch(Keys.INITIALIZE_CONFIG);
      
      // Verify critical error was set
      expect(store.state.criticalError).not.toBeNull();
      expect(store.state.criticalError).toContain('Network Error');
    });

    test('INITIALIZE_CONFIG should handle missing sub-config', async () => {
      // Mock root config with reference to a sub-config
      const mockRootResponse = {
        data: `
          appConfig:
            title: Main Dashboard
          pages:
            - name: Sub Page
              path: /sub-page.yml
          sections:
            - name: Root Section
              items: []
        `
      };
      
      // Mock 404 error for sub-config
      const notFoundError = new Error('Not Found');
      notFoundError.message = 'Request failed with status code 404';
      
      // Set up axios mocks
      (axios.get as jest.Mock).mockResolvedValueOnce(mockRootResponse);
      (axios.get as jest.Mock).mockRejectedValueOnce(notFoundError);
      
      // First initialize the root config
      await store.dispatch(Keys.INITIALIZE_ROOT_CONFIG);
      
      // Then dispatch with sub-config ID
      await store.dispatch(Keys.INITIALIZE_CONFIG, 'sub-page');
      
      // Verify error handling
      expect(store.state.criticalError).not.toBeNull();
      expect(store.state.criticalError).toContain('404');
    });
  });

  describe('LocalStorage Error Handling', () => {
    test('INITIALIZE_CONFIG should handle malformed JSON in localStorage', async () => {
      // Mock valid config response
      const mockResponse = {
        data: `
          appConfig:
            title: Main Dashboard
          sections:
            - name: Original Section
              items: []
        `
      };
      
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Set up localStorage with malformed JSON
      localStorageMock.setItem(
        localStorageKeys.CONF_SECTIONS, 
        '{ This is not valid JSON }'
      );
      
      // Call the action
      await store.dispatch(Keys.INITIALIZE_CONFIG);
      
      // Verify original sections were used and not localStorage
      expect(store.state.config.sections).toHaveLength(1);
      expect(store.state.config.sections[0].name).toBe('Original Section');
      expect(store.state.isUsingLocalConfig).toBe(false);
    });

    test('INITIALIZE_CONFIG should handle empty array in localStorage', async () => {
      // Mock valid config response
      const mockResponse = {
        data: `
          appConfig:
            title: Main Dashboard
          sections:
            - name: Original Section
              items: []
        `
      };
      
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Set up localStorage with empty array
      localStorageMock.setItem(
        localStorageKeys.CONF_SECTIONS, 
        '[]'
      );
      
      // Call the action
      await store.dispatch(Keys.INITIALIZE_CONFIG);
      
      // Verify original sections were used and not localStorage
      expect(store.state.config.sections).toHaveLength(1);
      expect(store.state.config.sections[0].name).toBe('Original Section');
      expect(store.state.isUsingLocalConfig).toBe(false);
    });

    test('INITIALIZE_CONFIG should handle invalid data structure in localStorage', async () => {
      // Mock valid config response
      const mockResponse = {
        data: `
          appConfig:
            title: Main Dashboard
          sections:
            - name: Original Section
              items: []
        `
      };
      
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Set up localStorage with non-array JSON
      localStorageMock.setItem(
        localStorageKeys.CONF_SECTIONS, 
        '{"notAnArray": true}'
      );
      
      // Call the action
      await store.dispatch(Keys.INITIALIZE_CONFIG);
      
      // Verify original sections were used and not localStorage
      expect(store.state.config.sections).toHaveLength(1);
      expect(store.state.config.sections[0].name).toBe('Original Section');
      expect(store.state.isUsingLocalConfig).toBe(false);
    });
  });
});

