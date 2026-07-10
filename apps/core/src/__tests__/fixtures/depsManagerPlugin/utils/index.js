'use strict';
// Hand-written CommonJS fixture whose own `exports.default` is deliberately the tsc-style
// {__esModule, default} wrapper, embedded as plain data - reproducing exactly what a real Node
// import() of a tsc-compiled module produces for depsManager.spec.ts. Vitest's own dynamic-import
// CJS interop (vite-node) does not reshape a plain value assigned to `exports.default` the way it
// reshapes the module's own synthesized default, so this stays deterministic under Vitest too.
exports.namedThing = () => 'named-value';
const factory = () => ({fileExists: async () => true});
exports.default = {__esModule: true, default: factory};
