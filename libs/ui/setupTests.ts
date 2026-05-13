// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'object' && (args[0] as {type?: string})?.type === 'css parsing') {
        // TODO: revoir au moment de https://aristid.atlassian.net/browse/LEAVC-824
        // aristid-ds UMD bundle injects a <style> with @font-face + base64 woff2 at load time,
        // which jsdom's CSS parser cannot handle. Once aristid-ds exposes an ESM build,
        // the CSS will be tree-shaken and this workaround can be removed.
        return;
    }
    originalConsoleError(...args);
};

import {webcrypto} from 'node:crypto';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
});

jest.mock('_ui/hooks/useSharedTranslation');
jest.mock('_ui/_utils/isDevEnv');

Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
});
