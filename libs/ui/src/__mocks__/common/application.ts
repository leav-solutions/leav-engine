// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {ApplicationInstallStatus, ApplicationType, GetApplicationByIdQuery} from '../../_gqlTypes';

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
    install: {
        status: ApplicationInstallStatus.SUCCESS,
        lastCallResult: 'Installation successful',
        __typename: 'ApplicationInstall'
    },
    settings: [],
    permissions: {
        access_application: true,
        admin_application: true,
        __typename: 'ApplicationPermissions'
    },
    __typename: 'Application'
};
