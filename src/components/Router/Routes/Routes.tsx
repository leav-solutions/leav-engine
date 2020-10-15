import React from 'react';
import {Route, Switch} from 'react-router-dom';
import Home from '../../Home';
import LibrariesList from '../../LibrariesList';
import LibraryItemsList from '../../LibraryItemsList';
import Navigation from '../../Navigation';
import Setting from '../../Setting';
import TreeList from '../../TreeList';
import RouteNotFound from '../RouteNotFound';

function Routes(): JSX.Element {
    return (
        <Switch>
            <Route exact path="/">
                <LibrariesList />
            </Route>

            <Route path="/home">
                <Home />
            </Route>

            <Route path="/navigation/list">
                <TreeList />
            </Route>

            <Route path="/navigation/:treeId">
                <Navigation />
            </Route>

            <Route exact path="/library/list/">
                <LibrariesList />
            </Route>

            <Route exact path="/library/list/:libId/:libQueryName/:filterName">
                <LibrariesList />
            </Route>

            <Route exact path="/library/items/:libId/:libQueryName/:filterName">
                <LibraryItemsList />
            </Route>

            <Route path="/setting">
                <Setting />
            </Route>

            <Route>
                <RouteNotFound />
            </Route>
        </Switch>
    );
}

export default Routes;
