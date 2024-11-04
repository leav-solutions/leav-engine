// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {IUtils} from 'utils/utils';
import {IFormFilterOptions} from '_types/forms';
import {IQueryInfos} from '_types/queryInfos';
import {ITask, TaskPriority, TaskStatus, TaskType} from '../../_types/tasksManager';
import {mockForm} from '../../__tests__/mocks/forms';
import taskRepo from './taskRepo';

const mockTask: ITask = {
    id: 'id',
    label: {fr: 'name', en: 'name'},
    created_at: null,
    created_by: null,
    modified_at: null,
    func: {
        moduleName: 'moduleName',
        subModuleName: 'subModuleName',
        name: 'func',
        args: []
    },
    role: {
        type: TaskType.IMPORT_DATA
    },
    archive: false,
    startAt: 123,
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM
};

describe('TaskRepo', () => {
    const docTaskData = {...mockTask, _key: '_key'};
    const taskData = {...mockTask};
    const mockCleanupRes = {...mockTask, id: 'id'};

    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'taskRepoTest'
    };

    test('Create task', async () => {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise([docTaskData])
        };

        const mockDbUtils: Mockify<IDbUtils> = {
            cleanup: jest.fn().mockReturnValue(mockCleanupRes),
            convertToDoc: jest.fn().mockReturnValue(docTaskData)
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: jest.fn().mockReturnValue(1)
        };

        const repo = taskRepo({
            'core.infra.db.dbService': mockDbServ,
            'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            'core.utils': mockUtils as IUtils
        });

        const createdTask = await repo.createTask(taskData, ctx);

        expect(mockDbServ.execute.mock.calls.length).toBe(1);

        expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

        expect(createdTask).toMatchObject(taskData);
    });

    test('Update task', async () => {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise([docTaskData])
        };

        const mockDbUtils: Mockify<IDbUtils> = {
            cleanup: jest.fn().mockReturnValue(mockCleanupRes),
            convertToDoc: jest.fn().mockReturnValue(docTaskData)
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: jest.fn().mockReturnValue(1)
        };

        const repo = taskRepo({
            'core.infra.db.dbService': mockDbServ,
            'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            'core.utils': mockUtils as IUtils
        });

        const updatedTask = await repo.updateTask(taskData, ctx);

        expect(mockDbServ.execute.mock.calls.length).toBe(1);
        expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^UPDATE/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

        expect(updatedTask).toMatchObject(taskData);
    });

    test('Retrieve tasks list with clean id', async () => {
        const mockDbServ = {execute: global.__mockPromise([])};
        const mockDbUtils = {
            findCoreEntity: global.__mockPromise({list: [{...mockTask, id: 'id'}]})
        } satisfies Mockify<IDbUtils>;

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: jest.fn().mockReturnValue(1)
        };

        const repo = taskRepo({
            'core.infra.db.dbService': mockDbServ,
            'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            'core.utils': mockUtils as IUtils
        });

        const tasks = await repo.getTasks({ctx});

        expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
        expect(tasks).toEqual({list: [mockTask]});
    });

    test('Retrieve tasks to execute', async () => {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise({results: [{...mockTask}]})
        };

        const mockDbUtils: Mockify<IDbUtils> = {
            cleanup: jest.fn().mockReturnValue(mockCleanupRes)
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: jest.fn().mockReturnValue(1)
        };

        const repo = taskRepo({
            'core.infra.db.dbService': mockDbServ,
            'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            'core.utils': mockUtils as IUtils
        });

        const tasks = await repo.getTasksToExecute(ctx);

        expect(mockDbServ.execute.mock.calls.length).toBe(1);

        expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('FILTER');
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('SORT');
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

        expect(tasks).toMatchObject({list: [taskData]});
    });

    test('Delete task', async () => {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise([docTaskData])
        };

        const mockDbUtils: Mockify<IDbUtils> = {
            cleanup: jest.fn().mockReturnValue(mockCleanupRes)
        };

        const repo = taskRepo({
            'core.infra.db.dbService': mockDbServ,
            'core.infra.db.dbUtils': mockDbUtils as IDbUtils
        });

        const deleteRes = await repo.deleteTask(taskData.id, ctx);

        expect(mockDbServ.execute.mock.calls.length).toBe(1);

        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^REMOVE/);
        expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

        expect(deleteRes).toMatchObject(taskData);
    });
});
