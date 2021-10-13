// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Workspace from 'components/Workspace';
import React from 'react';
import {Route, Switch} from 'react-router-dom';
import RouteNotFound from '../RouteNotFound';
import {routes} from './ListRoutes';

function Routes(): JSX.Element {
    return (
        <Switch>
            <Route exact path={routes.root}>
                <Workspace />
            </Route>

            <Route exact path={routes.home}>
                <Workspace />
            </Route>

            <Route exact path={routes.workspace}>
                <Workspace />
            </Route>

            <Route>
                <RouteNotFound />
            </Route>
        </Switch>
    );
}

export default Routes;
