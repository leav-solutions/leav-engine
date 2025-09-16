// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {generatePath, Navigate, useLocation, useOutletContext} from 'react-router-dom';
import {Application, IApplicationMatchingContext} from '../types';
import {routes} from '../routes';

export const RedirectToFirstFullpagePanelOnInvalidFullpagePanel: FunctionComponent<{
    application: Application;
}> = ({application, children}) => {
    const {search} = useLocation();
    const {currentFullpagePanel} = useOutletContext<IApplicationMatchingContext>();

    return currentFullpagePanel ? (
        <>{children}</>
    ) : (
        <Navigate
            to={generatePath(routes.panel, {panelId: application.workspaces.at(0).panels.at(0)?.id}) + search}
            replace
        />
    );
};
