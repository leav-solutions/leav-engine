import {
    render,
    renderHook,
    screen,
    type Queries,
    type RenderHookOptions,
    type RenderOptions,
    type RenderResult,
} from '@testing-library/react';
import {type MockedResponse} from '@apollo/client/testing';
import {type ReactElement} from 'react';
import {type queries} from '@testing-library/dom';
import {vi} from 'vitest';
import {TestProviders} from './TestProviders';

export interface ICustomRenderOptions extends RenderOptions {
    mocks?: readonly MockedResponse[];
    [key: string]: any;
}

export interface ICustomRenderHookOptions<
    Props,
    Q extends Queries = typeof queries,
    Container extends Element | DocumentFragment = HTMLElement,
    BaseElement extends Element | DocumentFragment = Container,
> extends RenderHookOptions<Props, Q, Container, BaseElement> {
    mocks?: readonly MockedResponse[];
}

// Wrapper around testing-library's render to automatically render apollo's provider and redux store provider
const renderWithProviders = (ui: ReactElement, options?: ICustomRenderOptions): RenderResult =>
    render(ui, {wrapper: props => <TestProviders {...props} {...options} />, ...options});

const renderHookWithProviders = <
    Result,
    Props,
    Q extends Queries = typeof queries,
    Container extends Element | DocumentFragment = HTMLElement,
    BaseElement extends Element | DocumentFragment = Container,
>(
    hook: (initialProps: Props) => Result,
    options?: ICustomRenderHookOptions<Props, Q, Container, BaseElement>,
) => renderHook(hook, {wrapper: props => <TestProviders {...props} {...options} />, ...options});

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
            width: 0,
        };
        return {...rec, toJSON: () => rec};
    }

    class FakeDOMRectList extends Array<DOMRect> implements DOMRectList {
        public item(index: number): DOMRect | null {
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

// Re-export what is needed from testing-library to improve DX.
export {act, cleanup, fireEvent, screen, waitFor, within} from '@testing-library/react';
// You can everything you need from this file when you use this custom render
export {mockBrowserFunctionsForTiptap};
export {renderWithProviders as render};
export {renderHookWithProviders as renderHook};

/**
 * Helps prevent error logs blowing up as a result of expecting an error to be thrown,
 * when using a library (such as enzyme)
 *
 * cf https://github.com/jestjs/jest/issues/5785#issuecomment-769475904
 * @param func Function that you would normally pass to `expect(func).toThrow()`
 */
export const expectToThrow = (func: () => unknown, error?: JestToErrorArg): void => {
    // Even though the error is caught, it still gets printed to the console
    // so we mock that out to avoid the wall of red text.
    const spy = vi.spyOn(console, 'error');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    spy.mockImplementation(() => {});

    expect(func).toThrow(error);

    spy.mockRestore();
};

type JestToErrorArg = string | RegExp | Error | (new (...args: any[]) => any);

// Since antd 6, the table renders a fixed header in its own <table>, so the header <tr>
// is exposed as an accessible row at index 0. This helper drops it to return only record rows,
// keeping the row indexing used throughout the tests unchanged.
export const getRecordRows = (): HTMLElement[] => screen.getAllByRole('row').slice(1);
