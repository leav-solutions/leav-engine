import {makeGraphQlCall} from '../e2eUtils';

describe('Records', () => {
    const testLibName = 'record_library_test';
    const testLibNameType = 'recordLibraryTest';
    let recordId;

    beforeAll(async () => {
        const res = await makeGraphQlCall(`mutation {
                saveLibrary(library: {id: "${testLibName}", label: {fr: "Test lib"}}) { id }
            }`);

        await makeGraphQlCall(`mutation { refreshSchema }`);

        const resCrea = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibName}") { id }
        }`);

        recordId = resCrea.data.data.c1.id;
    });

    test('Create records', async () => {
        const res = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibName}") { id },
            c2: createRecord(library: "${testLibName}") { id },
            c3: createRecord(library: "${testLibName}") { id },
            c4: createRecord(library: "${testLibName}") { id },
            c5: createRecord(library: "${testLibName}") { id },
            c6: createRecord(library: "${testLibName}") { id },
            c7: createRecord(library: "${testLibName}") { id },
            c8: createRecord(library: "${testLibName}") { id },
            c9: createRecord(library: "${testLibName}") { id },
            c10: createRecord(library: "${testLibName}") { id },
        }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.c1.id).toBeTruthy();
    });

    test('Get records filtered by ID', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: id, value: "${recordId}"}]) { list {id} } }
        `
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(1);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordId);
    });

    test('Get library details on a record', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: id, value: "${recordId}"}]) {
                 list {
                     id
                     library { id }
                    }
                }
            }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list[0].library.id).toBe(testLibName);
    });

    test('Get record identity', async () => {
        const res = await makeGraphQlCall(`
            {
                ${testLibNameType}(filters: [{field: id, value: "${recordId}"}]) {
                    list {
                        id
                        whoAmI { id library { id } label }
                    }
                }
            }
        `);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list[0].whoAmI.id).toBe(recordId);
        expect(res.data.data[testLibNameType].list[0].whoAmI.library.id).toBe(testLibName);
        expect(res.data.data[testLibNameType].list[0].whoAmI.label).toBe(null);
    });

    test('Get records paginated', async () => {
        const firstCallRes = await makeGraphQlCall(
            `{ ${testLibNameType}(pagination: {limit: 3, offset: 0}) { totalCount cursor {next prev} list {id} } }
        `
        );

        expect(firstCallRes.data.errors).toBeUndefined();
        expect(firstCallRes.status).toBe(200);
        expect(firstCallRes.data.data[testLibNameType].list.length).toBe(3);
        expect(firstCallRes.data.data[testLibNameType].totalCount).toBeGreaterThan(
            firstCallRes.data.data[testLibNameType].list.length
        );
        expect(firstCallRes.data.data[testLibNameType].cursor.next).toBeTruthy();

        const cursorCallRes = await makeGraphQlCall(
            `{ ${testLibNameType}(
                pagination: {
                    limit: 5,
                    cursor: "${firstCallRes.data.data[testLibNameType].cursor.next}"
                }) {
                    totalCount
                    cursor {next prev}
                    list {id}
                }
            }
        `
        );

        expect(cursorCallRes.data.errors).toBeUndefined();
        expect(cursorCallRes.data.data[testLibNameType].list.length).toBe(5);
        expect(cursorCallRes.data.data[testLibNameType].cursor.next).toBeTruthy();
    });

    test('Delete a record', async () => {
        const res = await makeGraphQlCall(
            `mutation {deleteRecord(library: "${testLibName}", id: "${recordId}") { id }}
        `
        );

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteRecord).toBeDefined();
        expect(res.data.data.deleteRecord.id).toBe(recordId);
    });
});
