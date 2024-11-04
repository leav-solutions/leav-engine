// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeDomain} from 'domain/tree/treeDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {ILibrary, LibraryBehavior} from '../../../_types/library';

interface IDeps {
    'core.domain.tree'?: ITreeDomain;
    'core.infra.tree'?: ITreeRepo;
    'core.utils'?: IUtils;
}

export type RunPreDeleteFunc = (library: ILibrary, ctx: IQueryInfos) => Promise<void>;

export default ({
    'core.domain.tree': treeDomain,
    'core.infra.tree': treeRepo = null,
    'core.utils': utils = null
}: IDeps): RunPreDeleteFunc => {
    const _filesBehavior = (library: ILibrary, ctx: IQueryInfos): Promise<any> =>
        treeRepo.deleteTree({id: utils.getLibraryTreeId(library.id), ctx});

    return async (library, ctx) => {
        // Remove library from tree where it's used
        const libraryTrees = await treeDomain.getTrees({
            params: {
                filters: {
                    library: library.id
                }
            },
            ctx
        });
        for (const tree of libraryTrees.list) {
            const newTreeLibraries = {...tree.libraries};
            delete newTreeLibraries[library.id];

            await treeDomain.saveTree(
                {
                    ...tree,
                    libraries: newTreeLibraries
                },
                ctx
            );
        }

        // Run action by behavior
        const actionByBehavior = {
            [LibraryBehavior.FILES]: () => _filesBehavior(library, ctx)
        };

        if (actionByBehavior[library.behavior]) {
            actionByBehavior[library.behavior]();
        }
    };
};
