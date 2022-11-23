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
    const attrAdvForNullVersionName = 'versions_attribute_for_null_test';

    const treeName = 'versions_tree';
    const otherTreeName = 'versions_tree_2';
    const treeElementLibName = 'versions_library_tree_test';
    const versionProfileName = 'versions_version_profile_test';
    const versionProfileMultipleTreesName = 'versions_version_profile_multiple_trees_test';

    let treeElement1: string;
    let treeElement2: string;
    let treeElement3: string;
    let nodeElement1: string;
    let nodeElement2: string;
    let nodeElement3: string;

    let otherNodeElement1: string;
    let otherNodeElement2: string;

    let recordId: string;
    beforeAll(async () => {
        await gqlSaveLibrary(treeElementLibName, 'Test Tree Lib');
        await gqlSaveTree(treeName, 'Test Tree', [treeElementLibName]);
        await gqlSaveTree(otherTreeName, 'Test Tree', [treeElementLibName]);
        await gqlSaveVersionProfile(versionProfileName, 'Test Version Profile', [treeName]);
        await gqlSaveVersionProfile(versionProfileMultipleTreesName, 'Test Version Profile', [treeName, otherTreeName]);

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

        await gqlSaveAttribute({
            id: attrAdvForNullVersionName,
            type: AttributeTypes.ADVANCED,
            label: 'Test Attr',
            format: AttributeFormats.TEXT,
            versionsConf: {
                versionable: true,
                profile: versionProfileMultipleTreesName
            }
        });

        // Create libraries
        await gqlSaveLibrary(testLibName, 'Test Lib');

        // Second call needed to attach attribute
        await gqlSaveLibrary(testLibName, 'Test Lib', [attrAdvName, attrAdvForNullVersionName]);

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

        otherNodeElement1 = await gqlAddElemToTree(otherTreeName, {id: treeElement1, library: treeElementLibName});
        otherNodeElement2 = await gqlAddElemToTree(
            otherTreeName,
            {id: treeElement2, library: treeElementLibName},
            otherNodeElement1
        );

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
                                treeId: "${treeName}",
                                treeNodeId: "${nodeElement1}"
                            }
                        ]
                    }
                ) {
                    id_value
                    version {
                        treeId
                        treeNode {
                            id
                        }
                    }

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
                                treeId: "${treeName}",
                                treeNodeId: "${nodeElement2}"
                            }
                        ]
                    }
                ) {
                    id_value
                    version {
                        treeId
                        treeNode {
                            id
                        }
                    }

                    ... on Value {
                        value
                    }

                }
              }`);

        expect(resSaveValue.status).toBe(200);
        expect(resSaveValue.data.errors).toBeUndefined();
        expect(resSaveValue.data.data.v1.version).toBeDefined();
        expect(resSaveValue.data.data.v1.version[0].treeId).toBe(treeName);
        expect(resSaveValue.data.data.v1.version[0].treeNode.id).toBe(nodeElement1);

        const resGetValues1 = await makeGraphQlCall(`{
            r1: ${testLibNameFormatted}(
                version: {
                    treeId: "${treeName}",
                    treeNodeId: "${nodeElement1}"
                }
            ) {
                list {
                    property(attribute: "${attrAdvName}") {
                        version {
                            treeId
                            treeNode {
                                id
                            }
                        }

                        ... on Value {
                            value
                        }
                    }
                }
            }
        }`);
        expect(resGetValues1.status).toBe(200);
        expect(resGetValues1.data.errors).toBeUndefined();
        expect(resGetValues1.data.data.r1.list[0].property[0].version).toHaveLength(1);
        expect(resGetValues1.data.data.r1.list[0].property[0].version[0].treeNode.id).toBe(nodeElement1);

        const resGetValues2 = await makeGraphQlCall(`{
            r2: ${testLibNameFormatted}(
                version: {
                    treeId: "${treeName}",
                    treeNodeId: "${nodeElement2}"
                }
            ) {
                list {
                    property(attribute: "${attrAdvName}") {
                        version {
                            treeId
                            treeNode {
                                id
                            }
                        }

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
        expect(resGetValues2.data.data.r2.list[0].property[0].version).toHaveLength(1);
        expect(resGetValues2.data.data.r2.list[0].property[0].version[0].treeNode.id).toBe(nodeElement2);

        const resGetValues3 = await makeGraphQlCall(`{
            r3: ${testLibNameFormatted}(
                version: {
                    treeId: "${treeName}",
                    treeNodeId: "${nodeElement3}"
                }
            ) {
                list {
                    property(attribute: "${attrAdvName}") {
                        version {
                            treeId
                            treeNode {
                                id
                            }
                        }

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
        expect(resGetValues3.data.data.r3.list[0].property[0].version).toHaveLength(1);
        expect(resGetValues3.data.data.r3.list[0].property[0].version[0].treeNode.id).toBe(nodeElement2);
    });

    test('Save and get values with null versions', async () => {
        const resSaveValue = await makeGraphQlCall(`mutation {
            v1: saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrAdvForNullVersionName}",
                value: {
                    value: "TEST VAL 1",
                    version: [
                        {
                            treeId: "${treeName}",
                            treeNodeId: "${nodeElement2}"
                        },
                        {
                            treeId: "${otherTreeName}",
                            treeNodeId: null
                        }
                    ]
                }
            ) {
                id_value
                version {
                    treeId
                    treeNode {
                        id
                    }
                }
            },
            v2: saveValue(
                library: "${testLibName}",
                recordId: "${recordId}",
                attribute: "${attrAdvForNullVersionName}",
                value: {
                    value: "TEST VAL 2",
                    version: null
                }
            ) {
                id_value
                version {
                    treeId
                    treeNode {
                        id
                    }
                }
            }
          }`);

        expect(resSaveValue.status).toBe(200);
        expect(resSaveValue.data.errors).toBeUndefined();
        expect(resSaveValue.data.data.v1.version).toBeDefined();

        expect(resSaveValue.data.data.v1.version[0].treeId).toBe(treeName);
        expect(resSaveValue.data.data.v1.version[0].treeNode.id).toBe(nodeElement2);
        expect(resSaveValue.data.data.v1.version[1].treeId).toBe(otherTreeName);
        expect(resSaveValue.data.data.v1.version[1].treeNode).toBe(null);

        const resGetValues1 = await makeGraphQlCall(`{
            r1: ${testLibNameFormatted}(
                version: [
                    {
                        treeId: "${treeName}",
                        treeNodeId: "${nodeElement3}"
                    },
                    {
                        treeId: "${otherTreeName}",
                        treeNodeId: "${otherNodeElement2}"
                    }
                ]
            ) {
                list {
                    property(attribute: "${attrAdvForNullVersionName}") {
                        version {
                            treeId
                            treeNode {
                                id
                            }
                        }

                        ... on Value {
                            value
                        }
                    }
                }
            }
        }`);
        expect(resGetValues1.status).toBe(200);
        expect(resGetValues1.data.errors).toBeUndefined();

        const foundValue1 = resGetValues1.data.data.r1.list[0].property[0];
        expect(foundValue1.value).toBe('TEST VAL 1');
        expect(foundValue1.version).toHaveLength(2);
        expect(foundValue1.version[0].treeId).toBe(treeName);
        expect(foundValue1.version[0].treeNode.id).toBe(nodeElement2);

        expect(foundValue1.version[1].treeId).toBe(otherTreeName);
        expect(foundValue1.version[1].treeNode).toBe(null);

        const resGetValues2 = await makeGraphQlCall(`{
            r1: ${testLibNameFormatted}(
                version: [
                    {
                        treeId: "${treeName}",
                        treeNodeId: "${nodeElement1}"
                    },
                    {
                        treeId: "${otherTreeName}",
                        treeNodeId: "${otherNodeElement1}"
                    }
                ]
            ) {
                list {
                    property(attribute: "${attrAdvForNullVersionName}") {
                        version {
                            treeId
                            treeNode {
                                id
                            }
                        }

                        ... on Value {
                            value
                        }
                    }
                }
            }
        }`);
        expect(resGetValues2.status).toBe(200);
        expect(resGetValues2.data.errors).toBeUndefined();

        const foundValue2 = resGetValues2.data.data.r1.list[0].property[0];
        expect(foundValue2.value).toBe('TEST VAL 2');
    });
});
