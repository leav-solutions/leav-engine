// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {useRoutes} from 'react-router-dom';
import {Loading} from '@leav/ui';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {firstLevelRoutes} from './router/routes';

export const InitApplicationRouter: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();

    return useRoutes(application === null ? [{element: <Loading />, path: '*'}] : firstLevelRoutes);
};
