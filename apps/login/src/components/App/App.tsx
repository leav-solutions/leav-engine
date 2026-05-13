import {BrowserRouter} from 'react-router-dom';
import AuthHandler from './AuthHandler';
import Routes from './Routes';
import {APP_BASE_URL} from '../../constants';

function App() {
    return (
        <BrowserRouter basename={APP_BASE_URL}>
            <AuthHandler>
                <Routes />
            </AuthHandler>
        </BrowserRouter>
    );
}
export default App;
