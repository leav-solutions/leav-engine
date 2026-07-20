import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {webcrypto} from 'node:crypto';
import ResizeObserver from 'resize-observer-polyfill';

dayjs.extend(duration);

// jsdom does not implement ResizeObserver. Since the antd bump, several components
// (@rc-component/resize-observer used by Table, Tree, etc.) call it in a passive effect,
// which throws "ResizeObserver is not defined" and prevents rendering. Polyfill it globally.
global.ResizeObserver = ResizeObserver;

vi.mock('react-i18next', async () => import('../__mocks__/react-i18next'));

Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
});

vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({}),
    }),
);
