import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {SystemTrees} from '../../../../_constants/systemTrees';
import {type ITree, TreeBehavior} from '../../../../_types/tree';

export type MigrationTreeToCreate = ITree & {_key: string};

const commonTreeData: Partial<ITree> = {
    system: true,
    behavior: TreeBehavior.STANDARD,
};
export const systemTrees: MigrationTreeToCreate[] = [
    {
        ...commonTreeData,
        _key: SystemTrees.USERS_GROUPS,
        label: {fr: "Groupes d'utilisateurs", en: 'Users groups'},
        libraries: {
            [SystemLibraries.USERS_GROUPS]: {
                allowedAtRoot: true,
                allowedChildren: [SystemLibraries.USERS_GROUPS],
                allowMultiplePositions: false,
            },
        },
    },
    {
        ...commonTreeData,
        _key: SystemTrees.FILES,
        behavior: TreeBehavior.FILES,
        label: {fr: 'Fichiers', en: 'Files'},
        libraries: {
            [SystemLibraries.FILES]: {
                allowedAtRoot: true,
                allowedChildren: [],
                allowMultiplePositions: false,
            },
            [SystemLibraries.FILES_DIRECTORIES]: {
                allowedAtRoot: true,
                allowedChildren: ['__all__'],
                allowMultiplePositions: false,
            },
        },
    },
];
