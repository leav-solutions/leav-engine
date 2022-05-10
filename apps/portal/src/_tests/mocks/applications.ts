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
    }
};
