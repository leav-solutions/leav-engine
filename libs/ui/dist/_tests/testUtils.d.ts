import {RenderOptions, RenderResult} from '@testing-library/react';
import {ReactElement} from 'react';
interface ICustomRenderOptions extends RenderOptions {
    [key: string]: any;
}
declare const renderWithProviders: (ui: ReactElement, options?: ICustomRenderOptions) => RenderResult;
export * from '@testing-library/react';
export {renderWithProviders as render};
