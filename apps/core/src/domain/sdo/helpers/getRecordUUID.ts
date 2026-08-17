import {CommonAttributes} from '../../../_constants/systemAttributes';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IRecordRepo} from '../../../infra/record/recordRepo';

/**
 * The uuid of a record — how an SDO references an entity, whether in `system.systemId` or in a mapped
 * link/tree value. `null` when the record is gone or carries no uuid.
 */
export type GetRecordUUID = (libraryId: string, recordId: string, ctx: IQueryInfos) => Promise<string | null>;

interface IDeps {
    'core.infra.record': IRecordRepo;
}

export default function ({'core.infra.record': recordRepo}: IDeps): GetRecordUUID {
    return async (libraryId, recordId, ctx) =>
        (
            await recordRepo.getRecord({
                libraryId,
                recordId,
                ctx,
            })
        )?.[CommonAttributes.UUID] ?? null;
}
