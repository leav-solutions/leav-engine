// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {ApplicationType, GetApplicationByIdQuery} from '_ui/_gqlTypes';

export const mockApplication: WithTypename<GetApplicationByIdQuery['applications']['list'][number]> = {
    id: 'my_app',
    label: {
        fr: 'Mon application',
        en: 'My application'
    },
    type: ApplicationType.internal,
    description: {
        fr: 'Description de mon application',
        en: 'My application description'
    },
    endpoint: 'my-app',
    url: null,
    color: null,
    icon: null,
    module: 'data-studio',
    settings: [],
    permissions: {
        access_application: true,
        admin_application: true,
        __typename: 'ApplicationPermissions'
    },
    __typename: 'Application'
};
