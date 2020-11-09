import React from 'react';
import {Route, Switch} from 'react-router-dom';
import Home from '../../Home';
import LibrariesList from '../../LibrariesList';
import LibraryItemsList from '../../LibraryItemsList';
import Navigation from '../../Navigation';
import Setting from '../../Setting';
import TreeList from '../../TreeList';
import RouteNotFound from '../RouteNotFound';
import {routes} from './ListRoutes';

function Routes(): JSX.Element {
    return (
        <Switch>
            <Route exact path={routes.root}>
                <LibrariesList />
            </Route>

            <Route path={routes.home}>
                <Home />
            </Route>

            <Route path={routes.navigation.listTree}>
                <TreeList />
            </Route>

            <Route path={routes.navigation.tree}>
                <Navigation />
            </Route>

            <Route exact path={routes.library.list}>
                <LibrariesList />
            </Route>

            <Route exact path={routes.library.listWithDetail}>
                <LibrariesList />
            </Route>

            <Route exact path={routes.library.items}>
                <LibraryItemsList />
            </Route>

            <Route path={routes.settings}>
                <Setting />
            </Route>

            <Route>
                <RouteNotFound />
            </Route>
        </Switch>
    );
}

export default Routes;
