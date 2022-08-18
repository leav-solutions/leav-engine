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
    behavior: TreeBehavior.STANDARD,
    libraries: {
        lib1: {
            allowMultiplePositions: false,
            allowedAtRoot: true,
            allowedChildren: ['__all__']
        },
        lib2: {
            allowMultiplePositions: false,
            allowedAtRoot: true,
            allowedChildren: ['__all__']
        }
    }
};

export const mockFilesTree: ITree = {
    ...mockTree,
    behavior: TreeBehavior.FILES,
    libraries: {
        lib1: {
            allowMultiplePositions: false,
            allowedAtRoot: true,
            allowedChildren: ['lib1', 'lib2']
        },
        lib2: {
            allowMultiplePositions: false,
            allowedAtRoot: true,
            allowedChildren: []
        }
    }
};
