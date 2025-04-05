/**
 * Mock for ConfigAccumulator
 */

const ConfigAccumulator = jest.fn().mockImplementation(function(conf = {}) {
  this.conf = conf;
  this.appConfig = jest.fn().mockReturnValue({});
  this.pageInfo = jest.fn().mockReturnValue({});
  this.sections = jest.fn().mockReturnValue([]);
  this.pages = jest.fn().mockReturnValue([]);
  
  // Add method mocks
  this.getAllSections = jest.fn().mockReturnValue([]);
  this.getSection = jest.fn().mockReturnValue({});
  this.getPage = jest.fn().mockReturnValue({});
  this.getSectionsForPage = jest.fn().mockReturnValue([]);
  this.getItemsForSection = jest.fn().mockReturnValue([]);
});

// Add static methods for Jest
ConfigAccumulator.mockClear = jest.fn();
ConfigAccumulator.mockReset = jest.fn();
ConfigAccumulator.mockRestore = jest.fn();

export default ConfigAccumulator; 