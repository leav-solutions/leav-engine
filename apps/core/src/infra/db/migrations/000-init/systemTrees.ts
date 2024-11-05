// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITree, TreeBehavior} from '../../../../_types/tree';

export type MigrationTreeToCreate = ITree & {_key: string};

const commonTreeData: Partial<ITree> = {
    system: true,
    behavior: TreeBehavior.STANDARD
};
export const systemTrees: MigrationTreeToCreate[] = [
    {
        ...commonTreeData,
        _key: 'users_groups',
        label: {fr: "Groupes d'utilisateurs", en: 'Users groups'},
        libraries: {
            users_groups: {
                allowedAtRoot: true,
                allowedChildren: ['users_groups'],
                allowMultiplePositions: false
            }
        }
    },
    {
        ...commonTreeData,
        _key: 'files_tree',
        behavior: TreeBehavior.FILES,
        label: {fr: 'Fichiers', en: 'Files'},
        libraries: {
            files: {
                allowedAtRoot: true,
                allowedChildren: [],
                allowMultiplePositions: false
            },
            files_directories: {
                allowedAtRoot: true,
                allowedChildren: ['__all__'],
                allowMultiplePositions: false
            }
        }
    }
];
