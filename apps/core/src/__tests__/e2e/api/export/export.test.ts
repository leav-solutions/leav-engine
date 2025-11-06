// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Client as GraphqlWsClient} from 'graphql-ws';
import {type ITask, TaskStatus} from '../../../../_types/tasksManager';
import {getConfig} from '../../../../config';
import {
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    gqlSaveValue,
    makeGraphQlCall,
    makeWebSocketGraphQlCall,
    waitGraphqlWebSocketMessage,
} from '../e2eUtils';
import {waitMailpitMessage} from '../mailpitUtils';
import {type IPubSubNotificationData} from '_types/eventsManager';
import getFileDataBuffer from '../../../../utils/helpers/getFileDataBuffer';
import getExcelData from '../../../../utils/helpers/getExcelData';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';

describe('Export', () => {
    const exportLibName = 'export_lib';
    const testTreeId = 'test_tree';
    const advancedAttrId = 'test_advanced_attr';
    const advancedLinkAttrId = 'test_advanced_link_attr';
    const treeAttrId = 'test_tree_attr';

    const attributesIdFormats = Object.values(AttributeFormats)
        .filter(format => format !== AttributeFormats.DATE_RANGE && format !== AttributeFormats.EXTENDED)
        .map(format => ({
            format,
            attrId: `simple_attr_${format.toLowerCase()}`,
        }));

    const exportProfileConfig = `{
        export: {
            defaultProfile: "default",
            profiles: [
                {
                    label: "default",
                    columns: [
                        {
                            columnLabel: "campaign id",
                            attribute: "id"
                        },
                        {
                            columnLabel: "created by",
                            attribute: "created_by"
                        }
                    ]
                },
                {
                    label: "wrongExportProfile",
                    columns: [
                        {
                            columnLabel: "campaign id",
                            attribute: "id"
                        },
                        {
                            columnLabel: "wrong_attribute",
                            attribute: "wrong_attribute"
                        }
                    ]
                },
                {
                    label: "testAllAttributesTypes",
                    columns: [
                        {
                            columnLabel: "id",
                            attribute: "id"
                        }, 
                        {
                            columnLabel: "created_by",
                            attribute: "created_by"
                        }, 
                        {
                            columnLabel: "${advancedAttrId}",
                            attribute: "${advancedAttrId}"
                        }, 
                        {
                            columnLabel: "${advancedLinkAttrId}",
                            attribute: "${advancedLinkAttrId}"
                        },
                        {
                            columnLabel: "${treeAttrId}",
                            attribute: "${treeAttrId}"
                        }
                    ]
                },
                {
                    label: "testAllAttributesFormats",
                    columns: [${attributesIdFormats.map(({attrId}) => `{columnLabel: "${attrId}", attribute: "${attrId}"}`)}]
                },
                {
                    label: "profile1",
                    columns: [
                       {
                            columnLabel: "modified by",
                            attribute: "modified_by"
                        }
                    ]
                }
            ]
        }
    }`;

    let exportTaskId: string;
    let graphqlClient: GraphqlWsClient;
    let recordId1: string;
    let recordId2: string;

    const waitExportWSNotification = () =>
        waitGraphqlWebSocketMessage<Pick<IPubSubNotificationData, 'notification'>>(
            graphqlClient,
            subscriptionGraphqlQuery,
            {},
            data => data?.notification?.title?.includes('export'),
            {timeoutMs: 20000},
        );

    beforeAll(async () => {
        await gqlSaveAttribute({
            id: advancedAttrId,
            type: AttributeTypes.ADVANCED,
            format: AttributeFormats.TEXT,
            linkedLibrary: exportLibName,
            label: advancedAttrId,
            multipleValues: true,
        });

        await gqlSaveAttribute({
            id: advancedLinkAttrId,
            type: AttributeTypes.ADVANCED_LINK,
            multipleValues: true,
            label: advancedLinkAttrId,
            linkedLibrary: exportLibName,
        });

        await gqlSaveAttribute({
            id: treeAttrId,
            type: AttributeTypes.TREE,
            multipleValues: true,
            label: treeAttrId,
            linkedTree: testTreeId,
        });

        await Promise.all(
            attributesIdFormats.map(({format, attrId}) =>
                gqlSaveAttribute({
                    id: attrId,
                    label: attrId,
                    type: AttributeTypes.SIMPLE,
                    format,
                }),
            ),
        );

        await gqlSaveLibrary(
            exportLibName,
            'Lib test export',
            [advancedAttrId, advancedLinkAttrId, treeAttrId, ...attributesIdFormats.map(({attrId}) => attrId)],
            exportProfileConfig,
        );

        await gqlSaveTree(testTreeId, 'Test tree', [exportLibName]);

        recordId1 = await gqlCreateRecord(exportLibName);
        recordId2 = await gqlCreateRecord(exportLibName);

        const nodeRecord1 = await gqlAddElemToTree(testTreeId, {id: recordId1, library: exportLibName});

        await Promise.all(
            attributesIdFormats.map(async ({format, attrId}) => {
                switch (format) {
                    case AttributeFormats.TEXT:
                        await gqlSaveValue(attrId, exportLibName, recordId1, 'text');
                        await gqlSaveValue(attrId, exportLibName, recordId2, 'text');
                        break;
                    case AttributeFormats.NUMERIC:
                        await gqlSaveValue(attrId, exportLibName, recordId1, '123');
                        await gqlSaveValue(attrId, exportLibName, recordId2, '123');
                        break;
                    case AttributeFormats.DATE:
                        await gqlSaveValue(attrId, exportLibName, recordId1, '1761837010063');
                        await gqlSaveValue(attrId, exportLibName, recordId2, '1761837010063');
                        break;
                    case AttributeFormats.ENCRYPTED:
                        await gqlSaveValue(attrId, exportLibName, recordId1, 'password');
                        await gqlSaveValue(attrId, exportLibName, recordId2, 'password');
                        break;
                    case AttributeFormats.BOOLEAN:
                        await gqlSaveValue(attrId, exportLibName, recordId1, 'true');
                        await gqlSaveValue(attrId, exportLibName, recordId2, 'true');
                        break;
                    case AttributeFormats.COLOR:
                        await gqlSaveValue(attrId, exportLibName, recordId1, '#FF5733');
                        await gqlSaveValue(attrId, exportLibName, recordId2, '#FF5733');
                        break;
                    case AttributeFormats.RICH_TEXT:
                        await gqlSaveValue(attrId, exportLibName, recordId1, 'rich text');
                        await gqlSaveValue(attrId, exportLibName, recordId2, 'rich text');
                        break;
                    default:
                        await Promise.resolve();
                }
            }),
        );

        await gqlSaveValue(advancedAttrId, exportLibName, recordId1, 'advanced_value_1');
        await gqlSaveValue(advancedAttrId, exportLibName, recordId1, 'advanced_value_2');
        await gqlSaveValue(advancedLinkAttrId, exportLibName, recordId1, recordId1);
        await gqlSaveValue(advancedLinkAttrId, exportLibName, recordId1, recordId2);
        await gqlSaveValue(treeAttrId, exportLibName, recordId1, nodeRecord1);

        await gqlSaveValue(advancedAttrId, exportLibName, recordId2, 'advanced_value_1');
        await gqlSaveValue(advancedAttrId, exportLibName, recordId2, 'advanced_value_2');
        await gqlSaveValue(advancedLinkAttrId, exportLibName, recordId2, recordId2);
        await gqlSaveValue(advancedLinkAttrId, exportLibName, recordId2, recordId1);
        await gqlSaveValue(treeAttrId, exportLibName, recordId2, nodeRecord1);

        graphqlClient = await makeWebSocketGraphQlCall();
    });

    afterAll(async () => {
        graphqlClient.dispose();
    });

    // May be listen with subscription in tasks to wait for task termination
    async function waitForTaskTerminate(ms: number = 200) {
        await new Promise(resolve => setTimeout(resolve, ms)); // Wait a bit to ensure task is done
    }

    async function getTask(taskId: string): Promise<ITask> {
        const resTaskQuery = await makeGraphQlCall(
            `query { tasks(filters: {id: "${taskId}"}) { list { id status link { name url } } } }`,
        );

        expect(resTaskQuery.data.errors).toBeUndefined();
        expect(resTaskQuery.status).toBe(200);
        expect(resTaskQuery.data.data.tasks.list.length).toBe(1);
        return resTaskQuery.data.data.tasks.list[0];
    }

    describe('export notifications', () => {
        describe('should notify success', () => {
            beforeEach(async () => {
                // use defaultProfile if no specified
                exportTaskId = (await makeGraphQlCall(`query { export(library: "${exportLibName}") }`)).data.data
                    .export;
            });

            test('should notify success by email', async () => {
                const config = await getConfig();
                const mailMsg = await waitMailpitMessage(
                    msg => msg.From.Address === config.mailer.from.email && msg.Subject.includes('export'),
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

            test('should notify success by webSocket', async () => {
                const msg = await waitExportWSNotification();

                expect(msg).toBeDefined();
                expect(msg.notification.title).toContain('complete');
                expect(msg.notification.level).toContain('info');

                await waitForTaskTerminate();
                const task = await getTask(exportTaskId);
                expect(task.status).toBe(TaskStatus.DONE);
                expect(task.link).toBeDefined();

                expect(msg.notification.attachments?.[0].url).toContain(task.link.url);
            });
        });

        describe('should notify failure', () => {
            beforeEach(async () => {
                exportTaskId = (
                    await makeGraphQlCall(
                        `query { export(library: "${exportLibName}", profile: "wrongExportProfile") }`,
                    )
                ).data.data.export;
            });

            test('should notify failure by email', async () => {
                const config = await getConfig();

                const mailMsg = await waitMailpitMessage(
                    msg => msg.From.Address === config.mailer.from.email && msg.Subject.includes('export'),
                );

                expect(mailMsg).toBeDefined();
                expect(mailMsg.Subject).toContain('failed');
                expect(mailMsg.From.Address).toEqual(config.mailer.from.email);
                expect(mailMsg.To[0].Address).toEqual(config.server.admin.email);

                await waitForTaskTerminate();
                const task = await getTask(exportTaskId);
                expect(task.status).toBe(TaskStatus.FAILED);
            });

            test('should notify failure by webSocket', async () => {
                const msg = await waitExportWSNotification();

                expect(msg).toBeDefined();
                expect(msg.notification.title).toContain('failed');
                expect(msg.notification.level).toContain('warning');

                await waitForTaskTerminate();
                const task = await getTask(exportTaskId);
                expect(task.status).toBe(TaskStatus.FAILED);
            });
        });
    });

    describe('export profiles', () => {
        test('should export library elements based on default export profile if no specified', async () => {
            exportTaskId = (await makeGraphQlCall(`query { export(library: "${exportLibName}") }`)).data.data.export;

            await waitExportWSNotification();
            await waitForTaskTerminate();
            const task = await getTask(exportTaskId);

            const filepath = task.link.url;
            const buffer = await getFileDataBuffer(filepath);
            const excelData = await getExcelData(buffer);

            expect(excelData).toEqual([
                [
                    ['campaign id', 'created by'], // custom label based on profile
                    ['Identifier', 'Created by'], // attribute label
                    [recordId2, 'admin'],
                    [recordId1, 'admin'],
                ],
            ]);
        });

        test('should export library elements based on specified profile', async () => {
            exportTaskId = (await makeGraphQlCall(`query { export(library: "${exportLibName}", profile: "profile1") }`))
                .data.data.export;

            await waitExportWSNotification();
            await waitForTaskTerminate();
            const task = await getTask(exportTaskId);

            const filepath = task.link.url;
            const buffer = await getFileDataBuffer(filepath);
            const excelData = await getExcelData(buffer);

            expect(excelData).toEqual([
                [
                    ['modified by'], // custom label based on profile
                    ['Modified by'], // attribute label
                    ['admin'],
                    ['admin'],
                ],
            ]);
        });
    });

    describe('excel file', () => {
        test('should have a valid excel file with all attributes types', async () => {
            exportTaskId = (
                await makeGraphQlCall(
                    `query { export(library: "${exportLibName}", profile: "testAllAttributesTypes") }`,
                )
            ).data.data.export;

            await waitExportWSNotification();
            await waitForTaskTerminate();
            const task = await getTask(exportTaskId);

            const filepath = task.link.url;
            const buffer = await getFileDataBuffer(filepath);
            const excelData = await getExcelData(buffer);

            expect(excelData).toEqual([
                [
                    ['id', 'created_by', advancedAttrId, advancedLinkAttrId, treeAttrId],
                    ['Identifier', 'Created by', advancedAttrId, advancedLinkAttrId, treeAttrId],
                    [
                        recordId2,
                        'admin',
                        'advanced_value_1 | advanced_value_2',
                        `${recordId1} | ${recordId2}`,
                        recordId1,
                    ],
                    [
                        recordId1,
                        'admin',
                        'advanced_value_1 | advanced_value_2',
                        `${recordId2} | ${recordId1}`,
                        recordId1,
                    ],
                ],
            ]);
        });

        test('should have a valid excel file with all attributes formats', async () => {
            exportTaskId = (
                await makeGraphQlCall(
                    `query { export(library: "${exportLibName}", profile: "testAllAttributesFormats") }`,
                )
            ).data.data.export;

            await waitExportWSNotification();
            await waitForTaskTerminate();
            const task = await getTask(exportTaskId);

            const filepath = task.link.url;
            const buffer = await getFileDataBuffer(filepath);
            const excelData = await getExcelData(buffer);

            expect(excelData).toEqual([
                [
                    attributesIdFormats.map(({attrId}) => attrId),
                    attributesIdFormats.map(({attrId}) => attrId),
                    ['text', '123', '1761837010063', 'true', 'true', '#FF5733', 'rich text'],
                    ['text', '123', '1761837010063', 'true', 'true', '#FF5733', 'rich text'],
                ],
            ]);
        });
    });
});

const subscriptionGraphqlQuery = `
        subscription {
            notification {
                level
                message
                title
                date
                attachments {
                    label
                    url
                }
                relatedEntities {
                    label
                    url
                }
            }
        }
    `;
