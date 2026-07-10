'use strict';
// Hand-written CommonJS fixture with named exports only, no default export - exercises the
// "no real default underneath" branch: the plugin has nothing to initialize, but its
// package.json infos must still be registered.
exports.someHelper = () => 'value';
