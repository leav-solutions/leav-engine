import React, {useRef, useState} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Ref, Sidebar, Sticky} from 'semantic-ui-react';
import Home from '../Home';
import LibrariesList from '../LibrariesList';
import LibraryDetailWrapper from '../LibrariesList/LibraryDetailWrapper';
import LibraryItemsList from '../LibraryItemsList';
import Setting from '../Setting';
import SideBarMenu from '../SideBarMenu';
import TopBar from '../TopBar';

function Router(): JSX.Element {
    const [sideBarVisible, setSideBarVisible] = useState<boolean>(false);

    const contextRef = useRef();

    const toggleSidebarVisible = () => {
        setSideBarVisible(visible => !visible);
    };

    const hideSideBar = () => setSideBarVisible(false);

    return (
        <BrowserRouter>
            <div style={{minHeight: '100vh'}}>
                <Sticky context={contextRef}>
                    <TopBar toggleSidebarVisible={toggleSidebarVisible} />
                </Sticky>
                <Sidebar.Pushable as={'div'} className="height-full-page">
                    <Sticky context={contextRef} styleElement={{position: ''}}>
                        <SideBarMenu visible={sideBarVisible} hide={hideSideBar} />
                    </Sticky>

                    <Ref innerRef={contextRef}>
                        <Sidebar.Pusher style={{margin: '1rem 2rem'}}>
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
                            </Switch>
                        </Sidebar.Pusher>
                    </Ref>
                </Sidebar.Pushable>
            </div>
        </BrowserRouter>
    );
}

export default Router;
