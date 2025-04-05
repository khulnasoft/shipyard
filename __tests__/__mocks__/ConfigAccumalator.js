/**
 * Mock for ConfigAccumalator
 * This mock is designed to break circular dependencies in tests
 */

// Create a constructor function with mock implementation
const ConfigAccumulator = jest.fn().mockImplementation(function() {
  this.conf = {
    appConfig: { language: 'en' },
    pageInfo: {},
    sections: [],
    pages: []
  };
  
  this.appConfig = jest.fn().mockReturnValue({ language: 'en' });
  this.pageInfo = jest.fn().mockReturnValue({});
  this.sections = jest.fn().mockReturnValue([]);
  this.pages = jest.fn().mockReturnValue([]);
  this.config = jest.fn().mockReturnValue({
    appConfig: { language: 'en' },
    pageInfo: {},
    sections: [],
    pages: []
  });
});

// Add the constructor method for proper instantiation
ConfigAccumulator.prototype.constructor = ConfigAccumulator;

// Add static methods/properties if needed
ConfigAccumulator.mockClear = jest.fn();
ConfigAccumulator.mockReset = jest.fn();
ConfigAccumulator.mockRestore = jest.fn();

module.exports = ConfigAccumulator; 