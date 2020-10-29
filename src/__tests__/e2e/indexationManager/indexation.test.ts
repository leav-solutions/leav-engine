import {makeGraphQlCall} from '../api/e2eUtils';

describe('Indexation', () => {
    const testLibName = 'indexation_library_test';
    let record1;
    let record2;

    beforeAll(async () => {
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "users", recordIdentityConf: { label: "login" }}) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${testLibName}", fullTextAttributes: ["created_by"]}) { id }
        }`);

        const rec1 = await makeGraphQlCall(`mutation { createRecord(library: "${testLibName}") { id }}`);
        const rec2 = await makeGraphQlCall(`mutation { createRecord(library: "${testLibName}") { id }}`);

        record1 = rec1.data.data.createRecord.id;
        record2 = rec2.data.data.createRecord.id;
    });

    test('Search records with not exactly identical terms (fuzziness)', async () => {
        setTimeout(async () => {
            const res = await makeGraphQlCall(
                `{ search(library: "${testLibName}", query: "admin") { totalCount list {id} } }`
            );

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.search.list.length).toBe(2);
            expect(res.data.data.search.list[0].id).toBe(record2);
            expect(res.data.data.search.list[1].id).toBe(record1);
        }, 5000);
    });

    test('Search records with from / size params', async () => {
        setTimeout(async () => {
            const res = await makeGraphQlCall(
                `{ search(library: "${testLibName}", query: "admni", from: 0, size: 1) { totalCount list {id} } }`
            );

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.search.list.length).toBe(1);
            expect(res.data.data.search.list[0].id).toBe(record1);
        }, 5000);
    });

    afterAll(async () => {
        // await makeGraphQlCall(`mutation { deleteRecord(library: "${testLibName}", id: "${record1}") { id }}`);
        // await makeGraphQlCall(`mutation { deleteRecord(library: "${testLibName}", id: "${record2}") { id }}`);
    });
});
