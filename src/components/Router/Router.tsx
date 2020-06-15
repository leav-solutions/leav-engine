import React, {useRef, useState} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {Ref, Sidebar, Sticky} from 'semantic-ui-react';
import styled from 'styled-components';
import SideBarMenu from '../SideBarMenu';
import TopBar from '../TopBar';
import Routes from './Routes';

const PageWrapper = styled.div`
    height: 100%;
    padding: 0;
    margin: 0;
`;

const TopBarWrapper = styled.div`
    height: 3.5rem;
`;

function Router(): JSX.Element {
    const [sideBarVisible, setSideBarVisible] = useState<boolean>(false);

    const contextRef = useRef();

    const toggleSidebarVisible = () => {
        setSideBarVisible(visible => !visible);
    };

    const hideSideBar = () => setSideBarVisible(false);

    return (
        <BrowserRouter>
            <PageWrapper>
                <TopBarWrapper>
                    <Sticky context={contextRef}>
                        <TopBar toggleSidebarVisible={toggleSidebarVisible} />
                    </Sticky>
                </TopBarWrapper>
                <Sidebar.Pushable as={'div'} className="page-content">
                    <Sticky context={contextRef} styleElement={{position: ''}}>
                        <SideBarMenu visible={sideBarVisible} hide={hideSideBar} />
                    </Sticky>

                    <Ref innerRef={contextRef}>
                        <Sidebar.Pusher>
                            <Routes />
                        </Sidebar.Pusher>
                    </Ref>
                </Sidebar.Pushable>
            </PageWrapper>
        </BrowserRouter>
    );
}

export default Router;
