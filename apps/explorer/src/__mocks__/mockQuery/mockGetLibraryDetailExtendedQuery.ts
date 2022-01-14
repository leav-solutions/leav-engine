// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    GET_LIBRARY_DETAIL_EXTENDED,
    GET_LIBRARY_DETAIL_EXTENDEDVariables,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {AttributeFormat, AttributeType, ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {mockLabel} from '__mocks__/common/label';

export const mockGetLibraryDetailExtendedDefaultView: GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView = {
    id: 'defaultViewId',
    description: 'default view',
    label: mockLabel('defaultViewLabel'),
    display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
    shared: false,
    filters: [],
    color: null,
    sort: null,
    settings: null
};

export const mockGetLibraryDetailExtendedElement: GET_LIBRARY_DETAIL_EXTENDED_libraries_list = {
    id: 'test',
    system: true,
    label: {
        fr: 'label',
        en: 'label'
    },
    attributes: [
        {
            id: 'test',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            label: {
                fr: 'Actif',
                en: 'Active'
            },
            multiple_values: false
        }
    ],
    gqlNames: {
        query: 'test',
        filter: 'FileFilter',
        searchableFields: 'FileSearchableFields',
        type: 'type'
    },
    permissions: {
        access_library: true,
        access_record: true,
        create_record: true,
        delete_record: true,
        edit_record: true
    },
    defaultView: mockGetLibraryDetailExtendedDefaultView,
    linkedTrees: []
};

export const mockGetLibraryDetailExtendedQuery: GET_LIBRARY_DETAIL_EXTENDED = {
    libraries: {
        list: [mockGetLibraryDetailExtendedElement]
    }
};

export const mockGetLibraryDetailExtendedQueryVar: GET_LIBRARY_DETAIL_EXTENDEDVariables = {
    libId: 'test'
};
