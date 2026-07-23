import '@testing-library/jest-dom';
import {act} from '@testing-library/react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// Some tests render components that fire async GraphQL queries (e.g. TreesSelector, LibrariesSelector)
// without awaiting their resolution. When such a query resolves after the test has ended, the state
// update leaks into the next test and React reports it as "not wrapped in act(...)". Flushing pending
// microtasks/timers inside act() after each test keeps those late updates attributed to their own test.
afterEach(async () => {
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });
});

// happy-dom *does* provide ResizeObserver, but it fires its callbacks asynchronously. Ant Design's
// `Input.TextArea` autoSize re-measures on those callbacks (through a raf), so a callback fired
// during the afterEach act() flush schedules a measurement that runs after the test's
// getComputedStyle stub has been restored — happy-dom then returns empty computed values and React
// logs "`NaN` is an invalid value for the `height` css style property". There is no layout in
// happy-dom for the observer to report anyway, so replace it with a no-op (same pattern as
// libs/ui). Assigned at module scope (before any test file imports @rc-component/resize-observer,
// which caches the global at import time) so the no-op is the one the library captures.
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

// React 18.3 deprecates `defaultProps` on function components and `findDOMNode`, both still used by
// semantic-ui-react (migration to aristid-ds in progress) and react-markdown@5. We can't fix those
// third-party libraries, so ignore exactly these warnings when they come from them — the same
// warnings on admin's own components stay visible. Remove once the aristid-ds migration is done.
const thirdPartyDeprecationPatterns = [
    'Support for defaultProps will be removed from function components',
    'findDOMNode is deprecated',
];
const thirdPartyModules = ['semantic-ui-react', 'react-markdown'];
const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
    const isThirdPartyDeprecation =
        typeof args[0] === 'string' &&
        thirdPartyDeprecationPatterns.some(pattern => (args[0] as string).includes(pattern)) &&
        args.some(arg => typeof arg === 'string' && thirdPartyModules.some(module => arg.includes(module)));
    if (!isThirdPartyDeprecation) {
        originalConsoleError(...args);
    }
};

vi.mock('react-i18next', async () => import('../__mocks__/react-i18next'));

vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({}),
    }),
);
