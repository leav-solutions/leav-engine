import {type FunctionComponent} from 'react';
import Workspace from '../../Workspace';
import {Route, Routes as RouterRoutes} from 'react-router-dom';
import RouteNotFound from '../RouteNotFound';
import {routes} from './ListRoutes';

const Routes: FunctionComponent = () => (
    <RouterRoutes>
        <Route path={routes.root} element={<Workspace />} />
        <Route path={routes.home} element={<Workspace />} />
        <Route path={routes.workspace} element={<Workspace />} />
        <Route element={<RouteNotFound />} />
    </RouterRoutes>
);

export default Routes;
