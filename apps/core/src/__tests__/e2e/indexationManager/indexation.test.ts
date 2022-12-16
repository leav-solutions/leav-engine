// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {setTimeout} from 'timers/promises';
import {makeGraphQlCall} from '../api/e2eUtils';

jest.setTimeout(20000);

describe('Indexation', () => {
    const testLibName = 'indexation_library_test';
    const libNameQuery = 'indexationLibraryTest';
    const attrId = 'indexation_attribute_test';

    let record1: string;
    let record2: string;

    beforeAll(async () => {
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "users", recordIdentityConf: { label: "login" }}) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrId}",
                    type: simple,
                    format: text,
                    label: {fr: "Test attr", en: "Test attr en"},
                    description: {fr: "Test attr", en: "Test attr en"},
                }
            ) {
                id
            }
        }`);

        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${testLibName}", attributes: ["${attrId}"], fullTextAttributes: ["created_by", "${attrId}"]}) { id }
        }`);

        await makeGraphQlCall('mutation { refreshSchema }');

        const rec1 = await makeGraphQlCall(`mutation { createRecord(library: "${testLibName}") { id }}`);
        const rec2 = await makeGraphQlCall(`mutation { createRecord(library: "${testLibName}") { id }}`);

        record1 = rec1.data.data.createRecord.id;
        record2 = rec2.data.data.createRecord.id;

        await makeGraphQlCall(`mutation {
                saveValue(
                       library: "${testLibName}",
                       recordId: "${record1}",
                       attribute: "${attrId}",
                       value: {value: "one two three"}
                   ) {
                        attribute {
                            id
                        }
                       id_value
                   }
           }`);
    });

    test('Search records', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
            ${libNameQuery}(searchQuery: "admin",sort: {field: "id", order: asc}) {
                totalCount
                list {id}
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[libNameQuery].list.length).toBe(2);
    });

    test('Search records with wildcard at first', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
            ${libNameQuery}(searchQuery: "dmin",sort: {field: "id", order: asc}) {
                totalCount
                list {id}
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[libNameQuery].list.length).toBe(2);
    });

    test('Search records with wildcard at end', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
            ${libNameQuery}(searchQuery: "admi",sort: {field: "id", order: asc}) {
                totalCount
                list {id ${attrId}}
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[libNameQuery].list.length).toBe(2);
    });

    test('Search records with wildcard at first/end', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
            ${libNameQuery}(searchQuery: "dmi",sort: {field: "id", order: asc}) {
                totalCount
                list {id}
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[libNameQuery].list.length).toBe(2);
    });

    test('Search records with phrase (all words matches)', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
            ${libNameQuery}(searchQuery: "one two three") {
                totalCount
                list {id ${attrId}}
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[libNameQuery].list.length).toBe(1);
    });

    test('Search records with phrase (1 word match only)', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
            ${libNameQuery}(searchQuery: "one rrr uuu") {
                totalCount
                list {id ${attrId}}
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[libNameQuery].list.length).toBe(1);
    });

    test('Search records with phrase (no matches)', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
            ${libNameQuery}(searchQuery: "zzz www iii") {
                totalCount
                list {id ${attrId}}
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[libNameQuery].list.length).toBe(0);
    });

    test('Search records with from / size params', async () => {
        await setTimeout(5000);

        const res = await makeGraphQlCall(`{
                ${libNameQuery}(
                    searchQuery: "admin",
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
