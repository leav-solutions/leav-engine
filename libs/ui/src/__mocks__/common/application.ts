import {type WithTypename} from '@leav/utils';
import {ApplicationType, type GetApplicationByIdQuery} from '_ui/_gqlTypes';

export const mockApplication: WithTypename<GetApplicationByIdQuery['applications']['list'][number]> = {
    id: 'my_app',
    label: {
        fr: 'Mon application',
        en: 'My application',
    },
    type: ApplicationType.internal,
    description: {
        fr: 'Description de mon application',
        en: 'My application description',
    },
    endpoint: 'my-app',
    url: null,
    color: null,
    icon: null,
    module: 'app-studio',
    settings: [],
    permissions: {
        access_application: true,
        admin_application: true,
        __typename: 'ApplicationPermissions',
    },
    __typename: 'Application',
};
