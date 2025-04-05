/* eslint-disable no-param-reassign, prefer-destructuring */
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import yaml from 'js-yaml';
import Keys from '@/utils/StoreMutations';
import { makePageName, formatConfigPath, componentVisibility } from '@/utils/ConfigHelpers';
import { applyItemId } from '@/utils/SectionHelpers';
import filterUserSections from '@/utils/CheckSectionVisibility';
import ErrorHandler, { InfoHandler, InfoKeys } from '@/utils/ErrorHandler';
import { isUserAdmin, makeBasicAuthHeaders, isLoggedInAsGuest } from '@/utils/Auth';
import { localStorageKeys, theme as defaultTheme } from './utils/defaults';

Vue.use(Vuex);

const {
  INITIALIZE_CONFIG,
  INITIALIZE_ROOT_CONFIG,
  SET_CONFIG,
  SET_ROOT_CONFIG,
  SET_CURRENT_CONFIG_INFO,
  SET_IS_USING_LOCAL_CONFIG,
  SET_MODAL_OPEN,
  SET_LANGUAGE,
  SET_ITEM_LAYOUT,
  SET_ITEM_SIZE,
  SET_THEME,
  SET_CUSTOM_COLORS,
  UPDATE_ITEM,
  USE_MAIN_CONFIG,
  SET_EDIT_MODE,
  SET_PAGE_INFO,
  SET_APP_CONFIG,
  SET_SECTIONS,
  SET_PAGES,
  UPDATE_SECTION,
  INSERT_SECTION,
  REMOVE_SECTION,
  COPY_ITEM,
  REMOVE_ITEM,
  INSERT_ITEM,
  UPDATE_CUSTOM_CSS,
  CONF_MENU_INDEX,
  CRITICAL_ERROR_MSG,
} = Keys;

const emptyConfig = {
  appConfig: {},
  pageInfo: { title: 'Shipyard' },
  sections: [],
};

