/**
 * True when `value` is the raw module.exports of a tsc-compiled CommonJS module (marked via the
 * __esModule/default convention tsc emits for its own __importDefault helper). Node's native
 * import() of such a module sets its `default` export to this WHOLE object rather than the file's
 * real default export - callers use this to detect that shape and unwrap it.
 */
export const isTscCjsDoubleWrap = (value: unknown): value is {__esModule: true; default?: unknown} =>
    value !== null && typeof value === 'object' && (value as {__esModule?: unknown}).__esModule === true;
