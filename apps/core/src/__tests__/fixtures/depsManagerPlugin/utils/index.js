'use strict';
// Hand-written CommonJS fixture whose own `exports.default` is deliberately the tsc-style
// {__esModule, default} wrapper, embedded as plain data - reproducing exactly what a real Node
// import() of a tsc-compiled module produces for depsManager.spec.ts. Vitest's own dynamic-import
// CJS interop (vite-node) does not reshape a plain value assigned to `exports.default` the way it
// reshapes the module's own synthesized default, so this stays deterministic under Vitest too.
//
// Same reasoning for `__esModule`/`module.exports` below: a real Node import() of a tsc-compiled
// module also adds these two as top-level keys of the imported namespace itself (not just nested
// under `default`). Assigned here as plain data for the same fidelity-under-Vitest reason.
exports.namedThing = () => 'named-value';
const factory = () => ({fileExists: async () => true});
exports.default = {__esModule: true, default: factory};
exports.__esModule = true;
exports['module.exports'] = exports;
