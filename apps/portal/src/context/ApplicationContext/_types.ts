// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';

export interface IApplicationContext {
    currentApp: GET_APPLICATION_BY_ID_applications_list;
    globalSettings: GET_GLOBAL_SETTINGS_globalSettings;
}
