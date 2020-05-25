import React, {useRef, useState} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {Ref, Sidebar, Sticky} from 'semantic-ui-react';
import SideBarMenu from '../SideBarMenu';
import TopBar from '../TopBar';
import Routes from './Routes';

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
                            <Routes />
                        </Sidebar.Pusher>
                    </Ref>
                </Sidebar.Pushable>
            </div>
        </BrowserRouter>
    );
}

export default Router;
