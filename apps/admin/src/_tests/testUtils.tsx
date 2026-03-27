// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type InMemoryCacheConfig} from '@apollo/client';
import {type MockedResponse} from '@apollo/client/testing';
import {render, type RenderOptions, type RenderResult} from '@testing-library/react';
import {type ReactElement} from 'react';
import {type MemoryRouterProps} from 'react-router-dom';
import {type RootState} from '../reduxStore/store';
import {TestProviders} from './TestProviders';

interface ICustomRenderOptions extends RenderOptions {
    apolloMocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    routerProps?: MemoryRouterProps;
    storeState?: Partial<RootState>;
    [key: string]: any;
}

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <TestProviders {...props} {...options} />, ...options});

// Re-export what is needed from testing-library to improve DX.
export {act, fireEvent, screen, waitFor, within} from '@testing-library/react';
// You can have what you need from this file with this custom render
export {renderWithProviders as render};
