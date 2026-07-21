// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// happy-dom provides ResizeObserver, matchMedia, getComputedStyle (incl. pseudo-elements) and
// crypto natively, so the jsdom polyfills / getComputedStyle pseudo-element workaround the setup
// used to need are no longer required.

vi.mock('_ui/hooks/useSharedTranslation');
// Some components import the hook through its deep path instead of the directory index, so the
// directory-level mock above does not intercept them. Mock the deep path too (both resolve to the
// same manual mock in __mocks__).
vi.mock('_ui/hooks/useSharedTranslation/useSharedTranslation');
vi.mock('_ui/_utils/isDevEnv');
