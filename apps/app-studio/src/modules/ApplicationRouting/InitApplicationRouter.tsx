import {type FunctionComponent} from 'react';
import {useRoutes} from 'react-router-dom';
import {Loading} from '@leav/ui';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {firstLevelRoutes} from './router/routes';

export const InitApplicationRouter: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();

    return useRoutes(application === null ? [{element: <Loading />, path: '*'}] : firstLevelRoutes);
};
