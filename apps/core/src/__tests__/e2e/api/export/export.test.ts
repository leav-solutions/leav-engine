// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Client as GraphqlWsClient} from 'graphql-ws';
import {TaskStatus} from '../../../../_types/tasksManager';
import {getConfig} from '../../../../config';
import {MASKED_VALUE} from '../../../../_constants/values';
import {
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    gqlSaveValue,
    makeGraphQlCall,
    makeWebSocketGraphQlCall,
    toCleanJSON,
    waitGraphqlWebSocketMessage,
} from '../e2eUtils';
import {deleteMailpitMessagesBySearch, waitForMailpitSearchMessage, waitMailpitMessage} from '../mailpitUtils';
import {type IPubSubNotificationData} from '_types/eventsManager';
import getFileDataBuffer from '../../../../utils/helpers/getFileDataBuffer';
import getExcelData from '../../../../utils/helpers/getExcelData';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import dayjs from 'dayjs';
import {waitForTaskCompletion} from '../taskUtils';
import {type IExportProfileConfig} from 'domain/export/exportProfileDomain';

describe('Export', () => {
    const exportLibName = 'export_lib';
    const testTreeId = 'test_tree';
    const advancedAttrId = 'test_advanced_attr';
    const advancedLinkAttrId = 'test_advanced_link_attr';
    const treeAttrId = 'test_tree_attr';

    const attributesIdFormats = Object.values(AttributeFormats)
        .filter(format => format !== AttributeFormats.EXTENDED)
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
                {
                    label: "profileWithEmptyColumn",
                    columns: [
                        {
                            columnLabel: "id",
                            attribute: "id"
                        }, 
                        {
                            columnLabel: "",
                            attribute: "modified_by"
                        }
                        {
                            columnLabel: "",
                            attribute: ""
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
            data => data?.notification?.title?.includes('Export'),
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
                    case AttributeFormats.DATE_RANGE:
                        await gqlSaveValue(
                            attrId,
                            exportLibName,
                            recordId1,
                            toCleanJSON({
                                from: dayjs('1987-06-07 12:00:00').unix(),
                                to: dayjs('1987-06-09 12:00:00').unix(),
                            }),
                        );
                        await gqlSaveValue(
                            attrId,
                            exportLibName,
                            recordId2,
                            toCleanJSON({
                                from: dayjs('1987-06-07 12:00:00').unix(),
                                to: dayjs('1987-06-09 12:00:00').unix(),
                            }),
                        );
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

    describe('export notifications', () => {
        beforeEach(async () => {
            // Clean mailpit messages before each test
            await deleteMailpitMessagesBySearch('export');
            // wait previous notification to be processed in websocket
            await Promise.resolve(cb => setTimeout(cb, 500));
        });

        afterEach(async () => {
            // Ensure mailpit is receive after each test to delete messages before next test
            await waitForMailpitSearchMessage('export');
        });

        describe('should notify success', () => {
            beforeEach(async () => {
                // use defaultProfile if no specified
                exportTaskId = (await makeGraphQlCall(`query { export(library: "${exportLibName}") }`)).data.data
                    .export;
            });

            test('should notify success by email', async () => {
                const config = await getConfig();
                const mailMsg = await waitMailpitMessage(
                    msg => msg.From.Address === config.mailer.from.email && msg.Subject.includes('Export'),
                );

                expect(mailMsg).toBeDefined();
                expect(mailMsg.Subject).toContain('successfully');
                expect(mailMsg.From.Address).toEqual(config.mailer.from.email);
                expect(mailMsg.To[0].Address).toEqual(config.server.admin.email);

                const task = await waitForTaskCompletion(exportTaskId);
                expect(task.status).toBe(TaskStatus.DONE);
                expect(task.link).toBeDefined();

                expect(mailMsg.HTML).toContain(task.link.url);
                expect(mailMsg.Text).toContain(task.link.url);
            });

            test('should notify success by webSocket', async () => {
                const msg = await waitExportWSNotification();

                expect(msg).toBeDefined();
                expect(msg.notification.title).toContain('successfully');
                expect(msg.notification.level).toContain('success');

                const task = await waitForTaskCompletion(exportTaskId);
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
                    msg => msg.From.Address === config.mailer.from.email && msg.Subject.includes('Export'),
                );

                expect(mailMsg).toBeDefined();
                expect(mailMsg.Subject).toContain('failed');
                expect(mailMsg.From.Address).toEqual(config.mailer.from.email);
                expect(mailMsg.To[0].Address).toEqual(config.server.admin.email);

                const task = await waitForTaskCompletion(exportTaskId);
                expect(task.status).toBe(TaskStatus.FAILED);
            });

            test('should notify failure by webSocket', async () => {
                const msg = await waitExportWSNotification();

                expect(msg).toBeDefined();
                expect(msg.notification.title).toContain('failed');
                expect(msg.notification.level).toContain('error');

                const task = await waitForTaskCompletion(exportTaskId);
                expect(task.status).toBe(TaskStatus.FAILED);
            });
        });
    });

    describe('export profiles', () => {
        describe('library has exportProfiles', () => {
            let exportProfilesConfig: IExportProfileConfig | null;
            beforeAll(async () => {
                exportProfilesConfig = (
                    await makeGraphQlCall(`query {
                    libraries(filters: {id: "${exportLibName}"}) {
                        list {
                            id
                            exportProfiles {
                                defaultProfile
                                profiles {
                                    label
                                    columns {
                                        columnLabel
                                        attribute
                                    }
                                    error {
                                        message
                                    }
                                }
                            }
                        }
                    }
                }`)
                ).data.data.libraries.list[0].exportProfiles;
            });

            test('should retrieve export profiles configuration', async () => {
                expect(exportProfilesConfig).toBeDefined();
                expect(exportProfilesConfig?.defaultProfile).toBe('default');
                expect(exportProfilesConfig?.profiles.length).toBe(6);
            });

            test('should have correct export profile columns configuration', async () => {
                const profile1 = exportProfilesConfig?.profiles.find(p => p.label === 'profileWithEmptyColumn');
                expect(profile1).toBeDefined();
                expect(profile1?.columns.length).toBe(3);
                expect(profile1?.columns[0]).toEqual({columnLabel: 'id', attribute: 'id'});
                expect(profile1?.columns[1]).toEqual({columnLabel: 'Modified by', attribute: 'modified_by'});
                expect(profile1?.columns[2]).toEqual({columnLabel: '', attribute: ''});
            });

            test('should return profile with error for invalid export profile', async () => {
                const wrongProfile = exportProfilesConfig?.profiles.find(p => p.label === 'wrongExportProfile');
                expect(wrongProfile).toBeDefined();
                expect(wrongProfile?.error).toBeDefined();
                expect(wrongProfile?.error?.message).toContain(
                    'Export profile column attribute "wrong_attribute" does not exist in the library (attribute "wrong_attribute" not found)',
                );
            });
        });

        test('should not export and fail if library has no exportProfiles', async () => {
            const noExportProfileLibName = 'no_export_profile_lib';
            await gqlSaveLibrary(noExportProfileLibName, 'Lib no export profile', []);

            const exportProfilesConfig = (
                await makeGraphQlCall(`query {
                    libraries(filters: {id: "${noExportProfileLibName}"}) {
                        list {
                            id
                            exportProfiles {
                                defaultProfile
                                profiles {
                                    label
                                    columns {
                                        columnLabel
                                        attribute
                                    }
                                }
                            }
                        }
                    }
                }`)
            ).data.data.libraries.list[0].exportProfiles;

            expect(exportProfilesConfig).toBeNull();
        });

        test('should export library elements based on default export profile if no specified', async () => {
            exportTaskId = (await makeGraphQlCall(`query { export(library: "${exportLibName}") }`)).data.data.export;

            const task = await waitForTaskCompletion(exportTaskId);

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

            const task = await waitForTaskCompletion(exportTaskId);

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

            const task = await waitForTaskCompletion(exportTaskId);

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

            const task = await waitForTaskCompletion(exportTaskId);

            const filepath = task.link.url;
            const buffer = await getFileDataBuffer(filepath);
            const excelData = await getExcelData(buffer);

            expect(excelData).toEqual([
                [
                    attributesIdFormats.map(({attrId}) => attrId),
                    attributesIdFormats.map(({attrId}) => attrId),
                    [
                        'text',
                        '123',
                        '1761837010063',
                        '{"to":550238400,"from":550065600}',
                        MASKED_VALUE,
                        'true',
                        '#FF5733',
                        'rich text',
                    ],
                    [
                        'text',
                        '123',
                        '1761837010063',
                        '{"to":550238400,"from":550065600}',
                        MASKED_VALUE,
                        'true',
                        '#FF5733',
                        'rich text',
                    ],
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
