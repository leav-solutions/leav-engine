// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlSaveLibrary, makeGraphQlCall} from '../e2eUtils';

describe('Records deletion', () => {
    const testLibName = 'record_deletion_library_test';
    const testLibNameType = 'recordDeletionLibraryTest';

    let recordId1;
    let recordId2;
    let recordId3;

    beforeAll(async () => {
        await gqlSaveLibrary(testLibName, 'Test Lib');

        const resCrea = await makeGraphQlCall(`mutation {
            r1: createRecord(library: "${testLibName}") { id }
            r2: createRecord(library: "${testLibName}") { id }
            r3: createRecord(library: "${testLibName}") { id }
        }`);

        recordId1 = resCrea.data.data.r1.id;
        recordId2 = resCrea.data.data.r2.id;
        recordId3 = resCrea.data.data.r3.id;
    });

    test('Deactivate and purge records', async () => {
        // Find records
        const resFind = await makeGraphQlCall(`{
            ${testLibNameType} {
                list {
                    id
                }
            }
        }`);
        expect(resFind.data.data[testLibNameType].list.length).toBe(3);

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
            ${testLibNameType} {
                list {
                    id
                }
            }
        }`);
        expect(resFindAfterDeactivation.data.data[testLibNameType].list.length).toBe(0);

        // Check they're found if explicit filter is specified
        const resFindAfterDeactivationWithFilter = await makeGraphQlCall(`{
            ${testLibNameType}(filters: [{field: "active", condition: EQUAL, value: "false"}]) {
                list {
                    id
                }
            }
        }`);
        expect(resFindAfterDeactivationWithFilter.data.data[testLibNameType].list.length).toBe(3);

        // Purge records
        await makeGraphQlCall(`mutation {
            purgeInactiveRecords(libraryId: "${testLibName}") {
                id
            }
        }`);

        // Check they're not present anymore
        const resFindAfterPurge = await makeGraphQlCall(`{
            ${testLibNameType}(filters: [
                {field: "active", condition: EQUAL, value: "false"},
                {operator: OR},
                {field: "active", condition: EQUAL, value: "true"}
            ]) {
                list {
                    id
                }
            }
        }`);
        expect(resFindAfterPurge.data.data[testLibNameType].list.length).toBe(0);
    });
});
