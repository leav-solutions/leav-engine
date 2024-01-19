// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TreeBehavior, TreeDetailsFragment, TreeLightFragment} from '_ui/_gqlTypes';
import {mockLibrarySimple} from './library';

export const mockTreeSimple: TreeLightFragment = {
    id: 'my_tree',
    label: {
        fr: 'Mon arbre',
        en: 'My tree'
    }
};

export const mockTreeWithDetails: TreeDetailsFragment = {
    id: 'my_tree',
    label: {
        fr: 'Mon arbre',
        en: 'My tree'
    },
    behavior: TreeBehavior.standard,
    system: false,
    libraries: [
        {
            library: {...mockLibrarySimple},
            settings: {
                allowedAtRoot: true,
                allowedChildren: ['__all__'],
                allowMultiplePositions: false
            }
        }
    ]
};
