// Mock Vue
export class Vue {
  $emit(event, ...args) {}
  $on(event, callback) {}
  $nextTick() {
    return Promise.resolve();
  }
}

// Mock Component decorator
export function Component(options) {
  return function(target) {
    return target;
  };
}

// Other decorators
export function Prop(options) {
  return function(target, key) {};
}

export function Watch(path, options) {
  return function(target, key) {};
}

export function Emit(event) {
  return function(target, key, descriptor) {
    return descriptor;
  };
}

export function Mixins(...mixins) {
  return Vue;
} 