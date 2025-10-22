// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TaskStatus} from '../../../../_types/tasksManager';
import {getConfig} from '../../../../config';
import {gqlCreateRecord, gqlSaveLibrary, makeGraphQlCall} from '../e2eUtils';
import {waitMailpitMessage} from '../mailpitUtils';

describe('Export', () => {
    const exportLibName = 'export_lib';
    let exportTaskId: string;

    beforeAll(async () => {
        await gqlSaveLibrary(exportLibName, 'Lib test export');
        await gqlCreateRecord(exportLibName);
        await gqlCreateRecord(exportLibName);
    });

    describe('excel success', () => {
        beforeEach(async () => {
            const resExportQuery = await makeGraphQlCall(
                `query { export(library: "${exportLibName}", attributes: ["id", "created_by"]) }`,
                true
            );

            expect(resExportQuery.data.errors).toBeUndefined();
            expect(resExportQuery.status).toBe(200);
            expect(resExportQuery.data.data.export).toBeDefined();

            exportTaskId = resExportQuery.data.data.export;
        });

        test('should notify by email', async () => {
            const config = await getConfig();
            const mailMsg = await waitMailpitMessage(
                msg => msg.From.Address === config.mailer.from.email && msg.Subject.includes('export')
            );

            expect(mailMsg).toBeDefined();
            expect(mailMsg.Subject).toContain('complete');
            expect(mailMsg.From.Address).toEqual(config.mailer.from.email);
            expect(mailMsg.To[0].Address).toEqual(config.server.admin.email);

            await waitForTaskTerminate();
            const task = await getTask(exportTaskId);
            expect(task.status).toBe(TaskStatus.DONE);
            expect(task.link).toBeDefined();

            expect(mailMsg.HTML).toContain(task.link.url);
            expect(mailMsg.Text).toContain(task.link.url);
        });
    });

    describe('excel failed', () => {
        beforeEach(async () => {
            const resExportQuery = await makeGraphQlCall(
                `query { export(library: "${exportLibName}", attributes: ["id", "not_exists"]) }`,
                true
            );

            expect(resExportQuery.data.errors).toBeUndefined();
            expect(resExportQuery.status).toBe(200);
            expect(resExportQuery.data.data.export).toBeDefined();

            exportTaskId = resExportQuery.data.data.export;
        });

        test('should notify by email', async () => {
            const config = await getConfig();

            const mailMsg = await waitMailpitMessage(
                msg => msg.From.Address === config.mailer.from.email && msg.Subject.includes('export')
            );

            expect(mailMsg).toBeDefined();
            expect(mailMsg.Subject).toContain('failed');
            expect(mailMsg.From.Address).toEqual(config.mailer.from.email);
            expect(mailMsg.To[0].Address).toEqual(config.server.admin.email);

            await waitForTaskTerminate();
            const task = await getTask(exportTaskId);
            expect(task.status).toBe(TaskStatus.FAILED);
        });
    });

    // May be listen with subscription in tasks to wait for task termination
    async function waitForTaskTerminate() {
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait a bit to ensure task is done
    }

    async function getTask(taskId: string) {
        const resTaskQuery = await makeGraphQlCall(
            `query { tasks(filters: {id: "${taskId}"}) { list { id status link { name url } } } }`,
            true
        );

        expect(resTaskQuery.data.errors).toBeUndefined();
        expect(resTaskQuery.status).toBe(200);
        expect(resTaskQuery.data.data.tasks.list.length).toBe(1);
        return resTaskQuery.data.data.tasks.list[0];
    }
});
