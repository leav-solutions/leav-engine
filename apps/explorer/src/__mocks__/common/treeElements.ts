// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_TREE_CONTENT_treeContent} from '_gqlTypes/GET_TREE_CONTENT';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {INavigationPath} from '_types/types';
import {ITreeNodePermissions} from '../../graphQL/queries/trees/getTreeContentQuery';
import {mockPreviews} from './record';

export const mockTreeRecord: RecordIdentity = {
    id: 'id',
    whoAmI: {
        id: 'id',
        color: 'color',
        label: 'label',
        preview: mockPreviews,
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
        preview: mockPreviews,
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

export const mockTreeNodePermissions: ITreeNodePermissions & {__typename: string} = {
    access_tree: true,
    edit_children: true,
    detach: true,
    __typename: 'TreePermissions'
};

export const mockTreeElement: GET_TREE_CONTENT_treeContent = {
    id: '12345',
    record: {
        ...mockTreeRecord
    },
    childrenCount: 1,
    permissions: mockTreeNodePermissions
};

export const mockTreeElements: GET_TREE_CONTENT_treeContent[] = [mockTreeElement];

export const mockNavigationPath: INavigationPath = {
    id: 'id',
    library: 'library',
    label: 'label'
};
