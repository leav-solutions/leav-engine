// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {e2eNonAdminUser, makeGraphQlCall} from '../e2eUtils';
import {waitForTaskCompletion} from '../taskUtils';
import {TaskStatus} from '../../../../_types/tasksManager';
import {FakePluginTaskType} from '../_fixtures/fakeplugin/_types/_types';

describe('Plugins', () => {
    /**
     * /!\ fake-plugin install is managed in globalSetup.js
     */
    describe('Get plugins list', () => {
        const gqlPluginsQuery = `{
            plugins {
                name
                description
                version
                author
            }
        }`;

        test('Return plugins list for admin', async () => {
            const resPlugins = await makeGraphQlCall(gqlPluginsQuery);

            expect(resPlugins.status).toBe(200);

            const fakePluginData = resPlugins.data.data.plugins.find(p => p.name === 'fakeplugin');

            expect(fakePluginData).toBeDefined();
        });

        it('Non admin users should not be authorized to list plugins', async () => {
            await expect(makeGraphQlCall(gqlPluginsQuery, {user: e2eNonAdminUser()})).rejects.toThrow(
                /Action forbidden/,
            );
        });
    });

    describe('Register graphql schema', () => {
        test('Plugins graphql schema should be loaded', async () => {
            const resSchema = await makeGraphQlCall(`{
                __schema {
                    queryType {
                        fields {
                            name
                        }
                    }
                }
            }`);

            expect(resSchema.data.data.__schema.queryType.fields.find(f => f.name === 'fakePluginQuery')).toBeDefined();
        });
    });

    describe('Register translation', () => {
        test('Plugins should be able to use their own translation', async () => {
            const resTranslation = await makeGraphQlCall(`{
                fakePluginTranslation
            }`);

            expect(resTranslation.data.data.fakePluginTranslation).toBe('Test translation FR');
        });
    });

    describe('Register permissions', () => {
        test('Plugins should be able to load their own permissions', async () => {
            const resPermissions = await makeGraphQlCall(`{
                permissionsActionsByType(type: library) {
                    name
                    label
                }
            }`);

            expect(
                resPermissions.data.data.permissionsActionsByType.find(p => p.name === 'fake_plugin_permission'),
            ).toBeDefined();
        });
    });

    describe('Register event actions', () => {
        test('Plugins should be able to load their own event actions', async () => {
            // Check if "FAKE_PLUGIN_ACTION" is part of the LogAction allowed values
            const resLogs = await makeGraphQlCall(`{
                __schema {
                    types {
                        name
                        enumValues {
                            name
                        }
                    }
                }
            }`);

            const logActionEnums: Array<{name: string}> = resLogs.data.data.__schema.types.find(
                t => t.name === 'LogAction',
            ).enumValues;
            expect(logActionEnums.find(e => e.name === 'fakeplugin_FAKE_PLUGIN_ACTION')).toBeDefined();
        });
    });

    describe('Register a start function', () => {
        test('Plugins should be able to register a start function', async () => {
            const hasStarted = await makeGraphQlCall(`{
                hasFakePluginStarted
            }`);
            expect(hasStarted.data.data.hasFakePluginStarted).toBe(true);
        });
    });

    describe('Launch a task from a plugin', () => {
        test('Plugins should be able to launch a task in taskManager', async () => {
            const exportTaskId = await makeGraphQlCall(`{
                fakePluginTask (taskName: "My test task")
            }`);

            const task = await waitForTaskCompletion(exportTaskId.data.data.fakePluginTask);

            expect(task.status).toBe(TaskStatus.DONE);
            expect(task.role.type).toBe(FakePluginTaskType.FAKE_TYPE);
        });
    });

    describe('Register a cron task', () => {
        test(
            'Plugins should be able to register a cron task',
            async () => {
                // wait for cron task to be executed (cron task is scheduled every minute, so max wait time is 1min)
                let hasExecuted = false;
                const startTime = Date.now();
                while (!hasExecuted && Date.now() - startTime < 80 * 1000) {
                    const res = await makeGraphQlCall(`{
                    hasFakePluginCronTaskExecuted
                }`);
                    hasExecuted = res.data.data.hasFakePluginCronTaskExecuted;
                    if (!hasExecuted) {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }

                expect(hasExecuted).toBe(true);
            },
            90 * 1000, // set timeout to 90s because cron task is scheduled every minute, but other tasks might delay execution
        );
    });
});
