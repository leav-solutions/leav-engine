// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

import {act} from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// Some tests end while an antd overlay (Popconfirm/Tooltip → Trigger → CSSMotion) still has a
// pending async re-alignment (rAF/timer). When it fires after the test has ended, React logs
// "An update to CSSMotion inside a test was not wrapped in act(...)". Flushing pending
// microtasks/timers inside act() after each test keeps those late updates attributed to their
// own test (same pattern as apps/admin setupTests).
afterEach(async () => {
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });
});

// happy-dom provides matchMedia, getComputedStyle (incl. pseudo-elements) and crypto natively, so
// the jsdom polyfills / getComputedStyle pseudo-element workaround the setup used to need are no
// longer required.

// happy-dom *does* provide ResizeObserver, but it fires its callbacks asynchronously. Ant Design's
// overlays (Popconfirm/Tooltip/Dropdown → Trigger → CSSMotion) re-align on those callbacks, so when
// one fires after a test has ended, React logs "An update to CSSMotion was not wrapped in act(...)".
// There is no layout in happy-dom for the observer to report anyway, so replace it with a no-op.
// Assigned at module scope (before any test file imports @rc-component/resize-observer, which caches
// the global at import time) so the no-op is the one the library captures.
globalThis.ResizeObserver = class {
    public observe(): void {
        /* no-op */
    }
    public unobserve(): void {
        /* no-op */
    }
    public disconnect(): void {
        /* no-op */
    }
};

vi.mock('_ui/hooks/useSharedTranslation');
// Some components import the hook through its deep path instead of the directory index, so the
// directory-level mock above does not intercept them. Mock the deep path too (both resolve to the
// same manual mock in __mocks__).
vi.mock('_ui/hooks/useSharedTranslation/useSharedTranslation');
vi.mock('_ui/_utils/isDevEnv');
