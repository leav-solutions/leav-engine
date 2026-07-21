// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

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
import ResizeObserver from 'resize-observer-polyfill';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
});

// jsdom does not implement ResizeObserver. Since the antd bump, several components
// (@rc-component/resize-observer used by Table, Tree, etc.) call it in a passive effect,
// which throws "ResizeObserver is not defined" and prevents rendering. Polyfill it globally
// so every test file benefits (previously each file had to import it individually).
global.ResizeObserver = ResizeObserver;

// jsdom throws "Not implemented: window.getComputedStyle(elt, pseudoElt)" whenever a pseudo-element
// is passed. antd measures the scrollbar with getComputedStyle(ele, '::-webkit-scrollbar')
// (@rc-component/util getScrollBarSize) when locking scroll for modals/portals, which floods the
// output with that error on nearly every test that opens one. Drop the pseudo-element argument so
// the call succeeds against jsdom's real implementation (scrollbar width resolves to 0, harmless
// in tests) instead of erroring.
const originalGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element: Element) => originalGetComputedStyle(element);

vi.mock('_ui/hooks/useSharedTranslation');
// Some components import the hook through its deep path instead of the directory index, so the
// directory-level mock above does not intercept them. Mock the deep path too (both resolve to the
// same manual mock in __mocks__).
vi.mock('_ui/hooks/useSharedTranslation/useSharedTranslation');
vi.mock('_ui/_utils/isDevEnv');

Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
});
