// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Override} from '@leav/utils';
import {type GET_APPLICATION_BY_ENDPOINT_applications_list} from '../../_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '../../_gqlTypes/GET_GLOBAL_SETTINGS';
import {type IApplicationSettings} from '../../_types/types';

export interface IApplicationContext {
    currentApp: Override<GET_APPLICATION_BY_ENDPOINT_applications_list, {settings: IApplicationSettings}>;
    globalSettings: GET_GLOBAL_SETTINGS_globalSettings;
}
