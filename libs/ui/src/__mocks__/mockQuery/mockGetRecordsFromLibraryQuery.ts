// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {IField} from '_ui/types/search';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryElement,
    IGetRecordsFromLibraryQueryVariables
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {mockLibrarySimple} from '../common/library';
import {mockPreviews} from '../common/record';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const mockGetRecordsFromLibraryQueryElement: IGetRecordsFromLibraryQueryElement = {
    _id: 'id',
    id: 'id',
    whoAmI: {
        id: 'id',
        label: 'label',
        subLabel: 'sublabel',
        color: null,
        preview: mockPreviews,
        library: mockLibrarySimple
    }
};

export const mockGetRecordsFromLibraryQuery = (libraryName: string, fields: IField[]): IGetRecordsFromLibraryQuery => ({
    records: {
        totalCount: 1,
        list: [mockGetRecordsFromLibraryQueryElement]
    }
});

export const mockGetRecordsFromLibraryQueryVar: IGetRecordsFromLibraryQueryVariables = {
    library: 'test',
    limit: 20,
    offset: 0,
    filters: [],
    sort: null,
    fullText: '',
    version: []
};
