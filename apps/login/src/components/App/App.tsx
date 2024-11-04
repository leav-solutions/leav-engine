// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {BrowserRouter} from 'react-router-dom';
import {APPS_ENDPOINT, APP_ENDPOINT} from '../../constants';
import AuthHandler from './AuthHandler';
import Routes from './Routes';

function App() {
    return (
        <BrowserRouter basename={`${APPS_ENDPOINT}/${APP_ENDPOINT}`}>
            <AuthHandler>
                <Routes />
            </AuthHandler>
        </BrowserRouter>
    );
}
export default App;
