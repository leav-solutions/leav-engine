// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Settings from 'components/Settings';
import Workspace from 'components/Workspace';
import {Route, Routes as RouterRoutes} from 'react-router-dom';
import RouteNotFound from '../RouteNotFound';
import {routes} from './ListRoutes';

function Routes(): JSX.Element {
    return (
        <RouterRoutes>
            <Route path={routes.root} element={<Workspace />} />
            <Route path={routes.home} element={<Workspace />} />
            <Route path={routes.workspace} element={<Workspace />} />
            <Route path={routes.settings} element={<Settings />} />
            <Route element={<RouteNotFound />} />
        </RouterRoutes>
    );
}

export default Routes;
