import React from 'react';
import {Route, Switch} from 'react-router-dom';
import Home from '../../Home';
import LibrariesList from '../../LibrariesList';
import LibraryDetailWrapper from '../../LibrariesList/LibraryDetailWrapper';
import LibraryItemsList from '../../LibraryItemsList';
import Setting from '../../Setting';
import RouteNotFound from '../RouteNotFound';

function Routes(): JSX.Element {
    return (
        <Switch>
            <Route exact path="/">
                <Home />
            </Route>

            <Route exact path="/library/list/">
                <LibrariesList />
            </Route>

            <Route exact path="/library/detail/:libId/:libQueryName">
                <LibraryDetailWrapper />
            </Route>

            <Route exact path="/library/list/:libId/:libQueryName">
                <LibrariesList />
            </Route>

            <Route exact path="/library/items/:libQueryName">
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
