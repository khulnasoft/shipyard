/**
 * Mock for rsup-progress package
 */

class Progress {
  constructor() {
    this.start = jest.fn();
    this.end = jest.fn();
    this.set = jest.fn();
    this.get = jest.fn().mockReturnValue(0);
  }
}

export default Progress; 