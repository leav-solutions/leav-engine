// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileType, LibraryBehavior} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI, RecordIdentity_whoAmI_preview} from '_gqlTypes/RecordIdentity';
import {IRecordIdentityWhoAmI} from '_types/types';

export const mockPreviews: RecordIdentity_whoAmI_preview = {
    tiny: '/fake/url/tiny.jpg',
    small: '/fake/url/small.jpg',
    medium: '/fake/url/medium.jpg',
    big: '/fake/url/big.jpg',
    huge: '/fake/url/huge.jpg',
    pdf: '',
    original: 'originals/files/123456',
    file: {
        id: '123456',
        file_type: FileType.image,
        library: {
            id: 'files'
        }
    }
};

export const mockRecord: RecordIdentity_whoAmI = {
    id: '123456',
    label: 'record_label',
    library: {
        id: 'record_lib',
        behavior: LibraryBehavior.standard,
        label: {fr: 'Test Lib'},
        gqlNames: {
            query: 'record_libs',
            type: 'RecordLib'
        }
    },
    preview: mockPreviews,
    color: 'blue'
};

export const mockRecordWhoAmI: IRecordIdentityWhoAmI = {
    ...mockRecord,
    index: 0
};
