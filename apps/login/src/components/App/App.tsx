// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Login from 'components/Login';
import ChangePassword from 'components/ResetPassword';
import ForgotPassword from 'components/ForgotPassword';
import React from 'react';
import {Route, Routes, BrowserRouter} from 'react-router-dom';

function App() {
    return (
        <BrowserRouter basename={`${process.env.REACT_APP_ENDPOINT ?? '/'}`}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/reset-password/:token" element={<ChangePassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;
