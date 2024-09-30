// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibraryRepo} from 'infra/library/libraryRepo';
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
    'core.infra.library': ILibraryRepo;
    'core.utils': IUtils;
}

export default function ({'core.infra.library': libraryRepo, 'core.utils': utils}: IDeps): ITreeDataValidationHelper {
    const _validateId = (treeData: ITree) => {
        if (!utils.isIdValid(treeData.id)) {
            throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
        }
    };

    const _checkLibExists = (treeData: ITree, existingLibs: ILibrary[]) => {
        // Check if all libraries exists
        const libsIds = existingLibs.map(lib => lib.id);

        const unknownLibs = difference(Object.keys(treeData.libraries ?? {}), libsIds);

        if (unknownLibs.length) {
            throw new ValidationError({
                libraries: {msg: Errors.UNKNOWN_LIBRARIES, vars: {libraries: unknownLibs.join(', ')}}
            });
        }
    };

    const _validateFilesTree = (treeLibraries: ILibrary[]) => {
        const hasForbiddenLibrary = treeLibraries.some(
            lib => lib.behavior !== LibraryBehavior.FILES && lib.behavior !== LibraryBehavior.DIRECTORIES
        );

        if (hasForbiddenLibrary) {
            throw new ValidationError<ITree>({libraries: Errors.NON_FILES_LIBRARY});
        }
    };

    const _validatePermissionsConf = (treeData: ITree) => {
        if (!treeData.permissions_conf) {
            return;
        }

        const permConfLibs = Object.keys(treeData.permissions_conf);

        const invalidLibs = difference(permConfLibs, Object.keys(treeData.libraries));

        if (invalidLibs.length) {
            throw new ValidationError({
                permissions_conf: {
                    msg: Errors.INVALID_PERMISSIONS_CONF_LIBRARIES,
                    vars: {libraries: invalidLibs.join(', ')}
                }
            });
        }
    };

    const validate = async (treeData: ITree, ctx: IQueryInfos): Promise<void> => {
        const {list: existingLibraries} = await libraryRepo.getLibraries({ctx});

        _validateId(treeData);
        _checkLibExists(treeData, existingLibraries);
        _validatePermissionsConf(treeData);

        if (treeData.behavior === TreeBehavior.FILES) {
            const treeLibraries = Object.keys(treeData.libraries).map(libId =>
                existingLibraries.find(lib => lib.id === libId)
            );

            _validateFilesTree(treeLibraries);
        }
    };

    return {
        validate
    };
}
