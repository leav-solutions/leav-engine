import {CORE_IN_CREATION_BY, type IRecord} from '../../../_types/record';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IRecordRepo} from '../../../infra/record/recordRepo';

export interface IRecordInCreationBypassHelper {
    recordInCreationBypass: (record: IRecord, ctx: IQueryInfos) => boolean;
    recordInCreationBypassById: (libraryId: string, recordId: string, ctx: IQueryInfos) => Promise<boolean>;
}

export interface IRecordInCreationBypassHelperDeps {
    'core.infra.record': IRecordRepo;
}

export default function ({
    'core.infra.record': recordRepo,
}: IRecordInCreationBypassHelperDeps): IRecordInCreationBypassHelper {
    const _recordInCreationBypass = (record: IRecord, ctx: IQueryInfos): boolean =>
        !record.active && record[CORE_IN_CREATION_BY] === ctx.userId;

    return {
        recordInCreationBypass: _recordInCreationBypass,
        recordInCreationBypassById: async (libraryId: string, recordId: string, ctx: IQueryInfos): Promise<boolean> => {
            const record = await recordRepo.getRecord({libraryId, recordId, ctx});
            return _recordInCreationBypass(record, ctx);
        },
    };
}
