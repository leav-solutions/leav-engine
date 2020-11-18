import {ILibraryDomain} from 'domain/library/libraryDomain';
import difference from 'lodash/difference';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../../_types/library';
import {ITree, TreeBehavior} from '../../../_types/tree';

export interface ITreeDataValidationHelper {
    validate(treeData: ITree, ctx: IQueryInfos): Promise<void>;
}

interface IDeps {
    'core.library.domain'?: ILibraryDomain;
    'core.utils'?: IUtils;
}

export default function({
    'core.library.domain': libraryDomain = null,
    'core.utils': utils = null
}: IDeps): ITreeDataValidationHelper {
    const _validateId = (treeData: ITree) => {
        if (!utils.isIdValid(treeData.id)) {
            throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
        }
    };

    const _checkLibExists = (treeData: ITree, existingLibs: ILibrary[]) => {
        // Check if all libraries exists
        const libsIds = existingLibs.map(lib => lib.id);

        const unknownLibs = difference(treeData.libraries, libsIds);

        if (unknownLibs.length) {
            throw new ValidationError({
                libraries: {msg: Errors.UNKNOWN_LIBRARIES, vars: {libraries: unknownLibs.join(', ')}}
            });
        }
    };

    const _validateFilesTree = (treeLibraries: ILibrary[]) => {
        if (treeLibraries.length > 1) {
            throw new ValidationError<ITree>({libraries: Errors.TOO_MUCH_LIBRARIES_ON_FILES_TREE});
        }

        if (treeLibraries[0].behavior !== LibraryBehavior.FILES) {
            throw new ValidationError<ITree>({libraries: Errors.NON_FILES_LIBRARY});
        }
    };

    const validate = async (treeData: ITree, ctx: IQueryInfos): Promise<void> => {
        const {list: treeLibraries} = await libraryDomain.getLibraries({ctx});

        _validateId(treeData);
        _checkLibExists(treeData, treeLibraries);

        if (treeData.behavior === TreeBehavior.FILES) {
            _validateFilesTree(treeLibraries);
        }
    };

    return {
        validate
    };
}
