import {ITree, TreeBehavior} from '../../_types/tree';

export const mockTree: ITree = {
    id: 'my_tree',
    label: {
        fr: 'MonArbre',
        en: 'MyTree'
    },
    libraries: ['lib1', 'lib2']
};

export const mockFilesTree: ITree = {
    ...mockTree,
    behavior: TreeBehavior.FILES,
    libraries: ['lib1']
};
