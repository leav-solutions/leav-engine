// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    GET_LIBRARY_DETAIL_EXTENDED,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_defaultView
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {AttributeFormat, AttributeType, LibraryBehavior, ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
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
    behavior: LibraryBehavior.standard,
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
            readonly: false,
            multiple_values: false,
            system: false
        }
    ],
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
