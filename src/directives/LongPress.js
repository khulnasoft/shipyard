/**
 * Vue directive for detecting a long-press event
 * Triggers a custom 'long-press' event after set delay
 * @author lissy93
 */

const DEFAULT_DELAY = 400; /* Time to hold in ms */

// Helper function to safely set dataset property
function safeSetDataset(el, key, value) {
  if (el && el.dataset) {
    el.dataset[key] = value;
  }
}

// Helper function to safely get dataset property
function safeGetDataset(el, key, defaultValue = null) {
  if (el && el.dataset && el.dataset[key] !== undefined) {
    return el.dataset[key];
  }
  return defaultValue;
}

// Helper to emit event both directly and via Vue component
function emitLongPressEvent(el, vnode) {
  try {
    // Dispatch DOM event
    const event = new CustomEvent('long-press');
    el.dispatchEvent(event);
    
    // Emit Vue component event if available
    if (vnode && vnode.componentInstance && typeof vnode.componentInstance.$emit === 'function') {
      vnode.componentInstance.$emit('long-press');
    } else if (vnode && vnode.context && typeof vnode.context.$emit === 'function') {
      // Alternative way to emit events in some Vue component structures
      vnode.context.$emit('long-press');
    }
  } catch (error) {
    console.error('Error emitting long-press event:', error);
  }
}

export default {
  bind(element, binding, vnode) {
    const el = element;
    
    // Initialize dataset properties safely
    safeSetDataset(el, 'longPressTimeout', 'null');
    safeSetDataset(el, 'longPress', 'false');
    safeSetDataset(el, 'elapsed', 'false');

    const swallowClick = (e) => {
      // Stop the click from propagating
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      
      // Clean up the click listener after handling
      el.removeEventListener('click', el.$longPressClickHandler);
    };

    /* When touch/pointer is held down, begin counting */
    const downHandler = (e) => {
      /* For right-click, immediately return */
      if (e.button === 2 || e.which === 3) {
        // Clear any existing timeout to be safe
        const existingTimeout = parseInt(safeGetDataset(el, 'longPressTimeout', 'null'), 10);
        if (!isNaN(existingTimeout)) {
          clearTimeout(existingTimeout);
          safeSetDataset(el, 'longPressTimeout', 'null');
        }
        return;
      }

      /* Prevent the context menu from showing on long-press (mobile) */
      e.preventDefault();

      // Record state
      safeSetDataset(el, 'longPress', 'false');
      safeSetDataset(el, 'elapsed', 'false');

      /* Clear any existing timeout to prevent memory leaks */
      const existingTimeout = parseInt(safeGetDataset(el, 'longPressTimeout', 'null'), 10);
      if (!isNaN(existingTimeout)) {
        clearTimeout(existingTimeout);
      }

      /* Kick off timeout */
      const timeoutId = setTimeout(() => {
        safeSetDataset(el, 'elapsed', 'true');
        safeSetDataset(el, 'longPress', 'true');

        /* Make click listener to prevent followed click */
        el.addEventListener('click', el.$longPressClickHandler);

        /* Emit events */
        emitLongPressEvent(el, vnode);

        /* Cleanup document listeners */
        document.removeEventListener('pointerup', el.$longPressUpHandler);
        el.removeEventListener('pointermove', el.$longPressMoveHandler);
      }, binding.value || DEFAULT_DELAY);
      
      safeSetDataset(el, 'longPressTimeout', timeoutId.toString());

      /* Add listener to cancel timer on touch up / pointer up */
      document.addEventListener('pointerup', el.$longPressUpHandler);

      /* Add listener to cancel on movement (more than a tiny bit) */
      el.addEventListener('pointermove', el.$longPressMoveHandler);
    };

    /* If user releases touch before timeout - cancel */
    const upHandler = () => {
      /* Clear timeout, if it hasn't yet elapsed */
      if (safeGetDataset(el, 'elapsed', 'false') === 'false') {
        const existingTimeout = parseInt(safeGetDataset(el, 'longPressTimeout', 'null'), 10);
        if (!isNaN(existingTimeout)) {
          clearTimeout(existingTimeout);
          safeSetDataset(el, 'longPressTimeout', 'null');
        }
      }
      document.removeEventListener('pointerup', el.$longPressUpHandler);
      el.removeEventListener('pointermove', el.$longPressMoveHandler);
    };

    /* If user moves finger before timeout - cancel */
    const moveHandler = () => {
      /* Clear timeout, if it hasn't yet elapsed */
      if (safeGetDataset(el, 'elapsed', 'false') === 'false') {
        const existingTimeout = parseInt(safeGetDataset(el, 'longPressTimeout', 'null'), 10);
        if (!isNaN(existingTimeout)) {
          clearTimeout(existingTimeout);
          safeSetDataset(el, 'longPressTimeout', 'null');
        }
        safeSetDataset(el, 'longPress', 'false');
        document.removeEventListener('pointerup', el.$longPressUpHandler);
        el.removeEventListener('pointermove', el.$longPressMoveHandler);
      }
    };

    // Store handlers directly on the element with $ prefix to match Vue convention
    el.$longPressDownHandler = downHandler;
    el.$longPressUpHandler = upHandler;
    el.$longPressMoveHandler = moveHandler;
    el.$longPressClickHandler = swallowClick;
    
    // Legacy property name for test compatibility
    el.longPressDownHandler = downHandler;
    
    // Add initial event listener
    el.addEventListener('pointerdown', el.$longPressDownHandler);
  },

  /* Dispose of all listeners when unbinding */
  unbind(element, binding, vnode) {
    if (!element) return;
    
    const el = element;
    
    // Clear the timeout
    const existingTimeout = parseInt(safeGetDataset(el, 'longPressTimeout', 'null'), 10);
    if (!isNaN(existingTimeout)) {
      clearTimeout(existingTimeout);
    }
    
    // Remove all event listeners
    if (el.$longPressDownHandler) {
      el.removeEventListener('pointerdown', el.$longPressDownHandler);
    }
    
    if (el.$longPressUpHandler) {
      document.removeEventListener('pointerup', el.$longPressUpHandler);
    }
    
    if (el.$longPressMoveHandler) {
      el.removeEventListener('pointermove', el.$longPressMoveHandler);
    }
    
    if (el.$longPressClickHandler) {
      el.removeEventListener('click', el.$longPressClickHandler);
    }
    
    // Clear all stored handlers to prevent memory leaks
    el.$longPressDownHandler = null;
    el.$longPressUpHandler = null;
    el.$longPressMoveHandler = null;
    el.$longPressClickHandler = null;
    el.longPressDownHandler = null; // Clear legacy property
  },
};
