// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordIdentity} from '_gqlTypes/RecordIdentity';

export const mockPreviews: Preview = {
    tiny: '/fake/url/tiny.jpg',
    small: '/fake/url/small.jpg',
    medium: '/fake/url/medium.jpg',
    big: '/fake/url/big.jpg',
    huge: '/fake/url/huge.jpg',
    pdf: '',
    file: null,
    original: '/fake/url/original.jpg'
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
