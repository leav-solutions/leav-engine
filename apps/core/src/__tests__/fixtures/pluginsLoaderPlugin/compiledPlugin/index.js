'use strict';
// Hand-written CommonJS fixture whose own `exports.default` is deliberately the tsc-style
// {__esModule, default} wrapper, embedded as plain data - see depsManager.spec.ts /
// utils/index.js for why this needs to be literal data rather than relying on vite-node's own
// CJS interop (which does not reshape a plain assigned value the way it reshapes its own
// synthesized default).
let initCalled = false;
const factory = () => ({
    init: async () => {
        initCalled = true;
    },
});
exports.default = {__esModule: true, default: factory};
exports.wasInitCalled = () => initCalled;
