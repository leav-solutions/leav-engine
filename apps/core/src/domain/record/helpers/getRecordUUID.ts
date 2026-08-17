import {CommonAttributes} from '../../../_constants/systemAttributes';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IRecordRepo} from '../../../infra/record/recordRepo';

/**
 * The uuid of a record — its stable, instance-independent identifier, and the way an SDO references an
 * entity. `null` when the record is gone or carries no uuid.
 */
export type GetRecordUUIDHelper = (libraryId: string, recordId: string, ctx: IQueryInfos) => Promise<string | null>;

interface IDeps {
    'core.infra.record': IRecordRepo;
}

export default function ({'core.infra.record': recordRepo}: IDeps): GetRecordUUIDHelper {
    return async (libraryId, recordId, ctx) =>
        (
            await recordRepo.getRecord({
                libraryId,
                recordId,
                ctx,
            })
        )?.[CommonAttributes.UUID] ?? null;
}
