// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, type RenderOptions, type RenderResult} from '@testing-library/react';
import {TestProviders} from './TestProviders';
import {type InMemoryCacheConfig} from '@apollo/client';
import {type MockedResponse} from '@apollo/client/testing';
import {type GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {type ReactElement} from 'react';

interface ICustomRenderOptions extends RenderOptions {
    apolloMocks?: readonly MockedResponse[];
    currentApp?: GET_APPLICATION_BY_ID_applications_list;
    cacheSettings?: InMemoryCacheConfig;
    [key: string]: any;
}

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <TestProviders {...props} {...options} />, ...options});

// Re-export what is needed from testing-library to improve DX.
export {act, renderHook, screen, waitFor, within} from '@testing-library/react';
// You can have what you need from this file when you use this custom render
export {renderWithProviders as render};
