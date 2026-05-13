import {type GET_APPLICATION_BY_ID_applications_list} from '../../_gqlTypes/GET_APPLICATION_BY_ID';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '../../_gqlTypes/GET_GLOBAL_SETTINGS';

export interface IApplicationContext {
    currentApp: GET_APPLICATION_BY_ID_applications_list;
    globalSettings: GET_GLOBAL_SETTINGS_globalSettings;
}
