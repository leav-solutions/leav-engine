// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryElement,
    IGetRecordsFromLibraryQueryVariables
} from 'graphQL/queries/records/getRecordsFromLibraryQueryTypes';
import {IField, OrderSearch} from '_types/types';
import {mockLabel} from '__mocks__/common/label';
import {mockLibrary} from '__mocks__/common/library';
import {mockPreview} from '__mocks__/common/preview';

export const mockGetRecordsFromLibraryQueryElement: IGetRecordsFromLibraryQueryElement = {
    id: 'id',
    whoAmI: {
        id: 'id',
        label: mockLabel('label'),
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
    sortField: 'field',
    sortOrder: OrderSearch.asc
};
