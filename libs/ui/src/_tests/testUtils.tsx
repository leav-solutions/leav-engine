// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, RenderOptions, RenderResult} from '@testing-library/react';
import {PropsWithChildren, ReactElement} from 'react';
import MockedLangContextProvider from '../testing/MockedLangContextProvider';

interface ICustomRenderOptions extends RenderOptions {
    [key: string]: any;
}

interface IProvidersProps {
    [key: string]: any;
}

const Providers = ({children}: PropsWithChildren<IProvidersProps>) => {
    return <MockedLangContextProvider>{children ?? <></>}</MockedLangContextProvider>;
};

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <Providers {...props} {...options} />, ...options});

// Re-export everything from testing-library to improve DX.
// You can import everything you need from this file when you use this custom render
export * from '@testing-library/react';
export {renderWithProviders as render};
