import { mount, createLocalVue } from '@vue/test-utils';
import { Component, Vue } from 'vue-property-decorator';
import WidgetMixin from '@/mixins/WidgetMixin';
import axios from 'axios';
import { Progress } from 'rsup-progress';
import ErrorHandler from '@/utils/ErrorHandler';
import { serviceEndpoints } from '@/utils/defaults';

// Mock dependencies
jest.mock('axios');
jest.mock('@/utils/ErrorHandler');
jest.mock('rsup-progress');

// Create a test component that uses the mixin
@Component
class TestWidget extends Vue {
  mixins = [WidgetMixin];
  
  // Override the default fetchData method for testing
  fetchData() {
    // Custom implementation for testing
    this.$emit('data-fetched');
    (this as any).finishLoading();
  }
}

describe('WidgetMixin', () => {
  let localVue: any;
  let wrapper: any;
  let originalEnv: any;
  
  beforeEach(() => {
    // Create a local Vue instance
    localVue = createLocalVue();
    
    // Mock Progress class
    (Progress as jest.Mock).mockImplementation(() => ({
      start: jest.fn(),
      end: jest.fn()
    }));
    
    // Mock axios request
    (axios.request as jest.Mock).mockImplementation(() => 
      Promise.resolve({ data: { success: true, result: 'test-data' } })
    );
    
    // Save original process.env
    originalEnv = { ...process.env };
    
    // Mock environment variables
    process.env.VUE_APP_DOMAIN = 'https://test-domain.com';
    process.env.VUE_APP_TEST_VAR = 'test-value';
    
    // Mock Date.now and setTimeout
    jest.useFakeTimers();
    
    // Create component with mixin
    wrapper = mount(TestWidget, {
      localVue,
      propsData: {
        options: {}
      }
    });
    
    // Clear mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    
    // Restore timers
    jest.useRealTimers();
    
    // Clean up
    wrapper.destroy();
  });
  
  // 1. Component Lifecycle Tests
  describe('lifecycle hooks', () => {
    test('mounted hook calls fetchData', () => {
      const mockFetchData = jest.fn();
      const component = {
        mixins: [WidgetMixin],
        fetchData: mockFetchData,
        updateInterval: 0
      };
      
      const vmComponent = mount({
        mixins: [component]
      });
      
      expect(mockFetchData).toHaveBeenCalledTimes(1);
    });
    
    test('sets up continuous updates when updateInterval is defined', () => {
      const mockContinuousUpdates = jest.fn();
      const component = {
        mixins: [WidgetMixin],
        fetchData: jest.fn(),
        continuousUpdates: mockContinuousUpdates,
        computed: {
          updateInterval: () => 30000
        }
      };
      
      const vmComponent = mount({
        mixins: [component]
      });
      
      expect(mockContinuousUpdates).toHaveBeenCalledTimes(1);
    });
    
    test('beforeDestroy clears interval if updater exists', () => {
      // Mock setInterval and clearInterval
      const setIntervalSpy = jest.spyOn(window, 'setInterval');
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      
      // Create component with updateInterval
      const wrapperWithInterval = mount(TestWidget, {
        localVue,
        propsData: {
          options: {
            updateInterval: 30
          }
        }
      });
      
      // Ensure setInterval was called
      expect(setIntervalSpy).toHaveBeenCalled();
      
      // Destroy component
      wrapperWithInterval.destroy();
      
      // Ensure clearInterval was called
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
  
  // 2. Computed Properties Tests
  describe('computed properties', () => {
    test('proxyReqEndpoint returns correct endpoint', () => {
      const endpoint = wrapper.vm.proxyReqEndpoint;
      expect(endpoint).toBe(`${process.env.VUE_APP_DOMAIN}${serviceEndpoints.corsProxy}`);
    });
    
    test('proxyReqEndpoint uses window.location.origin when VUE_APP_DOMAIN is not set', () => {
      // Remove VUE_APP_DOMAIN
      delete process.env.VUE_APP_DOMAIN;
      
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://window-origin.com'
        },
        writable: true
      });
      
      const newWrapper = mount(TestWidget, {
        localVue,
        propsData: {
          options: {}
        }
      });
      
      const endpoint = newWrapper.vm.proxyReqEndpoint;
      expect(endpoint).toBe(`https://window-origin.com${serviceEndpoints.corsProxy}`);
    });
    
    test('useProxy returns options.useProxy value', () => {
      const wrapperWithProxy = mount(TestWidget, {
        localVue,
        propsData: {
          options: {
            useProxy: true
          }
        }
      });
      
      expect(wrapperWithProxy.vm.useProxy).toBe(true);
    });
    
    test('useProxy returns overrideProxyChoice when set', async () => {
      expect(wrapper.vm.useProxy).toBe(false);
      
      // Set override
      wrapper.vm.overrideProxyChoice = true;
      
      // Force computed property recalculation
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.useProxy).toBe(true);
    });
    
    describe('updateInterval', () => {
      test('returns 0 when no interval specified', () => {
        expect(wrapper.vm.updateInterval).toBe(0);
      });
      
      test('returns default 30 seconds when set to true', () => {
        const wrapperWithInterval = mount(TestWidget, {
          localVue,
          propsData: {
            options: {
              updateInterval: true
            }
          }
        });
        
        expect(wrapperWithInterval.vm.updateInterval).toBe(30 * 1000);
      });
      
      test('returns user-specified interval in milliseconds', () => {
        const wrapperWithCustomInterval = mount(TestWidget, {
          localVue,
          propsData: {
            options: {
              updateInterval: 60 // 60 seconds
            }
          }
        });
        
        expect(wrapperWithCustomInterval.vm.updateInterval).toBe(60 * 1000);
      });
      
      test('returns 0 if interval is out of range', () => {
        // Test too small
        const wrapperSmallInterval = mount(TestWidget, {
          localVue,
          propsData: {
            options: {
              updateInterval: 1 // Too small
            }
          }
        });
        
        expect(wrapperSmallInterval.vm.updateInterval).toBe(0);
        
        // Test too large
        const wrapperLargeInterval = mount(TestWidget, {
          localVue,
          propsData: {
            options: {
              updateInterval: 8000 // Too large
            }
          }
        });
        
        expect(wrapperLargeInterval.vm.updateInterval).toBe(0);
      });
      
      test('uses overrideUpdateInterval when options.updateInterval is null', () => {
        const wrapperWithOverride = mount(TestWidget, {
          localVue,
          propsData: {
            options: {
              updateInterval: null
            }
          }
        });
        
        // Set override
        wrapperWithOverride.vm.overrideUpdateInterval = 45;
        
        expect(wrapperWithOverride.vm.updateInterval).toBe(45 * 1000);
      });
    });
  });
  
  // 3. Methods Tests
  describe('methods', () => {
    test('update method calls startLoading and fetchData', () => {
      const startLoadingSpy = jest.spyOn(wrapper.vm, 'startLoading');
      const fetchDataSpy = jest.spyOn(wrapper.vm, 'fetchData');
      
      wrapper.vm.update();
      
      expect(startLoadingSpy).toHaveBeenCalledTimes(1);
      expect(fetchDataSpy).toHaveBeenCalledTimes(1);
    });
    
    test('continuousUpdates sets up interval with correct timing', () => {
      const setIntervalSpy = jest.spyOn(window, 'setInterval');
      const updateSpy = jest.spyOn(wrapper.vm, 'update');
      
      // Set update interval
      wrapper.setProps({
        options: {
          updateInterval: 5 // 5 seconds
        }
      });
      
      wrapper.vm.continuousUpdates();
      
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
      
      // Fast-forward time and check update is called
      jest.advanceTimersByTime(5000);
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
    
    test('error method calls ErrorHandler and emits event', () => {
      const errorMsg = 'Test error';
      const errorTrace = 'Error trace';
      
      wrapper.vm.error(errorMsg, errorTrace);
      
      // Check ErrorHandler was called
      expect(ErrorHandler).toHaveBeenCalledWith(errorMsg, errorTrace);
      
      // Check event was emitted
      expect(wrapper.emitted().error).toBeTruthy();
      expect(wrapper.emitted().error[0]).toEqual([errorMsg]);
    });
    
    test('error method does not emit when ignoreErrors option is true', () => {
      wrapper.setProps({
        options: {
          ignoreErrors: true
        }
      });
      
      wrapper.vm.error('Test error');
      
      // Check event was not emitted
      expect(wrapper.emitted().error).toBeFalsy();
    });
    
    test('startLoading method emits loading event and starts progress', () => {
      wrapper.vm.startLoading();
      
      // Check loading event
      expect(wrapper.emitted().loading).toBeTruthy();
      expect(wrapper.emitted().loading[0]).toEqual([true]);
      
      // Check progress started
      expect(wrapper.vm.progress.start).toHaveBeenCalled();
    });
    
    test('startLoading does not emit when disableLoader is true', () => {
      wrapper.vm.disableLoader = true;
      wrapper.vm.startLoading();
      
      // Check loading event was not emitted
      expect(wrapper.emitted().loading).toBeFalsy();
      expect(wrapper.vm.progress.start).not.toHaveBeenCalled();
    });
    
    test('finishLoading method emits loading event and ends progress', () => {
      wrapper.vm.finishLoading();
      
      // Check loading event
      expect(wrapper.emitted().loading).toBeTruthy();
      expect(wrapper.emitted().loading[0]).toEqual([false]);
      
      // Check progress end is called after timeout
      expect(wrapper.vm.progress.end).not.toHaveBeenCalled();
      jest.advanceTimersByTime(500);
      expect(wrapper.vm.progress.end).toHaveBeenCalled();
    });
    
    test('tooltip method returns correct configuration', () => {
      const content = 'Tooltip content';
      const tooltip = wrapper.vm.tooltip(content);
      
      expect(tooltip).toEqual({
        content,
        html: false,
        trigger: 'hover focus',
        delay: 250
      });
      
      // Test with HTML
      const htmlTooltip = wrapper.vm.tooltip(content, true);
      expect(htmlTooltip.html).toBe(true);
    });
    
    describe('makeRequest method', () => {
      test('makes request with correct configuration', async () => {
        const endpoint = 'https://api.example.com/data';
        const options = { Authorization: 'Bearer token' };
        
        await wrapper.vm.makeRequest(endpoint, options);
        
        expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
          method: 'GET',
          url: endpoint,
          headers: options,
          timeout: wrapper.vm.defaultTimeout
        }));
      });
      
      test('uses proxy when useProxy is true', async () => {
        const endpoint = 'https://api.example.com/data';
        wrapper.vm.overrideProxyChoice = true;
        
        await wrapper.vm.makeRequest(endpoint);
        
        expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
          url: wrapper.vm.proxyReqEndpoint,
          headers: {
            'Target-URL': endpoint,
            CustomHeaders: JSON.stringify(null)
          }
        }));
      });
      
      test('handles successful response', async () => {
        const responseData = { success: true, result: 'test-data' };
        (axios.request as jest.Mock).mockResolvedValueOnce({ data: responseData });
        
        const result = await wrapper.vm.makeRequest('https://api.example.com/data');
        
        expect(result).toEqual(responseData);
      });
      
      test('handles error from proxy', async () => {
        const responseData = { success: false, message: 'Proxy error' };
        (axios.request as jest.Mock).mockResolvedValueOnce({ data: responseData });
        
        const errorSpy = jest.spyOn(wrapper.vm, 'error');
        const result = await wrapper.vm.makeRequest('https://api.example.com/data');
        
        expect(errorSpy).toHaveBeenCalledWith('Proxy returned error from target server', 'Proxy error');
        expect(result).toEqual(responseData);
      });
      
      test('handles request failure', async () => {
        const requestError = new Error('Network error');
        (axios.request as jest.Mock).mockRejectedValueOnce(requestError);
        
        const errorSpy = jest.spyOn(wrapper.vm, 'error');
        
        try {
          await wrapper.vm.makeRequest('https://api.example.com/data');
        } catch (error) {
          expect(error).toBe(requestError);
        }
        
        expect(errorSpy).toHaveBeenCalledWith('Unable to fetch data', requestError);
      });
      
      test('always calls finishLoading after request', async () => {
        const finishLoadingSpy = jest.spyOn(wrapper.vm, 'finishLoading');
        
        // Test successful request
        await wrapper.vm.makeRequest('https://api.example.com/data');
        expect(finishLoadingSpy).toHaveBeenCalledTimes(1);
        
        finishLoadingSpy.mockClear();
        
        // Test failed request
        (axios.request as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
        try {
          await wrapper.vm.makeRequest('https://api.example.com/data');
        } catch (error) {
          // Error expected
        }
        expect(finishLoadingSpy).toHaveBeenCalledTimes(1);
      });
      
      test('uses custom timeout when specified in options', async () => {
        const customTimeout = 30000;
        wrapper.setProps({
          options: {
            timeout: customTimeout
          }
        });
        
        await wrapper.vm.makeRequest('https://api.example.com/data');
        
        expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
          timeout: customTimeout
        }));
      });
    });
    
    describe('parseAsEnvVar method', () => {
      test('returns input as-is if not a string', () => {
        const input = { key: 'value' };
        expect(wrapper.vm.parseAsEnvVar(input)).toBe(input);
        
        const numberInput = 42;
        expect(wrapper.vm.parseAsEnvVar(numberInput)).toBe(numberInput);
      });
      
      test('returns input as-is if not an environment variable reference', () => {
        const input = 'just a regular string';
        expect(wrapper.vm.parseAsEnvVar(input)).toBe(input);
      });
      
      test('returns environment variable value when found', () => {
        const envVar = 'VUE_APP_TEST_VAR';
        process.env[envVar] = 'test-value';
        
        expect(wrapper.vm.parseAsEnvVar(envVar)).toBe('test-value');
      });
      
      test('calls error method and returns original string when env var not found', () => {
        const envVar = 'VUE_APP_NONEXISTENT_VAR';
        const errorSpy = jest.spyOn(wrapper.vm, 'error');
        
        expect(wrapper.vm.parseAsEnvVar(envVar)).toBe(envVar);
        expect(errorSpy).toHaveBeenCalledWith(`Environment variable ${envVar} not found`);
      });
    });
  });
  
  // 4. Data handling and props validation
  describe('props validation', () => {
    test('default options prop is an empty object', () => {
      const defaultPropValue = wrapper.vm.$options.props.options.default;
      expect(typeof defaultPropValue).toBe('object');
      expect(Object.keys(defaultPropValue)).toHaveLength(0);
    });
    
    test('options prop is an object type', () => {
      expect(wrapper.vm.$options.props.options.type).toBe(Object);
    });
    
    test('handles various option values correctly', () => {
      const testOptionsWrapper = mount(TestWidget, {
        localVue,
        propsData: {
          options: {
            useProxy: true,
            updateInterval: 30,
            timeout: 10000,
            ignoreErrors: true
          }
        }
      });
      
      expect(testOptionsWrapper.vm.useProxy).toBe(true);
      expect(testOptionsWrapper.vm.updateInterval).toBe(30000);
      expect(testOptionsWrapper.vm.options.timeout).toBe(10000);
    });
  });
  
  // 5. Integration tests
  describe('integration behaviors', () => {
    test('full update cycle works correctly', async () => {
      const startLoadingSpy = jest.spyOn(wrapper.vm, 'startLoading');
      const fetchDataSpy = jest.spyOn(wrapper.vm, 'fetchData');
      const finishLoadingSpy = jest.spyOn(wrapper.vm, 'finishLoading');
      
      wrapper.vm.update();
      
      expect(startLoadingSpy).toHaveBeenCalled();
      expect(fetchDataSpy).toHaveBeenCalled();
      
      // Should emit events
      expect(wrapper.emitted()['data-fetched']).toBeTruthy();
      expect(wrapper.emitted().loading).toBeTruthy();
      expect(wrapper.emitted().loading[0]).toEqual([false]);
      
      // Advance timers to check progress end
      jest.advanceTimersByTime(500);
      expect(wrapper.vm.progress.end).toHaveBeenCalled();
    });
    
    test('automatic updates work with update interval', async () => {
      const updateSpy = jest.spyOn(wrapper.vm, 'update');
      
      // Set up with a 5 second interval
      wrapper.setProps({
        options: {
          updateInterval: 5
        }
      });
      
      // The mounted hook should have already called continuousUpdates
      // Fast-forward 5 seconds and check update is called
      jest.advanceTimersByTime(5000);
      expect(updateSpy).toHaveBeenCalledTimes(1);
      
      // Fast-forward another 5 seconds
      jest.advanceTimersByTime(5000);
      expect(updateSpy).toHaveBeenCalledTimes(2);
    });
  });
});

