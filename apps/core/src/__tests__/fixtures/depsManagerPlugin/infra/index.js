'use strict';
// Hand-written CommonJS fixture: named exports only, no default export at all - mimics a real
// TS module like infra/mailer/index.ts (see depsManager.spec.ts).
Object.defineProperty(exports, '__esModule', {value: true});
exports.namedOnly = () => 'infra-value';
