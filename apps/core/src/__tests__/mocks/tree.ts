// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
