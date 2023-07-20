// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPreviewScalar} from '@leav/utils';
import {IRecordIdentityWhoAmI} from '../../types/RecordIdentity';

export const mockPreviews: IPreviewScalar = {
    tiny: '/fake/url/tiny.jpg',
    small: '/fake/url/small.jpg',
    medium: '/fake/url/medium.jpg',
    big: '/fake/url/big.jpg',
    huge: '/fake/url/huge.jpg',
    original: '/fake/url/original.jpg',
    file: null
};

export const mockRecord: IRecordIdentityWhoAmI = {
    id: '123456',
    label: 'record_label',
    library: {
        id: 'record_lib',
        label: {fr: 'Test Lib'}
    },
    preview: mockPreviews,
    color: 'blue'
};
