// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, AttributeType, LibraryBehavior, ViewSizes, ViewTypes} from '_ui/_gqlTypes';
import {
    IGetLibraryDetailExtendedQuery,
    IGetLibraryDetailExtendedVariables,
    ILibraryDetailExtended,
    ILibraryDetailExtendedDefaultView
} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import {mockLabel} from '_ui/__mocks__/common/label';

export const mockGetLibraryDetailExtendedDefaultView: ILibraryDetailExtendedDefaultView = {
    id: 'defaultViewId',
    description: {fr: 'default view', en: 'default view'},
    label: mockLabel('defaultViewLabel'),
    display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
    shared: false,
    filters: [],
    color: null,
    sort: null,
    attributes: []
};

export const mockGetLibraryDetailExtendedElement: ILibraryDetailExtended = {
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

export const mockGetLibraryDetailExtendedQuery: IGetLibraryDetailExtendedQuery = {
    libraries: {
        list: [mockGetLibraryDetailExtendedElement]
    }
};

export const mockGetLibraryDetailExtendedQueryVar: IGetLibraryDetailExtendedVariables = {
    libId: ['test']
};
