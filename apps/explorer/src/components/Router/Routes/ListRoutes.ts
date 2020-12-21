// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActiveLibrary} from '../../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {IActiveTree} from '../../../queries/cache/activeTree/getActiveTreeQuery';

export const routes = {
    root: '/',
    home: '/home',
    navigation: {
        listTree: '/navigation/list',
        tree: '/navigation/:treeId'
    },
    library: {
        list: '/library/list/',
        listWithDetail: '/library/list/:libId/:libQueryName/:filterName',
        items: '/library/items/:libId/:libQueryName/:filterName'
    },
    settings: '/setting'
};

export const makeActiveLibraryRoute = (activeLibrary: IActiveLibrary) => {
    return `/library/items/${activeLibrary.id}/${activeLibrary.gql.query}/${activeLibrary.filter}`;
};

export const makeActiveTreeRoute = (activeTree: IActiveTree) => {
    return `/navigation/${activeTree.id}`;
};
