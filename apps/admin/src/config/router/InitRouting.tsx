import {type FunctionComponent} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {APP_BASE_URL} from '../../constants';

export const InitRouting: FunctionComponent = ({children}) => (
    <BrowserRouter basename={APP_BASE_URL}>{children}</BrowserRouter>
);
