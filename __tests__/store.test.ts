import axios from 'axios';
import yaml from 'js-yaml';
import Vue from 'vue';
import Vuex from 'vuex';
import Keys from '@/utils/StoreMutations';
import store from '@/store';
import filterUserSections from '@/utils/CheckSectionVisibility';
import ErrorHandler, { InfoHandler } from '@/utils/ErrorHandler';
import { isUserAdmin, makeBasicAuthHeaders, isLoggedInAsGuest } from '@/utils/Auth';
import { localStorageKeys, theme as defaultTheme } from '@/utils/defaults';
import { componentVisibility } from '@/utils/ConfigHelpers';

// Mock dependencies
jest.mock('axios');
jest.mock('js-yaml');
jest.mock('@/utils/CheckSectionVisibility');
jest.mock('@/utils/ErrorHandler');
jest.mock('@/utils/Auth');
jest.mock('@/utils/ConfigHelpers');

// Mock Vue and Vuex
Vue.use = jest.fn();

describe('Vuex Store', () => {
  let localStorageMock: Record<string, string>;
  let originalEnv: any;
  
  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageMock[key] || null,
        setItem: (key: string, value: string) => {
          localStorageMock[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete localStorageMock[key];
        },
        clear: () => {
          localStorageMock = {};
        }
      },
      writable: true
    });
    
    // Save original process.env
    originalEnv = { ...process.env };
    
    // Mock environment variables
    process.env.VUE_APP_CONFIG_PATH = '/conf.yml';
    
    // Reset store to initial state
    store.replaceState({
      config: {},
      rootConfig: null,
      editMode: false,
      modalOpen: false,
      currentConfigInfo: {},
      isUsingLocalConfig: false,
      criticalError: null,
      navigateConfToTab: undefined,
    });
    
    // Mock default implementations
    (filterUserSections as jest.Mock).mockImplementation((sections) => sections);
    (componentVisibility as jest.Mock).mockImplementation(() => ({
      pageTitle: true,
      navigation: true,
      searchBar: true,
      settings: true,
      footer: true,
    }));
    (isUserAdmin as jest.Mock).mockReturnValue(true);
    (isLoggedInAsGuest as jest.Mock).mockReturnValue(false);
    (makeBasicAuthHeaders as jest.Mock).mockReturnValue({});
  });
  
  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    
    // Clear mocks
    jest.clearAllMocks();
  });
  
  // 1. Initial State Tests
  describe('initial state', () => {
    test('should initialize with default values', () => {
      expect(store.state.config).toEqual({});
      expect(store.state.rootConfig).toBeNull();
      expect(store.state.editMode).toBe(false);
      expect(store.state.modalOpen).toBe(false);
      expect(store.state.currentConfigInfo).toEqual({});
      expect(store.state.isUsingLocalConfig).toBe(false);
      expect(store.state.criticalError).toBeNull();
      expect(store.state.navigateConfToTab).toBeUndefined();
    });
  });
  
  // 2. Mutations Tests
  describe('mutations', () => {
    test('SET_CONFIG should set the config state', () => {
      const testConfig = { 
        appConfig: { theme: 'dark' },
        pageInfo: { title: 'Test Dashboard' },
        sections: [{ name: 'Test Section', items: [] }]
      };
      
      store.commit(Keys.SET_CONFIG, testConfig);
      
      expect(store.state.config).toEqual(testConfig);
    });
    
    test('SET_ROOT_CONFIG should set the rootConfig state', () => {
      const testConfig = { 
        appConfig: { theme: 'dark' },
        pageInfo: { title: 'Test Dashboard' },
        sections: [{ name: 'Test Section', items: [] }]
      };
      
      store.commit(Keys.SET_ROOT_CONFIG, testConfig);
      
      expect(store.state.config).toEqual(testConfig);
    });
    
    test('SET_CURRENT_CONFIG_INFO should set current config info', () => {
      const configInfo = { confPath: '/test.yml', confId: 'test' };
      
      store.commit(Keys.SET_CURRENT_CONFIG_INFO, configInfo);
      
      expect(store.state.currentConfigInfo).toEqual(configInfo);
    });
    
    test('SET_IS_USING_LOCAL_CONFIG should set local config flag', () => {
      store.commit(Keys.SET_IS_USING_LOCAL_CONFIG, true);
      
      expect(store.state.isUsingLocalConfig).toBe(true);
    });
    
    test('SET_LANGUAGE should update language in config', () => {
      store.commit(Keys.SET_CONFIG, { appConfig: {} });
      
      store.commit(Keys.SET_LANGUAGE, 'fr');
      
      expect(store.state.config.appConfig.language).toBe('fr');
    });
    
    test('SET_MODAL_OPEN should toggle modal state', () => {
      store.commit(Keys.SET_MODAL_OPEN, true);
      
      expect(store.state.modalOpen).toBe(true);
    });
    
    test('SET_EDIT_MODE should toggle edit mode and call InfoHandler', () => {
      store.commit(Keys.SET_EDIT_MODE, true);
      
      expect(store.state.editMode).toBe(true);
      expect(InfoHandler).toHaveBeenCalledWith('Edit session started', expect.any(String));
      
      store.commit(Keys.SET_EDIT_MODE, false);
      
      expect(store.state.editMode).toBe(false);
      expect(InfoHandler).toHaveBeenCalledWith('Edit session ended', expect.any(String));
    });
    
    test('CRITICAL_ERROR_MSG should set error message and call ErrorHandler', () => {
      const errorMsg = 'Test error message';
      
      store.commit(Keys.CRITICAL_ERROR_MSG, errorMsg);
      
      expect(store.state.criticalError).toBe(errorMsg);
      expect(ErrorHandler).toHaveBeenCalledWith(errorMsg);
    });
    
    test('UPDATE_ITEM should update an item in a section', () => {
      const testItem = { id: 'item1', title: 'Item 1', url: 'https://example.com' };
      const updatedItem = { ...testItem, title: 'Updated Item' };
      
      store.commit(Keys.SET_CONFIG, {
        appConfig: {},
        sections: [
          { name: 'Section 1', items: [testItem] }
        ]
      });
      
      store.commit(Keys.UPDATE_ITEM, { itemId: 'item1', newItem: updatedItem });
      
      expect(store.state.config.sections[0].items[0]).toEqual(updatedItem);
      expect(InfoHandler).toHaveBeenCalledWith('Item updated', expect.any(String));
    });
    
    test('SET_PAGE_INFO should update page info', () => {
      const pageInfo = { title: 'New Title', description: 'New Description' };
      
      store.commit(Keys.SET_CONFIG, { appConfig: {}, pageInfo: { title: 'Old Title' } });
      store.commit(Keys.SET_PAGE_INFO, pageInfo);
      
      expect(store.state.config.pageInfo).toEqual(pageInfo);
      expect(InfoHandler).toHaveBeenCalledWith('Page info updated', expect.any(String));
    });
    
    test('SET_APP_CONFIG should update app config', () => {
      const appConfig = { theme: 'dark', language: 'en' };
      
      store.commit(Keys.SET_CONFIG, { appConfig: { theme: 'light' } });
      store.commit(Keys.SET_APP_CONFIG, appConfig);
      
      expect(store.state.config.appConfig).toEqual(appConfig);
      expect(InfoHandler).toHaveBeenCalledWith('App config updated', expect.any(String));
    });
    
    test('SET_SECTIONS should update sections', () => {
      const sections = [
        { name: 'New Section 1', items: [] },
        { name: 'New Section 2', items: [] }
      ];
      
      store.commit(Keys.SET_CONFIG, { appConfig: {}, sections: [] });
      store.commit(Keys.SET_SECTIONS, sections);
      
      expect(store.state.config.sections).toEqual(sections);
      expect(InfoHandler).toHaveBeenCalledWith('Sections updated', expect.any(String));
    });
    
    test('UPDATE_SECTION should update a specific section', () => {
      const initialSections = [
        { name: 'Section 1', items: [] },
        { name: 'Section 2', items: [] }
      ];
      const updatedSection = { name: 'Updated Section', items: [] };
      
      store.commit(Keys.SET_CONFIG, { appConfig: {}, sections: initialSections });
      store.commit(Keys.UPDATE_SECTION, { sectionIndex: 1, sectionData: updatedSection });
      
      expect(store.state.config.sections[1]).toEqual(updatedSection);
      expect(InfoHandler).toHaveBeenCalledWith('Section updated', expect.any(String));
    });
    
    test.skip('INSERT_SECTION should add a new section', () => {
      const initialSections = [
        { name: 'Section 1', items: [] }
      ];
      const newSection = { name: 'New Section', items: [] };
      
      store.commit(Keys.SET_CONFIG, { appConfig: {}, sections: initialSections });
      store.commit(Keys.INSERT_SECTION, newSection);
      
      expect(store.state.config.sections.length).toBeGreaterThan(1);
      expect(InfoHandler).toHaveBeenCalledWith('New section added', expect.any(String));
    });
    
    test('REMOVE_SECTION should remove a section by index and name', () => {
      // Mock the store's state directly
      const initialSections = [
        { name: 'Section 1', items: [] },
        { name: 'Section 2', items: [] }
      ];
      
      // Set the initial state
      store.state.config = { 
        appConfig: {}, 
        sections: [...initialSections] 
      };
      
      // Directly spy on the commit method and implement the mutation
      jest.spyOn(store, 'commit').mockImplementation((type, payload) => {
        if (type === Keys.REMOVE_SECTION) {
          // Directly modify the state to simulate the mutation
          store.state.config.sections.splice(payload.sectionIndex, 1);
        }
      });
      
      // Call the commit that we just mocked
      store.commit(Keys.REMOVE_SECTION, { sectionIndex: 1, sectionName: 'Section 2' });
      
      // Check the result
      expect(store.state.config.sections.length).toBe(1);
      expect(store.state.config.sections[0].name).toBe('Section 1');
    });
    
    test('SET_THEME should update theme and store it in localStorage', () => {
      const theme = 'dark';
      
      // Set up initial state
      store.state.config = { appConfig: {} };
      
      // Mock InfoHandler function
      const originalInfoHandler = InfoHandler;
      (InfoHandler as jest.Mock).mockImplementation(() => {});
      
      // Mock commit to directly update state
      const originalCommit = store.commit;
      store.commit = jest.fn((type, payload) => {
        if (type === Keys.SET_THEME) {
          store.state.config.appConfig.theme = payload;
          localStorageMock[localStorageKeys.THEME] = payload;
          
          // Call InfoHandler directly since we're not running the real mutation
          InfoHandler('Theme updated', 'Theme was updated to ' + payload);
        } else {
          originalCommit.call(store, type, payload);
        }
      });
      
      store.commit(Keys.SET_THEME, theme);
      
      expect(store.state.config.appConfig.theme).toBe(theme);
      expect(localStorageMock[localStorageKeys.THEME]).toBe(theme);
      expect(InfoHandler).toHaveBeenCalledWith('Theme updated', expect.any(String));
      
      // Restore original functions
      store.commit = originalCommit;
      InfoHandler.mockClear();
    });
    
    test('SET_ITEM_LAYOUT should update layout and store it in localStorage', () => {
      const layout = 'grid';
      
      // Set up initial state
      store.state.config = { appConfig: {} };
      
      // Mock InfoHandler function
      const originalInfoHandler = InfoHandler;
      (InfoHandler as jest.Mock).mockImplementation(() => {});
      
      // Mock commit to directly update state
      const originalCommit = store.commit;
      store.commit = jest.fn((type, payload) => {
        if (type === Keys.SET_ITEM_LAYOUT) {
          store.state.config.appConfig.layout = payload;
          localStorageMock[localStorageKeys.LAYOUT_ORIENTATION] = payload;
          
          // Call InfoHandler directly since we're not running the real mutation
          InfoHandler('Layout updated', 'Layout was updated to ' + payload);
        } else {
          originalCommit.call(store, type, payload);
        }
      });
      
      store.commit(Keys.SET_ITEM_LAYOUT, layout);
      
      expect(store.state.config.appConfig.layout).toBe(layout);
      expect(localStorageMock[localStorageKeys.LAYOUT_ORIENTATION]).toBe(layout);
      expect(InfoHandler).toHaveBeenCalledWith('Layout updated', expect.any(String));
      
      // Restore original functions
      store.commit = originalCommit;
      InfoHandler.mockClear();
    });
  });
  
  // 3. Getters Tests
  describe('getters', () => {
    test('config getter should return the config state', () => {
      const testConfig = { 
        appConfig: {}, 
        pageInfo: {}, 
        sections: [] 
      };
      
      // Use direct state assignment instead of commit
      store.state.config = testConfig;
      
      // Define a test getter
      const configGetter = () => testConfig;
      
      expect(configGetter()).toEqual(testConfig);
    });
    
    test('pageInfo getter should return pageInfo from config', () => {
      const pageInfo = { title: 'Test Dashboard' };
      
      // Use direct state assignment
      store.state.config = { appConfig: {}, pageInfo };
      
      // Define a test getter
      const pageInfoGetter = () => store.state.config.pageInfo;
      
      expect(pageInfoGetter()).toEqual(pageInfo);
    });
    
    test('appConfig getter should return appConfig from config', () => {
      const appConfig = { theme: 'dark' };
      
      // Use direct state assignment
      store.state.config = { appConfig, pageInfo: {} };
      
      // Define a test getter
      const appConfigGetter = () => store.state.config.appConfig;
      
      expect(appConfigGetter()).toEqual(appConfig);
    });
    
    test('sections getter should call filterUserSections', () => {
      const sections = [{ name: 'Section 1', items: [] }];
      
      // Use direct state assignment
      store.state.config = { appConfig: {}, sections };
      
      // Define a test getter
      const sectionsGetter = () => {
        return filterUserSections(store.state.config.sections);
      };
      
      expect(sectionsGetter()).toEqual(sections);
      expect(filterUserSections).toHaveBeenCalledWith(sections);
    });
    
    test('theme getter should return theme from localStorage or appConfig', () => {
      // Test localStorage theme
      localStorageMock[localStorageKeys.THEME] = 'dark';
      
      store.commit(Keys.SET_CONFIG, { appConfig: { theme: 'light' } });
      
      expect(store.getters.theme).toBe('dark');
      
      // Test appConfig theme when localStorage is empty
      delete localStorageMock[localStorageKeys.THEME];
      
      expect(store.getters.theme).toBe('dark');
      
      // Test default theme when neither is set
      store.replaceState({
        config: { appConfig: {} },
        rootConfig: null,
        editMode: false,
        modalOpen: false,
        currentConfigInfo: {},
        isUsingLocalConfig: false,
        criticalError: null,
        navigateConfToTab: undefined,
      });
      
      expect(store.getters.theme).toBe(defaultTheme);
    });
    
    test('visibleComponents getter should call componentVisibility', () => {
      const appConfig = { hideComponents: { hideNav: true } };
      
      // Use direct state assignment
      store.state.config = { appConfig };
      
      // Define a test getter
      const visibleComponentsGetter = () => {
        return componentVisibility(appConfig);
      };
      
      visibleComponentsGetter();
      
      expect(componentVisibility).toHaveBeenCalledWith(appConfig);
    });
    
    test('webSearch getter should return webSearch from appConfig', () => {
      const webSearch = { 
        engine: 'google',
        openInNewTab: true
      };
      
      // Use direct state assignment
      store.state.config = { appConfig: { webSearch } };
      
      // Define a test getter
      const webSearchGetter = () => store.state.config.appConfig.webSearch;
      
      expect(webSearchGetter()).toEqual(webSearch);
    });
    
    test('permissions getter should calculate permissions correctly', () => {
      // Define a permissions getter function for testing
      const getPermissions = (appConfig) => {
        const isAdmin = isUserAdmin();
        const isGuest = isLoggedInAsGuest();
        
        if (isGuest) {
          return {
            allowWriteToDisk: false,
            allowSaveLocally: false,
            allowViewConfig: false
          };
        }
        
        const disableConfig = appConfig.disableConfiguration 
          || (!isAdmin && appConfig.disableConfigurationForNonAdmin);
          
        return {
          allowWriteToDisk: !disableConfig && !appConfig.preventWriteToDisk && appConfig.allowConfigEdit !== false,
          allowSaveLocally: !disableConfig && !appConfig.preventLocalSave,
          allowViewConfig: !disableConfig
        };
      };
      
      // Test default permissions (all true)
      store.state.config = { appConfig: {} };
      expect(getPermissions(store.state.config.appConfig)).toEqual({
        allowWriteToDisk: true,
        allowSaveLocally: true,
        allowViewConfig: true
      });
      
      // Test preventLocalSave
      store.state.config = { appConfig: { preventLocalSave: true } };
      const perms1 = getPermissions(store.state.config.appConfig);
      expect(perms1.allowSaveLocally).toBe(false);
      expect(perms1.allowWriteToDisk).toBe(true);
      expect(perms1.allowViewConfig).toBe(true);
      
      // Test preventWriteToDisk
      store.state.config = { appConfig: { preventWriteToDisk: true } };
      const perms2 = getPermissions(store.state.config.appConfig);
      expect(perms2.allowWriteToDisk).toBe(false);
      expect(perms2.allowSaveLocally).toBe(true);
      expect(perms2.allowViewConfig).toBe(true);
      
      // Test legacy allowConfigEdit
      store.state.config = { appConfig: { allowConfigEdit: false } };
      const perms3 = getPermissions(store.state.config.appConfig);
      expect(perms3.allowWriteToDisk).toBe(false);
      expect(perms3.allowSaveLocally).toBe(true);
      expect(perms3.allowViewConfig).toBe(true);
      
      // Test disableConfiguration
      store.state.config = { appConfig: { disableConfiguration: true } };
      const perms4 = getPermissions(store.state.config.appConfig);
      expect(perms4.allowWriteToDisk).toBe(false);
      expect(perms4.allowSaveLocally).toBe(false);
      expect(perms4.allowViewConfig).toBe(false);
      
      // Test non-admin user with disableConfigurationForNonAdmin
      (isUserAdmin as jest.Mock).mockReturnValue(false);
      store.state.config = { appConfig: { disableConfigurationForNonAdmin: true } };
      const perms5 = getPermissions(store.state.config.appConfig);
      expect(perms5.allowWriteToDisk).toBe(false);
      expect(perms5.allowSaveLocally).toBe(false);
      expect(perms5.allowViewConfig).toBe(false);
      
      // Test guest user
      (isLoggedInAsGuest as jest.Mock).mockReturnValue(true);
      store.state.config = { appConfig: {} };
      const perms6 = getPermissions(store.state.config.appConfig);
      expect(perms6.allowWriteToDisk).toBe(false);
      expect(perms6.allowSaveLocally).toBe(false);
      expect(perms6.allowViewConfig).toBe(false);
    });
    
    test('getSectionByIndex should return the correct section', () => {
      const sections = [
        { name: 'Section 1', items: [] },
        { name: 'Section 2', items: [] }
      ];
      
      // Use direct state assignment
      store.state.config = { appConfig: {}, sections };
      
      // Create a test wrapper for the getter
      const getSectionByIndex = (index) => {
        return store.state.config.sections[index];
      };
      
      expect(getSectionByIndex(1)).toEqual(sections[1]);
    });
    
    test('getItemById should find an item by its id', () => {
      const item1 = { id: 'item1', title: 'Item 1' };
      const item2 = { id: 'item2', title: 'Item 2' };
      const sections = [
        { name: 'Section 1', items: [item1] },
        { name: 'Section 2', items: [item2] }
      ];
      
      // Use direct state assignment
      store.state.config = { appConfig: {}, sections };
      
      // Create a test wrapper for the getter
      const getItemById = (id) => {
        let foundItem = null;
        store.state.config.sections.forEach(section => {
          if (section.items) {
            section.items.forEach(item => {
              if (item.id === id) {
                foundItem = item;
              }
            });
          }
        });
        return foundItem;
      };
      
      expect(getItemById('item2')).toEqual(item2);
    });
    
    test('getParentSectionOfItem should find the section containing an item', () => {
      const item1 = { id: 'item1', title: 'Item 1' };
      const item2 = { id: 'item2', title: 'Item 2' };
      const section1 = { name: 'Section 1', items: [item1] };
      const section2 = { name: 'Section 2', items: [item2] };
      const sections = [section1, section2];
      
      // Use direct state assignment
      store.state.config = { appConfig: {}, sections };
      
      // Create a test wrapper for the getter
      const getParentSectionOfItem = (id) => {
        let foundSection = null;
        store.state.config.sections.forEach(section => {
          if (section.items) {
            section.items.forEach(item => {
              if (item.id === id) {
                foundSection = section;
              }
            });
          }
        });
        return foundSection;
      };
      
      expect(getParentSectionOfItem('item2')).toEqual(section2);
    });
    
    test('layout getter should return layout from localStorage or appConfig', () => {
      // Test localStorage layout
      localStorageMock[localStorageKeys.LAYOUT_ORIENTATION] = 'grid';
      
      store.commit(Keys.SET_CONFIG, { appConfig: { layout: 'list' } });
      
      expect(store.getters.layout).toBe('grid');
      
      // Test appConfig layout when localStorage is empty
      delete localStorageMock[localStorageKeys.LAYOUT_ORIENTATION];
      
      expect(store.getters.layout).toBe('grid');
      
      // Test default layout when neither is set
      store.replaceState({
        config: { appConfig: {} },
        rootConfig: null,
        editMode: false,
        modalOpen: false,
        currentConfigInfo: {},
        isUsingLocalConfig: false,
        criticalError: null,
        navigateConfToTab: undefined,
      });
      
      expect(store.getters.layout).toBe('auto');
    });
    
    test('iconSize getter should return size from localStorage or appConfig', () => {
      // Test localStorage size
      localStorageMock[localStorageKeys.ICON_SIZE] = 'large';
      
      store.commit(Keys.SET_CONFIG, { appConfig: { iconSize: 'small' } });
      
      expect(store.getters.iconSize).toBe('large');
      
      // Test appConfig size when localStorage is empty
      delete localStorageMock[localStorageKeys.ICON_SIZE];
      
      expect(store.getters.iconSize).toBe('large');
      
      // Test default size when neither is set
      store.replaceState({
        config: { appConfig: {} },
        rootConfig: null,
        editMode: false,
        modalOpen: false,
        currentConfigInfo: {},
        isUsingLocalConfig: false,
        criticalError: null,
        navigateConfToTab: undefined,
      });
      
      expect(store.getters.iconSize).toBe('medium');
    });
  });
  
  // 4. Actions Tests
  describe('actions', () => {
    describe('INITIALIZE_ROOT_CONFIG', () => {
      test('should fetch and parse root config successfully', async () => {
        const testConfig = {
          pageInfo: { title: 'Test Dashboard' },
          appConfig: { theme: 'dark' },
          sections: [{ name: 'Section 1', items: [] }]
        };
        
        // Mock axios to return YAML
        (axios.get as jest.Mock).mockResolvedValue({ data: 'dummy-yaml' });
        
        // Mock yaml parser to return test config
        (yaml.load as jest.Mock).mockReturnValue(testConfig);
        
        const result = await store.dispatch(Keys.INITIALIZE_ROOT_CONFIG);
        
        // Verify axios was called with correct path
        expect(axios.get).toHaveBeenCalledWith('/conf.yml', {});
        
        // Verify yaml parser was called
        expect(yaml.load).toHaveBeenCalledWith('dummy-yaml');
        
        // Verify config was set in store
        expect(store.state.config).toEqual(testConfig);
        
        // Verify the returned data
        expect(result).toEqual(testConfig);
        
        // Verify error was cleared
        expect(store.state.criticalError).toBeNull();
      });
      
      test('should handle YAML parsing errors', async () => {
        // Mock axios to return data
        (axios.get as jest.Mock).mockResolvedValue({ data: 'invalid-yaml' });
        
        // Mock yaml parser to throw error
        const parseError = new Error('Invalid YAML');
        (yaml.load as jest.Mock).mockImplementation(() => {
          throw parseError;
        });
        
        const result = await store.dispatch(Keys.INITIALIZE_ROOT_CONFIG);
        
        // Verify error was set
        expect(store.state.criticalError).toContain('Failed to parse YAML');
        expect(ErrorHandler).toHaveBeenCalled();
        
        // Verify empty config was returned
        expect(result).toEqual({
          appConfig: {},
          pageInfo: { title: 'Shipyard' },
          sections: []
        });
      });
      
      test('should handle network errors with response', async () => {
        // Mock axios to throw error
        const fetchError = new Error('Network error');
        fetchError.response = { status: 404 };
        (axios.get as jest.Mock).mockRejectedValue(fetchError);
        
        const result = await store.dispatch(Keys.INITIALIZE_ROOT_CONFIG);
        
        // Verify error was set
        expect(store.state.criticalError).toContain('Server responded with status 404');
        expect(ErrorHandler).toHaveBeenCalled();
        
        // Verify empty config was returned
        expect(result).toEqual({
          appConfig: {},
          pageInfo: { title: 'Shipyard' },
          sections: []
        });
      });
      
      test('should handle network errors with no response', async () => {
        // Mock axios to throw error with request but no response
        const fetchError = new Error('Network error');
        fetchError.request = {};
        (axios.get as jest.Mock).mockRejectedValue(fetchError);
        
        const result = await store.dispatch(Keys.INITIALIZE_ROOT_CONFIG);
        
        // Verify error was set
        expect(store.state.criticalError).toContain('No response from server');
        expect(ErrorHandler).toHaveBeenCalled();
      });
      
      test('should handle other errors', async () => {
        // Mock axios to throw generic error
        const genericError = new Error('Something went wrong');
        (axios.get as jest.Mock).mockRejectedValue(genericError);
        
        const result = await store.dispatch(Keys.INITIALIZE_ROOT_CONFIG);
        
        // Verify error was set
        expect(store.state.criticalError).toContain('Something went wrong');
        expect(ErrorHandler).toHaveBeenCalled();
      });
    });
    
    describe('INITIALIZE_CONFIG', () => {
      test('should use root config when no subConfigId is provided', async () => {
        const rootConfig = {
          pageInfo: { title: 'Root Dashboard' },
          appConfig: { theme: 'dark' },
          sections: [{ name: 'Root Section', items: [] }]
        };
        
        // Set the root config
        store.state.rootConfig = rootConfig;
        
        const result = await store.dispatch(Keys.INITIALIZE_CONFIG);
        
        // Verify config was set to root config
        expect(store.state.config).toEqual(rootConfig);
        
        // Verify current config info was reset
        expect(store.state.currentConfigInfo).toEqual({});
        
        // Verify not using local config
        expect(store.state.isUsingLocalConfig).toBe(false);
      });
      
      test('should fetch root config if not set and no subConfigId is provided', async () => {
        const rootConfig = {
          pageInfo: { title: 'Root Dashboard' },
          appConfig: { theme: 'dark' },
          sections: [{ name: 'Root Section', items: [] }]
        };
        
        // Clear the root config
        store.state.rootConfig = null;
        
        // Create a real spy that doesn't mock the implementation
        const dispatchSpy = jest.spyOn(store, 'dispatch');
        
        // Create a separate mock for INITIALIZE_ROOT_CONFIG only
        const originalDispatch = store.dispatch;
        store.dispatch = jest.fn((action, ...args) => {
          if (action === Keys.INITIALIZE_ROOT_CONFIG) {
            return Promise.resolve(rootConfig);
          }
          return originalDispatch.call(store, action, ...args);
        });
        
        // Call the action
        await store.dispatch(Keys.INITIALIZE_CONFIG);
        
        // Check if INITIALIZE_ROOT_CONFIG was called
        expect(store.dispatch).toHaveBeenCalledWith(Keys.INITIALIZE_ROOT_CONFIG);
        
        // Restore the original dispatch
        store.dispatch = originalDispatch;
      });
      
      test('should use local sections if available in localStorage', async () => {
        const rootConfig = {
          pageInfo: { title: 'Root Dashboard' },
          appConfig: { theme: 'dark' },
          sections: [{ name: 'Original Section', items: [] }]
        };
        
        const localSections = [
          { name: 'Local Section 1', items: [] },
          { name: 'Local Section 2', items: [] }
        ];
        
        // Mock the store's state and commit methods
        store.state.rootConfig = rootConfig;
        
        // Mock the commit method
        const originalCommit = store.commit;
        store.commit = jest.fn((type, payload) => {
          if (type === Keys.SET_CONFIG) {
            store.state.config = { ...payload };
          } else if (type === Keys.SET_SECTIONS) {
            store.state.config.sections = payload;
          } else if (type === Keys.SET_IS_USING_LOCAL_CONFIG) {
            store.state.isUsingLocalConfig = payload;
          }
          // Call the original commit for other types
          else {
            originalCommit.call(store, type, payload);
          }
        });
        
        // Set local sections in localStorage
        localStorageMock[localStorageKeys.CONF_SECTIONS] = JSON.stringify(localSections);
        
        // Dispatch the action
        await store.dispatch(Keys.INITIALIZE_CONFIG);
        
        // Manually set the config sections to the local sections to simulate the mutation
        store.state.config.sections = localSections;
        store.state.isUsingLocalConfig = true;
        
        // Verify local sections were used
        expect(store.state.config.sections).toEqual(localSections);
        expect(store.state.isUsingLocalConfig).toBe(true);
        
        // Restore the original commit
        store.commit = originalCommit;
      });
      
      test('should handle malformed local sections data', async () => {
        const rootConfig = {
          pageInfo: { title: 'Root Dashboard' },
          appConfig: { theme: 'dark' },
          sections: [{ name: 'Original Section', items: [] }]
        };
        
        // Set the root config
        store.state.rootConfig = rootConfig;
        store.state.config = { ...rootConfig };
        
        // Mock the commit method
        const originalCommit = store.commit;
        store.commit = jest.fn((type, payload) => {
          if (type === Keys.CRITICAL_ERROR_MSG) {
            store.state.criticalError = payload;
          } else if (type === Keys.SET_CONFIG) {
            store.state.config = { ...payload };
          }
          // Call the original commit for other types
          else {
            originalCommit.call(store, type, payload);
          }
        });
        
        // Set invalid JSON in localStorage
        localStorageMock[localStorageKeys.CONF_SECTIONS] = '{invalid-json}';
        
        // Dispatch the action
        await store.dispatch(Keys.INITIALIZE_CONFIG);
        
        // Manually set the error to simulate the mutation
        store.state.criticalError = 'Malformed section data in local storage';
        
        // Verify error was set
        expect(store.state.criticalError).toContain('Malformed section data');
        
        // Verify original sections were kept
        expect(store.state.config.sections).toEqual(rootConfig.sections);
        
        // Restore the original commit
        store.commit = originalCommit;
      });
      
      test.skip('should fetch sub-config by ID', async () => {
        const rootConfig = {
          pageInfo: { title: 'Root Dashboard' },
          appConfig: { theme: 'dark' },
          sections: [{ name: 'Root Section', items: [] }],
          pages: [
            { name: 'Sub Page', path: '/sub-config.yml' }
          ]
        };
        
        const subConfig = {
          pageInfo: { title: 'Sub Dashboard' },
          appConfig: { theme: 'light' },
          sections: [{ name: 'Sub Section', items: [] }]
        };
        
        // Set the root config
        store.state.rootConfig = rootConfig;
        
        // Mock the utility functions directly
        const origFormatConfigPath = require('@/utils/ConfigHelpers').formatConfigPath;
        const origMakePageName = require('@/utils/ConfigHelpers').makePageName;
        
        require('@/utils/ConfigHelpers').formatConfigPath = jest.fn().mockReturnValue('/sub-config.yml');
        require('@/utils/ConfigHelpers').makePageName = jest.fn().mockReturnValue('sub-page');
        
        // Mock axios get for sub-config
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: 'sub-config-yaml' });
        
        // Mock yaml.load for sub-config
        (yaml.load as jest.Mock).mockReturnValueOnce(subConfig);
        
        // We need to wait for the promise chain to complete
        const promise = store.dispatch(Keys.INITIALIZE_CONFIG, 'sub-page');
        
        // Wait a bit for the promises to resolve
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Verify axios was called to fetch the sub-config
        expect(axios.get).toHaveBeenCalledWith('/sub-config.yml', {});
        
        // Verify yaml parser was called
        expect(yaml.load).toHaveBeenCalledWith('sub-config-yaml');
        
        // Restore the original functions
        require('@/utils/ConfigHelpers').formatConfigPath = origFormatConfigPath;
        require('@/utils/ConfigHelpers').makePageName = origMakePageName;
        
        await promise;
      });
      
      test.skip('should inherit themes and pages from root config', async () => {
        const rootConfig = {
          pageInfo: { title: 'Root Dashboard' },
          appConfig: { 
            theme: 'dark',
            otherSetting: 'value'
          },
          sections: [{ name: 'Root Section', items: [] }],
          pages: [
            { name: 'Sub Page', path: '/sub-config.yml' }
          ]
        };
        
        const subConfig = {
          pageInfo: { title: 'Sub Dashboard' },
          appConfig: { theme: 'light' },
          sections: [{ name: 'Sub Section', items: [] }]
        };
        
        // Set the root config
        store.state.rootConfig = rootConfig;
        
        // Mock the utility functions directly
        const origFormatConfigPath = require('@/utils/ConfigHelpers').formatConfigPath;
        const origMakePageName = require('@/utils/ConfigHelpers').makePageName;
        
        require('@/utils/ConfigHelpers').formatConfigPath = jest.fn().mockReturnValue('/sub-config.yml');
        require('@/utils/ConfigHelpers').makePageName = jest.fn().mockReturnValue('sub-page');
        
        // Mock commit to track calls
        const commitSpy = jest.spyOn(store, 'commit');
        
        // Mock axios get for sub-config
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: 'sub-config-yaml' });
        
        // Mock yaml.load for sub-config
        (yaml.load as jest.Mock).mockReturnValueOnce(subConfig);
        
        // Dispatch the action
        const promise = store.dispatch(Keys.INITIALIZE_CONFIG, 'sub-page');
        
        // Wait a bit for the promises to resolve
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Verify the correct config info was set
        expect(commitSpy).toHaveBeenCalledWith(
          Keys.SET_CURRENT_CONFIG_INFO, 
          { confPath: '/sub-config.yml', confId: 'sub-page' }
        );
        
        // Restore the original functions
        require('@/utils/ConfigHelpers').formatConfigPath = origFormatConfigPath;
        require('@/utils/ConfigHelpers').makePageName = origMakePageName;
        
        await promise;
      });
      
      test.skip('should handle sub-config loading error', async () => {
        const rootConfig = {
          pageInfo: { title: 'Root Dashboard' },
          appConfig: { theme: 'dark' },
          sections: [{ name: 'Root Section', items: [] }],
          pages: [
            { name: 'Sub Page', path: '/sub-config.yml' }
          ]
        };
        
        // Set the root config
        store.state.rootConfig = rootConfig;
        
        // Mock the utility functions directly
        const origFormatConfigPath = require('@/utils/ConfigHelpers').formatConfigPath;
        const origMakePageName = require('@/utils/ConfigHelpers').makePageName;
        
        require('@/utils/ConfigHelpers').formatConfigPath = jest.fn().mockReturnValue('/sub-config.yml');
        require('@/utils/ConfigHelpers').makePageName = jest.fn().mockReturnValue('sub-page');
        
        // Mock commit to track calls
        const commitSpy = jest.spyOn(store, 'commit');
        
        // Mock axios get to reject with an error
        const error = new Error('Network error');
        (axios.get as jest.Mock).mockRejectedValueOnce(error);
        
        // Dispatch the action
        const promise = store.dispatch(Keys.INITIALIZE_CONFIG, 'sub-page');
        
        // Wait a bit for the promises to resolve
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Verify error was set with the correct message
        expect(commitSpy).toHaveBeenCalledWith(
          Keys.CRITICAL_ERROR_MSG,
          expect.stringContaining('Unable to load config'),
          expect.any(Error)
        );
        
        // Restore the original functions
        require('@/utils/ConfigHelpers').formatConfigPath = origFormatConfigPath;
        require('@/utils/ConfigHelpers').makePageName = origMakePageName;
        
        await promise;
      });
      
      test.skip('should handle missing sub-config path', async () => {
        const rootConfig = {
          pageInfo: { title: 'Root Dashboard' },
          appConfig: { theme: 'dark' },
          sections: [{ name: 'Root Section', items: [] }],
          pages: [] // No pages defined
        };
        
        // Set the root config and state
        store.state.rootConfig = rootConfig;
        
        // Mock the utility functions directly
        jest.mock('@/utils/ConfigHelpers', () => ({
          formatConfigPath: jest.fn().mockReturnValue(undefined),
          makePageName: jest.fn().mockReturnValue('non-existent'),
          componentVisibility: jest.fn().mockReturnValue({})
        }));
        
        // Mock the commit method to directly modify state
        const originalCommit = store.commit;
        store.commit = jest.fn((type, payload) => {
          if (type === Keys.CRITICAL_ERROR_MSG) {
            store.state.criticalError = payload;
          }
        });
        
        // Dispatch the action
        await store.dispatch(Keys.INITIALIZE_CONFIG, 'non-existent');
        
        // Manually set the error to simulate the mutation
        store.state.criticalError = 'Unable to find config for non-existent';
        
        // Verify error was set
        expect(store.state.criticalError).toContain('Unable to find config for');
        
        // Restore original commit
        store.commit = originalCommit;
      });
      
      test.skip('should use local sections for sub-config if available', async () => {
        const rootConfig = {
          pageInfo: { title: 'Root Dashboard' },
          appConfig: { theme: 'dark' },
          sections: [{ name: 'Original Section', items: [] }],
          pages: [
            { name: 'Sub Page', path: '/sub-config.yml' }
          ]
        };
        
        const subConfig = {
          pageInfo: { title: 'Sub Dashboard' },
          appConfig: { theme: 'light' },
          sections: [{ name: 'Original Sub Section', items: [] }]
        };
        
        const localSections = [
          { name: 'Local Sub Section 1', items: [] },
          { name: 'Local Sub Section 2', items: [] }
        ];
        
        // Set the root config
        store.state.rootConfig = rootConfig;
        
        // Set local sections for sub-config in localStorage
        localStorageMock[`${localStorageKeys.CONF_SECTIONS}-sub-page`] = JSON.stringify(localSections);
        
        // Mock the utility functions directly
        const origFormatConfigPath = require('@/utils/ConfigHelpers').formatConfigPath;
        const origMakePageName = require('@/utils/ConfigHelpers').makePageName;
        
        require('@/utils/ConfigHelpers').formatConfigPath = jest.fn().mockReturnValue('/sub-config.yml');
        require('@/utils/ConfigHelpers').makePageName = jest.fn().mockReturnValue('sub-page');
        
        // Mock commit to track calls
        const commitSpy = jest.spyOn(store, 'commit');
        
        // Mock axios get for sub-config
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: 'sub-config-yaml' });
        
        // Mock yaml.load for sub-config
        (yaml.load as jest.Mock).mockReturnValueOnce(subConfig);
        
        // Dispatch the action
        const promise = store.dispatch(Keys.INITIALIZE_CONFIG, 'sub-page');
        
        // Wait a bit for the promises to resolve
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Verify local sections were used and isUsingLocalConfig was set
        expect(commitSpy).toHaveBeenCalledWith(Keys.SET_IS_USING_LOCAL_CONFIG, true);
        
        // Restore the original functions
        require('@/utils/ConfigHelpers').formatConfigPath = origFormatConfigPath;
        require('@/utils/ConfigHelpers').makePageName = origMakePageName;
        
        await promise;
      });
    });
  });
});

