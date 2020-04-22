import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {ILibrary, LibraryBehavior} from '../../../_types/library';
import {IQueryInfos} from '_types/queryInfos';

const _filesBehavior = (
    library: ILibrary,
    deps: {treeRepo: ITreeRepo; utils: IUtils},
    ctx: IQueryInfos
): Promise<any> => deps.treeRepo.deleteTree({id: deps.utils.getLibraryTreeId(library.id), ctx});

export default (library: ILibrary, deps: {treeRepo: ITreeRepo; utils: IUtils}, ctx: IQueryInfos): Promise<void> => {
    const actionByBehavior = {
        [LibraryBehavior.FILES]: () => _filesBehavior(library, deps, ctx)
    };

    return actionByBehavior[library.behavior] ? actionByBehavior[library.behavior]() : null;
};
