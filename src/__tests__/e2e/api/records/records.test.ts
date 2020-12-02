// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    makeGraphQlCall
} from '../e2eUtils';

describe('Records', () => {
    const testLibName = 'record_library_test';
    const testLibNameType = 'recordLibraryTest';
    let recordId;

    beforeAll(async () => {
        const res = await makeGraphQlCall(`mutation {
                saveLibrary(library: {id: "${testLibName}", label: {fr: "Test lib"}}) { id }
            }`);

        await makeGraphQlCall('mutation { refreshSchema }');

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
            `{ ${testLibNameType}(filters: [{field: "id", value: "${recordId}"}]) { list {id} } }
        `
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].list.length).toBe(1);
        expect(res.data.data[testLibNameType].list[0].id).toBe(recordId);
    });

    test('Get library details on a record', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: "id", value: "${recordId}"}]) {
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
                ${testLibNameType}(filters: [{field: "id", value: "${recordId}"}]) {
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

    describe('Sort/filter', () => {
        const sfTestLibId = 'records_sort_filter_test_lib';
        const sfTestLibQueryName = 'recordsSortFilterTestLib';
        const sfTestLibLinkId = 'records_sort_filter_test_lib_linked';
        const sfTestLibTreeId = 'records_sort_filter_test_lib_tree';
        const testTreeId = 'records_sf_test_tree';
        const testSimpleAttrId = 'records_sort_filter_test_attr_simple';
        const testSimpleExtAttrId = 'records_sort_filter_test_attr_simple_extended';
        const testSimpleLinkAttrId = 'records_sort_filter_test_attr_simple_link';
        const testAdvAttrId = 'records_sort_filter_test_attr_adv';
        const testAdvLinkAttrId = 'records_sort_filter_test_attr_adv_link';
        const testTreeAttrId = 'records_sort_filter_test_attr_tree';

        let sfRecord1;
        let sfRecord2;
        let sfRecord3;
        let sfLinkedRecord1;
        let sfLinkedRecord2;
        let sfLinkedRecord3;
        let sfTreeRecord1;
        let sfTreeRecord2;
        let sfTreeRecord3;

        beforeAll(async () => {
            jest.setTimeout(10000);

            // Create libs
            await gqlSaveLibrary(sfTestLibId, 'Test');
            await gqlSaveLibrary(sfTestLibLinkId, 'Test');
            await gqlSaveLibrary(sfTestLibTreeId, 'Test');

            // Create tree
            await gqlSaveTree(testTreeId, 'Test', [sfTestLibTreeId]);

            // Create all attributes
            await gqlSaveAttribute({
                id: testSimpleAttrId,
                type: AttributeTypes.SIMPLE,
                label: 'test',
                format: AttributeFormats.TEXT
            });
            await gqlSaveAttribute({
                id: testSimpleExtAttrId,
                type: AttributeTypes.SIMPLE,
                label: 'test',
                format: AttributeFormats.EXTENDED,
                embeddedFields: [
                    {
                        id: 'name',
                        format: AttributeFormats.TEXT
                    }
                ]
            });
            await gqlSaveAttribute({
                id: testSimpleLinkAttrId,
                type: AttributeTypes.SIMPLE_LINK,
                label: 'test',
                linkedLibrary: sfTestLibLinkId
            });
            await gqlSaveAttribute({
                id: testAdvAttrId,
                type: AttributeTypes.ADVANCED,
                label: 'test',
                format: AttributeFormats.TEXT
            });
            await gqlSaveAttribute({
                id: testAdvLinkAttrId,
                type: AttributeTypes.ADVANCED_LINK,
                label: 'test',
                linkedLibrary: sfTestLibLinkId
            });
            await gqlSaveAttribute({
                id: testTreeAttrId,
                type: AttributeTypes.TREE,
                label: 'test',
                linkedTree: testTreeId
            });

            // Save attributes on libs
            await gqlSaveLibrary(sfTestLibId, 'Test', [
                testSimpleAttrId,
                testSimpleExtAttrId,
                testAdvAttrId,
                testAdvLinkAttrId,
                testTreeAttrId
            ]);
            await gqlSaveLibrary(sfTestLibLinkId, 'Test', [testSimpleAttrId]);
            await gqlSaveLibrary(sfTestLibTreeId, 'Test', [testSimpleAttrId]);

            // Create some records
            sfRecord1 = await gqlCreateRecord(sfTestLibId);
            sfRecord2 = await gqlCreateRecord(sfTestLibId);
            sfRecord3 = await gqlCreateRecord(sfTestLibId);

            // Create records on linked lib
            sfLinkedRecord1 = await gqlCreateRecord(sfTestLibLinkId);
            sfLinkedRecord2 = await gqlCreateRecord(sfTestLibLinkId);
            sfLinkedRecord3 = await gqlCreateRecord(sfTestLibLinkId);

            // Create records on tree lib
            sfTreeRecord1 = await gqlCreateRecord(sfTestLibTreeId);
            sfTreeRecord2 = await gqlCreateRecord(sfTestLibTreeId);
            sfTreeRecord3 = await gqlCreateRecord(sfTestLibTreeId);

            // Save values on linked records
            await makeGraphQlCall(`mutation {
                v1: saveValue(
                    library: "${sfTestLibLinkId}",
                    recordId: "${sfLinkedRecord1}",
                    attribute: "${testSimpleAttrId}",
                    value: {value: "C"}) { value }
                v2: saveValue(
                    library: "${sfTestLibLinkId}",
                    recordId: "${sfLinkedRecord2}",
                    attribute: "${testSimpleAttrId}",
                    value: {value: "A"}) { value }
                v3: saveValue(
                    library: "${sfTestLibLinkId}",
                    recordId: "${sfLinkedRecord3}",
                    attribute: "${testSimpleAttrId}",
                    value: {value: "B"}) { value }
            }`);

            // Save values on tree records
            await makeGraphQlCall(`mutation {
                v1: saveValue(
                    library: "${sfTestLibTreeId}",
                    recordId: "${sfTreeRecord1}",
                    attribute: "${testSimpleAttrId}",
                    value: {value: "C"}) { value }
                v2: saveValue(
                    library: "${sfTestLibTreeId}",
                    recordId: "${sfTreeRecord2}",
                    attribute: "${testSimpleAttrId}",
                    value: {value: "A"}) { value }
                v3: saveValue(
                    library: "${sfTestLibTreeId}",
                    recordId: "${sfTreeRecord3}",
                    attribute: "${testSimpleAttrId}",
                    value: {value: "B"}) { value }
            }`);

            // Add element to tree
            await gqlAddElemToTree(testTreeId, {id: sfTreeRecord1, library: sfTestLibTreeId});
            await gqlAddElemToTree(testTreeId, {id: sfTreeRecord2, library: sfTestLibTreeId});
            await gqlAddElemToTree(testTreeId, {id: sfTreeRecord3, library: sfTestLibTreeId});
        });

        describe('On simple attribute', () => {
            beforeAll(async () => {
                // Save values on records
                await makeGraphQlCall(`mutation {
                    v1: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testSimpleAttrId}",
                        value: {value: "C"}) { value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testSimpleAttrId}",
                        value: {value: "A"}) { value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testSimpleAttrId}",
                        value: {value: "B"}) { value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(
                    `{ ${sfTestLibQueryName}(filters: [{field: "${testSimpleAttrId}", value: "C"}]) { list {id}} }`
                );

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(1);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(
                    `{ ${sfTestLibQueryName}(sort: {field: "${testSimpleAttrId}", order: asc}) {
                        list {
                            id
                        }
                    }
                }`
                );

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(3);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord2);
                expect(res.data.data[sfTestLibQueryName].list[1].id).toBe(sfRecord3);
                expect(res.data.data[sfTestLibQueryName].list[2].id).toBe(sfRecord1);
            });
        });

        describe('On simple extended attribute', () => {
            beforeAll(async () => {
                // Save values on records
                await makeGraphQlCall(`mutation {
                    v1: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testSimpleExtAttrId}",
                        value: {value: "{\\"name\\": \\"C\\"}"}) { value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testSimpleExtAttrId}",
                        value: {value: "{\\"name\\": \\"A\\"}"}) { value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testSimpleExtAttrId}",
                        value: {value: "{\\"name\\": \\"B\\"}"}) { value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    ${sfTestLibQueryName}(filters: [{field: "${testSimpleExtAttrId}.name", value: "C"}]) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(1);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    ${sfTestLibQueryName}(sort: {field: "${testSimpleExtAttrId}.name", order: asc}) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(3);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord2);
                expect(res.data.data[sfTestLibQueryName].list[1].id).toBe(sfRecord3);
                expect(res.data.data[sfTestLibQueryName].list[2].id).toBe(sfRecord1);
            });
        });

        describe('On simple link attribute', () => {
            beforeAll(async () => {
                // Save values on records
                await makeGraphQlCall(`mutation {
                    v1: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testSimpleLinkAttrId}",
                        value: {value: "${sfLinkedRecord1}"}) { value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testSimpleLinkAttrId}",
                        value: {value: "${sfLinkedRecord2}"}) { value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testSimpleLinkAttrId}",
                        value: {value: "${sfLinkedRecord3}"}) { value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    ${sfTestLibQueryName}(
                        filters: [{field: "${testSimpleLinkAttrId}.${testSimpleAttrId}", value: "C"}]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(1);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    ${sfTestLibQueryName}(sort: {field: "${testSimpleLinkAttrId}.${testSimpleAttrId}", order: asc}) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(3);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord2);
                expect(res.data.data[sfTestLibQueryName].list[1].id).toBe(sfRecord3);
                expect(res.data.data[sfTestLibQueryName].list[2].id).toBe(sfRecord1);
            });
        });

        describe('On advanced attribute', () => {
            beforeAll(async () => {
                // Save values on records
                await makeGraphQlCall(`mutation {
                    v1: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testAdvAttrId}",
                        value: {value: "C"}) { value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testAdvAttrId}",
                        value: {value: "A"}) { value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testAdvAttrId}",
                        value: {value: "B"}) { value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(
                    `{ ${sfTestLibQueryName}(filters: [{field: "${testAdvAttrId}", value: "C"}]) { list {id}} }`
                );

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(1);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(
                    `{ ${sfTestLibQueryName}(sort: {field: "${testAdvAttrId}", order: asc}) {
                        list {
                            id
                        }
                    }
                }`
                );

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(3);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord2);
                expect(res.data.data[sfTestLibQueryName].list[1].id).toBe(sfRecord3);
                expect(res.data.data[sfTestLibQueryName].list[2].id).toBe(sfRecord1);
            });
        });

        describe('On advanced link attribute', () => {
            beforeAll(async () => {
                // Save values on records
                await makeGraphQlCall(`mutation {
                    v1: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testAdvLinkAttrId}",
                        value: {value: "${sfLinkedRecord1}"}) { value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testAdvLinkAttrId}",
                        value: {value: "${sfLinkedRecord2}"}) { value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testAdvLinkAttrId}",
                        value: {value: "${sfLinkedRecord3}"}) { value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    ${sfTestLibQueryName}(
                        filters: [{field: "${testAdvLinkAttrId}.${testSimpleAttrId}", value: "C"}]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(1);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(
                    `{ ${sfTestLibQueryName}(sort: {field: "${testAdvLinkAttrId}.${testSimpleAttrId}", order: asc}) {
                        list {
                            id
                        }
                    }
                }`
                );

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(3);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord2);
                expect(res.data.data[sfTestLibQueryName].list[1].id).toBe(sfRecord3);
                expect(res.data.data[sfTestLibQueryName].list[2].id).toBe(sfRecord1);
            });
        });

        describe('On tree attribute', () => {
            beforeAll(async () => {
                // Save values on records
                await makeGraphQlCall(`mutation {
                    v1: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testTreeAttrId}",
                        value: {value: "${sfTestLibTreeId}/${sfTreeRecord1}"}) { value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testTreeAttrId}",
                        value: {value: "${sfTestLibTreeId}/${sfTreeRecord2}"}) { value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testTreeAttrId}",
                        value: {value: "${sfTestLibTreeId}/${sfTreeRecord3}"}) { value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    ${sfTestLibQueryName}(
                        filters: [{field: "${testTreeAttrId}.${testSimpleAttrId}", value: "C"}]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(1);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(
                    `{ ${sfTestLibQueryName}(sort: {field: "${testTreeAttrId}.${testSimpleAttrId}", order: asc}) {
                        list {
                            id
                        }
                    }
                }`
                );

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[sfTestLibQueryName].list.length).toBe(3);
                expect(res.data.data[sfTestLibQueryName].list[0].id).toBe(sfRecord2);
                expect(res.data.data[sfTestLibQueryName].list[1].id).toBe(sfRecord3);
                expect(res.data.data[sfTestLibQueryName].list[2].id).toBe(sfRecord1);
            });
        });
    });
});
