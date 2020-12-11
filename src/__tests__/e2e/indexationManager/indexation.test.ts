// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../api/e2eUtils';

jest.setTimeout(10000);

describe('Indexation', () => {
    const testLibName = 'indexation_library_test';
    const libNameQuery = 'indexationLibraryTest';

    let record1: string;
    let record2: string;

    beforeAll(async done => {
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "users", recordIdentityConf: { label: "login" }}) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${testLibName}", fullTextAttributes: ["created_by"]}) { id }
        }`);

        setTimeout(async () => {
            const rec1 = await makeGraphQlCall(`mutation { createRecord(library: "${testLibName}") { id }}`);
            const rec2 = await makeGraphQlCall(`mutation { createRecord(library: "${testLibName}") { id }}`);

            record1 = rec1.data.data.createRecord.id;
            record2 = rec2.data.data.createRecord.id;

            done();
        }, 5000);
    });

    test('Search records with not exactly identical terms (fuzziness)', async done => {
        expect.assertions(5);

        setTimeout(async () => {
            const res = await makeGraphQlCall(`{ ${libNameQuery}(searchQuery: "admin") { totalCount list {id} } }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data[libNameQuery].list.length).toBe(2);
            expect(res.data.data[libNameQuery].list[0].id).toBe(record1);
            expect(res.data.data[libNameQuery].list[1].id).toBe(record2);

            done();
        }, 5000);
    });

    test('Search records with from / size params', async done => {
        expect.assertions(4);

        setTimeout(async () => {
            const res = await makeGraphQlCall(
                `{ ${libNameQuery}(searchQuery: "admni", pagination: { limit: 1, offset: 0}) { totalCount list {id} } }`
            );

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data[libNameQuery].list.length).toBe(1);
            expect(res.data.data[libNameQuery].list[0].id).toBe(record1);

            done();
        }, 5000);
    });
});
