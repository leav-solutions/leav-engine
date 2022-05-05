// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEditApplicationContextData} from 'context/EditApplicationContext/EditApplicationContext';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_APPLICATION_COMPONENTS_applicationsComponents} from '_gqlTypes/GET_APPLICATION_COMPONENTS';
import {ApplicationInstallStatus} from '_gqlTypes/globalTypes';

export const mockApplication: GET_APPLICATIONS_applications_list = {
    id: 'myapp',
    label: {
        fr: 'My App',
        en: 'My App'
    },
    description: {
        en: 'My description'
    },
    endpoint: 'my-app',
    color: 'orange',
    icon: null
};

export const mockApplicationDetails: GET_APPLICATION_BY_ID_applications_list = {
    ...mockApplication,
    component: 'explorer',
    libraries: [
        {
            id: 'libA'
        },
        {
            id: 'libB'
        }
    ],
    trees: [
        {
            id: 'treeA'
        },
        {
            id: 'treeB'
        }
    ],
    permissions: {
        access_application: true,
        admin_application: true
    },
    install: {
        status: ApplicationInstallStatus.SUCCESS,
        lastCallResult: 'all good!'
    }
};

export const mockApplicationsComponents: GET_APPLICATION_COMPONENTS_applicationsComponents[] = [
    {
        id: 'admin-app',
        description: 'Administration app',
        version: '0.1.0'
    },
    {
        id: 'explorer',
        description: 'Generic application to explore your data',
        version: '0.1.0'
    }
];

export const mockEditApplicationContextValue: IEditApplicationContextData = {
    application: mockApplicationDetails,
    readonly: false
};
