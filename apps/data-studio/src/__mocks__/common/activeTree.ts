import {type IActiveTree} from '../../graphQL/queries/cache/activeTree/getActiveTreeQuery';
import {LibraryBehavior, TreeBehavior} from '../../_gqlTypes';

export const mockActiveTree: IActiveTree = {
    id: 'activeTreeId',
    label: 'activeTreeLabel',
    behavior: TreeBehavior.standard,
    libraries: [
        {
            id: 'activeTreeLibraryId',
            behavior: LibraryBehavior.standard,
        },
    ],
    permissions: {
        access_tree: true,
        edit_children: true,
    },
};
