import ClickOutside from '@/directives/ClickOutside';

describe('ClickOutside Directive', () => {
  // Elements for testing
  let targetElement: HTMLElement;
  let childElement: HTMLElement;
  let outsideElement: HTMLElement;
  let binding: any;
  let documentAddEventListenerSpy: jest.SpyInstance;
  let documentRemoveEventListenerSpy: jest.SpyInstance;
  let actionMock: jest.Mock;
  
  // Access the private instances array for testing
  // @ts-ignore - accessing private property for testing
  const instances = (ClickOutside as any).instances || [];
  
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = '';
    
    // Set up test elements
    targetElement = document.createElement('div');
    targetElement.id = 'target';
    childElement = document.createElement('div');
    childElement.id = 'child';
    outsideElement = document.createElement('div');
    outsideElement.id = 'outside';
    
    // Create element hierarchy
    targetElement.appendChild(childElement);
    document.body.appendChild(targetElement);
    document.body.appendChild(outsideElement);
    
    // Create action mock
    actionMock = jest.fn();
    
    // Create binding object
    binding = {
      value: actionMock
    };
    
    // Spy on document event listeners
    documentAddEventListenerSpy = jest.spyOn(document, 'addEventListener');
    documentRemoveEventListenerSpy = jest.spyOn(document, 'removeEventListener');
  });
  
  afterEach(() => {
    // Clean up
    jest.clearAllMocks();
    
    // Ensure all instances are cleaned up after each test
    while (instances.length > 0) {
      const handler = instances.pop();
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
    }
  });
  
  // 1. Test directive binding and unbinding
  describe('lifecycle', () => {
    test('should add event listeners on bind', () => {
      ClickOutside.bind(targetElement, binding);
      
      expect(documentAddEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(documentAddEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(documentAddEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });
    
    test('should set dataset index on bind', () => {
      const initialLength = instances.length;
      
      ClickOutside.bind(targetElement, binding);
      
      expect(targetElement.dataset.outsideClickIndex).toBe(initialLength.toString());
    });
    
    test('should store handler in instances array', () => {
      const initialLength = instances.length;
      
      ClickOutside.bind(targetElement, binding);
      
      expect(instances.length).toBe(initialLength + 1);
      expect(instances[instances.length - 1]).toBeInstanceOf(Function);
    });
    
    test('should remove event listeners on unbind', () => {
      ClickOutside.bind(targetElement, binding);
      const index = parseInt(targetElement.dataset.outsideClickIndex || '0', 10);
      const handler = instances[index];
      
      ClickOutside.unbind(targetElement);
      
      expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith('click', handler);
    });
    
    test('should remove handler from instances array', () => {
      ClickOutside.bind(targetElement, binding);
      const initialLength = instances.length;
      
      ClickOutside.unbind(targetElement);
      
      expect(instances.length).toBe(initialLength - 1);
    });
  });
  
  // 2. Test click event handling
  describe('click handling', () => {
    test('should call action when clicking outside target', () => {
      ClickOutside.bind(targetElement, binding);
      
      // Simulate click outside target
      outsideElement.click();
      
      expect(actionMock).toHaveBeenCalledTimes(1);
      expect(actionMock).toHaveBeenCalledWith(expect.any(MouseEvent));
    });
    
    test('should not call action when clicking target', () => {
      ClickOutside.bind(targetElement, binding);
      
      // Simulate click on target
      targetElement.click();
      
      expect(actionMock).not.toHaveBeenCalled();
    });
    
    test('should not call action when clicking inside target', () => {
      ClickOutside.bind(targetElement, binding);
      
      // Simulate click on child element
      childElement.click();
      
      expect(actionMock).not.toHaveBeenCalled();
    });
  });
  
  // 3. Test touch event handling
  describe('touch handling', () => {
    test('should call action when touch starts outside target', () => {
      ClickOutside.bind(targetElement, binding);
      
      // Simulate touchstart outside target
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true
      });
      outsideElement.dispatchEvent(touchEvent);
      
      expect(actionMock).toHaveBeenCalledTimes(1);
      expect(actionMock).toHaveBeenCalledWith(expect.any(TouchEvent));
    });
    
    test('should not call action when touch starts on target', () => {
      ClickOutside.bind(targetElement, binding);
      
      // Simulate touchstart on target
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true
      });
      targetElement.dispatchEvent(touchEvent);
      
      expect(actionMock).not.toHaveBeenCalled();
    });
    
    test('should not call action when touch starts inside target', () => {
      ClickOutside.bind(targetElement, binding);
      
      // Simulate touchstart on child element
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true
      });
      childElement.dispatchEvent(touchEvent);
      
      expect(actionMock).not.toHaveBeenCalled();
    });
  });
  
  // 4. Test multiple instance management
  describe('multiple instances', () => {
    let secondElement: HTMLElement;
    let secondActionMock: jest.Mock;
    
    beforeEach(() => {
      secondElement = document.createElement('div');
      secondElement.id = 'second-target';
      document.body.appendChild(secondElement);
      
      secondActionMock = jest.fn();
    });
    
    test('should handle multiple bound elements correctly', () => {
      ClickOutside.bind(targetElement, { value: actionMock });
      ClickOutside.bind(secondElement, { value: secondActionMock });
      
      // Click outside both elements
      outsideElement.click();
      
      // Both actions should be called
      expect(actionMock).toHaveBeenCalledTimes(1);
      expect(secondActionMock).toHaveBeenCalledTimes(1);
    });
    
    test('should call only relevant actions when clicking inside one element', () => {
      ClickOutside.bind(targetElement, { value: actionMock });
      ClickOutside.bind(secondElement, { value: secondActionMock });
      
      // Click inside first element
      childElement.click();
      
      // First action should not be called, second action should be called
      expect(actionMock).not.toHaveBeenCalled();
      expect(secondActionMock).toHaveBeenCalledTimes(1);
    });
    
    test('should maintain correct indices when unbinding middle element', () => {
      const thirdElement = document.createElement('div');
      document.body.appendChild(thirdElement);
      const thirdActionMock = jest.fn();
      
      // Bind three elements
      ClickOutside.bind(targetElement, { value: actionMock });
      ClickOutside.bind(secondElement, { value: secondActionMock });
      ClickOutside.bind(thirdElement, { value: thirdActionMock });
      
      // Unbind middle element
      ClickOutside.unbind(secondElement);
      
      // Click outside all elements
      outsideElement.click();
      
      // First and third actions should be called
      expect(actionMock).toHaveBeenCalledTimes(1);
      expect(secondActionMock).not.toHaveBeenCalled();
      expect(thirdActionMock).toHaveBeenCalledTimes(1);
    });
  });
  
  // 5. Test nested element handling
  describe('nested elements', () => {
    let parentElement: HTMLElement;
    let childTargetElement: HTMLElement;
    let parentActionMock: jest.Mock;
    let childActionMock: jest.Mock;
    
    beforeEach(() => {
      // Create nested structure
      parentElement = document.createElement('div');
      parentElement.id = 'parent';
      childTargetElement = document.createElement('div');
      childTargetElement.id = 'child-target';
      
      parentElement.appendChild(childTargetElement);
      document.body.appendChild(parentElement);
      
      parentActionMock = jest.fn();
      childActionMock = jest.fn();
    });
    
    test('should handle nested clickOutside elements correctly', () => {
      // Bind to both elements
      ClickOutside.bind(parentElement, { value: parentActionMock });
      ClickOutside.bind(childTargetElement, { value: childActionMock });
      
      // Click outside both
      outsideElement.click();
      
      // Both actions should be called
      expect(parentActionMock).toHaveBeenCalledTimes(1);
      expect(childActionMock).toHaveBeenCalledTimes(1);
    });
    
    test('should call only parent action when clicking between parent and child', () => {
      // Create element between parent and child
      const middleElement = document.createElement('div');
      parentElement.insertBefore(middleElement, childTargetElement);
      
      // Bind to both elements
      ClickOutside.bind(parentElement, { value: parentActionMock });
      ClickOutside.bind(childTargetElement, { value: childActionMock });
      
      // Click on middle element (inside parent, outside child)
      middleElement.click();
      
      // Only child action should be called
      expect(parentActionMock).not.toHaveBeenCalled();
      expect(childActionMock).toHaveBeenCalledTimes(1);
    });
  });
  
  // 6. Test cleanup and memory management
  describe('cleanup', () => {
    test('should properly clean up all event listeners', () => {
      const elements = Array.from({ length: 5 }, (_, i) => {
        const el = document.createElement('div');
        el.id = `element-${i}`;
        document.body.appendChild(el);
        return el;
      });
      
      // Bind to all elements
      elements.forEach(el => {
        ClickOutside.bind(el, { value: jest.fn() });
      });
      
      // Verify listeners were added
      expect(documentAddEventListenerSpy).toHaveBeenCalledTimes(elements.length * 2);
      
      // Unbind all elements
      elements.forEach(el => {
        ClickOutside.unbind(el);
      });
      
      // Verify listeners were removed
      expect(documentRemoveEventListenerSpy).toHaveBeenCalledTimes(elements.length);
      
      // Instances array should be empty
      expect(instances.length).toBe(0);
    });
    
    test('should not leak memory when elements are unbound', () => {
      // Create many elements
      const elements = Array.from({ length: 10 }, (_, i) => {
        const el = document.createElement('div');
        el.id = `element-${i}`;
        document.body.appendChild(el);
        return el;
      });
      
      // Bind to all elements
      elements.forEach(el => {
        ClickOutside.bind(el, { value: jest.fn() });
      });
      
      // Check initial instance count
      const initialInstanceCount = instances.length;
      expect(initialInstanceCount).toBe(elements.length);
      
      // Unbind half the elements
      elements.slice(0, 5).forEach(el => {
        ClickOutside.unbind(el);
      });
      
      // Check instances were removed
      expect(instances.length).toBe(initialInstanceCount - 5);
      
      // Unbind the rest
      elements.slice(5).forEach(el => {
        ClickOutside.unbind(el);
      });
      
      // Instances array should be empty
      expect(instances.length).toBe(0);
    });
  });
  
  // 7. Test edge cases
  describe('edge cases', () => {
    test('should handle element with no dataset property', () => {
      // Create mock element without dataset
      const mockElement = {} as HTMLElement;
      
      // This should not throw
      expect(() => {
        ClickOutside.unbind(mockElement);
      }).not.toThrow();
    });
    
    test('should handle invalid indices', () => {
      // Set an invalid index
      targetElement.dataset.outsideClickIndex = '9999';
      
      // This should not throw
      expect(() => {
        ClickOutside.unbind(targetElement);
      }).not.toThrow();
    });
    
    test('should handle binding with no value function', () => {
      // Create binding with no value
      const emptyBinding = { value: undefined };
      
      // This should not throw
      expect(() => {
        ClickOutside.bind(targetElement, emptyBinding);
      }).not.toThrow();
      
      // Click outside should not cause error
      outsideElement.click();
    });
    
    test('should work with shadow DOM elements', () => {
      // Skip test if browser doesn't support shadow DOM
      if (!Element.prototype.attachShadow) {
        return;
      }
      
      // Create element with shadow DOM
      const host = document.createElement('div');
      document.body.appendChild(host);
      const shadowRoot = host.attachShadow({ mode: 'open' });
      
      // Create element in shadow DOM
      const shadowElement = document.createElement('div');
      shadowRoot.appendChild(shadowElement);
      
      // Bind to shadow DOM element
      const shadowActionMock = jest.fn();
      ClickOutside.bind(shadowElement, { value: shadowActionMock });
      
      // Click outside
      outsideElement.click();
      
      // Action should be called
      expect(shadowActionMock).toHaveBeenCalledTimes(1);
    });
  });
});

