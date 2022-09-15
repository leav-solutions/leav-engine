// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {setTimeout} from 'timers/promises';
import {makeGraphQlCall} from '../api/e2eUtils';

jest.setTimeout(20000);

describe('Indexation', () => {
    const testLibName = 'indexation_library_test';
    const libNameQuery = 'indexationLibraryTest';

    let record1: string;
    let record2: string;

    beforeAll(async () => {
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "users", recordIdentityConf: { label: "login" }}) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${testLibName}", fullTextAttributes: ["created_by"]}) { id }
        }`);

        await makeGraphQlCall('mutation { refreshSchema }');

        const rec1 = await makeGraphQlCall(`mutation { createRecord(library: "${testLibName}") { id }}`);
        const rec2 = await makeGraphQlCall(`mutation { createRecord(library: "${testLibName}") { id }}`);

        record1 = rec1.data.data.createRecord.id;
        record2 = rec2.data.data.createRecord.id;
    });

    test('Search records with not exactly identical terms (fuzziness)', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
            ${libNameQuery}(searchQuery: "admni",sort: {field: "id", order: asc}) {
                totalCount
                list {id}
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[libNameQuery].list.length).toBe(2);
    });

    test('Search records with from / size params', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
                ${libNameQuery}(
                    searchQuery: "admni",
                    pagination: { limit: 1, offset: 0},
                    sort: {field: "id", order: asc}
                ) {
                        totalCount list {id}
                }
            }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[libNameQuery].list.length).toBe(1);
    });
});
