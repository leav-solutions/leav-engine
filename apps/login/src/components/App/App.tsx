// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ForgotPassword from 'components/ForgotPassword';
import Login from 'components/Login';
import ChangePassword from 'components/ResetPassword';
import Loading from 'components/shared/Loading';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {useEffect} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import styled from 'styled-components';
import useAppName from '../../hooks/useAppName';

const Background = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #8051fc;
`;

interface IAppProps {
    basename: string;
}

function App({basename}: IAppProps) {
    const {name, loading, error} = useAppName();

    useEffect(() => {
        document.title = `${name}`;
    }, [name]);

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <Background>
            <BrowserRouter basename={basename}>
                <Switch>
                    <Route exact path="/">
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
