import {createBrowserRouter} from 'react-router-dom';
import {APP_BASE_URL} from '../../constants';
import {adminRoutes} from '../../modules/routes/routes';

export const adminRouter = createBrowserRouter(adminRoutes, {basename: APP_BASE_URL});
