// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {ApplicationType} from '_gqlTypes/globalTypes';

export const mockApplication: WithTypename<GET_APPLICATION_BY_ID_applications_list> = {
    __typename: 'Application',
    id: 'my-app',
    label: {
        en: 'My App'
    },
    description: {
        en: 'My description'
    },
    endpoint: 'my-app',
    permissions: {
        access_application: true,
        __typename: 'ApplicationPermissions'
    },
    type: ApplicationType.internal,
    color: null,
    url: 'https://example.com/app/my-app',
    icon: {
        __typename: 'Icon',
        id: 'my-icon',
        whoAmI: {
            id: 'my-icon',
            label: 'My icon',
            library: {
                id: 'my-lib',
                label: {
                    en: 'My Library'
                }
            },
            subLabel: 'my Icon',
            color: '#789456',
            preview: {
                tiny: 'path/to/tiny/preview.png',
                small: 'path/to/small/preview.png',
                medium: 'path/to/medium/preview.png',
                big: 'path/to/big/preview.png',
                huge: 'path/to/huge/preview.png',
                original: 'path/to/original/preview.png',
                file: null
            }
        }
    }
};
