// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ME_me} from '_gqlTypes/ME';

export const mockUser: ME_me = {
    id: '1',
    login: 'toto',
    whoAmI: {
        id: '1',
        label: 'Toto',
        color: 'red',
        library: {
            id: 'users',
            label: {
                fr: 'Utilisateurs'
            },
            gqlNames: {
                query: 'users',
                type: 'Users'
            }
        },
        preview: null
    }
};
