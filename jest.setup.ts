// Global test setup file for Vue 2 component testing

// Mock Vue's directive system for tests when needed
import Vue from 'vue';

// Configure Vue for testing
Vue.config.productionTip = false;
Vue.config.devtools = false;

// Mock v-tooltip directive
Vue.directive('tooltip', {
  bind(el, binding) {
    const value = extractTooltipText(binding.value);
    el.setAttribute('title', value);
  },
  update(el, binding) {
    const value = extractTooltipText(binding.value);
    el.setAttribute('title', value);
  }
});

// Helper function to extract text from tooltip values
function extractTooltipText(value: any): string {
  if (!value) return '';
  
  // If it's a string, return it directly
  if (typeof value === 'string') return value;
  
  // If it's an object, try to find the text content
  if (typeof value === 'object') {
    if (value.content) return value.content;
    if (value.text) return value.text;
    // Add other potential property names here
  }
  
  // Fallback: try to return a sensible string representation
  return String(value);
}

// Optional: Register global components for tests
// import SomeGlobalComponent from '@/components/SomeGlobalComponent.vue';
// Vue.component('some-global-component', SomeGlobalComponent);

// Optional: Mock Window properties
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string): string => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string): void => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string): void => {
      delete store[key];
    }),
    clear: jest.fn((): void => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Optional: Add custom Jest matchers
// expect.extend({
//   toBeValidComponent(received) {
//     const pass = received && typeof received === 'object';
//     return {
//       pass,
//       message: () => `expected ${received} to be a valid Vue component`,
//     };
//   },
// });

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Polyfill for PointerEvent if not available in JSDOM
if (typeof PointerEvent === 'undefined') {
  // @ts-ignore
  class PointerEvent extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || 'mouse';
      this.isPrimary = params.isPrimary ?? true;
    }
  }
  
  // @ts-ignore
  window.PointerEvent = PointerEvent;
}
