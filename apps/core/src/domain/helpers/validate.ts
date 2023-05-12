// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordRepo} from 'infra/record/recordRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {AttributeCondition, IRecord} from '../../_types/record';
import {GetCoreEntityByIdFunc} from './getCoreEntityById';
import {ILibraryRepo} from 'infra/library/libraryRepo';

interface IDeps {
    'core.domain.helpers.getCoreEntityById'?: GetCoreEntityByIdFunc;
    'core.infra.record'?: IRecordRepo;
    'core.utils'?: IUtils;
    'core.infra.library'?: ILibraryRepo;
}

export interface IValidateHelper {
    validateLibrary(library: string, ctx: IQueryInfos): Promise<void>;
    validateRecord(library: string, recordId: string, ctx: IQueryInfos): Promise<IRecord>;
    validateView(view: string, throwIfNotFound: boolean, ctx: IQueryInfos): Promise<boolean>;
    validateTree(tree: string, throwIfNotFound: boolean, ctx: IQueryInfos): Promise<boolean>;
    validateLibraryAttribute(library: string, attribute: string, ctx: IQueryInfos): Promise<void>;
}

export default function ({
    'core.domain.helpers.getCoreEntityById': getCoreEntityById = null,
    'core.infra.record': recordRepo = null,
    'core.utils': utils = null,
    'core.infra.library': libraryRepo = null
}: IDeps): IValidateHelper {
    return {
        async validateLibraryAttribute(library: string, attribute: string, ctx: IQueryInfos): Promise<void> {
            const libs = await libraryRepo.getLibrariesUsingAttribute(attribute, ctx);

            if (!libs.includes(library)) {
                throw new ValidationError({attribute: Errors.UNKNOWN_LIBRARY_ATTRIBUTE});
            }
        },
        async validateRecord(library, recordId, ctx): Promise<IRecord> {
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

            if (!recordsRes.list.length) {
                throw utils.generateExplicitValidationError(
                    'recordId',
                    {msg: Errors.UNKNOWN_RECORD, vars: {library, recordId}},
                    ctx.lang
                );
            }

            return recordsRes.list[0];
        },
        async validateLibrary(library: string, ctx: IQueryInfos): Promise<void> {
            const lib = await getCoreEntityById('library', library, ctx);
            // Check if exists and can delete
            if (!lib) {
                throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
            }
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
