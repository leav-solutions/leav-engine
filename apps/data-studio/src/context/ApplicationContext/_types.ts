import {type Override} from '@leav/utils';
import {type GET_APPLICATION_BY_ENDPOINT_applications_list} from '../../_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '../../_gqlTypes/GET_GLOBAL_SETTINGS';
import {type IApplicationSettings} from '../../_types/types';

export interface IApplicationContext {
    currentApp: Override<GET_APPLICATION_BY_ENDPOINT_applications_list, {settings: IApplicationSettings}>;
    globalSettings: GET_GLOBAL_SETTINGS_globalSettings;
}
