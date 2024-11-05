// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import Settings from 'components/Settings';
import Workspace from 'components/Workspace';
import {Route, Routes as RouterRoutes} from 'react-router-dom';
import RouteNotFound from '../RouteNotFound';
import {routes} from './ListRoutes';

const Routes: FunctionComponent = () => (
    <RouterRoutes>
        <Route path={routes.root} element={<Workspace />} />
        <Route path={routes.home} element={<Workspace />} />
        <Route path={routes.workspace} element={<Workspace />} />
        <Route path={routes.settings} element={<Settings />} />
        <Route element={<RouteNotFound />} />
    </RouterRoutes>
);

export default Routes;
