import {isTscCjsDoubleWrap} from './isTscCjsDoubleWrap';

describe('isTscCjsDoubleWrap', () => {
    test('Should detect a tsc-style __esModule/default wrapper', () => {
        expect(isTscCjsDoubleWrap({__esModule: true, default: () => 'value'})).toBe(true);
    });

    test('Should detect the wrapper even when it has no real default export underneath', () => {
        expect(isTscCjsDoubleWrap({__esModule: true, namedOnly: () => 'value'})).toBe(true);
    });

    test('Should return false for an already-unwrapped function export', () => {
        expect(isTscCjsDoubleWrap(() => 'value')).toBe(false);
    });

    test('Should return false for a plain value with no __esModule marker', () => {
        expect(isTscCjsDoubleWrap({foo: 'bar'})).toBe(false);
    });

    test('Should return false for null or undefined', () => {
        expect(isTscCjsDoubleWrap(null)).toBe(false);
        expect(isTscCjsDoubleWrap(undefined)).toBe(false);
    });
});
