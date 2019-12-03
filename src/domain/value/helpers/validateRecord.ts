import {IRecordRepo} from 'infra/record/recordRepo';
import ValidationError from '../../../errors/ValidationError';
import {AttributeTypes} from '../../../_types/attribute';

export default async (library: string, recordId: number, deps: {recordRepo: IRecordRepo}): Promise<void> => {
    const recordsRes = deps.recordRepo.find(library, [
        {attribute: {id: 'id', type: AttributeTypes.SIMPLE}, value: recordId}
    ]);

    if (!(await recordsRes).list.length) {
        throw new ValidationError({recordId: 'Unknown record'});
    }
};
