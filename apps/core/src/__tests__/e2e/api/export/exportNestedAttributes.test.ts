// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Client as GraphqlWsClient} from 'graphql-ws';
import {type ITask} from '../../../../_types/tasksManager';
import {
    e2eGuestUser,
    e2eNonAdminUser,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveValue,
    makeGraphQlCall,
    makeWebSocketGraphQlCall,
    waitGraphqlWebSocketMessage,
} from '../e2eUtils';
import {type IPubSubNotificationData} from '_types/eventsManager';
import getFileDataBuffer from '../../../../utils/helpers/getFileDataBuffer';
import getExcelData from '../../../../utils/helpers/getExcelData';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';

// Helper function to create a record as a specific user
async function createRecordAsUser(library: string, user: ReturnType<typeof e2eGuestUser>): Promise<string> {
    const res = await makeGraphQlCall(
        `mutation {
            createRecord(library: "${library}") {
                record {
                    id
                }
            }
        }`,
        {user},
    );
    return res.data.data.createRecord.record.id;
}

describe('Export Nested Attributes', () => {
    const eventLibName = 'export_nested_events_lib';

    let graphqlClient: GraphqlWsClient;

    const waitExportWSNotificationDone = () =>
        waitGraphqlWebSocketMessage<Pick<IPubSubNotificationData, 'notification'>>(
            graphqlClient,
            subscriptionGraphqlQuery,
            {},
            data => data?.notification?.level?.includes('success'),
            {timeoutMs: 20000},
        );

    async function getTask(taskId: string): Promise<ITask> {
        const resTaskQuery = await makeGraphQlCall(
            `query { tasks(filters: {id: "${taskId}"}) { list { id status link { name url } } } }`,
        );

        expect(resTaskQuery.data.errors).toBeUndefined();
        expect(resTaskQuery.status).toBe(200);
        expect(resTaskQuery.data.data.tasks.list.length).toBe(1);
        return resTaskQuery.data.data.tasks.list[0];
    }

    beforeAll(async () => {
        // Create Event Library - created_by is automatically added to all libraries
        await gqlSaveAttribute({
            id: 'event_name',
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: 'Event Name',
        });

        await gqlSaveLibrary(
            eventLibName,
            'Events Library',
            ['event_name'],
            `{
                export: {
                    defaultProfile: "default",
                    profiles: [
                        {
                            label: "default",
                            columns: [
                                {columnLabel: "Event Name", attribute: "event_name"},
                                {columnLabel: "Created By (default label)", attribute: "created_by"}
                            ]
                        },
                        {
                            label: "with_user_info",
                            columns: [
                                {columnLabel: "Event Name", attribute: "event_name"},
                                {columnLabel: "Creator Email", attribute: "created_by.email"}
                            ]
                        },
                        {
                            label: "with_creator_of_creator",
                            columns: [
                                {columnLabel: "Event Name", attribute: "event_name"},
                                {columnLabel: "Creator's Creator Email", attribute: "created_by.created_by.email"}
                            ]
                        }
                    ]
                },
                recordIdentityConf: {
                    label: "event_name"
                }
            }`,
        );

        // Create Event records authenticated as different users
        // Event created by guest user
        // The guest user's created_by will point to whoever created the guest (system admin from globalSetup)
        const eventId1 = await createRecordAsUser(eventLibName, e2eGuestUser());
        await gqlSaveValue('event_name', eventLibName, eventId1, 'Product Launch 2025');

        // Event created by nonAdmin user
        // The nonAdmin user's created_by will point to whoever created the nonAdmin (system admin from globalSetup)
        const eventId2 = await createRecordAsUser(eventLibName, e2eNonAdminUser());
        await gqlSaveValue('event_name', eventLibName, eventId2, 'Team Meeting');

        graphqlClient = await makeWebSocketGraphQlCall();
    });

    afterAll(async () => {
        graphqlClient.dispose();
    });

    describe('default behavior (link attribute without dot notation)', () => {
        test('should export using recordIdentityConf.label for created_by link', async () => {
            const exportTaskId = (
                await makeGraphQlCall(`query { export(library: "${eventLibName}", profile: "default") }`)
            ).data.data.export;

            await waitExportWSNotificationDone();
            const task = await getTask(exportTaskId);

            const filepath = task.link.url;
            const buffer = await getFileDataBuffer(filepath);
            const excelData = await getExcelData(buffer);

            // created_by will show the label of the creator
            // excelData[0][0] is the first row (header with display labels)
            expect(excelData[0].length).toBeGreaterThan(0);
            expect(excelData[0][0]).toEqual(
                expect.arrayContaining([expect.stringContaining('Event Name'), expect.stringContaining('Created By')]),
            );

            // We test for expect.any(String), and it returns an ID which is a string
            expect(excelData[0][2]).toEqual(
                expect.arrayContaining([expect.stringContaining('Team Meeting'), expect.any(String)]),
            );

            expect(excelData[0][3]).toEqual(
                expect.arrayContaining([expect.stringContaining('Product Launch 2025'), expect.any(String)]),
            );
        });
    });

    describe('nested simple attributes (one level - created_by user info)', () => {
        test('should export specific attributes from created_by user', async () => {
            const exportTaskId = (
                await makeGraphQlCall(`query { export(library: "${eventLibName}", profile: "with_user_info") }`)
            ).data.data.export;

            await waitExportWSNotificationDone();
            const task = await getTask(exportTaskId);

            const filepath = task.link.url;
            const buffer = await getFileDataBuffer(filepath);
            const excelData = await getExcelData(buffer);

            // Should contain event name and creator email (created_by points to system users)
            expect(excelData[0].length).toBeGreaterThan(0);
            expect(excelData[0][0]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Event Name'),
                    expect.stringContaining('Creator Email'),
                ]),
            );

            expect(excelData[0][2]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Team Meeting'),
                    expect.stringContaining('non-admin@aristid.com'),
                ]),
            );

            expect(excelData[0][3]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Product Launch 2025'),
                    expect.stringContaining('guest@aristid.com'),
                ]),
            );
        });
    });

    describe('nested link attributes (two levels - created_by.created_by)', () => {
        test('should export attributes from creator of creator (2 levels deep)', async () => {
            const exportTaskId = (
                await makeGraphQlCall(
                    `query { export(library: "${eventLibName}", profile: "with_creator_of_creator") }`,
                )
            ).data.data.export;

            await waitExportWSNotificationDone();
            const task = await getTask(exportTaskId);

            const filepath = task.link.url;
            const buffer = await getFileDataBuffer(filepath);
            const excelData = await getExcelData(buffer);

            // Should navigate 2 levels deep: event.created_by.created_by
            // Note: created_by points to system users which have 'email' attribute
            expect(excelData[0].length).toBeGreaterThan(0);
            expect(excelData[0][0]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Event Name'),
                    expect.stringContaining("Creator's Creator Email"),
                ]),
            );

            expect(excelData[0][2]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Team Meeting'),
                    expect.stringContaining('system@test.leav-engine.com'),
                ]),
            );

            expect(excelData[0][3]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Product Launch 2025'),
                    expect.stringContaining('system@test.leav-engine.com'),
                ]),
            );
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
