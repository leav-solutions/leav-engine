import {type FunctionComponent, type PropsWithChildren} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {APP_BASE_URL} from '../../constants';

export const InitRouting: FunctionComponent<PropsWithChildren> = ({children}) => (
    <BrowserRouter basename={APP_BASE_URL}>{children}</BrowserRouter>
);
