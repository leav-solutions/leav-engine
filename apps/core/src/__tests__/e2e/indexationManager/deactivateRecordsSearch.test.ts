import {AttributeFormat, AttributeType, RecordFilterCondition} from '../_gqlTypes';
import {adminUserSdk} from '../api/e2eUtils';

describe('deactivateRecords with fulltext search', () => {
    const libId = 'deactivate_search_lib';
    const attrId = 'deactivate_search_attr';

    let alphaRecord1: string;
    let alphaRecord2: string;
    let bravoRecord: string;

    const waitForIndexedCount = (searchQuery: string, expectedCount: number): Promise<void> =>
        vi.waitFor(
            async () => {
                const {records} = await adminUserSdk.SearchRecords({libraryId: libId, searchQuery});
                expect(records.list).toHaveLength(expectedCount);
            },
            {timeout: 10_000, interval: 500},
        );

    const activeIds = async (): Promise<string[]> => {
        const {records} = await adminUserSdk.SearchRecords({libraryId: libId});
        return records.list.map(record => record.id);
    };

    beforeAll(async () => {
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: attrId,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {en: 'Deactivate search attr'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: libId,
                label: {en: 'Deactivate search lib'},
                attributes: [attrId],
                fullTextAttributes: [attrId],
            },
        });

        const create = async (payload: string): Promise<string> => {
            const {createRecord} = await adminUserSdk.CreateRecord({
                library: libId,
                data: {values: [{attribute: attrId, payload}]},
            });
            return createRecord.record.id;
        };

        alphaRecord1 = await create('alpha unique');
        alphaRecord2 = await create('alpha unique');
        bravoRecord = await create('bravo distinct');

        // Wait for indexation to catch up before exercising fulltext-scoped deactivation.
        await waitForIndexedCount('alpha', 2);
        await waitForIndexedCount('bravo', 1);
    });

    test('a non-matching searchQuery deactivates nothing (does not wipe the library)', async () => {
        const {deactivateRecords} = await adminUserSdk.DeactivateRecords({
            libraryId: libId,
            searchQuery: 'zzznomatch',
        });

        expect(deactivateRecords).toHaveLength(0);
        // The three records are still active.
        expect(await activeIds()).toEqual(expect.arrayContaining([alphaRecord1, alphaRecord2, bravoRecord]));
    });

    test('a matching searchQuery only deactivates the matching records', async () => {
        const {deactivateRecords} = await adminUserSdk.DeactivateRecords({
            libraryId: libId,
            searchQuery: 'alpha',
        });

        expect(deactivateRecords.map(record => record.id).sort()).toEqual([alphaRecord1, alphaRecord2].sort());

        // The non-matching record is untouched...
        const remainingActive = await activeIds();
        expect(remainingActive).toContain(bravoRecord);
        expect(remainingActive).not.toContain(alphaRecord1);
        expect(remainingActive).not.toContain(alphaRecord2);

        // ...and the matching records are now inactive (retrievable only with retrieveInactive).
        const {records: inactive} = await adminUserSdk.SearchRecords({
            libraryId: libId,
            retrieveInactive: true,
            filters: [{field: 'active', condition: RecordFilterCondition.EQUAL, value: 'false'}],
        });
        expect(inactive.list.map(record => record.id).sort()).toEqual([alphaRecord1, alphaRecord2].sort());
    });
});
