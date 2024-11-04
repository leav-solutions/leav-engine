// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICachesService} from 'infra/cache/cacheService';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IUtils} from 'utils/utils';
import {ILibrary} from '_types/library';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {AttributeCondition, IRecord} from '../../_types/record';
import {GetCoreEntityByIdFunc} from './getCoreEntityById';

interface IDeps {
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.infra.record': IRecordRepo;
    'core.utils': IUtils;
    'core.infra.library': ILibraryRepo;
    'core.infra.cache.cacheService': ICachesService;
}

export interface IValidateHelper {
    validateLibrary(library: string, ctx: IQueryInfos): Promise<ILibrary>;
    validateRecord(library: string, recordId: string, ctx: IQueryInfos): Promise<IRecord>;
    validateView(view: string, throwIfNotFound: boolean, ctx: IQueryInfos): Promise<boolean>;
    validateTree(tree: string, throwIfNotFound: boolean, ctx: IQueryInfos): Promise<boolean>;
    validateLibraryAttribute(library: string, attribute: string, ctx: IQueryInfos): Promise<void>;
}

export default function ({
    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
    'core.infra.record': recordRepo,
    'core.utils': utils,
    'core.infra.library': libraryRepo,
    'core.infra.cache.cacheService': cacheService
}: IDeps): IValidateHelper {
    return {
        async validateLibraryAttribute(library: string, attribute: string, ctx: IQueryInfos): Promise<void> {
            const libs = await libraryRepo.getLibrariesUsingAttribute(attribute, ctx);

            if (!libs.includes(library)) {
                throw new ValidationError({attribute: Errors.UNKNOWN_LIBRARY_ATTRIBUTE});
            }
        },
        async validateRecord(library, recordId, ctx): Promise<IRecord> {
            async function _fetchRecordFromDB() {
                const recordsRes = await recordRepo.find({
                    libraryId: library,
                    filters: [
                        {
                            attributes: [{id: 'id', type: AttributeTypes.SIMPLE}],
                            condition: AttributeCondition.EQUAL,
                            value: String(recordId)
                        }
                    ],
                    retrieveInactive: true,
                    ctx
                });

                return recordsRes.list[0];
            }

            const cacheKey = utils.getRecordsCacheKey(library, recordId);
            const res = await cacheService.memoize({key: cacheKey, func: _fetchRecordFromDB, storeNulls: false, ctx});

            if (!res) {
                throw utils.generateExplicitValidationError(
                    'recordId',
                    {msg: Errors.UNKNOWN_RECORD, vars: {library, recordId}},
                    ctx.lang
                );
            }

            return res;
        },
        async validateLibrary(library, ctx) {
            const lib = await getCoreEntityById('library', library, ctx);
            if (!lib) {
                throw utils.generateExplicitValidationError('library', Errors.UNKNOWN_LIBRARY, ctx.lang);
            }

            return lib;
        },
        async validateView(view: string, throwIfNotFound: boolean, ctx: IQueryInfos): Promise<boolean> {
            const existingView = await getCoreEntityById('view', view, ctx);

            if (existingView) {
                return true;
            }

            if (throwIfNotFound) {
                throw new ValidationError({id: Errors.UNKNOWN_VIEW});
            }

            return false;
        },
        async validateTree(tree, throwIfNotFound, ctx) {
            const existingTree = await getCoreEntityById('tree', tree, ctx);

            if (existingTree) {
                return true;
            }

            if (throwIfNotFound) {
                throw new ValidationError({tree: {msg: Errors.UNKNOWN_TREE, vars: {tree}}});
            }

            return false;
        }
    };
}
