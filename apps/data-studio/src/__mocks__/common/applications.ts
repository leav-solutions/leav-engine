// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {GET_APPLICATION_BY_ENDPOINT_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {ApplicationType} from '_gqlTypes/globalTypes';

export const mockApplication: GET_APPLICATIONS_applications_list = {
    id: 'my-app',
    label: {
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

export const mockApplicationDetails: WithTypename<GET_APPLICATION_BY_ENDPOINT_applications_list> = {
    ...mockApplication,
    __typename: 'Application',
    type: ApplicationType.external,
    module: 'data-studio',
    permissions: {
        admin_application: true,
        access_application: true,
        __typename: 'ApplicationPermissions'
    },
    settings: {
        libraries: ['libA', 'libB'],
        trees: ['treeA', 'treeB'],
        showTransparency: false
    }
};
