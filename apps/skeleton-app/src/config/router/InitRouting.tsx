// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {APP_ENDPOINT, APPS_ENDPOINT} from '@leav/ui';

export const InitRouting: FunctionComponent = ({children}) => (
    <BrowserRouter basename={`${APPS_ENDPOINT}/${APP_ENDPOINT}`}>{children}</BrowserRouter>
);
