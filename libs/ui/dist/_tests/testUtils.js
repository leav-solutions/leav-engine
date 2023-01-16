import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import { render } from '@testing-library/react';
import MockedLangContextProvider from '../testing/MockedLangContextProvider';
const Providers = ({ children }) => {
    return _jsx(MockedLangContextProvider, { children: children !== null && children !== void 0 ? children : _jsx(_Fragment, {}) });
};
// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui, options) => render(ui, Object.assign({ wrapper: props => _jsx(Providers, Object.assign({}, props, options)) }, options));
// Re-export everything from testing-library to improve DX.
// You can import everything you need from this file when you use this custom render
export * from '@testing-library/react';
export { renderWithProviders as render };
//# sourceMappingURL=testUtils.js.map