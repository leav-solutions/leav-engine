// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordIdentity, RecordIdentity_whoAmI_preview} from '_gqlTypes/RecordIdentity';

export const mockPreviews: RecordIdentity_whoAmI_preview = {
    tiny: '/fake/url/tiny.jpg',
    small: '/fake/url/small.jpg',
    medium: '/fake/url/medium.jpg',
    big: '/fake/url/big.jpg',
    huge: '/fake/url/huge.jpg',
    pdf: ''
};

export const mockModifier: RecordIdentity = {
    whoAmI: {
        id: '123456',
        label: 'admin',
        library: {
            id: 'users',
            label: {fr: 'Utilisateurs'}
        },
        preview: mockPreviews,
        color: '#123456'
    }
};
