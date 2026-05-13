import {LibraryBehavior} from '../../_gqlTypes';
import {type RecordIdentity} from '../../_gqlTypes/RecordIdentity';
import {
    type TREE_NODE_CHILDREN_treeNodeChildren_list,
    type TREE_NODE_CHILDREN_treeNodeChildren_list_permissions,
} from '../../_gqlTypes/TREE_NODE_CHILDREN';
import {type INavigationPath} from '../../_types/types';
import {mockPreviews} from './record';

export const mockTreeRecord: RecordIdentity = {
    id: 'id',
    whoAmI: {
        id: 'id',
        color: 'color',
        label: 'label',
        subLabel: 'sublabel',
        preview: mockPreviews,
        library: {
            id: 'library-id',
            behavior: LibraryBehavior.standard,
            label: {
                fr: 'library-label',
                en: 'library-label',
            },
        },
    },
};

export const mockTreeRecordChild: RecordIdentity = {
    id: 'child',
    whoAmI: {
        id: 'child',
        color: 'color',
        label: 'label-child',
        subLabel: 'sulabel-child',
        preview: mockPreviews,
        library: {
            id: 'library-id',
            behavior: LibraryBehavior.standard,
            label: {
                fr: 'library-label',
                en: 'library-label',
            },
        },
    },
};

export const mockTreeNodePermissions: TREE_NODE_CHILDREN_treeNodeChildren_list_permissions & {__typename: string} = {
    access_tree: true,
    edit_children: true,
    detach: true,
    __typename: 'TreePermissions',
};

export const mockTreeElement: TREE_NODE_CHILDREN_treeNodeChildren_list = {
    id: '12345',
    record: {
        ...mockTreeRecord,
        active: true,
    },
    childrenCount: 1,
    permissions: mockTreeNodePermissions,
};

export const mockTreeElements: TREE_NODE_CHILDREN_treeNodeChildren_list[] = [mockTreeElement];

export const mockNavigationPath: INavigationPath = {
    id: 'id',
    library: 'library',
    label: 'label',
};
