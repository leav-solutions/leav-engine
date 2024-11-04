// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ITree} from '_types/tree';

interface IDeps {
    'core.infra.tree': ITreeRepo;
}

export type HandleRemovedLibrariesFunc = (
    treeDataBefore: ITree,
    treeDataAfter: ITree,
    ctx: IQueryInfos
) => Promise<void>;

export default function ({'core.infra.tree': treeRepo}: IDeps): HandleRemovedLibrariesFunc {
    return async (treeDataBefore, treeDataAfter, ctx) => {
        if (!treeDataAfter.libraries) {
            // If libraries have not changed, don't do anything
            return;
        }

        const oldTreeLibrariesIds = Object.keys(treeDataBefore.libraries ?? {});
        const newTreeLibraries = Object.keys(treeDataAfter.libraries);
        const removedLibraries = oldTreeLibrariesIds.filter(l => !newTreeLibraries.includes(l));

        // For each library, get all records presents in the tree
        for (const libraryId of removedLibraries) {
            const nodesToRemove = await treeRepo.getNodesByLibrary({treeId: treeDataBefore.id, libraryId, ctx});

            // Detach them
            for (const nodeId of nodesToRemove) {
                await treeRepo.deleteElement({treeId: treeDataBefore.id, nodeId, deleteChildren: true, ctx});
            }
        }
    };
}
