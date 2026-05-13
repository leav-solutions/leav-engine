import {type GET_APPLICATION_BY_ID_applications_list} from '../../../../../_gqlTypes/GET_APPLICATION_BY_ID';

export type ApplicationInfosFormValues = Omit<
    GET_APPLICATION_BY_ID_applications_list,
    'permissions' | 'url' | 'settings'
>;
