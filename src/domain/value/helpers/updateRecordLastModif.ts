import {IRecordRepo} from 'infra/record/recordRepo';
import moment from 'moment';
import {IRecord} from '_types/record';
import {IQueryInfos} from '../../../_types/queryInfos';

export default (
    library: string,
    recordId: number,
    infos: IQueryInfos,
    deps: {
        recordRepo: IRecordRepo;
    }
): Promise<IRecord> => {
    return deps.recordRepo.updateRecord(library, {
        id: recordId,
        modified_at: moment().unix(),
        modified_by: infos.userId
    });
};
