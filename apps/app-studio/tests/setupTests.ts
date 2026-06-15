// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import {disableFragmentWarnings} from '@apollo/client';
import Modal from 'react-modal';
import React from 'react';

disableFragmentWarnings();

// Suppress react-modal "App element is not defined" warning in jsdom.
Modal.setAppElement(document.body);

// To prevent warnings
React.useLayoutEffect = React.useEffect;

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
