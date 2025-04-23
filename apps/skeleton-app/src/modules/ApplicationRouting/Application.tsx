// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import type {IApplication} from './types';
import {Outlet} from 'react-router-dom';

interface IApplicationProps {
    application: IApplication;
}

export const Application: FunctionComponent<IApplicationProps> = ({application}) => (
    <Outlet context={application.workspaces} />
);
