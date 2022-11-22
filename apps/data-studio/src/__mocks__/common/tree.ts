// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_TREE_LIST_QUERY_trees_list} from '_gqlTypes/GET_TREE_LIST_QUERY';

export const mockTree: GET_TREE_LIST_QUERY_trees_list = {
    id: 'id-tree',
    label: {fr: 'label-tree', en: 'label-tree'},
    libraries: [
        {
            library: {
                id: 'library-id',
                label: {fr: 'library-label', en: 'library-label'}
            }
        }
    ],
    permissions: {
        access_tree: true,
        edit_children: true
    }
};
