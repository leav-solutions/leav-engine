import {type WithTypename} from '@leav/utils';
import {type GET_APPLICATIONS_applications_list} from '../../_gqlTypes/GET_APPLICATIONS';
import {type GET_APPLICATION_BY_ENDPOINT_applications_list} from '../../_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {ApplicationType} from '../../_gqlTypes';

export const mockApplication: GET_APPLICATIONS_applications_list = {
    id: 'my-app',
    label: {
        en: 'My App',
    },
    description: {
        en: 'My description',
    },
    endpoint: 'my-app',
    url: 'http://example.com/app/my-app',
    color: 'orange',
    icon: null,
};

export const mockApplicationDetails: WithTypename<GET_APPLICATION_BY_ENDPOINT_applications_list> = {
    ...mockApplication,
    __typename: 'Application',
    type: ApplicationType.external,
    module: 'data-studio',
    permissions: {
        admin_application: true,
        access_application: true,
        __typename: 'ApplicationPermissions',
    },
    settings: {
        libraries: ['libA', 'libB'],
        trees: ['treeA', 'treeB'],
        showTransparency: false,
    },
};
