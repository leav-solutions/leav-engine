// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActiveLibrary} from '../../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import {IActiveTree} from '../../../graphQL/queries/cache/activeTree/getActiveTreeQuery';

export const routes = {
    root: '/',
    home: '/:panel',
    workspace: '/:panel/:entityId',
    settings: '/settings/:tabId?'
};

export const makeActiveLibraryRoute = (activeLibrary: IActiveLibrary) => {
    return `/library/${activeLibrary.id}`;
};

export const makeActiveTreeRoute = (activeTree: IActiveTree) => {
    return `/tree/${activeTree.id}`;
};
