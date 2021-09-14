// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {INavigationPath} from '_types/types';
import {IRecordAndChildren} from '../../graphQL/queries/trees/getTreeContentQuery';

export const mockTreeRecord: RecordIdentity = {
    id: 'id',
    whoAmI: {
        id: 'id',
        color: 'color',
        label: 'label',
        preview: {
            small: 'preview',
            medium: 'preview',
            big: 'preview',
            pages: 'preview'
        },
        library: {
            id: 'library-id',
            label: {
                fr: 'library-label',
                en: 'library-label'
            },
            gqlNames: {
                type: 'library_id',
                query: 'LibraryId'
            }
        }
    }
};

export const mockTreeRecordChild: RecordIdentity = {
    id: 'child',
    whoAmI: {
        id: 'child',
        color: 'color',
        label: 'label-child',
        preview: {
            small: 'preview-child',
            medium: 'preview-child',
            big: 'preview-child',
            pages: 'preview-child'
        },
        library: {
            id: 'library-id',
            label: {
                fr: 'library-label',
                en: 'library-label'
            },
            gqlNames: {
                type: 'library_id',
                query: 'LibraryId'
            }
        }
    }
};

export const mockTreeElement: IRecordAndChildren = {
    record: {
        ...mockTreeRecord
    },
    children: [{record: mockTreeRecordChild}]
};

export const mockTreeElements: IRecordAndChildren[] = [mockTreeElement];

export const mockNavigationPath: INavigationPath = {
    id: 'id',
    library: 'library',
    label: 'label'
};
