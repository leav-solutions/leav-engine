// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
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

    display: flex;
    flex-flow: column;
`;

const TopBarWrapper = styled.div`
    height: 3rem;

    & > * {
        height: 3rem;

        & > * {
            height: 3rem;
        }
    }
`;

const BodyWrapper = styled.div`
    position: relative; /* relative position for Drawer */
    height: calc(100% - 3rem);
`;

function Router(): JSX.Element {
    const [sideBarVisible, setSideBarVisible] = useState<boolean>(false);
    const [userPanelVisible, setUserPanelVisible] = useState<boolean>(false);

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
                        <TopBar
                            sideBarVisible={sideBarVisible}
                            userPanelVisible={userPanelVisible}
                            toggleSidebarVisible={toggleSidebarVisible}
                            toggleUserPanelVisible={toggleUserPanelVisible}
                        />
                    </TopBarWrapper>
                    <BodyWrapper>
                        <SideBarMenu visible={sideBarVisible} hide={hideSideBar} />
                        <UserPanel userPanelVisible={userPanelVisible} hideUserPanel={hideUserPanel} />

                        <Routes />
                    </BodyWrapper>
                </PageWrapper>
            </BrowserRouter>
        </>
    );
}

export default Router;
