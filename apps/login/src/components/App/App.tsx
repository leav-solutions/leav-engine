// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Login from 'components/Login';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';

function App() {
    return (
        <Router>
            <Login />
        </Router>
    );
}
export default App;
