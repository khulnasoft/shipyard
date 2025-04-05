import { mount, shallowMount, Wrapper } from '@vue/test-utils';
import Button from '@/components/FormElements/Button.vue';

describe('Button.vue', () => {
  // Test component mounting and basic rendering
  test('renders correctly with default props', () => {
    const wrapper = shallowMount(Button);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(true);
  });

  // Test all props
  describe('props', () => {
    test('renders with type prop', () => {
      const type = 'submit';
      const wrapper = shallowMount(Button, {
        propsData: { type }
      });
      expect(wrapper.attributes('type')).toBe(type);
    });

    test('renders with correct default type when not specified', () => {
      const wrapper = shallowMount(Button);
      expect(wrapper.attributes('type')).toBe('button');
    });
    
    test('renders with disabled prop', () => {
      const wrapper = shallowMount(Button, {
        propsData: { disabled: true }
      });
      expect(wrapper.attributes('disabled')).toBe('disabled');
    });

    test('renders with disallow prop', () => {
      const wrapper = shallowMount(Button, {
        propsData: { disallow: true }
      });
      expect(wrapper.classes()).toContain('disallowed');
      expect(wrapper.attributes('disabled')).toBe('disabled');
    });

    test('renders with tooltip prop', () => {
      const tooltip = 'Test tooltip';
      const wrapper = shallowMount(Button, {
        propsData: { tooltip }
      });
      expect(wrapper.attributes('title')).toBe(tooltip);
    });
  });

  // Test click event handling
  describe('events', () => {
    test('calls click function when clicked', async () => {
      const click = jest.fn();
      const wrapper = shallowMount(Button, {
        propsData: { click }
      });
      
      await wrapper.trigger('click');
      expect(click).toHaveBeenCalledTimes(1);
    });

    test('does not call click function when disabled', async () => {
      const click = jest.fn();
      const wrapper = shallowMount(Button, {
        propsData: { click, disabled: true }
      });
      
      await wrapper.trigger('click');
      expect(click).not.toHaveBeenCalled();
    });

    test('does not call click function when disallowed', async () => {
      const click = jest.fn();
      const wrapper = shallowMount(Button, {
        propsData: { click, disallow: true }
      });
      
      await wrapper.trigger('click');
      expect(click).not.toHaveBeenCalled();
    });

    test('handles null click prop gracefully', async () => {
      const wrapper = shallowMount(Button);
      
      // This should not throw an error
      await wrapper.trigger('click');
      expect(wrapper.exists()).toBe(true);
    });
  });

  // Test slot content rendering
  describe('slots', () => {
    test('renders default slot content', () => {
      const defaultSlotContent = 'Default button text';
      const wrapper = shallowMount(Button, {
        slots: {
          default: defaultSlotContent
        }
      });
      
      expect(wrapper.text()).toContain(defaultSlotContent);
    });

    test('renders text slot content', () => {
      const textSlotContent = 'Button text slot';
      const wrapper = shallowMount(Button, {
        slots: {
          text: textSlotContent
        }
      });
      
      expect(wrapper.text()).toContain(textSlotContent);
    });

    test('renders icon slot content', () => {
      const iconSlotContent = '<svg data-testid="icon"></svg>';
      const wrapper = shallowMount(Button, {
        slots: {
          icon: iconSlotContent
        }
      });
      
      // Check if the slot content was rendered
      expect(wrapper.html()).toContain('data-testid="icon"');
    });
  });

  // Test computed property 'hoverText'
  describe('computed properties', () => {
    test('hoverText returns undefined when no tooltip provided', () => {
      const wrapper = shallowMount(Button);
      const vm = wrapper.vm as any;
      
      expect(vm.hoverText).toBeUndefined();
    });

    test('hoverText returns correct tooltip config when tooltip provided', () => {
      const tooltip = 'Test tooltip';
      const wrapper = shallowMount(Button, {
        propsData: { tooltip }
      });
      const vm = wrapper.vm as any;
      
      expect(vm.hoverText).toEqual({
        content: tooltip,
        trigger: 'hover focus',
        delay: { show: 350, hide: 100 }
      });
    });
  });

  // Test disabled and disallowed states
  describe('states', () => {
    test('applies correct styles when disabled', () => {
      const wrapper = shallowMount(Button, {
        propsData: { disabled: true }
      });
      
      expect(wrapper.attributes('disabled')).toBe('disabled');
    });

    test('applies correct styles when disallowed', () => {
      const wrapper = shallowMount(Button, {
        propsData: { disallow: true }
      });
      
      expect(wrapper.classes()).toContain('disallowed');
      expect(wrapper.attributes('disabled')).toBe('disabled');
    });
  });

  // Test tooltip functionality
  describe('tooltip functionality', () => {
    test('v-tooltip directive is applied with tooltip prop', () => {
      const tooltip = 'Test tooltip';
      const wrapper = mount(Button, {
        propsData: { tooltip }
      });
      
      // Check for the v-tooltip directive
      // Note: This is a simple check since the actual directive behavior would require more complex testing
      expect(wrapper.attributes('title')).toBe(tooltip);
      
      const vm = wrapper.vm as any;
      expect(vm.hoverText).toEqual({
        content: tooltip,
        trigger: 'hover focus',
        delay: { show: 350, hide: 100 }
      });
    });
  });
});

