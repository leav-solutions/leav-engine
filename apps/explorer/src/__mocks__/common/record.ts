// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordIdentityWhoAmI} from '_types/types';

export const mockRecordWhoAmI: IRecordIdentityWhoAmI = {
    id: '123456',
    label: 'record_label',
    library: {
        id: 'record_lib',
        label: {fr: 'Test Lib'},
        gqlNames: {
            query: 'record_libs',
            type: 'RecordLib'
        }
    },
    preview: {
        small: '/fake/url/small.jpg',
        big: '/fake/url/big.jpg',
        medium: '/fake/url/medium.jpg',
        pages: ''
    },
    color: '#123456',
    index: 0
};
