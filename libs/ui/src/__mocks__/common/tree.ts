import {TreeBehavior, type TreeDetailsFragment, type TreeLightFragment} from '_ui/_gqlTypes';
import {mockLibrarySimple} from './library';

export const mockTreeSimple: TreeLightFragment = {
    id: 'my_tree',
    label: {
        fr: 'Mon arbre',
        en: 'My tree',
    },
};

export const mockTreeWithDetails: TreeDetailsFragment = {
    id: 'my_tree',
    label: {
        fr: 'Mon arbre',
        en: 'My tree',
    },
    behavior: TreeBehavior.standard,
    system: false,
    libraries: [
        {
            library: {...mockLibrarySimple},
            settings: {
                allowedAtRoot: true,
                allowedChildren: ['__all__'],
                allowMultiplePositions: false,
            },
        },
    ],
};
