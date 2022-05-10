// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import styled from 'styled-components';
import AppMenu from '../AppMenu';
import Routes from '../Routes';

const LeftCol = styled.div`
    position: fixed;
    width: 250px;
    background-color: #1b1c1d;
    min-height: 100vh;
`;

const Content = styled.div`
    /* margin-left: 250px; */
    padding: 20px;
    margin-top: 3em;
    /* min-height: 100vh; */
`;

function Home(): JSX.Element {
    return (
        <Router basename={`${process.env.REACT_APP_ENDPOINT ?? '/'}`}>
            <div className="wrapper height100">
                {/* <LeftCol> */}
                <AppMenu />
                {/* </LeftCol> */}
                <Content className="content flex-col height100" style={{overflowX: 'scroll'}}>
                    <Routes />
                </Content>
            </div>
        </Router>
    );
}

export default Home;
