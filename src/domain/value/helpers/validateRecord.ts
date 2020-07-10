import {IRecordRepo} from 'infra/record/recordRepo';
import ValidationError from '../../../errors/ValidationError';
import {AttributeTypes} from '../../../_types/attribute';
import {Errors} from '../../../_types/errors';
import {IQueryInfos} from '_types/queryInfos';

export default async (
    library: string,
    recordId: number,
    deps: {recordRepo: IRecordRepo},
    ctx: IQueryInfos
): Promise<void> => {
    const recordsRes = await deps.recordRepo.find({
        libraryId: library,
        filters: [{attributes: [{id: 'id', type: AttributeTypes.SIMPLE}], value: String(recordId)}],
        retrieveInactive: true,
        ctx
    });

    if (!recordsRes.list.length) {
        throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
    }
};
