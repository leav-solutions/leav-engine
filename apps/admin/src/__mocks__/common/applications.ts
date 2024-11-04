// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {IEditApplicationContextData} from 'context/EditApplicationContext/EditApplicationContext';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_APPLICATION_MODULES_applicationsModules} from '_gqlTypes/GET_APPLICATION_MODULES';
import {ApplicationType} from '_gqlTypes/globalTypes';

export const mockApplication: GET_APPLICATIONS_applications_list = {
    id: 'myapp',
    type: ApplicationType.internal,
    label: {
        fr: 'My App',
        en: 'My App'
    },
    description: {
        en: 'My description'
    },
    endpoint: 'my-app',
    url: 'http://example.com/app/my-app',
    color: 'orange',
    icon: null
};

export const mockApplicationDetails: WithTypename<GET_APPLICATION_BY_ID_applications_list> = {
    ...mockApplication,
    __typename: 'Application',
    module: 'data-studio',
    permissions: {
        __typename: 'ApplicationPermissions',
        access_application: true,
        admin_application: true
    },
    settings: {
        foo: 'bar',
        libraries: ['libA', 'libB'],
        trees: ['treeA', 'treeB']
    }
};

export const mockApplicationsModules: GET_APPLICATION_MODULES_applicationsModules[] = [
    {
        id: 'admin',
        description: 'Administration',
        version: '0.1.0'
    },
    {
        id: 'data-studio',
        description: 'Generic application to explore your data',
        version: '0.1.0'
    }
];

export const mockEditApplicationContextValue: IEditApplicationContextData = {
    application: mockApplicationDetails,
    readonly: false
};
