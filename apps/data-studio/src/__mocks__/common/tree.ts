// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_TREES_trees_list} from '_gqlTypes/GET_TREES';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';

export const mockTree: GET_TREES_trees_list = {
    id: 'id-tree',
    label: {fr: 'label-tree', en: 'label-tree'},
    behavior: TreeBehavior.standard,
    libraries: [
        {
            library: {
                id: 'library-id',
                label: {fr: 'library-label', en: 'library-label'},
                behavior: LibraryBehavior.standard
            }
        }
    ],
    permissions: {
        access_tree: true,
        edit_children: true
    }
};
