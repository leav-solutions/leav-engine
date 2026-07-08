// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import * as matchers from '@testing-library/jest-dom/matchers';
import {disableFragmentWarnings} from '@apollo/client';
import Modal from 'react-modal';
import React from 'react';
import {expect, vi} from 'vitest';

// Register jest-dom matchers explicitly on Vitest's expect. The '@testing-library/jest-dom/vitest'
// auto-extend entry did not attach to the expect instance used by app-studio's tests here.
expect.extend(matchers);

disableFragmentWarnings();

// Suppress react-modal "App element is not defined" warning in jsdom.
// Must use a dedicated element, NOT document.body: react-modal sets aria-hidden on the app
// element when a modal opens, and if that element is body, the modal portal (also in body)
// becomes inaccessible to ARIA queries in tests.
const modalAppRoot = document.createElement('div');
modalAppRoot.id = 'root';
document.body.appendChild(modalAppRoot);
Modal.setAppElement(modalAppRoot);

// To prevent warnings
React.useLayoutEffect = React.useEffect;

// Mirror libs/ui: make useSharedTranslation return the i18n keys instead of resolved labels, so
// tests can assert on stable keys. Components reach the hook through the _ui deep path.
vi.mock('_ui/hooks/useSharedTranslation');
// Some components import the hook through its deep path instead of the directory index, so the
// directory-level mock above does not intercept them. Mock the deep path too (both resolve to the
// same manual mock in __mocks__).
vi.mock('_ui/hooks/useSharedTranslation/useSharedTranslation');

// app-studio components also call react-i18next's useTranslation directly. Make its t return the
// key (joined with interpolated values as `key|value`) so tests assert on stable keys and can
// verify passed variables — the same contract the former jest manual mock provided.
vi.mock('react-i18next', async () => {
    const actual = await vi.importActual('react-i18next');
    const mockT = (key: string, variables?: Record<string, unknown>) =>
        [key, ...(variables ? Object.values(variables) : [])].join('|');
    return {
        ...actual,
        useTranslation: () => ({
            t: mockT,
            i18n: {language: 'fr', options: {fallbackLng: ['en']}, changeLanguage: vi.fn()},
        }),
    };
});

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