const store = new Vuex.Store({
  state: {
    config: {}, // The current config being used, and rendered to the UI
    rootConfig: null, // Always the content of main config file, never used directly
    editMode: false, // While true, the user can drag and edit items + sections
    modalOpen: false, // KB shortcut functionality will be disabled when modal is open
    currentConfigInfo: {}, // For multi-page support, will store info about config file
    isUsingLocalConfig: false, // If true, will use local config instead of fetched
    criticalError: null, // Will store a message, if a critical error occurs
    navigateConfToTab: undefined, // Used to switch active tab in config modal
  },
  getters: {
    config(state) {
      return state.config;
    },
    pageInfo(state) {
      return state.config.pageInfo || {};
    },
    appConfig(state) {
      return state.config.appConfig || {};
    },
    sections(state) {
      return filterUserSections(state.config.sections || []);
    },
    theme(state) {
      const localStorageKey = state.currentConfigInfo.confId
        ? `${localStorageKeys.THEME}-${state.currentConfigInfo.confId}` : localStorageKeys.THEME;
      const localTheme = localStorage.getItem(localStorageKey);
      // Return either theme from local storage, or from appConfig
      return localTheme || (state.config.appConfig && state.config.appConfig.theme) || defaultTheme;
    },
    visibleComponents(state) {
      return componentVisibility(state.config.appConfig || {});
    },
    webSearch(state) {
      return state.config.appConfig && state.config.appConfig.webSearch;
    },
    /* Make config read/ write permissions object */
    permissions(state, getters) {
      const appConfig = getters.appConfig;
      const perms = {
        allowWriteToDisk: true,
        allowSaveLocally: true,
        allowViewConfig: true,
      };
      // Disable writing to disk if preventWriteToDisk is true or allowConfigEdit is false
      if (appConfig.preventWriteToDisk || appConfig.allowConfigEdit === false) {
        perms.allowWriteToDisk = false;
      }
      // Disable local saving if preventLocalSave is true
      if (appConfig.preventLocalSave) {
        perms.allowSaveLocally = false;
      }
      // Disable all config operations if disableConfiguration is true
      if (appConfig.disableConfiguration) {
        perms.allowWriteToDisk = false;
        perms.allowSaveLocally = false;
        perms.allowViewConfig = false;
      }
      // Disable config operations for non-admin if disableConfigurationForNonAdmin is true
      if (appConfig.disableConfigurationForNonAdmin && !isUserAdmin()) {
        perms.allowWriteToDisk = false;
        perms.allowSaveLocally = false;
        perms.allowViewConfig = false;
      }
      // Disable all config operations for guest users
      if (isLoggedInAsGuest()) {
        perms.allowWriteToDisk = false;
        perms.allowSaveLocally = false;
        perms.allowViewConfig = false;
      }
      return perms;
    },
    getItemById: (state, getters) => (id) => {
      let item;
      getters.sections.forEach(section => {
        (section.items || []).forEach(currentItem => {
          if (currentItem.id === id) {
            item = currentItem;
          }
        });
      });
      return item;
    },
    getParentSectionOfItem: (state, getters) => (itemId) => {
      let foundSection;
      getters.sections.forEach(section => {
        (section.items || []).forEach(item => {
          if (item.id === itemId) {
            foundSection = section;
          }
        });
      });
      return foundSection;
    },
    layout(state) {
      const pageId = state.currentConfigInfo.confId;
      const layoutStoreKey = pageId
        ? `${localStorageKeys.LAYOUT_ORIENTATION}-${pageId}` : localStorageKeys.LAYOUT_ORIENTATION;
      const localLayout = localStorage.getItem(layoutStoreKey);
      const appConfigLayout = state.config.appConfig && state.config.appConfig.layout;
      return localLayout || appConfigLayout || 'auto';
    },
    iconSize(state) {
      const pageId = state.currentConfigInfo.confId;
      const sizeStoreKey = pageId
        ? `${localStorageKeys.ICON_SIZE}-${pageId}` : localStorageKeys.ICON_SIZE;
      const localSize = localStorage.getItem(sizeStoreKey);
      const appConfigSize = state.config.appConfig && state.config.appConfig.iconSize;
      return localSize || appConfigSize || 'medium';
    },
  },
  mutations: {
    /* Set the master config */
    [SET_ROOT_CONFIG](state, config) {
      if (!config.appConfig) config.appConfig = {};
      state.config = config;
    },
    /* The config to display and edit. Will differ from ROOT_CONFIG when using multi-page */
    [SET_CONFIG](state, config) {
      if (!config.appConfig) config.appConfig = {};
      state.config = config;
    },
    [SET_CURRENT_CONFIG_INFO](state, subConfigInfo) {
      state.currentConfigInfo = subConfigInfo;
    },
    [SET_IS_USING_LOCAL_CONFIG](state, isUsingLocalConfig) {
      state.isUsingLocalConfig = isUsingLocalConfig;
    },
    [SET_LANGUAGE](state, lang) {
      const newConfig = state.config;
      newConfig.appConfig.language = lang;
      state.config = newConfig;
    },
    [SET_MODAL_OPEN](state, modalOpen) {
      state.modalOpen = modalOpen;
    },
    [SET_EDIT_MODE](state, editMode) {
      if (editMode !== state.editMode) {
        InfoHandler(editMode ? 'Edit session started' : 'Edit session ended', InfoKeys.EDITOR);
        state.editMode = editMode;
      }
    },
    [CRITICAL_ERROR_MSG](state, message) {
      if (message) ErrorHandler(message);
      state.criticalError = message;
    },
    [UPDATE_ITEM](state, payload) {
      const { itemId, newItem } = payload;
      const newConfig = { ...state.config };
      newConfig.sections.forEach((section, secIndex) => {
        (section.items || []).forEach((item, itemIndex) => {
          if (item.id === itemId) {
            newConfig.sections[secIndex].items[itemIndex] = newItem;
            InfoHandler('Item updated', InfoKeys.EDITOR);
          }
        });
      });
      state.config = newConfig;
    },
    [SET_PAGE_INFO](state, newPageInfo) {
      const newConfig = state.config;
      newConfig.pageInfo = newPageInfo;
      state.config = newConfig;
      InfoHandler('Page info updated', InfoKeys.EDITOR);
    },
    [SET_APP_CONFIG](state, newAppConfig) {
      const newConfig = state.config;
      newConfig.appConfig = newAppConfig;
      state.config = newConfig;
      InfoHandler('App config updated', InfoKeys.EDITOR);
    },
    [SET_PAGES](state, multiPages) {
      const newConfig = state.config;
      newConfig.pages = multiPages;
      state.config = newConfig;
      InfoHandler('Pages updated', InfoKeys.EDITOR);
    },
    [SET_SECTIONS](state, newSections) {
      const newConfig = state.config;
      newConfig.sections = newSections;
      state.config = newConfig;
      InfoHandler('Sections updated', InfoKeys.EDITOR);
    },
    [INSERT_SECTION](state, payload) {
      const { section, index } = payload;
      const config = { ...state.config };
      // Insert the section at the specified index
      config.sections.splice(index, 0, section);
      // Apply item IDs to ensure uniqueness
      config.sections = applyItemId(config.sections);
      state.config = config;
      InfoHandler('Section added', InfoKeys.EDITOR);
    },
    [REMOVE_SECTION](state, sectionName) {
      const config = { ...state.config };
      // Find the section index
      const sectionIndex = config.sections.findIndex(s => s.name === sectionName);
      // Remove the section if found
      if (sectionIndex !== -1) {
        config.sections.splice(sectionIndex, 1);
        // Reapply item IDs to ensure consistency
        config.sections = applyItemId(config.sections);
        state.config = config;
        InfoHandler('Section removed', InfoKeys.EDITOR);
      }
    },
    [UPDATE_SECTION](state, payload) {
      const { sectionIndex, sectionData } = payload;
      const newConfig = { ...state.config };
      newConfig.sections[sectionIndex] = sectionData;
      state.config = newConfig;
      InfoHandler('Section updated', InfoKeys.EDITOR);
    },
    [INSERT_ITEM](state, payload) {
      const { newItem, targetSection, appendTo } = payload;
      const config = { ...state.config };
      
      config.sections.forEach((section) => {
        if (section.name === targetSection) {
          if (!section.items) section.items = [];
          if (appendTo === 'beginning') {
            section.items.unshift(newItem);
          } else {
            section.items.push(newItem);
          }
          InfoHandler('Item added', InfoKeys.EDITOR);
        }
      });
      
      config.sections = applyItemId(config.sections);
      state.config = config;
    },
    [REMOVE_ITEM](state, payload) {
      const { itemId, sectionName } = payload;
      const config = { ...state.config };
      config.sections.forEach((section) => {
        if (section.name === sectionName && section.items) {
          section.items.forEach((item, index) => {
            if (item.id === itemId) {
              section.items.splice(index, 1);
              InfoHandler('Item removed', InfoKeys.EDITOR);
            }
          });
        }
      });
      config.sections = applyItemId(config.sections);
      state.config = config;
    },
    [SET_THEME](state, theme) {
      const newConfig = { ...state.config };
      newConfig.appConfig.theme = theme;
      state.config = newConfig;
      const pageId = state.currentConfigInfo.confId;
      const themeStoreKey = pageId
        ? `${localStorageKeys.THEME}-${pageId}` : localStorageKeys.THEME;
      localStorage.setItem(themeStoreKey, theme);
      InfoHandler('Theme updated', InfoKeys.VISUAL);
    },
    [SET_CUSTOM_COLORS](state, customColors) {
      const newConfig = { ...state.config };
      newConfig.appConfig.customColors = customColors;
      state.config = newConfig;
      InfoHandler('Color palette updated', InfoKeys.VISUAL);
    },
    [SET_ITEM_LAYOUT](state, layout) {
      const newConfig = { ...state.config };
      newConfig.appConfig.layout = layout;
      state.config = newConfig;
      const pageId = state.currentConfigInfo.confId;
      const layoutStoreKey = pageId
        ? `${localStorageKeys.LAYOUT_ORIENTATION}-${pageId}` : localStorageKeys.LAYOUT_ORIENTATION;
      localStorage.setItem(layoutStoreKey, layout);
      InfoHandler('Layout updated', InfoKeys.VISUAL);
    },
    [SET_ITEM_SIZE](state, iconSize) {
      const newConfig = { ...state.config };
      newConfig.appConfig.iconSize = iconSize;
      state.config = newConfig;
      const pageId = state.currentConfigInfo.confId;
      const sizeStoreKey = pageId
        ? `${localStorageKeys.ICON_SIZE}-${pageId}` : localStorageKeys.ICON_SIZE;
      localStorage.setItem(sizeStoreKey, iconSize);
      InfoHandler('Item size updated', InfoKeys.VISUAL);
    },
    [UPDATE_CUSTOM_CSS](state, customCss) {
      state.config.appConfig.customCss = customCss;
      InfoHandler('Custom colors updated', InfoKeys.VISUAL);
    },
    [COPY_ITEM](state, payload) {
      const { item, toSection, appendTo } = payload;
      const config = { ...state.config };
      const newItem = { ...item };
      
      config.sections.forEach((section) => {
        if (section.name === toSection) {
          if (!section.items) section.items = [];
          if (appendTo === 'beginning') {
            section.items.unshift(newItem);
          } else {
            section.items.push(newItem);
          }
          InfoHandler('Item copied', InfoKeys.EDITOR);
        }
      });
      config.sections = applyItemId(config.sections);
      state.config = config;
    },
    [USE_MAIN_CONFIG]() {
      this.dispatch(Keys.INITIALIZE_CONFIG);
    },
  },
  actions: {
    /* Fetches the root config file, only ever called by INITIALIZE_CONFIG */
    async [INITIALIZE_ROOT_CONFIG]({ commit }) {
      const configFilePath = process.env.VUE_APP_CONFIG_PATH || '/conf.yml';
      try {
        // Attempt to fetch the YAML file
        const response = await axios.get(configFilePath, makeBasicAuthHeaders());
        
        try {
          const data = yaml.load(response.data);
          // Replace missing root properties with empty objects
          if (!data.appConfig) data.appConfig = {};
          if (!data.pageInfo) data.pageInfo = {};
          if (!data.sections) data.sections = [];
          // Set the state, and return data
          commit(SET_ROOT_CONFIG, data);
          commit(CRITICAL_ERROR_MSG, null);
          return data;
        } catch (parseError) {
          commit(CRITICAL_ERROR_MSG, `Failed to parse YAML: ${parseError.message}`);
          return { ...emptyConfig };
        }
      } catch (fetchError) {
        if (fetchError.response) {
          commit(
            CRITICAL_ERROR_MSG,
            'Failed to fetch configuration: Server responded with status '
            + `${fetchError.response?.status || 'mystery status'}`,
          );
        } else if (fetchError.request) {
          commit(CRITICAL_ERROR_MSG, 'Failed to fetch configuration: No response from server');
        } else {
          commit(CRITICAL_ERROR_MSG, `Failed to fetch configuration: ${fetchError.message}`);
        }
        return { ...emptyConfig };
      }
    },
    /**
     * Fetches config and updates state
     * If not on sub-page, will trigger the fetch of main config, then use that
     * If using sub-page config, then fetch that sub-config, then
     * override certain fields (appConfig, pages) and update config
     */
    async [INITIALIZE_CONFIG]({ commit, state }, subConfigId) {
      const rootConfig = state.rootConfig || await this.dispatch(Keys.INITIALIZE_ROOT_CONFIG);

      commit(SET_IS_USING_LOCAL_CONFIG, false);
      if (!subConfigId) { // Use root config as config
        commit(SET_CONFIG, rootConfig);
        commit(SET_CURRENT_CONFIG_INFO, {});

        const localSectionsRaw = localStorage.getItem(localStorageKeys.CONF_SECTIONS);
        if (localSectionsRaw) {
          try {
            const json = JSON.parse(localSectionsRaw);
            if (Array.isArray(json) && json.length >= 1) {
              commit(SET_SECTIONS, json);
              commit(SET_IS_USING_LOCAL_CONFIG, true);
            }
          } catch (e) {
            commit(CRITICAL_ERROR_MSG, 'Malformed section data in local storage', e);
          }
        }
      } else {
        // Find and format path to fetch sub-config from
        const subConfigPath = formatConfigPath(rootConfig?.pages?.find(
          (page) => makePageName(page.name) === subConfigId,
        )?.path);

        if (!subConfigPath) {
          commit(CRITICAL_ERROR_MSG, `Unable to find config for '${subConfigId}'`, undefined);
          return state.config;
        }
        
        // Set up config info early
        commit(SET_CURRENT_CONFIG_INFO, { confPath: subConfigPath, confId: subConfigId });
        
        try {
          // Fetch and process the sub-config
          const response = await axios.get(subConfigPath, makeBasicAuthHeaders());
          
          // Parse the YAML
          const configContent = yaml.load(response.data) || {};
          
          // Certain values must be inherited from root config
          const theme = configContent?.appConfig?.theme || rootConfig.appConfig?.theme || 'default';
          configContent.appConfig = { ...rootConfig.appConfig };
          configContent.pages = rootConfig.pages;
          configContent.appConfig.theme = theme;

          // Set the config
          commit(SET_CONFIG, configContent);
          
          // Load local sections if they exist
          const localStorageKey = `${localStorageKeys.CONF_SECTIONS}-${subConfigId}`;
          const localSectionsRaw = localStorage.getItem(localStorageKey);
          if (localSectionsRaw) {
            try {
              const json = JSON.parse(localSectionsRaw);
              if (Array.isArray(json) && json.length >= 1) {
                commit(SET_SECTIONS, json);
                commit(SET_IS_USING_LOCAL_CONFIG, true);
              }
            } catch (e) {
              commit(CRITICAL_ERROR_MSG, 'Malformed section data in local storage for sub-config', e);
            }
          }
          
          return state.config;
        } catch (err) {
          commit(CRITICAL_ERROR_MSG, `Unable to load config: ${err.message}`, err);
          return state.config;
        }
      }
      return state.config;
    },
  },
  modules: {},
});

export default store;
