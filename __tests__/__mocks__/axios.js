/**
 * Mock for axios HTTP client
 */

const mockAxiosInstance = {
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} }),
  patch: jest.fn().mockResolvedValue({ data: {} }),
  request: jest.fn().mockResolvedValue({ data: {} }),
  defaults: {
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      delete: {},
      patch: {}
    },
    baseURL: '',
    timeout: 0
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn()
    }
  }
};

// Main axios mock
const axios = jest.fn().mockImplementation(() => mockAxiosInstance);

// Add static methods
axios.get = jest.fn().mockResolvedValue({ data: {} });
axios.post = jest.fn().mockResolvedValue({ data: {} });
axios.put = jest.fn().mockResolvedValue({ data: {} });
axios.delete = jest.fn().mockResolvedValue({ data: {} });
axios.patch = jest.fn().mockResolvedValue({ data: {} });
axios.request = jest.fn().mockResolvedValue({ data: {} });
axios.create = jest.fn().mockReturnValue(mockAxiosInstance);
axios.CancelToken = {
  source: jest.fn().mockReturnValue({
    token: {},
    cancel: jest.fn()
  })
};
axios.isCancel = jest.fn().mockReturnValue(false);
axios.all = jest.fn().mockImplementation(promises => Promise.all(promises));
axios.spread = jest.fn(callback => data => callback(...data));
axios.defaults = mockAxiosInstance.defaults;
axios.interceptors = mockAxiosInstance.interceptors;

// Export
export default axios; 