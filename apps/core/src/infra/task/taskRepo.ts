// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {IDbService} from 'infra/db/dbService';
import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import {TaskStatus, ITask} from '_types/tasksManager';
import {aql} from 'arangojs';

export const TASKS_COLLECTION = 'core_tasks';

interface IGetTasksParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        startAt?: number;
        status?: TaskStatus;
    };
}

export interface ITaskRepo {
    getTasks({params, ctx}: {params?: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>>;
    createTask(task: ITask, ctx: IQueryInfos): Promise<ITask>;
    updateTask(task: Partial<ITask> & {id: string}, ctx: IQueryInfos): Promise<ITask>;
}

interface IDeps {
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.db.dbService'?: IDbService;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null
}: IDeps = {}): ITaskRepo {
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

            const res = await dbUtils.findCoreEntity<ITask>({
                ...initializedParams,
                collectionName: TASKS_COLLECTION,
                ctx
            });

            return res;
        },
        async createTask(task: ITask, ctx: IQueryInfos): Promise<ITask> {
            const collec = dbService.db.collection(TASKS_COLLECTION);
            const docToInsert = dbUtils.convertToDoc(task);

            const newTask = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${collec} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(newTask[0]);
        },
        async updateTask(task: Partial<ITask> & {id: string}, ctx: IQueryInfos): Promise<ITask> {
            const collec = dbService.db.collection(TASKS_COLLECTION);
            const docToInsert = dbUtils.convertToDoc(task);

            const updatedTask = await dbService.execute({
                query: aql`
                    UPDATE ${docToInsert} IN ${collec}
                    RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(updatedTask[0]);
        }
    };
}
