import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {ILibrary, LibraryBehavior} from '../../../_types/library';

const _filesBehavior = (library: ILibrary, deps: {treeRepo: ITreeRepo; utils: IUtils}): Promise<any> =>
    deps.treeRepo.deleteTree(deps.utils.getLibraryTreeId(library.id));

export default (library: ILibrary, deps: {treeRepo: ITreeRepo; utils: IUtils}): Promise<void> => {
    const actionByBehavior = {
        [LibraryBehavior.FILES]: () => _filesBehavior(library, deps)
    };

    return actionByBehavior[library.behavior] ? actionByBehavior[library.behavior]() : null;
};
