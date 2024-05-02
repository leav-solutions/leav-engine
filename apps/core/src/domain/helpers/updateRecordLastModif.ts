// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordRepo} from 'infra/record/recordRepo';
import moment from 'moment';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord} from '_types/record';

interface IDeps {
    'core.infra.record'?: IRecordRepo;
}

export type UpdateRecordLastModifFunc = (library: string, recordId: string, ctx: IQueryInfos) => Promise<IRecord>;

export default function ({'core.infra.record': recordRepo = null}: IDeps): UpdateRecordLastModifFunc {
    return (library, recordId, ctx) =>
        recordRepo.updateRecord({
            libraryId: library,
            recordData: {
                id: recordId,
                modified_at: moment().unix(),
                modified_by: String(ctx.userId)
            }
        });
}
