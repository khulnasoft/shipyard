/**
 * Mock for InfoHandler utility
 */

// Create InfoKeys mock
const InfoKeys = {
  EDIT_ENABLED: 'edit-enabled',
  EDIT_DISABLED: 'edit-disabled',
  CONFIG_UPDATED: 'config-updated',
  CONFIG_SAVED: 'config-saved',
  CONFIG_SAVE_ERROR: 'config-save-error',
  CONFIG_LOAD_ERROR: 'config-load-error'
};

// Create InfoHandler function mock
const InfoHandler = jest.fn();

// Export default and named exports
InfoHandler.InfoKeys = InfoKeys;
export { InfoKeys, InfoHandler };
export default InfoHandler; 