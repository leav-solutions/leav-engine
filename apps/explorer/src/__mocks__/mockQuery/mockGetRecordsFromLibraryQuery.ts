// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryElement,
    IGetRecordsFromLibraryQueryVariables
} from 'graphQL/queries/records/getRecordsFromLibraryQueryTypes';
import {SortOrder} from '_gqlTypes/globalTypes';
import {IField} from '_types/types';
import {mockLibrary} from '__mocks__/common/library';
import {mockPreview} from '__mocks__/common/preview';

export const mockGetRecordsFromLibraryQueryElement: IGetRecordsFromLibraryQueryElement = {
    id: 'id',
    whoAmI: {
        id: 'id',
        label: 'label',
        preview: mockPreview,
        library: mockLibrary
    }
};

export const mockGetRecordsFromLibraryQuery = (libraryName: string, fields: IField[]): IGetRecordsFromLibraryQuery => ({
    [libraryName]: {
        totalCount: 1,
        list: [mockGetRecordsFromLibraryQueryElement]
    }
});

export const mockGetRecordsFromLibraryQueryVar: IGetRecordsFromLibraryQueryVariables = {
    limit: 20,
    offset: 0,
    filters: [],
    sortField: 'id',
    sortOrder: SortOrder.asc,
    fullText: ''
};
