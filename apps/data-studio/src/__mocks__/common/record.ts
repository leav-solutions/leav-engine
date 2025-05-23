// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileType} from '@leav/utils';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';

export const mockPreviews: Preview = {
    tiny: '/fake/url/tiny.jpg',
    small: '/fake/url/small.jpg',
    medium: '/fake/url/medium.jpg',
    big: '/fake/url/big.jpg',
    huge: '/fake/url/huge.jpg',
    pdf: '',
    original: 'originals/files/123456',
    file: {
        id: '123456',
        type: FileType.IMAGE,
        label: 'Some file',
        color: null,
        preview: null,
        library: {
            id: 'files',
            label: {fr: 'Fichiers'},
            behavior: LibraryBehavior.files
        }
    }
};

export const mockRecord: RecordIdentity_whoAmI = {
    id: '123456',
    label: 'record_label',
    subLabel: 'record_sublabel',
    library: {
        id: 'record_lib',
        behavior: LibraryBehavior.standard,
        label: {fr: 'Test Lib'}
    },
    preview: mockPreviews,
    color: 'blue'
};
