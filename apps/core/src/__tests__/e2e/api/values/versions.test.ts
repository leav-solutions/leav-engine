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
    gqlSaveVersionProfile,
    makeGraphQlCall
} from '../e2eUtils';

describe('Versions', () => {
    const testLibName = 'versions_library_test';
    const testLibNameFormatted = 'versionsLibraryTest';
    const attrAdvName = 'versions_attribute_test';
    const treeName = 'versions_tree';
    const treeElementLibName = 'versions_library_tree_test';
    const versionProfileName = 'versions_version_profile_test';

    let treeElement1: string;
    let treeElement2: string;
    let treeElement3: string;
    let nodeElement1: string;
    let nodeElement2: string;
    let nodeElement3: string;
    let recordId: string;
    beforeAll(async () => {
        await gqlSaveLibrary(treeElementLibName, 'Test Tree Lib');
        await gqlSaveTree(treeName, 'Test Tree', [treeElementLibName]);
        await gqlSaveVersionProfile(versionProfileName, 'Test Version Profile', [treeName]);

        // Create attribute
        // Add tree to versions conf on attribute
        await gqlSaveAttribute({
            id: attrAdvName,
            type: AttributeTypes.ADVANCED,
            label: 'Test Attr',
            format: AttributeFormats.TEXT,
            versionsConf: {
                versionable: true,
                profile: versionProfileName
            }
        });

        // Create libraries
        await gqlSaveLibrary(testLibName, 'Test Lib');

        // Second call needed to attach attribute
        await gqlSaveLibrary(testLibName, 'Test Lib', [attrAdvName]);

        // Create records for tree
        const resCreaTreeRecord = await makeGraphQlCall(`
            mutation {
                r1: createRecord(library: "${treeElementLibName}") {id},
                r2: createRecord(library: "${treeElementLibName}") {id},
                r3: createRecord(library: "${treeElementLibName}") {id}
            }
        `);
        treeElement1 = resCreaTreeRecord.data.data.r1.id;
        treeElement2 = resCreaTreeRecord.data.data.r2.id;
        treeElement3 = resCreaTreeRecord.data.data.r3.id;

        // Add records to the tree
        nodeElement1 = await gqlAddElemToTree(treeName, {id: treeElement1, library: treeElementLibName});
        nodeElement2 = await gqlAddElemToTree(treeName, {id: treeElement2, library: treeElementLibName}, nodeElement1);
        nodeElement3 = await gqlAddElemToTree(treeName, {id: treeElement3, library: treeElementLibName}, nodeElement2);

        recordId = await gqlCreateRecord(testLibName);
    });

    test('Save and get values with version', async () => {
        const resSaveValue = await makeGraphQlCall(`mutation {
                v1: saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvName}",
                    value: {
                        value: "TEST VAL 1",
                        version: [
                            {
                                name: "${treeName}",
                                value: "${nodeElement1}"
                            }
                        ]
                    }
                ) {
                    id_value
                    version

                    ... on Value {
                        value
                    }

                },
                v2: saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvName}",
                    value: {
                        value: "TEST VAL 2",
                        version: [
                            {
                                name: "${treeName}",
                                value: "${nodeElement2}"
                            }
                        ]
                    }
                ) {
                    id_value
                    version

                    ... on Value {
                        value
                    }

                }
              }`);

        expect(resSaveValue.status).toBe(200);
        expect(resSaveValue.data.errors).toBeUndefined();
        expect(resSaveValue.data.data.v1.version).toBeDefined();
        expect(resSaveValue.data.data.v1.version[0].name).toBe(treeName);
        expect(resSaveValue.data.data.v1.version[0].value).toBe(nodeElement1);

        const resGetValues1 = await makeGraphQlCall(`{
            r1: ${testLibNameFormatted}(
                version: {
                    name: "${treeName}",
                    value: "${nodeElement1}"
                }
            ) {
                list {
                    property(attribute: "${attrAdvName}") {
                        version

                        ... on Value {
                            value
                        }
                    }
                }
            }
        }`);
        expect(resGetValues1.status).toBe(200);
        expect(resGetValues1.data.errors).toBeUndefined();
        expect(resGetValues1.data.data.r1.list[0].property[0].version).toBeDefined();
        expect(resGetValues1.data.data.r1.list[0].property[0].version[treeName]).toBeDefined();
        expect(resGetValues1.data.data.r1.list[0].property[0].version[treeName]).toBe(nodeElement1);

        const resGetValues2 = await makeGraphQlCall(`{
            r2: ${testLibNameFormatted}(
                version: {
                    name: "${treeName}",
                    value: "${nodeElement2}"
                }
            ) {
                list {
                    property(attribute: "${attrAdvName}") {
                        version

                        ... on Value {
                            value
                        }
                    }
                }
            }
        }`);
        expect(resGetValues2.status).toBe(200);
        expect(resGetValues2.data.errors).toBeUndefined();
        expect(resGetValues2.data.data.r2.list[0].property[0].version).toBeDefined();
        expect(resGetValues2.data.data.r2.list[0].property[0].version[treeName]).toBeDefined();
        expect(resGetValues2.data.data.r2.list[0].property[0].version[treeName]).toBe(nodeElement2);

        const resGetValues3 = await makeGraphQlCall(`{
            r3: ${testLibNameFormatted}(
                version: {
                    name: "${treeName}",
                    value: "${nodeElement3}"
                }
            ) {
                list {
                    property(attribute: "${attrAdvName}") {
                        version

                        ... on Value {
                            value
                        }
                    }
                }
            }
        }`);
        expect(resGetValues3.status).toBe(200);
        expect(resGetValues3.data.errors).toBeUndefined();
        expect(resGetValues3.data.data.r3.list[0].property[0].version).toBeDefined();
        expect(resGetValues3.data.data.r3.list[0].property[0].version[treeName]).toBeDefined();
        expect(resGetValues3.data.data.r3.list[0].property[0].version[treeName]).toBe(nodeElement2);
    });
});
