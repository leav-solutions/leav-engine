// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordIdentity} from '_gqlTypes/RecordIdentity';

export const mockModifier: RecordIdentity = {
    id: '1',
    whoAmI: {
        id: '123456',
        label: 'admin',
        library: {
            id: 'users',
            label: {fr: 'Utilisateurs'},
            gqlNames: {
                query: 'users',
                type: 'User'
            }
        },
        preview: {
            small: '/fake/url/small.jpg',
            big: '/fake/url/big.jpg',
            medium: '/fake/url/medium.jpg',
            pages: ''
        },
        color: '#123456'
    }
};
