import {Menu} from 'antd';
import React, {useRef, useState} from 'react';
import {BrowserRouter} from 'react-router-dom';
import styled from 'styled-components';
import SideBarMenu from '../SideBarMenu';
import TopBar from '../TopBar';
import UserPanel from '../UserPanel';
import Routes from './Routes';

const PageWrapper = styled.div`
    height: 100%;
    padding: 0;
    margin: 0;
`;

const TopBarWrapper = styled.div``;

function Router(): JSX.Element {
    const [sideBarVisible, setSideBarVisible] = useState<boolean>(false);
    const [userPanelVisible, setUserPanelVisible] = useState<boolean>(false);

    const contextRef = useRef();

    const toggleSidebarVisible = () => {
        setSideBarVisible(visible => !visible);
    };

    const hideSideBar = () => setSideBarVisible(false);

    const toggleUserPanelVisible = () => {
        setUserPanelVisible(visible => !visible);
    };

    const hideUserPanel = () => setUserPanelVisible(false);

    return (
        <>
            <BrowserRouter>
                <PageWrapper>
                    <TopBarWrapper>
                        <div>
                            <TopBar
                                sideBarVisible={sideBarVisible}
                                userPanelVisible={userPanelVisible}
                                toggleSidebarVisible={toggleSidebarVisible}
                                toggleUserPanelVisible={toggleUserPanelVisible}
                            />
                        </div>
                    </TopBarWrapper>
                    <div
                        style={{
                            position: 'relative', // relative position for Drawer
                            height: '100%'
                        }}
                    >
                        <div>
                            <SideBarMenu visible={sideBarVisible} hide={hideSideBar} />
                            <UserPanel userPanelVisible={userPanelVisible} hideUserPanel={hideUserPanel} />
                        </div>
                        <div>
                            <Menu>
                                <Routes />
                            </Menu>
                        </div>
                    </div>
                </PageWrapper>
            </BrowserRouter>
        </>
    );
}

export default Router;
