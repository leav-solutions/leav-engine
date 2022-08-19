// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useLocalStorage from 'hooks/useLocalStorage';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import styled from 'styled-components';
import AppMenu from '../AppMenu';
import Header from '../Header';
import Routes from '../Routes';

const headerHeight = '3rem';
const LeftCol = styled.div`
    grid-area: sidebar;
    height: calc(100vh - ${headerHeight});
    position: relative;
    border-right: 1px solid #ddd;
`;

const Content = styled.div`
    grid-area: content;
    padding: 20px;
    height: calc(100vh - ${headerHeight});
    overflow-y: auto;
`;

const HeaderWrapper = styled.div`
    grid-area: header;
`;

const HomeWrapper = styled.div<{menuWidth: number}>`
    display: grid;
    grid-template-columns: ${({menuWidth}) => menuWidth}px 1fr;
    grid-template-rows: ${headerHeight} 1fr;
    grid-template-areas:
        'header header'
        'sidebar content';
    transition: grid-template-columns 0.3s ease-in-out;
`;

function Home(): JSX.Element {
    const [isMenuCollapsed, setMenuCollapsed] = useLocalStorage('menu_collapsed', false);
    const menuWidth = isMenuCollapsed ? 71 : 250;

    const _handleToggleMenu = () => {
        setMenuCollapsed(!isMenuCollapsed);
    };

    return (
        <Router basename={`${process.env.REACT_APP_ENDPOINT ?? '/'}`}>
            <HomeWrapper menuWidth={menuWidth}>
                <HeaderWrapper>
                    <Header />
                </HeaderWrapper>
                <LeftCol>
                    <AppMenu isCollapsed={isMenuCollapsed} onToggle={_handleToggleMenu} width={menuWidth} />
                </LeftCol>
                <Content className="content flex-col" style={{overflowX: 'scroll'}}>
                    <Routes />
                </Content>
            </HomeWrapper>
        </Router>
    );
}

export default Home;
