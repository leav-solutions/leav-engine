// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ForgotPassword from 'components/ForgotPassword';
import Login from 'components/Login';
import ChangePassword from 'components/ResetPassword';
import {useEffect} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import styled from 'styled-components';
import useAppName from '../../useAppName';

const Background = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #8051fc;
`;

function App() {
    const appName = useAppName();

    useEffect(() => {
        document.title = `${appName}`;
    }, [appName]);

    return (
        <Background>
            <BrowserRouter basename={`${import.meta.env.VITE_ENDPOINT ?? '/'}`}>
                <Switch>
                    <Route path="/">
                        <Login />
                    </Route>
                    <Route path="/reset-password/:token">
                        <ChangePassword />
                    </Route>
                    <Route path="/forgot-password">
                        <ForgotPassword />
                    </Route>
                </Switch>
            </BrowserRouter>
        </Background>
    );
}
export default App;
