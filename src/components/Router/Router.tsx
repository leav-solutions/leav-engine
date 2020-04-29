import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Sidebar} from 'semantic-ui-react';
import Home from '../Home';
import Setting from '../Setting';
import SideBarMenu from '../SideBarMenu';

function Router(): JSX.Element {
    return (
        <BrowserRouter>
            <div className="height100">
                <SideBarMenu visible={true} />
                <Sidebar.Pusher>
                    <Switch>
                        <Route exact path="/">
                            <Home />
                        </Route>
                        <Route path="/setting">
                            <Setting />
                        </Route>
                    </Switch>
                </Sidebar.Pusher>
            </div>
        </BrowserRouter>
    );
}

export default Router;
