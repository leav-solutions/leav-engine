import {IRecordRepo} from 'infra/record/recordRepo';
import ValidationError from '../../../errors/ValidationError';
import {AttributeTypes} from '../../../_types/attribute';
import {Errors} from '../../../_types/errors';

export default async (library: string, recordId: number, deps: {recordRepo: IRecordRepo}): Promise<void> => {
    const recordsRes = await deps.recordRepo.find(
        library,
        [{attribute: {id: 'id', type: AttributeTypes.SIMPLE}, value: String(recordId)}],
        undefined,
        undefined,
        true
    );

    if (!recordsRes.list.length) {
        throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
    }
};
