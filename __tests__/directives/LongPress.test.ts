import LongPress from '@/directives/LongPress';

// Constants from the directive
const LONG_PRESS_DEFAULT_DELAY = 750;

describe('LongPress Directive', () => {
  // Mock elements, events, and Vue component context
  let element: HTMLElement;
  let vnode: any;
  let binding: any;
  let customEventSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // Set up DOM element
    element = document.createElement('div');
    document.body.appendChild(element);
    
    // Mock Vue node
    vnode = {
      componentInstance: {
        $emit: jest.fn()
      }
    };
    
    // Mock directive binding
    binding = {};
    
    // Add CustomEvent to window if not supported by jsdom
    if (typeof window.CustomEvent !== 'function') {
      window.CustomEvent = function(event: string, params: any) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      };
      (window.CustomEvent as any).prototype = window.Event.prototype;
    }
    
    // Spy on dispatchEvent
    customEventSpy = jest.spyOn(element, 'dispatchEvent');
    
    // Mock timers
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Clean up
    document.body.removeChild(element);
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  
  // 1. Test directive binding and unbinding
  describe('lifecycle', () => {
    test('should add event listener on bind', () => {
      const addEventSpy = jest.spyOn(element, 'addEventListener');
      
      LongPress.bind(element, binding, vnode);
      
      expect(addEventSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(element.$longPressHandler).toBeDefined();
    });
    
    test('should remove event listener on unbind', () => {
      const removeEventSpy = jest.spyOn(element, 'removeEventListener');
      
      LongPress.bind(element, binding, vnode);
      LongPress.unbind(element, binding, vnode);
      
      expect(removeEventSpy).toHaveBeenCalledWith('pointerdown', element.$longPressHandler);
    });
    
    test('should clear timeout on unbind', () => {
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
      
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown to set the timeout
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      expect(element.dataset.longPressTimeout).toBeDefined();
      
      LongPress.unbind(element, binding, vnode);
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
  
  // 2. Test long press event triggering
  describe('long press event triggering', () => {
    test('should trigger long-press event after default delay', () => {
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      // Fast-forward timer
      jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
      
      // Check that $emit was called on the component instance
      expect(vnode.componentInstance.$emit).toHaveBeenCalledWith('long-press');
      expect(element.dataset.elapsed).toBe('true');
    });
    
    test('should dispatch event on regular DOM element', () => {
      // Remove component instance to test regular DOM elements
      vnode.componentInstance = null;
      
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      // Fast-forward timer
      jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
      
      // Check that dispatchEvent was called
      expect(customEventSpy).toHaveBeenCalled();
      expect(element.dataset.elapsed).toBe('true');
    });
  });
  
  // 3. Test early press release handling
  describe('early press release', () => {
    test('should cancel long press on early pointer up', () => {
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
      
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      // Simulate an early pointerup (before the timeout)
      const pointerUpEvent = new PointerEvent('pointerup', { bubbles: true });
      document.dispatchEvent(pointerUpEvent);
      
      // Check that timeout was cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      // Fast-forward timer - event should not trigger
      jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
      
      // Event should not have been emitted
      expect(vnode.componentInstance.$emit).not.toHaveBeenCalled();
    });
  });
  
  // 4. Test right-click handling
  describe('right-click handling', () => {
    test('should immediately exit on right-click', () => {
      const setTimeoutSpy = jest.spyOn(window, 'setTimeout');
      
      LongPress.bind(element, binding, vnode);
      
      // Simulate a right-click (button=2)
      const rightClickEvent = new PointerEvent('pointerdown', { 
        bubbles: true, 
        button: 2 
      });
      element.dispatchEvent(rightClickEvent);
      
      // Check that setTimeout was not called
      expect(setTimeoutSpy).not.toHaveBeenCalled();
      expect(element.dataset.longPressTimeout).not.toBeDefined();
    });
  });
  
  // 5. Test pointer move cancellation
  describe('pointer move cancellation', () => {
    test('should cancel long press on pointer move', () => {
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
      
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      // Simulate pointer move
      const pointerMoveEvent = new PointerEvent('pointermove', { bubbles: true });
      element.dispatchEvent(pointerMoveEvent);
      
      // Check that timeout was cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      // Fast-forward timer - event should not trigger
      jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
      
      // Event should not have been emitted
      expect(vnode.componentInstance.$emit).not.toHaveBeenCalled();
    });
  });
  
  // 6. Test event cleanup
  describe('event cleanup', () => {
    test('should remove document pointerup listener after firing', () => {
      const docRemoveEventSpy = jest.spyOn(document, 'removeEventListener');
      
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      // Simulate pointerup
      const pointerUpEvent = new PointerEvent('pointerup', { bubbles: true });
      document.dispatchEvent(pointerUpEvent);
      
      // Check that document listener was removed
      expect(docRemoveEventSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));
    });
    
    test('should remove element pointermove listener after firing', () => {
      const elementRemoveEventSpy = jest.spyOn(element, 'removeEventListener');
      
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      // Simulate pointermove
      const pointerMoveEvent = new PointerEvent('pointermove', { bubbles: true });
      element.dispatchEvent(pointerMoveEvent);
      
      // Check that element listener was removed
      expect(elementRemoveEventSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    });
  });
  
  // 7. Test click swallowing
  describe('click swallowing', () => {
    test('should prevent default click after long press', () => {
      // Mock for Date.now to control the timing
      const realDateNow = Date.now;
      const mockDateStart = 1000000;
      
      try {
        let currentTime = mockDateStart;
        Date.now = jest.fn(() => currentTime);
        
        LongPress.bind(element, binding, vnode);
        
        // Simulate a pointerdown
        const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
        element.dispatchEvent(pointerDownEvent);
        
        // Fast-forward timer to trigger long press
        jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
        
        // Set the current time to be after long press duration
        currentTime = mockDateStart + LONG_PRESS_DEFAULT_DELAY + 100;
        
        // Simulate a click (that should be swallowed)
        const clickEvent = new MouseEvent('click', { bubbles: true });
        const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
        const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
        
        element.dispatchEvent(clickEvent);
        
        // Event should be swallowed
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(stopPropagationSpy).toHaveBeenCalled();
      } finally {
        // Restore original Date.now
        Date.now = realDateNow;
      }
    });
    
    test('should not prevent default click after regular short press', () => {
      // Mock for Date.now to control the timing
      const realDateNow = Date.now;
      const mockDateStart = 1000000;
      
      try {
        let currentTime = mockDateStart;
        Date.now = jest.fn(() => currentTime);
        
        LongPress.bind(element, binding, vnode);
        
        // Simulate a pointerdown
        const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
        element.dispatchEvent(pointerDownEvent);
        
        // Set the current time to be a short duration
        currentTime = mockDateStart + 100; // Just 100ms
        
        // Simulate a click (should not be swallowed for short press)
        const clickEvent = new MouseEvent('click', { bubbles: true });
        const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
        const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
        
        element.dispatchEvent(clickEvent);
        
        // Event should not be swallowed
        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(stopPropagationSpy).not.toHaveBeenCalled();
      } finally {
        // Restore original Date.now
        Date.now = realDateNow;
      }
    });
    
    test('should remove click listener after handling click', () => {
      const removeEventSpy = jest.spyOn(element, 'removeEventListener');
      
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      // Simulate a click
      const clickEvent = new MouseEvent('click', { bubbles: true });
      element.dispatchEvent(clickEvent);
      
      // Check that click listener was removed
      expect(removeEventSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });
  
  // 8. Test dataset management
  describe('dataset management', () => {
    test('should initialize dataset properties on bind', () => {
      LongPress.bind(element, binding, vnode);
      
      expect(element.dataset.longPressTimeout).toBe('null');
    });
    
    test('should set dataset.elapsed to false on pointerdown', () => {
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      expect(element.dataset.elapsed).toBe('false');
    });
    
    test('should set dataset.elapsed to true after long press', () => {
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDownEvent);
      
      // Fast-forward timer
      jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
      
      expect(element.dataset.elapsed).toBe('true');
    });
    
    test('should store timeout ID in dataset', () => {
      // Mock setTimeout to return a specific value
      const originalSetTimeout = window.setTimeout;
      const mockTimeoutId = 12345;
      
      try {
        window.setTimeout = jest.fn(() => mockTimeoutId);
        
        LongPress.bind(element, binding, vnode);
        
        // Simulate a pointerdown
        const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true });
        element.dispatchEvent(pointerDownEvent);
        
        expect(element.dataset.longPressTimeout).toBe(mockTimeoutId.toString());
      } finally {
        window.setTimeout = originalSetTimeout;
      }
    });
  });
  
  // 9. Test preventDefault behavior
  describe('preventDefault behavior', () => {
    test('should call preventDefault on pointerdown event', () => {
      LongPress.bind(element, binding, vnode);
      
      // Simulate a pointerdown with preventDefault spy
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(pointerDownEvent, 'preventDefault');
      
      element.dispatchEvent(pointerDownEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
  
  // 10. Test integration of multiple interactions
  describe('integration', () => {
    test('should handle multiple press sequences correctly', () => {
      // Mock Date.now to control timing
      const realDateNow = Date.now;
      const mockStart = 1000000;
      
      try {
        let currentTime = mockStart;
        Date.now = jest.fn(() => currentTime);
        
        LongPress.bind(element, binding, vnode);
        
        // First sequence: long press
        const pointerDown1 = new PointerEvent('pointerdown', { bubbles: true });
        element.dispatchEvent(pointerDown1);
        
        // Fast-forward to trigger long press
        jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
        currentTime = mockStart + LONG_PRESS_DEFAULT_DELAY;
        
        // Emit should have been called
        expect(vnode.componentInstance.$emit).toHaveBeenCalledWith('long-press');
        expect(element.dataset.elapsed).toBe('true');
        
        // Clean up first interaction
        const pointerUp1 = new PointerEvent('pointerup', { bubbles: true });
        document.dispatchEvent(pointerUp1);
        
        // Reset mocks for second sequence
        jest.clearAllMocks();
        
        // Second sequence: short press (released early)
        currentTime = mockStart + 1000; // New start time
        
        const pointerDown2 = new PointerEvent('pointerdown', { bubbles: true });
        element.dispatchEvent(pointerDown2);
        
        // Release early
        const pointerUp2 = new PointerEvent('pointerup', { bubbles: true });
        document.dispatchEvent(pointerUp2);
        
        // Advance timer past delay
        jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
        
        // Emit should NOT have been called for the second sequence
        expect(vnode.componentInstance.$emit).not.toHaveBeenCalled();
        
        // Third sequence: move during press
        currentTime = mockStart + 2000; // New start time
        
        const pointerDown3 = new PointerEvent('pointerdown', { bubbles: true });
        element.dispatchEvent(pointerDown3);
        
        // Move during press
        const pointerMove = new PointerEvent('pointermove', { bubbles: true });
        element.dispatchEvent(pointerMove);
        
        // Advance timer past delay
        jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
        
        // Emit should NOT have been called for the third sequence
        expect(vnode.componentInstance.$emit).not.toHaveBeenCalled();
      } finally {
        Date.now = realDateNow;
      }
    });
    
    test('should handle click event correctly after various press durations', () => {
      // Mock Date.now to control timing
      const realDateNow = Date.now;
      const mockStart = 1000000;
      
      try {
        let currentTime = mockStart;
        Date.now = jest.fn(() => currentTime);
        
        LongPress.bind(element, binding, vnode);
        
        // First: long press followed by click
        const pointerDown1 = new PointerEvent('pointerdown', { bubbles: true });
        element.dispatchEvent(pointerDown1);
        
        // Fast-forward to trigger long press
        jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
        currentTime = mockStart + LONG_PRESS_DEFAULT_DELAY + 50;
        
        // Click should be swallowed
        const click1 = new MouseEvent('click', { bubbles: true, cancelable: true });
        const preventDefault1 = jest.spyOn(click1, 'preventDefault');
        element.dispatchEvent(click1);
        
        expect(preventDefault1).toHaveBeenCalled();
        
        // Reset for next test
        currentTime = mockStart + 2000;
        jest.clearAllMocks();
        
        // Second: short press followed by click
        const pointerDown2 = new PointerEvent('pointerdown', { bubbles: true });
        element.dispatchEvent(pointerDown2);
        
        // Simulate pointer up after short duration
        currentTime = mockStart + 2000 + 100; // Just 100ms elapsed
        const pointerUp2 = new PointerEvent('pointerup', { bubbles: true });
        document.dispatchEvent(pointerUp2);
        
        // Click should NOT be swallowed
        const click2 = new MouseEvent('click', { bubbles: true, cancelable: true });
        const preventDefault2 = jest.spyOn(click2, 'preventDefault');
        element.dispatchEvent(click2);
        
        expect(preventDefault2).not.toHaveBeenCalled();
      } finally {
        Date.now = realDateNow;
      }
    });
  });
  
  // 11. Edge cases
  describe('edge cases', () => {
    test('should handle rapid multiple presses correctly', () => {
      LongPress.bind(element, binding, vnode);
      
      // First press
      const pointerDown1 = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDown1);
      
      // Release before timeout
      const pointerUp1 = new PointerEvent('pointerup', { bubbles: true });
      document.dispatchEvent(pointerUp1);
      
      // Quick second press
      const pointerDown2 = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDown2);
      
      // Fast-forward timer
      jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
      
      // Emit should have been called for the second press
      expect(vnode.componentInstance.$emit).toHaveBeenCalledWith('long-press');
    });
    
    test('should handle right-click followed by normal press correctly', () => {
      LongPress.bind(element, binding, vnode);
      
      // First, right-click
      const rightClick = new PointerEvent('pointerdown', { 
        bubbles: true, 
        button: 2 
      });
      element.dispatchEvent(rightClick);
      
      // Then normal press
      const pointerDown = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDown);
      
      // Fast-forward timer
      jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
      
      // Emit should have been called for the normal press
      expect(vnode.componentInstance.$emit).toHaveBeenCalledWith('long-press');
    });
    
    test('should handle missing dataset values gracefully', () => {
      LongPress.bind(element, binding, vnode);
      
      // Manually corrupt the dataset
      delete element.dataset.longPressTimeout;
      
      // This should not throw an error
      const pointerDown = new PointerEvent('pointerdown', { bubbles: true });
      element.dispatchEvent(pointerDown);
      
      // Fast-forward timer
      jest.advanceTimersByTime(LONG_PRESS_DEFAULT_DELAY);
      
      // Should still work
      expect(vnode.componentInstance.$emit).toHaveBeenCalledWith('long-press');
    });
    
    test('should handle DOM element with no dataset property', () => {
      // Create a mock element without dataset
      const mockElement = {} as HTMLElement;
      mockElement.addEventListener = jest.fn();
      mockElement.removeEventListener = jest.fn();
      mockElement.dispatchEvent = jest.fn();
      
      // This should not throw an error
      LongPress.bind(mockElement, binding, vnode);
      
      // Verify listener was added
      expect(mockElement.addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    });
  });
});
