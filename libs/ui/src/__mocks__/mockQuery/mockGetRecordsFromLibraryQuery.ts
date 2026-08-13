import {
    type IGetRecordsFromLibraryQuery,
    type IGetRecordsFromLibraryQueryElement,
    type IGetRecordsFromLibraryQueryVariables,
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {mockLibrarySimple} from '../common/library';
import {mockPreviews} from '../common/record';

export const mockGetRecordsFromLibraryQueryElement: IGetRecordsFromLibraryQueryElement = {
    _id: 'id',
    id: 'id',
    whoAmI: {
        id: 'id',
        label: 'label',
        subLabel: 'sublabel',
        color: null,
        preview: mockPreviews,
        library: mockLibrarySimple,
    },
};

export const mockGetRecordsFromLibraryQuery = (): IGetRecordsFromLibraryQuery => ({
    records: {
        totalCount: 1,
        list: [mockGetRecordsFromLibraryQueryElement],
    },
});

export const mockGetRecordsFromLibraryQueryVar: IGetRecordsFromLibraryQueryVariables = {
    library: 'test',
    limit: 20,
    offset: 0,
    filters: [],
    sort: null,
    fullText: '',
    version: [],
};
