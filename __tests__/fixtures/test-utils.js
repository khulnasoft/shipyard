/**
 * Common test utilities and helpers for Jest tests
 */

import { createLocalVue, shallowMount, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';

/**
 * Creates a local Vue instance with common plugins
 * @returns {Object} A local Vue instance
 */
export const createTestVue = () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);
  
  // Add directives needed for testing
  localVue.directive('tooltip', {
    bind(el, binding) {
      // Mock implementation
    }
  });
  
  return localVue;
};

/**
 * Creates a Vuex store with mock state for testing
 * @param {Object} options - Store options
 * @returns {Object} A mock Vuex store
 */
export const createMockStore = (options = {}) => {
  const defaultState = {
    config: {
      appConfig: { language: 'en' },
      pageInfo: {},
      sections: []
    },
    rootConfig: {},
    currentConfigInfo: {},
    isUsingLocalConfig: false,
    isEditMode: false,
    modalOpen: false,
    criticalErrorMsg: null
  };
  
  return new Vuex.Store({
    state: { ...defaultState, ...options.state },
    getters: {
      config: state => state.config,
      pageInfo: state => state.config.pageInfo,
      appConfig: state => state.config.appConfig,
      sections: state => state.config.sections,
      theme: () => 'light',
      visibleComponents: () => ({
        pageTitle: true,
        navigation: true,
        searchBar: true,
        settings: true,
        footer: true,
      }),
      webSearch: () => ({}),
      permissions: () => ({ canEdit: true }),
      ...options.getters
    },
    mutations: {
      SET_CONFIG: jest.fn(),
      SET_ROOT_CONFIG: jest.fn(),
      SET_CURRENT_CONFIG_INFO: jest.fn(),
      SET_IS_USING_LOCAL_CONFIG: jest.fn(),
      SET_LANGUAGE: jest.fn(),
      SET_MODAL_OPEN: jest.fn(),
      SET_EDIT_MODE: jest.fn(),
      CRITICAL_ERROR_MSG: jest.fn(),
      ...options.mutations
    },
    actions: {
      INITIALIZE_ROOT_CONFIG: jest.fn(),
      INITIALIZE_CONFIG: jest.fn(),
      ...options.actions
    }
  });
};

/**
 * Helper to mount components with common dependencies
 * @param {Object} Component - Vue component to mount
 * @param {Object} options - Mount options
 * @returns {Object} Mounted component wrapper
 */
export const mountComponent = (Component, options = {}) => {
  const localVue = options.localVue || createTestVue();
  const store = options.store || createMockStore();
  
  return mount(Component, {
    localVue,
    store,
    ...options
  });
};

/**
 * Helper to shallow mount components with common dependencies
 * @param {Object} Component - Vue component to mount
 * @param {Object} options - Mount options
 * @returns {Object} Mounted component wrapper
 */
export const shallowMountComponent = (Component, options = {}) => {
  const localVue = options.localVue || createTestVue();
  const store = options.store || createMockStore();
  
  return shallowMount(Component, {
    localVue,
    store,
    ...options
  });
};

/**
 * Mocks window.location object properties
 * @param {Object} props - Properties to mock on window.location
 */
export const mockWindowLocation = (props = {}) => {
  const originalLocation = window.location;
  delete window.location;
  
  window.location = {
    href: 'https://example.com',
    search: '',
    pathname: '/',
    origin: 'https://example.com',
    protocol: 'https:',
    host: 'example.com',
    hostname: 'example.com',
    port: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    ...props
  };
  
  return () => {
    window.location = originalLocation;
  };
};

/**
 * Helper to wait for the next tick in Vue
 * @returns {Promise} Promise that resolves after Vue's next tick
 */
export const nextTick = () => Vue.nextTick();

/**
 * Helper to mock Progress class
 * @returns {Object} Mock Progress instance
 */
export const createMockProgress = () => ({
  start: jest.fn(),
  end: jest.fn()
}); 