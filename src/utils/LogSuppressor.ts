/**
 * This file contains utilities to suppress specific console warnings
 * that are not relevant to the application's functionality.
 */

// Original console.warn function
const originalWarn = console.warn;

// List of warning messages to suppress
const suppressedWarnings = [
  'TRenderEngineProvider: Support for defaultProps will be removed from function components',
  'MemoizedTNodeRenderer: Support for defaultProps will be removed from memo components',
  'TNodeChildrenRenderer: Support for defaultProps will be removed from function components',
];

// Override console.warn to filter out specific warnings
console.warn = function (message: any, ...optionalParams: any[]) {
  // Check if this is a warning we want to suppress
  if (typeof message === 'string') {
    for (const warningText of suppressedWarnings) {
      if (message.includes(warningText)) {
        // Skip this warning
        return;
      }
    }
  }
  
  // Pass through to the original console.warn for all other warnings
  originalWarn(message, ...optionalParams);
};

export {}; // Make this a module
