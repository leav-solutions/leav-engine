// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Override} from '@leav/utils';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {IApplicationSettings} from '_types/types';

export interface IApplicationContext {
    currentApp: Override<GET_APPLICATION_BY_ID_applications_list, {settings: IApplicationSettings}>;
    globalSettings: GET_GLOBAL_SETTINGS_globalSettings;
}
