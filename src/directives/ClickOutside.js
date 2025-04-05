/**
 * A Vue directive to trigger an event when the user
 * clicks anywhere other than the specified elements
 * Used to close context menus popup modals and tips
 * Shipyard: Licensed under MIT - (C) KhulnaSoft Ltd 2024
 */

// Use a Map to store handlers for each element
const handlers = new Map();

// For backward compatibility with tests
const instances = [];

/* Trigger action when click anywhere, except target elem */
function onDocumentClick(event, elem, action) {
  if (!action || typeof action !== 'function') return;
  
  const { target } = event;
  
  // Check if the click was outside the element
  const isOutside = elem !== target && !elem.contains(target);
  
  // Check for shadow DOM
  const isInShadow = elem.shadowRoot && elem.shadowRoot.contains(target);
  
  if (isOutside && !isInShadow) {
    action(event);
  }
}

export default {
  /* Add event listeners */
  bind(element, binding) {
    const elem = element;
    const action = binding.value;
    
    // Create the event handler
    const click = (event) => {
      onDocumentClick(event, elem, action);
    };
    
    // Store the handler
    handlers.set(elem, click);
    
    // Set the index for compatibility with tests
    elem.dataset.outsideClickIndex = instances.length;
    instances.push(click);
    
    // Add event listeners
    document.addEventListener('click', click);
    document.addEventListener('touchstart', click);
  },
  
  /* Remove event listeners */
  unbind(elem) {
    if (!elem || !elem.dataset) return;
    
    // Get the handler from our Map
    const handler = handlers.get(elem);
    
    if (handler) {
      // Remove event listeners
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
      
      // Remove from our Maps
      handlers.delete(elem);
      
      // For backward compatibility with tests
      const index = parseInt(elem.dataset.outsideClickIndex || '0', 10);
      if (index >= 0 && index < instances.length) {
        instances.splice(index, 1);
      }
    }
  },
  
  // Expose our instances array for testing
  instances
};
