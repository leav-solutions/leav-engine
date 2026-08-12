import {
    adminUserSdk,
    downloadFileBuffer,
    e2eGuestUser,
    e2eNonAdminUser,
    gqlSaveAttribute,
    gqlSaveValue,
    makeGraphQlCall,
} from '../e2eUtils';
import getExcelData from '../../../../utils/helpers/getExcelData';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {waitForTaskCompletedWithStatus} from '../taskUtils';
import {TaskStatus} from '../../../../_types/tasksManager';
import {type IExportProfileConfig} from '../../../../domain/export/exportProfileDomain';

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

    beforeAll(async () => {
        // Create Event Library - created_by is automatically added to all libraries
        await gqlSaveAttribute({
            id: 'event_name',
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: 'Event Name',
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: eventLibName,
                label: {en: 'Events Library'},
                attributes: ['event_name'],
                settings: {
                    export: {
                        defaultProfile: 'default',
                        profiles: [
                            {
                                label: 'default',
                                columns: [
                                    {columnLabel: 'Event Name', attribute: 'event_name'},
                                    {columnLabel: 'Created By (default label)', attribute: 'created_by'},
                                ],
                            },
                            {
                                label: 'with_user_info',
                                columns: [
                                    {columnLabel: 'Event Name', attribute: 'event_name'},
                                    {columnLabel: 'Creator Email', attribute: 'created_by.email'},
                                ],
                            },
                            {
                                label: 'with_creator_of_creator',
                                columns: [
                                    {columnLabel: 'Event Name', attribute: 'event_name'},
                                    {columnLabel: "Creator's Creator Email", attribute: 'created_by.created_by.email'},
                                ],
                            },
                            {
                                label: 'with_creator_of_creator_label',
                                columns: [
                                    {columnLabel: 'Event Name', attribute: 'event_name'},
                                    {columnLabel: "Creator's Creator Label", attribute: 'created_by.created_by'},
                                ],
                            },
                            {
                                label: 'through_tree_attribute',
                                columns: [
                                    {columnLabel: 'Event Name', attribute: 'event_name'},
                                    {columnLabel: "Creator's Group Label", attribute: 'created_by.user_groups'},
                                ],
                            },
                            {
                                label: 'through_tree_attribute_label',
                                columns: [
                                    {columnLabel: 'Event Name', attribute: 'event_name'},
                                    {columnLabel: "Creator's Group Label", attribute: 'created_by.user_groups.label'},
                                ],
                            },
                            {
                                label: 'with_creator_of_creator_wrong_attribute',
                                columns: [
                                    {columnLabel: 'Event Name', attribute: 'event_name'},
                                    {
                                        columnLabel: "Creator's Creator Email",
                                        attribute: 'created_by.created_by.wrong_attribute',
                                    },
                                ],
                            },
                        ],
                    },
                    recordIdentityConf: {
                        label: 'event_name',
                    },
                },
            },
        });

        // Create Event records authenticated as different users
        // Event created by guest user
        // The guest user's created_by will point to whoever created the guest (system admin from globalSetup)
        const eventId1 = await createRecordAsUser(eventLibName, e2eGuestUser());
        await gqlSaveValue('event_name', eventLibName, eventId1, 'Product Launch 2025');

        // Event created by nonAdmin user
        // The nonAdmin user's created_by will point to whoever created the nonAdmin (system admin from globalSetup)
        const eventId2 = await createRecordAsUser(eventLibName, e2eNonAdminUser());
        await gqlSaveValue('event_name', eventLibName, eventId2, 'Team Meeting');
    });

    async function exportToExcelGetData(library: string, profile: string): Promise<string[][][]> {
        const exportTaskId = (await makeGraphQlCall(`query { export(library: "${library}", profile: "${profile}") }`))
            .data.data.export;

        const task = await waitForTaskCompletedWithStatus(exportTaskId, TaskStatus.DONE);

        const buffer = await downloadFileBuffer(task.link.url);
        return getExcelData(buffer);
    }

    describe('default behavior (link attribute without dot notation)', () => {
        test('should export using recordIdentityConf.label for created_by link', async () => {
            const excelData = await exportToExcelGetData(eventLibName, 'default');

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
            const excelData = await exportToExcelGetData(eventLibName, 'with_user_info');

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
            const excelData = await exportToExcelGetData(eventLibName, 'with_creator_of_creator');

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

    describe('nested link attributes without specific attribute (label)', () => {
        test('should export label from chained link without specifying attribute', async () => {
            const excelData = await exportToExcelGetData(eventLibName, 'with_creator_of_creator_label');

            // Should navigate 2 levels deep: event.created_by.created_by
            // And return the label of the user, not "[object Object]"
            expect(excelData[0].length).toBeGreaterThan(0);
            expect(excelData[0][0]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Event Name'),
                    expect.stringContaining("Creator's Creator Label"),
                ]),
            );

            // The value should be the user ID or label, not "[object Object]"
            expect(excelData[0][2]).toEqual(
                expect.arrayContaining([expect.stringContaining('Team Meeting'), expect.any(String)]),
            );
            // Ensure it's not "[object Object]"
            expect(excelData[0][2][1]).not.toBe('[object Object]');

            expect(excelData[0][3]).toEqual(
                expect.arrayContaining([expect.stringContaining('Product Launch 2025'), expect.any(String)]),
            );
            // Ensure it's not "[object Object]"
            expect(excelData[0][3][1]).not.toBe('[object Object]');
        });
    });

    test('nested tree attributes without specific attribute (label)', async () => {
        const excelData = await exportToExcelGetData(eventLibName, 'through_tree_attribute');

        // Should navigate 2 levels deep: event.created_by.created_by
        // And return the label of the user, not "[object Object]"
        expect(excelData[0].length).toBeGreaterThan(0);
        expect(excelData[0][0]).toEqual(
            expect.arrayContaining([
                expect.stringContaining('Event Name'),
                expect.stringContaining("Creator's Group Label"),
            ]),
        );

        expect(excelData[0][2]).toEqual(['Team Meeting', 'non-admin']);
        expect(excelData[0][3]).toEqual(['Product Launch 2025', '']);
    });

    test('nested tree attributes with specific attribute (label)', async () => {
        const excelData = await exportToExcelGetData(eventLibName, 'through_tree_attribute_label');

        // Should navigate 2 levels deep: event.created_by.created_by
        // And return the label of the user, not "[object Object]"
        expect(excelData[0].length).toBeGreaterThan(0);
        expect(excelData[0][0]).toEqual(
            expect.arrayContaining([
                expect.stringContaining('Event Name'),
                expect.stringContaining("Creator's Group Label"),
            ]),
        );

        expect(excelData[0][2]).toEqual(['Team Meeting', 'non-admin']);
        expect(excelData[0][3]).toEqual(['Product Launch 2025', '']);
    });

    describe('library has exportProfiles', () => {
        let exportProfilesConfig: IExportProfileConfig | null;
        beforeAll(async () => {
            exportProfilesConfig = (
                await makeGraphQlCall(`query {
                    libraries(filters: {id: "${eventLibName}"}) {
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
            expect(exportProfilesConfig?.profiles.length).toBe(7);
        });

        test('should have correct export profile columns configuration', async () => {
            const profile1 = exportProfilesConfig?.profiles.find(p => p.label === 'default');
            expect(profile1).toBeDefined();
            expect(profile1?.columns.length).toBe(2);
            expect(profile1?.columns[0]).toEqual({columnLabel: 'Event Name', attribute: 'event_name'});
            expect(profile1?.columns[1]).toEqual({columnLabel: 'Created By (default label)', attribute: 'created_by'});

            const profile2 = exportProfilesConfig?.profiles.find(p => p.label === 'with_user_info');
            expect(profile2).toBeDefined();
            expect(profile2?.columns.length).toBe(2);
            expect(profile2?.columns[0]).toEqual({columnLabel: 'Event Name', attribute: 'event_name'});
            expect(profile2?.columns[1]).toEqual({columnLabel: 'Creator Email', attribute: 'created_by.email'});

            const profile3 = exportProfilesConfig?.profiles.find(p => p.label === 'with_creator_of_creator');
            expect(profile3).toBeDefined();
            expect(profile3?.columns.length).toBe(2);
            expect(profile3?.columns[0]).toEqual({columnLabel: 'Event Name', attribute: 'event_name'});
            expect(profile3?.columns[1]).toEqual({
                columnLabel: "Creator's Creator Email",
                attribute: 'created_by.created_by.email',
            });
        });

        test('should return profile with error for invalid export profile', async () => {
            const wrongProfile = exportProfilesConfig?.profiles.find(
                p => p.label === 'with_creator_of_creator_wrong_attribute',
            );
            expect(wrongProfile).toBeDefined();
            expect(wrongProfile?.error).toBeDefined();
            expect(wrongProfile?.error?.message).toContain(
                'Export profile column attribute "created_by.created_by.wrong_attribute": Attribute path "created_by.created_by.wrong_attribute" does not exist in the library "users" (attribute "wrong_attribute" not found)',
            );
        });
    });
});
