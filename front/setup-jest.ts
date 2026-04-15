// When running via `ng test` (@angular-builders/jest), the builder already calls
// initTestEnvironment via its own setup.js. Wrapping in try-catch avoids the
// "Cannot set base providers because it has already been called" error while
// still initializing correctly when running `npm test` (direct jest).
try {
  require('jest-preset-angular/setup-jest');
} catch (_) {
  // Already initialized by @angular-builders/jest
}

/* global mocks for jsdom */
const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

Object.defineProperty(window, 'localStorage', { configurable: true, value: mock() });
Object.defineProperty(window, 'sessionStorage', { configurable: true, value: mock() });
Object.defineProperty(window, 'getComputedStyle', {
  configurable: true,
  value: () => ['-webkit-appearance'],
});

try {
  Object.defineProperty(document.body.style, 'transform', {
    configurable: true,
    value: () => {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  });
} catch (_) {
  // Property may already be defined in this jsdom environment
}

/* output shorter and more meaningful Zone error stack traces */
// Error.stackTraceLimit = 2;
