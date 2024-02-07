// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorDisplay, Loading} from '@leav/ui';
import ForgotPassword from 'components/ForgotPassword';
import Login from 'components/Login';
import ResetPassword from 'components/ResetPassword';
import useAppName from 'hooks/useAppName';
import {useEffect} from 'react';
import {Route, Routes as RouterRoutes} from 'react-router-dom';

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
        <RouterRoutes>
            <Route path="/" element={<Login />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
        </RouterRoutes>
    );
}
