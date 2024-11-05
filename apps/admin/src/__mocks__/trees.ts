// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import pick from 'lodash/pick';
import {GET_TREE_BY_ID_trees_list} from '../_gqlTypes/GET_TREE_BY_ID';
import {PermissionsRelation, TreeBehavior} from '../_gqlTypes/globalTypes';
import {mockAttrTree} from './attributes';

export const mockTree: GET_TREE_BY_ID_trees_list = {
    id: 'test_tree',
    system: false,
    libraries: [
        {
            library: {id: 'test_lib', label: {fr: 'Test Lib'}, attributes: [{...mockAttrTree}]},
            settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: ['__all__']}
        },
        {
            library: {id: 'test_lib2', label: {fr: 'Test Lib 2'}, attributes: [{...mockAttrTree}]},
            settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: ['__all__']}
        }
    ],
    behavior: TreeBehavior.standard,
    label: {
        fr: 'TestTree',
        en: 'TestTree'
    },
    permissions_conf: null
};

export const mockTreeWithPermConf: GET_TREE_BY_ID_trees_list = {
    ...mockTree,
    id: 'test_tree_with_perm',
    permissions_conf: [
        {
            libraryId: 'test_lib',
            permissionsConf: {
                permissionTreeAttributes: [pick(mockAttrTree, ['id', 'label'])],
                relation: PermissionsRelation.and
            }
        },
        {
            libraryId: 'test_lib2',
            permissionsConf: {
                permissionTreeAttributes: [pick(mockAttrTree, ['id', 'label'])],
                relation: PermissionsRelation.and
            }
        }
    ]
};
