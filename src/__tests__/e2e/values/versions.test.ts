import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {gqlSaveAttribute, gqlSaveLibrary, gqlSaveTree, makeGraphQlCall} from '../e2eUtils';

describe('Versions', () => {
    const testLibName = 'versions_library_test';
    const attrAdvName = 'versions_attribute_test';
    const treeName = 'versions_tree';
    const treeElementLibName = 'versions_library_tree_test';

    let treeElement1;
    let treeElement2;
    let recordId;
    beforeAll(async () => {
        await gqlSaveLibrary(treeElementLibName, 'Test Tree Lib');
        await gqlSaveTree(treeName, 'Test Tree', [treeElementLibName]);

        // Create attribute
        // Add tree to versions conf on attribute
        const saveAttr = await gqlSaveAttribute(
            attrAdvName,
            AttributeTypes.ADVANCED,
            'Test Attr',
            AttributeFormats.TEXT,
            {
                versionable: true,
                trees: [treeName]
            }
        );

        // Create libraries
        await gqlSaveLibrary(testLibName, 'Test Lib', [attrAdvName]);

        // Create records for tree
        const resCreaTreeRecord = await makeGraphQlCall(`
            mutation {
                r1: createRecord(library: "${treeElementLibName}") {id},
                r2: createRecord(library: "${treeElementLibName}") {id}
            }
        `);
        treeElement1 = resCreaTreeRecord.data.data.r1.id;
        treeElement2 = resCreaTreeRecord.data.data.r2.id;

        // Add records to the tree
        await makeGraphQlCall(`mutation {
            a1: treeAddElement(
                treeId: "${treeName}", element: {id: "${treeElement1}", library: "users"}
            ) {id}
        }`);

        await makeGraphQlCall(`mutation {
            a1: treeAddElement(
                treeId: "${treeName}",
                element: {id: "${treeElement2}",library: "${treeElementLibName}"},
                parent: {id: "${treeElement1}", library: "${treeElementLibName}"}
            ) { id }
        }`);

        // Create record
        const resCreaRecord = await makeGraphQlCall(`
            mutation {
                r1: createRecord(library: "${testLibName}") {id}
            }
        `);
        recordId = resCreaRecord.data.data.r1.id;
    });

    test('Save value with version', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvName}",
                    value: {
                        value: "TEST VAL",
                        version: [
                            {
                                name: "${treeName}",
                                value: {library: "${treeElementLibName}", id: "${treeElement2}"}
                            }
                        ]
                    }
                ) {
                    id_value
                    value
                    version {
                        name
                        value {
                            id
                            library
                        }
                    }
                }
              }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.version).toBeDefined();
        expect(res.data.data.saveValue.version[0].name).toBe(treeName);
        expect(res.data.data.saveValue.version[0].value.id).toBe(treeElement2);
    });
});
