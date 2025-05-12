// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {generatePath, Navigate, useLocation, useOutletContext} from 'react-router-dom';
import {IApplication, IApplicationMatchingContext, Nullable} from '../types';
import {routes} from '../routes';

export const RedirectToFirstPanelOnUnknownOne: FunctionComponent<{application: IApplication}> = ({
    application,
    children
}) => {
    const {search} = useLocation();
    const {currentPanel} = useOutletContext<Nullable<IApplicationMatchingContext>>();

    return currentPanel == null ? (
        <Navigate
            to={generatePath(routes.panel, {panelId: application.workspaces.at(0).panels.at(0)?.id}) + search}
            replace
        />
    ) : (
        <>{children}</>
    );
};
