// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {IDbService} from 'infra/db/dbService';
import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import {TaskStatus, ITask} from '../../_types/tasksManager';
import {aql, join} from 'arangojs/aql';
import {IUtils} from 'utils/utils';
import {IExecuteWithCount, IDbDocument} from 'infra/db/_types';

export const TASKS_COLLECTION = 'core_tasks';

export interface ITaskRepo {
    getTasks({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<ITask>>;
    createTask(task: Omit<ITask, 'created_at' | 'created_by' | 'modified_at'>, ctx: IQueryInfos): Promise<ITask>;
    updateTask(task: Partial<ITask> & {id: string}, ctx: IQueryInfos): Promise<ITask>;
    getTasksToExecute(ctx: IQueryInfos): Promise<IList<ITask>>;
    deleteTask(taskId, ctx): Promise<ITask>;
    isATaskRunning(ctx: IQueryInfos, workerId?: number): Promise<boolean>;
}

interface IDeps {
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.db.dbService'?: IDbService;
    'core.utils'?: IUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.utils': utils = null
}: IDeps = {}): ITaskRepo {
    return {
        async isATaskRunning(ctx: IQueryInfos, workerId?: number): Promise<boolean> {
            const collec = dbService.db.collection(TASKS_COLLECTION);
            const queryParts = [aql`FOR task IN ${collec} FILTER task.status == ${TaskStatus.RUNNING}`];

            if (typeof workerId !== 'undefined') {
                queryParts.push(aql`FILTER task.workerId == ${workerId}`);
            }

            queryParts.push(aql`RETURN task`);

            const runningTasks = await dbService.execute({query: join(queryParts), ctx});

            return runningTasks.length > 0;
        },
        async getTasksToExecute(ctx: IQueryInfos): Promise<IList<ITask>> {
            const collec = dbService.db.collection(TASKS_COLLECTION);

            const query = aql`FOR task IN ${collec}
                    FILTER task.status == ${TaskStatus.PENDING}
                    FILTER task.startAt <= ${utils.getUnixTime()}
                    FILTER task.workerId == null
                    SORT task.priority DESC, task.startAt ASC
                RETURN task`;

            const tasks = await dbService.execute<IExecuteWithCount | IDbDocument[]>({
                query,
                withTotalCount: true,
                ctx
            });

            const list = (tasks as IExecuteWithCount).results;
            const totalCount = (tasks as IExecuteWithCount).totalCount;

            return {
                totalCount,
                list: list.map(dbUtils.cleanup) as ITask[]
            };
        },
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
        async createTask(
            task: Omit<ITask, 'created_at' | 'created_by' | 'modified_at'>,
            ctx: IQueryInfos
        ): Promise<ITask> {
            const collec = dbService.db.collection(TASKS_COLLECTION);
            const docToInsert = dbUtils.convertToDoc(task);

            const newTask = await dbService.execute({
                query: aql`INSERT ${{
                    ...docToInsert,
                    created_at: utils.getUnixTime(),
                    created_by: ctx.userId,
                    modified_at: utils.getUnixTime()
                }} IN ${collec} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(newTask[0]);
        },
        async updateTask(task: Partial<ITask> & {id: string}, ctx: IQueryInfos): Promise<ITask> {
            const collec = dbService.db.collection(TASKS_COLLECTION);
            const docToInsert = dbUtils.convertToDoc(task);

            const updatedTask = await dbService.execute({
                query: aql`UPDATE ${{
                    ...docToInsert,
                    modified_at: utils.getUnixTime()
                }} IN ${collec} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(updatedTask[0]);
        },
        async deleteTask(taskId, ctx): Promise<ITask> {
            const collec = dbService.db.collection(TASKS_COLLECTION);

            const res = await dbService.execute({
                query: aql`REMOVE ${{_key: taskId}} IN ${collec} RETURN OLD`,
                ctx
            });

            return dbUtils.cleanup<ITask>(res.pop());
        }
    };
}
