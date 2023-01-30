// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {
    TREE_NODE_CHILDREN_treeNodeChildren_list,
    TREE_NODE_CHILDREN_treeNodeChildren_list_permissions
} from '_gqlTypes/TREE_NODE_CHILDREN';
import {INavigationPath} from '_types/types';
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

export const mockTreeNodePermissions: TREE_NODE_CHILDREN_treeNodeChildren_list_permissions & {__typename: string} = {
    access_tree: true,
    edit_children: true,
    detach: true,
    __typename: 'TreePermissions'
};

export const mockTreeElement: TREE_NODE_CHILDREN_treeNodeChildren_list = {
    id: '12345',
    record: {
        ...mockTreeRecord,
        active: true
    },
    childrenCount: 1,
    permissions: mockTreeNodePermissions
};

export const mockTreeElements: TREE_NODE_CHILDREN_treeNodeChildren_list[] = [mockTreeElement];

export const mockNavigationPath: INavigationPath = {
    id: 'id',
    library: 'library',
    label: 'label'
};
