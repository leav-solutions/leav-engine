'use strict';
// Hand-written CommonJS fixture whose own `exports.default` is deliberately the tsc-style
// {__esModule, default} wrapper, embedded as plain data - see
// dirWithIndexJs/index.js for why.
const migration = async () => ({run: async () => 'migrated-via-js-file'});
exports.default = {__esModule: true, default: migration};
