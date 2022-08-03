// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import {eTaskStatus, ITask} from '_types/tasksManager';

export const TASKS_COLLECTION = 'core_tasks';

interface IGetTasksParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        status?: eTaskStatus;
    };
}

export interface ITaskRepo {
    getTasks({params, ctx}: {params?: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>>;
}

interface IDeps {
    'core.infra.db.dbUtils'?: IDbUtils;
}

export default function ({'core.infra.db.dbUtils': dbUtils = null}: IDeps = {}): ITaskRepo {
    return {
        async getTasks({params, ctx}): Promise<IList<ITask>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };
            const initializedParams = {...defaultParams, ...params};

            const res = await dbUtils.findCoreEntity<ITask & {funcArgs: string}>({
                ...initializedParams,
                collectionName: TASKS_COLLECTION,
                ctx
            });

            return res;
        }
    };
}
