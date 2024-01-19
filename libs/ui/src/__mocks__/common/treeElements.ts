// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordIdentity} from '_ui/types/records';
import {INavigationPath} from '_ui/types/trees';
import {TreeNodeChildFragment} from '_ui/_gqlTypes';
import {mockPreviews} from './record';

export const mockTreeRecord: IRecordIdentity = {
    id: 'id',
    whoAmI: {
        id: 'id',
        color: 'color',
        label: 'label',
        subLabel: 'sublabel',
        preview: mockPreviews,
        library: {
            id: 'library-id',
            label: {
                fr: 'library-label',
                en: 'library-label'
            }
        }
    }
};

export const mockTreeRecordChild: IRecordIdentity = {
    id: 'child',
    whoAmI: {
        id: 'child',
        color: 'color',
        label: 'label-child',
        subLabel: 'sulabel-child',
        preview: mockPreviews,
        library: {
            id: 'library-id',
            label: {
                fr: 'library-label',
                en: 'library-label'
            }
        }
    }
};

export const mockTreeNodePermissions: TreeNodeChildFragment['permissions'] & {__typename: string} = {
    // export const mockTreeNodePermissions: TREE_NODE_CHILDREN_treeNodeChildren_list_permissions & {__typename: string} = {
    access_tree: true,
    edit_children: true,
    detach: true,
    __typename: 'TreePermissions'
};

export const mockTreeElement: TreeNodeChildFragment = {
    id: '12345',
    record: {
        ...mockTreeRecord,
        active: [
            {
                value: true
            }
        ]
    },
    childrenCount: 1,
    permissions: mockTreeNodePermissions
};

export const mockTreeElements: TreeNodeChildFragment[] = [mockTreeElement];

export const mockNavigationPath: INavigationPath = {
    id: 'id',
    library: 'library',
    label: 'label'
};
