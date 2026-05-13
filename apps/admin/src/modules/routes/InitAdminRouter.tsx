import {type FunctionComponent} from 'react';
import {useRoutes} from 'react-router-dom';
import {adminRoutes} from './routes';

export const InitAdminRouter: FunctionComponent = () => useRoutes(adminRoutes);
