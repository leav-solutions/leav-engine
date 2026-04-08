// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {AttributeCondition} from '../../../../_types/record';
import {
    adminUserSdk,
    gqlAddElemToTree,
    gqlSaveAttribute,
    gqlSaveTree,
    gqlSaveValue,
    makeGraphQlCall,
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
        await adminUserSdk.SaveLibrary({library: {id: testLibraryId, label: {en: 'Test Lib'}}});

        // Create color attribute
        await gqlSaveAttribute({
            id: testColorAttributeId,
            label: 'Test attribute',
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
        });

        // Create label attribute
        await gqlSaveAttribute({
            id: testLabelAttributeId,
            label: 'Test attribute',
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
        });

        await gqlSaveAttribute({
            id: testLinkAttributeId,
            label: 'Test attribute',
            type: AttributeTypes.ADVANCED_LINK,
            linkedLibrary: testLinkedLibraryId,
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
        );

        await adminUserSdk.SaveLibrary({
            library: {id: testLibraryId, label: {en: 'Test Lib'}, attributes: [testLinkAttributeId]},
        });

        await gqlSaveTree(testTreeId, 'Test tree', [testTreeRecordLibraryId]);
        await gqlSaveAttribute({
            id: testTreeAttributeId,
            label: 'Test attribute',
            linkedTree: testTreeId,
            type: AttributeTypes.TREE,
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
            recordIdInLinkedLibrary,
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

    describe('Parent context', () => {
        const parentContextLibraryId = 'record_identity_parent_context_library';
        const parentLibraryId = 'record_identity_parent_library';
        const grandParentLibraryId = 'record_identity_grandparent_library';
        const parentLinkAttributeId = 'record_identity_parent_link_attribute';
        const grandParentLinkAttributeId = 'record_identity_grandparent_link_attribute';
        const parentLabelAttributeId = 'record_identity_parent_label_attribute';

        let childRecordId;
        let parentRecordId;
        let grandParentRecordId;

        beforeAll(async () => {
            // Create label attribute for parent context
            await gqlSaveAttribute({
                id: parentLabelAttributeId,
                label: 'Parent Label Attribute',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
            });

            // Create grandparent library
            await makeGraphQlCall(`
                mutation {
                    saveLibrary(library: {
                        id: "${grandParentLibraryId}",
                        label: {en: "GrandParent Library"},
                        attributes: ["${parentLabelAttributeId}"],
                        recordIdentityConf: {
                            label: "${parentLabelAttributeId}"
                        }
                    }) { id }
                }
            `);

            // Create link attribute for grandparent
            await gqlSaveAttribute({
                id: grandParentLinkAttributeId,
                label: 'GrandParent Link Attribute',
                type: AttributeTypes.SIMPLE_LINK,
                linkedLibrary: grandParentLibraryId,
            });

            // Create parent library with parentContext pointing to grandparent
            await makeGraphQlCall(`
                mutation {
                    saveLibrary(library: {
                        id: "${parentLibraryId}",
                        label: {en: "Parent Library"},
                        attributes: ["${parentLabelAttributeId}", "${grandParentLinkAttributeId}"],
                        recordIdentityConf: {
                            label: "${parentLabelAttributeId}",
                            parentContext: "${grandParentLinkAttributeId}"
                        }
                    }) { id }
                }
            `);

            // Create link attribute for parent
            await gqlSaveAttribute({
                id: parentLinkAttributeId,
                label: 'Parent Link Attribute',
                type: AttributeTypes.SIMPLE_LINK,
                linkedLibrary: parentLibraryId,
            });

            // Create child library with parentContext pointing to parent
            await makeGraphQlCall(`
                mutation {
                    saveLibrary(library: {
                        id: "${parentContextLibraryId}",
                        label: {en: "Child Library"},
                        attributes: ["${parentLinkAttributeId}"],
                        recordIdentityConf: {
                            parentContext: "${parentLinkAttributeId}"
                        }
                    }) { id }
                }
            `);

            // Create records
            const resCreate = await makeGraphQlCall(`
                mutation {
                    grandparent: createRecord(library: "${grandParentLibraryId}") { record { id } }
                    parent: createRecord(library: "${parentLibraryId}") { record { id } }
                    child: createRecord(library: "${parentContextLibraryId}") { record { id } }
                }
            `);

            grandParentRecordId = resCreate.data.data.grandparent.record.id;
            parentRecordId = resCreate.data.data.parent.record.id;
            childRecordId = resCreate.data.data.child.record.id;

            // Set up parent context chain
            await gqlSaveValue(parentLabelAttributeId, grandParentLibraryId, grandParentRecordId, 'GrandParent Label');
            await gqlSaveValue(grandParentLinkAttributeId, parentLibraryId, parentRecordId, grandParentRecordId);
            await gqlSaveValue(parentLabelAttributeId, parentLibraryId, parentRecordId, 'Parent Label');
            await gqlSaveValue(parentLinkAttributeId, parentContextLibraryId, childRecordId, parentRecordId);
        });

        test('Retrieve record identity with parent context', async () => {
            const res = await makeGraphQlCall(`
                {
                    records(
                        library: "${parentContextLibraryId}",
                        filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${childRecordId}"}]
                    ) {
                        list {
                            id
                            whoAmI {
                                id
                                library { id }
                                parentContext {
                                    id
                                    library { id }
                                    label
                                }
                            }
                        }
                    }
                }
            `);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list[0].whoAmI.id).toBe(childRecordId);
            expect(res.data.data.records.list[0].whoAmI.parentContext).toHaveLength(2);

            // First should be parent
            expect(res.data.data.records.list[0].whoAmI.parentContext[0].id).toBe(parentRecordId);
            expect(res.data.data.records.list[0].whoAmI.parentContext[0].library.id).toBe(parentLibraryId);
            expect(res.data.data.records.list[0].whoAmI.parentContext[0].label).toBe('Parent Label');

            // Second should be grandparent
            expect(res.data.data.records.list[0].whoAmI.parentContext[1].id).toBe(grandParentRecordId);
            expect(res.data.data.records.list[0].whoAmI.parentContext[1].library.id).toBe(grandParentLibraryId);
            expect(res.data.data.records.list[0].whoAmI.parentContext[1].label).toBe('GrandParent Label');
        });

        test('Retrieve record identity without parent context when not configured', async () => {
            const res = await makeGraphQlCall(`
                {
                    records(
                        library: "${testLibraryId}",
                        filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recordId}"}]
                    ) {
                        list {
                            id
                            whoAmI {
                                id
                                parentContext {
                                    id
                                }
                            }
                        }
                    }
                }
            `);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list[0].whoAmI.parentContext).toBeNull();
        });

        test('Retrieve single level parent context', async () => {
            const res = await makeGraphQlCall(`
                {
                    records(
                        library: "${parentLibraryId}",
                        filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${parentRecordId}"}]
                    ) {
                        list {
                            id
                            whoAmI {
                                id
                                parentContext {
                                    id
                                    library { id }
                                    label
                                }
                            }
                        }
                    }
                }
            `);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list[0].whoAmI.parentContext).toHaveLength(1);
            expect(res.data.data.records.list[0].whoAmI.parentContext[0].id).toBe(grandParentRecordId);
            expect(res.data.data.records.list[0].whoAmI.parentContext[0].library.id).toBe(grandParentLibraryId);
            expect(res.data.data.records.list[0].whoAmI.parentContext[0].label).toBe('GrandParent Label');
        });
    });
});
