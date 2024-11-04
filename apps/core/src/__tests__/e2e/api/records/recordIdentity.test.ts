// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {AttributeCondition} from '../../../../_types/record';
import {
    gqlAddElemToTree,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    gqlSaveValue,
    makeGraphQlCall
} from '../e2eUtils';

describe('Record identity', () => {
    // For regular identity (=own attribute)
    const testLibraryId = 'record_identity_library_test';
    let recordId;

    // For identity through link attribute
    const testLinkedIdentityLibraryId = 'record_identity_test_linked_identity';

    const testLinkedLibraryId = 'record_identity_test_linked_library';
    const testLinkAttributeId = 'record_identity_test_link_attribute';
    let recordIdLinkIdentity;
    let recordIdInLinkedLibrary;

    // For identity through tree attribute
    const testTreeIdentityLibraryId = 'record_library_test_tree_attribute';

    const testTreeId = 'record_identity_test_tree';
    const testTreeRecordLibraryId = 'record_identity_test_tree_record_library';
    const testTreeAttributeId = 'record_identity_test_tree_attribute';
    let recordIdTreeIdentity;
    let recordIdInTree;

    // Identity attributes
    const testLabelAttributeId = 'record_identity_test_label_attribute';
    const testColorAttributeId = 'record_identity_test_color_attribute';

    beforeAll(async () => {
        // Create base library
        await gqlSaveLibrary(testLibraryId, 'Test Lib');

        // Create color attribute
        await gqlSaveAttribute({
            id: testColorAttributeId,
            label: 'Test attribute',
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT
        });

        // Create label attribute
        await gqlSaveAttribute({
            id: testLabelAttributeId,
            label: 'Test attribute',
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT
        });

        await gqlSaveAttribute({
            id: testLinkAttributeId,
            label: 'Test attribute',
            type: AttributeTypes.ADVANCED_LINK,
            linkedLibrary: testLinkedLibraryId
        });

        await makeGraphQlCall(
            `mutation {
            saveLibrary(library: {
                id: "${testLinkedLibraryId}",
                label: {en: "Test Lib"},
                attributes: ["${testLabelAttributeId}", "${testColorAttributeId}"]
                recordIdentityConf: {
                    label: "${testLabelAttributeId}",
                    color: "${testColorAttributeId}",
                }
            }) { id }
        }`,
            true
        );

        await makeGraphQlCall(
            `mutation {
            saveLibrary(library: {
                id: "${testTreeRecordLibraryId}",
                label: {en: "Test Lib"},
                attributes: ["${testLabelAttributeId}", "${testColorAttributeId}"]
                recordIdentityConf: {
                    label: "${testLabelAttributeId}",
                    color: "${testColorAttributeId}",
                }
            }) { id }
        }`,
            true
        );

        await makeGraphQlCall(
            `mutation {
            saveLibrary(library: {
                id: "${testLinkedIdentityLibraryId}",
                label: {en: "Test Lib"},
                attributes: ["${testLinkAttributeId}"]
                recordIdentityConf: {
                    label: "${testLinkAttributeId}",
                    color: "${testLinkAttributeId}",
                }
            }) { id }
        }`,
            true
        );

        await gqlSaveLibrary(testLibraryId, 'Test Lib', [testLinkAttributeId]);

        await gqlSaveTree(testTreeId, 'Test tree', [testTreeRecordLibraryId]);
        await gqlSaveAttribute({
            id: testTreeAttributeId,
            label: 'Test attribute',
            linkedTree: testTreeId,
            type: AttributeTypes.TREE
        });

        await makeGraphQlCall(
            `mutation {
            saveLibrary(library: {
                id: "${testTreeIdentityLibraryId}",
                label: {en: "Test Lib"},
                attributes: ["${testTreeAttributeId}"],
                recordIdentityConf: {
                    label: "${testTreeAttributeId}",
                    color: "${testTreeAttributeId}",
                }
            }) { id }
        }`,
            true
        );

        const resCrea = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibraryId}") { record {id} }
            c2: createRecord(library: "${testLinkedIdentityLibraryId}") { record {id} }
            c3: createRecord(library: "${testTreeIdentityLibraryId}") { record {id} }
            c4: createRecord(library: "${testLinkedLibraryId}") { record {id} }
            c5: createRecord(library: "${testTreeRecordLibraryId}") { record {id} }
        }`);

        recordId = resCrea.data.data.c1.record.id;
        recordIdLinkIdentity = resCrea.data.data.c2.record.id;
        recordIdTreeIdentity = resCrea.data.data.c3.record.id;
        recordIdInLinkedLibrary = resCrea.data.data.c4.record.id;
        recordIdInTree = resCrea.data.data.c5.record.id;

        // Values for linked identity
        await gqlSaveValue(
            testLinkAttributeId,
            testLinkedIdentityLibraryId,
            recordIdLinkIdentity,
            recordIdInLinkedLibrary
        );
        await gqlSaveValue(testLabelAttributeId, testLinkedLibraryId, recordIdInLinkedLibrary, 'my linked label');
        await gqlSaveValue(testColorAttributeId, testLinkedLibraryId, recordIdInLinkedLibrary, '#123456');

        // Values for tree identity
        const nodeId = await gqlAddElemToTree(testTreeId, {id: recordIdInTree, library: testTreeRecordLibraryId});
        await gqlSaveValue(testTreeAttributeId, testTreeIdentityLibraryId, recordIdTreeIdentity, nodeId);
        await gqlSaveValue(testLabelAttributeId, testTreeRecordLibraryId, recordIdInTree, 'my tree label');
        await gqlSaveValue(testColorAttributeId, testTreeRecordLibraryId, recordIdInTree, '#654321');
    });

    test('Retrieve record identity', async () => {
        const res = await makeGraphQlCall(`
            {
                records(
                    library: "${testLibraryId}",
                    filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recordId}"}]
                ) {
                    list {
                        id
                        whoAmI { id library { id } label }
                    }
                }
            }
        `);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.records.list[0].whoAmI.id).toBe(recordId);
        expect(res.data.data.records.list[0].whoAmI.library.id).toBe(testLibraryId);
        expect(res.data.data.records.list[0].whoAmI.label).toBe(null);
    });

    test('Retrieve label based on link attribute', async () => {
        const res = await makeGraphQlCall(`
            {
                records(
                    library: "${testLinkedIdentityLibraryId}",
                    filters: [
                        {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recordIdLinkIdentity}"}
                    ]
                ) {
                    list {
                        id
                        whoAmI { id library { id } label color }
                    }
                }
            }
        `);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.records.list[0].whoAmI.label).toBe('my linked label');
        expect(res.data.data.records.list[0].whoAmI.color).toBe('#123456');
    });

    test('Retrieve label based on tree attribute', async () => {
        const res = await makeGraphQlCall(`
            {
                records(
                    library: "${testTreeIdentityLibraryId}",
                    filters: [
                        {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recordIdTreeIdentity}"}
                    ]
                ) {
                    list {
                        id
                        whoAmI { id library { id } label color}
                    }
                }
            }
        `);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.records.list[0].whoAmI.label).toBe('my tree label');
        expect(res.data.data.records.list[0].whoAmI.color).toBe('#654321');
    });
});
