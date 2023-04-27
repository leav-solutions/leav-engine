// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActiveLibrary} from '../../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import {IActiveTree} from '../../../graphQL/queries/cache/activeTree/getActiveTreeQuery';

export const routes = {
    root: '/',
    home: '/:panel(home)',
    workspace: '/:panel(tree|library)/:entityId',
    navigation: {
        listTree: '/tree/list',
        tree: '/:panel(tree)/:treeId'
    },
    library: {
        list: '/library/list/',
        items: '/:panel(library)/:libId'
    },
    settings: '/settings/:tabId?'
};

export const makeActiveLibraryRoute = (activeLibrary: IActiveLibrary) => {
    return `/library/${activeLibrary.id}`;
};

export const makeActiveTreeRoute = (activeTree: IActiveTree) => {
    return `/tree/${activeTree.id}`;
};
