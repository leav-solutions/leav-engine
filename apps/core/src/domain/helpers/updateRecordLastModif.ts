// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IRecordRepo} from 'infra/record/recordRepo';
import moment from 'moment';
import {type IUtils} from 'utils/utils';
import {type IQueryInfos} from '_types/queryInfos';
import {type IRecord} from '_types/record';
import {ECacheType, type ICachesService} from '../../infra/cache/cacheService';

interface IDeps {
    'core.infra.record': IRecordRepo;
    'core.infra.cache.cacheService': ICachesService;
    'core.utils': IUtils;
}

export type UpdateRecordLastModifFunc = (library: string, recordId: string, ctx: IQueryInfos) => Promise<IRecord>;

export default function ({
    'core.infra.record': recordRepo,
    'core.infra.cache.cacheService': cacheService,
    'core.utils': utils,
}: IDeps): UpdateRecordLastModifFunc {
    return async (library, recordId, ctx) => {
        await cacheService.getCache(ECacheType.RAM).deleteData([utils.getRecordsCacheKey(library, recordId)]);
        return recordRepo.updateRecord({
            libraryId: library,
            recordData: {
                id: recordId,
                modified_at: moment().unix(),
                modified_by: String(ctx.userId),
            },
            ctx,
        });
    };
}
