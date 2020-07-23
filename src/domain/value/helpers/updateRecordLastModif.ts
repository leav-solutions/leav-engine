import {IRecordRepo} from 'infra/record/recordRepo';
import moment from 'moment';
import {IRecord} from '_types/record';
import {IQueryInfos} from '../../../_types/queryInfos';

export default (
    library: string,
    recordId: string,
    deps: {
        recordRepo: IRecordRepo;
    },
    ctx: IQueryInfos
): Promise<IRecord> => {
    return deps.recordRepo.updateRecord({
        libraryId: library,
        recordData: {
            id: recordId,
            modified_at: moment().unix(),
            modified_by: ctx.userId
        },
        ctx
    });
};
