// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {Errors} from '../../_types/errors';
import ValidationError from '../../errors/ValidationError';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeTypes} from '../../_types/attribute';

interface IDeps {
    'core.infra.library'?: ILibraryRepo;
    'core.infra.record'?: IRecordRepo;
}

export interface IValidateHelper {
    validateLibrary(library: string, ctx: IQueryInfos): Promise<void>;
    validateRecord(library: string, record: string, ctx: IQueryInfos): Promise<void>;
}

export default function ({
    'core.infra.library': libraryRepo = null,
    'core.infra.record': recordRepo = null
}: IDeps): IValidateHelper {
    return {
        async validateRecord(library: string, record: string, ctx: IQueryInfos): Promise<void> {
            const recordsRes = await recordRepo.find({
                libraryId: library,
                filters: [{attributes: [{id: 'id', type: AttributeTypes.SIMPLE}], value: String(record)}],
                retrieveInactive: true,
                ctx
            });

            if (!recordsRes.list.length) {
                throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
            }
        },
        async validateLibrary(library: string, ctx: IQueryInfos): Promise<void> {
            const lib = await libraryRepo.getLibraries({params: {filters: {id: library}}, ctx});
            // Check if exists and can delete
            if (!lib.list.length) {
                throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
            }
        }
    };
}
