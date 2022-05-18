// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';

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
    libraries: [
        {
            id: 'my-lib',
            label: {
                en: 'My Library'
            }
        }
    ],
    permissions: {
        access_application: true
    },
    icon: {
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
            color: '#789456',
            preview: {
                tiny: 'path/to/tiny/preview.png',
                small: 'path/to/small/preview.png',
                medium: 'path/to/medium/preview.png',
                big: 'path/to/big/preview.png',
                huge: 'path/to/huge/preview.png'
            }
        }
    }
};
