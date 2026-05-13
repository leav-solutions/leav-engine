import {AttributeTypes} from '../../../../_types/attribute';
import {adminUserSdk, makeGraphQlCall} from '../e2eUtils';

describe('Records deletion', () => {
    const testLibName = 'record_deletion_library_test';
    const testAnotherLibName = 'record_deletion_another_library_test';
    const testAnotherLinkAttribute = 'record_deletion_another_link_attribute';

    let recordId1;
    let recordId2;
    let recordId3;
    let recordId4;
    let linkRecordId1;
    let linkRecordId2;
    let linkRecordId3;

    beforeAll(async () => {
        await adminUserSdk.SaveLibrary({library: {id: testLibName, label: {en: 'Test Lib'}}});

        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${testAnotherLinkAttribute}",
                    type: ${AttributeTypes.SIMPLE_LINK},
                    linked_library: "${testLibName}",
                    label: {en: "Link to delete record"},
                    multiple_values: false
                }
            ) { id }
        }`);
        await adminUserSdk.SaveLibrary({
            library: {id: testAnotherLibName, label: {en: 'Test Another Lib'}, attributes: [testAnotherLinkAttribute]},
        });

        const resCrea = await makeGraphQlCall(`mutation {
            r1: createRecord(library: "${testLibName}") { record {id} }
            r2: createRecord(library: "${testLibName}") { record {id} }
            r3: createRecord(library: "${testLibName}") { record {id} }
            r4: createRecord(library: "${testLibName}") { record {id} }
        }`);

        recordId1 = resCrea.data.data.r1.record.id;
        recordId2 = resCrea.data.data.r2.record.id;
        recordId3 = resCrea.data.data.r3.record.id;
        recordId4 = resCrea.data.data.r4.record.id;

        const resLinkRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testAnotherLibName}", data: { values: [
                { attribute: "${testAnotherLinkAttribute}", payload: "${recordId1}"}
            ]}) { record {id} },
            c2: createRecord(library: "${testAnotherLibName}", data: { values: [
                { attribute: "${testAnotherLinkAttribute}", payload: "${recordId3}"}
            ]}) { record {id} },
            c3: createRecord(library: "${testAnotherLibName}", data: { values: [
                { attribute: "${testAnotherLinkAttribute}", payload: "${recordId4}"}
            ]}) { record {id} },
        }`);

        linkRecordId1 = resLinkRecord.data.data.c1.record.id;
        linkRecordId2 = resLinkRecord.data.data.c2.record.id;
        linkRecordId3 = resLinkRecord.data.data.c3.record.id;
    });

    test('Deactivate and purge records', async () => {
        // Find records
        const resFind = await makeGraphQlCall(`{
            records(library: "${testLibName}") {
                list {
                    id
                }
            }
        }`);
        expect(resFind.data.data.records.list.length).toBe(4);

        // Deactivate records by IDs
        await makeGraphQlCall(`mutation {
            deactivateRecords(libraryId: "${testLibName}", recordsIds: ["${recordId1}", "${recordId2}"]) {
                id
            }
        }`);

        // Deactivate records by filters
        await makeGraphQlCall(`mutation {
            deactivateRecords(
                libraryId: "${testLibName}",
                filters: [
                    {field: "id", condition: EQUAL, value: "${recordId3}"}
                ]
            ) {
                id
            }
        }`);

        // Check they're not found in standard search
        const resFindAfterDeactivation = await makeGraphQlCall(`{
            records(library: "${testLibName}") {
                list {
                    id
                }
            }
        }`);
        expect(resFindAfterDeactivation.data.data.records.list.length).toBe(1);

        // Check they're found if explicit filter is specified
        const resFindAfterDeactivationWithFilter = await makeGraphQlCall(`{
            records(library: "${testLibName}", filters: [{field: "active", condition: EQUAL, value: "false"}]) {
                list {
                    id
                }
            }
        }`);
        expect(resFindAfterDeactivationWithFilter.data.data.records.list.length).toBe(3);

        // Purge records
        await makeGraphQlCall(`mutation {
            purgeInactiveRecords(libraryId: "${testLibName}") {
                id
            }
        }`);

        // Check they're not present anymore
        const resFindAfterPurge = await makeGraphQlCall(`{
            records(
                library: "${testLibName}",
                filters: [
                    {field: "active", condition: EQUAL, value: "false"},
                    {operator: OR},
                    {field: "active", condition: EQUAL, value: "true"}
                ]
            ) {
                list {
                    id
                }
            }
        }`);
        expect(resFindAfterPurge.data.data.records.list.length).toBe(1);

        // Should have remove simple link that pointed to deleted record
        const resLinkedRecord = await makeGraphQlCall(`query {
                records(
                    library: "${testAnotherLibName}",
                ) {
                    list {
                        id
                        property (attribute: "${testAnotherLinkAttribute}") {
                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                        }
                    }
                }
        }`);

        expect(resLinkedRecord.data.data.records.list.length).toBe(3);
        expect(resLinkedRecord.data.data.records.list).toEqual(
            expect.arrayContaining([
                {
                    id: linkRecordId1,
                    property: [],
                },
                {
                    id: linkRecordId2,
                    property: [],
                },
                {
                    id: linkRecordId3,
                    property: [
                        expect.objectContaining({
                            payload: {
                                id: recordId4,
                            },
                        }),
                    ],
                },
            ]),
        );
    });
});
