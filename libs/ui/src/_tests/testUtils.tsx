/* eslint-disable react-refresh/only-export-components */
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache, InMemoryCacheConfig} from '@apollo/client';
import {MockedProvider, MockedResponse} from '@apollo/client/testing';
import {Queries, render, renderHook, RenderHookOptions, RenderOptions, RenderResult} from '@testing-library/react';
import {KitApp} from 'aristid-ds';
import {PropsWithChildren, ReactElement} from 'react';
import {MemoryRouter, MemoryRouterProps} from 'react-router-dom';
import {gqlPossibleTypes} from '_ui/gqlPossibleTypes';
import MockedUserContextProvider from '_ui/testing/MockedUserContextProvider';
import MockedLangContextProvider from '../testing/MockedLangContextProvider';
import {queries} from '@testing-library/dom';

export interface ICustomRenderOptions extends RenderOptions {
    mocks?: readonly MockedResponse[];
    [key: string]: any;
}

export interface ICustomRenderHookOptions<
    Props,
    Q extends Queries = typeof queries,
    Container extends Element | DocumentFragment = HTMLElement,
    BaseElement extends Element | DocumentFragment = Container
> extends RenderHookOptions<Props, Q, Container, BaseElement> {
    mocks?: readonly MockedResponse[];
}

interface IProvidersProps {
    mocks?: readonly MockedResponse[];
    cacheSettings?: InMemoryCacheConfig;
    routerProps?: MemoryRouterProps;
}

const Providers = ({children, mocks, cacheSettings, routerProps}: PropsWithChildren<IProvidersProps>) => {
    const mockCache = new InMemoryCache({possibleTypes: gqlPossibleTypes, ...cacheSettings});

    return (
        <MockedLangContextProvider>
            <MockedUserContextProvider>
                <MockedProvider mocks={mocks} cache={mockCache} addTypename={true}>
                    <MemoryRouter {...routerProps}>
                        <KitApp>{children ?? <></>}</KitApp>
                    </MemoryRouter>
                </MockedProvider>
            </MockedUserContextProvider>
        </MockedLangContextProvider>
    );
};

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <Providers {...props} {...options} />, ...options});

const renderHookWithProviders = <
    Result,
    Props,
    Q extends Queries = typeof queries,
    Container extends Element | DocumentFragment = HTMLElement,
    BaseElement extends Element | DocumentFragment = Container
>(
    hook: (initialProps: Props) => Result,
    options?: ICustomRenderHookOptions<Props, Q, Container, BaseElement>
) => renderHook(hook, {wrapper: props => <Providers {...props} {...options} />, ...options});

const mockBrowserFunctionsForTiptap = () => {
    const originalElementFromPoint = document.elementFromPoint;
    const originalHTMLElementGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    const originalHTMLElementGetClientRects = HTMLElement.prototype.getClientRects;
    const originalRangeGetBoundingClientRect = Range.prototype.getBoundingClientRect;
    const originalRangeGetClientRects = Range.prototype.getClientRects;

    function getBoundingClientRect(): DOMRect {
        const rec = {
            x: 0,
            y: 0,
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0
        };
        return {...rec, toJSON: () => rec};
    }

    class FakeDOMRectList extends Array<DOMRect> implements DOMRectList {
        item(index: number): DOMRect | null {
            return this[index];
        }
    }

    document.elementFromPoint = (): null => null;
    HTMLElement.prototype.getBoundingClientRect = getBoundingClientRect;
    HTMLElement.prototype.getClientRects = (): DOMRectList => new FakeDOMRectList();
    Range.prototype.getBoundingClientRect = getBoundingClientRect;
    Range.prototype.getClientRects = (): DOMRectList => new FakeDOMRectList();

    return () => {
        document.elementFromPoint = originalElementFromPoint;
        HTMLElement.prototype.getBoundingClientRect = originalHTMLElementGetBoundingClientRect;
        HTMLElement.prototype.getClientRects = originalHTMLElementGetClientRects;
        Range.prototype.getBoundingClientRect = originalRangeGetBoundingClientRect;
        Range.prototype.getClientRects = originalRangeGetClientRects;
    };
};

// Re-export everything from testing-library to improve DX. You can everything you need from this file when you use this
// custom render
export * from '@testing-library/react';
export {mockBrowserFunctionsForTiptap};
export {renderWithProviders as render};
export {renderHookWithProviders as renderHook};
