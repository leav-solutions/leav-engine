// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {IEditApplicationContextData} from 'context/EditApplicationContext/EditApplicationContext';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_APPLICATION_MODULES_applicationsModules} from '_gqlTypes/GET_APPLICATION_MODULES';
import {ApplicationInstallStatus, ApplicationType} from '_gqlTypes/globalTypes';
import {mockLibrary} from '__mocks__/libraries';

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
    module: 'explorer',
    libraries: [
        {
            ...mockLibrary,
            id: 'libA'
        },
        {
            ...mockLibrary,
            id: 'libB'
        }
    ],
    trees: [
        {
            __typename: 'Tree',
            id: 'treeA'
        },
        {
            __typename: 'Tree',
            id: 'treeB'
        }
    ],
    permissions: {
        __typename: 'ApplicationPermissions',
        access_application: true,
        admin_application: true
    },
    install: {
        __typename: 'ApplicationInstall',
        status: ApplicationInstallStatus.SUCCESS,
        lastCallResult: 'all good!'
    },
    settings: {
        foo: 'bar'
    }
};

export const mockApplicationsModules: GET_APPLICATION_MODULES_applicationsModules[] = [
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
