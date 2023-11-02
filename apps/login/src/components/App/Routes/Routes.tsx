import {ErrorDisplay, Loading} from '@leav/ui';
import ForgotPassword from 'components/ForgotPassword';
import Login from 'components/Login';
import ResetPassword from 'components/ResetPassword';
import useAppName from 'hooks/useAppName';
import {useEffect} from 'react';
import {Route, Switch} from 'react-router-dom';

export default function Routes() {
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
        <Switch>
            <Route exact path="/">
                <Login />
            </Route>
            <Route path="/reset-password/:token">
                <ResetPassword />
            </Route>
            <Route path="/forgot-password">
                <ForgotPassword />
            </Route>
        </Switch>
    );
}
