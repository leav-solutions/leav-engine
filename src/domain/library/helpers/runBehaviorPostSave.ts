// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {ILibrary, LibraryBehavior} from '../../../_types/library';
import {TreeBehavior} from '../../../_types/tree';
import {IQueryInfos} from '_types/queryInfos';

const _filesBehavior = (
    library: ILibrary,
    isNewLib: boolean,
    deps: {treeRepo: ITreeRepo; utils: IUtils},
    ctx: IQueryInfos
): Promise<any> =>
    isNewLib
        ? deps.treeRepo.createTree({
              treeData: {
                  id: deps.utils.getLibraryTreeId(library.id),
                  system: true,
                  label: library.label,
                  behavior: TreeBehavior.FILES,
                  libraries: [library.id]
              },
              ctx
          })
        : null;

export default (
    library: ILibrary,
    isNewLib: boolean,
    deps: {treeRepo: ITreeRepo; utils: IUtils},
    ctx: IQueryInfos
): Promise<void> => {
    const actionByBehavior = {
        [LibraryBehavior.FILES]: () => _filesBehavior(library, isNewLib, deps, ctx)
    };

    return actionByBehavior[library.behavior] ? actionByBehavior[library.behavior]() : null;
};
