// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordRepo} from 'infra/record/recordRepo';
import moment from 'moment';
import {IRecord} from '_types/record';
import {IQueryInfos} from '../../../_types/queryInfos';

export default (
    library: string,
    recordId: string,
    deps: {
        recordRepo?: IRecordRepo;
    },
    ctx: IQueryInfos
): Promise<IRecord> => {
    return deps.recordRepo.updateRecord({
        libraryId: library,
        recordData: {
            id: recordId,
            modified_at: moment().unix(),
            modified_by: String(ctx.userId)
        }
    });
};
