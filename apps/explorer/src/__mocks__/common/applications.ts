// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';

export const mockApplication: GET_APPLICATIONS_applications_list = {
    id: 'my-app',
    label: {
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
    ]
};
