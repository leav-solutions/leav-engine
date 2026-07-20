// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import ResizeObserver from 'resize-observer-polyfill';

vi.mock('react-i18next', async () => import('../__mocks__/react-i18next'));

// jsdom does not implement ResizeObserver. Since the antd bump, several components
// (@rc-component/resize-observer used by Table, Tree, etc.) call it in a passive effect,
// which throws "ResizeObserver is not defined" and prevents rendering. Polyfill it globally.
global.ResizeObserver = ResizeObserver;

vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({}),
    }),
);

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
