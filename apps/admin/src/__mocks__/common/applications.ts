import {type WithTypename} from '@leav/utils';
import {type IEditApplicationContextData} from '../../context/EditApplicationContext/EditApplicationContext';
import {type GET_APPLICATIONS_applications_list} from '../../_gqlTypes/GET_APPLICATIONS';
import {type GET_APPLICATION_BY_ID_applications_list} from '../../_gqlTypes/GET_APPLICATION_BY_ID';
import {type GET_APPLICATION_MODULES_applicationsModules} from '../../_gqlTypes/GET_APPLICATION_MODULES';
import {ApplicationType} from '../../_gqlTypes';

export const mockApplication: GET_APPLICATIONS_applications_list = {
    id: 'myapp',
    type: ApplicationType.internal,
    label: {
        fr: 'My App',
        en: 'My App',
    },
    description: {
        en: 'My description',
    },
    endpoint: 'my-app',
    url: 'http://example.com/app/my-app',
    color: 'orange',
    icon: null,
    system: false,
};

export const mockApplicationDetails: WithTypename<GET_APPLICATION_BY_ID_applications_list> = {
    ...mockApplication,
    __typename: 'Application',
    module: 'app-studio',
    permissions: {
        __typename: 'ApplicationPermissions',
        access_application: true,
        admin_application: true,
    },
    settings: {
        foo: 'bar',
        libraries: ['libA', 'libB'],
        trees: ['treeA', 'treeB'],
    },
};

export const mockApplicationsModules: GET_APPLICATION_MODULES_applicationsModules[] = [
    {
        id: 'admin',
        description: 'Administration',
        version: '0.1.0',
    },
    {
        id: 'app-studio',
        description: 'Generic application to explore your data',
        version: '0.1.0',
    },
];

export const mockEditApplicationContextValue: IEditApplicationContextData = {
    application: mockApplicationDetails,
    readonly: false,
};
