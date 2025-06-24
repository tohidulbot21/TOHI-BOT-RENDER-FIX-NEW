
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

// Filter out common Facebook API and theme errors
const suppressedErrors = [
  'getThreadInfoGraphQL',
  'Invalid response data',
  'formatThreadGraphQLResponse',
  'Theme loading failed',
  'Failed to load theme',
  'removeUserFromGroup',
  'Cannot read properties of undefined',
  'ECONNRESET',
  'ETIMEDOUT',
  'Rate limited'
];

console.error = function(...args) {
  const message = args.join(' ');
  const shouldSuppress = suppressedErrors.some(error => 
    message.includes(error)
  );
  
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args);
  }
};

console.log = function(...args) {
  const message = args.join(' ');
  const shouldSuppress = suppressedErrors.some(error => 
    message.includes(error)
  );
  
  if (!shouldSuppress) {
    originalConsoleLog.apply(console, args);
  }
};

module.exports = { originalConsoleError, originalConsoleLog };
