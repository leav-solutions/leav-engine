import {type InMemoryCacheConfig} from '@apollo/client';
import {type MockedResponse} from '@apollo/client/testing';
import {render, type RenderOptions, type RenderResult} from '@testing-library/react';
import {type ReactElement} from 'react';
import {type RootState} from '../reduxStore/store';
import {type GET_APPLICATION_BY_ENDPOINT_applications_list} from '../_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {TestProviders} from './TestProviders';

export interface ICustomRenderOptions extends RenderOptions {
    apolloMocks?: readonly MockedResponse[];
    storeState?: Partial<RootState>;
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ENDPOINT_applications_list;
    [key: string]: any;
}

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <TestProviders {...props} {...options} />, ...options});

// Re-export what is needed from testing-library to improve DX.
export {act, renderHook, screen, waitFor, within} from '@testing-library/react';
// You can have what you need from this file when you use this custom render
export {renderWithProviders as render};
