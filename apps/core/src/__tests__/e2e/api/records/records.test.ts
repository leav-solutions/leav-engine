// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {AttributeCondition, TreeCondition} from '../../../../_types/record';
import {
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    gqlSaveValue,
    makeGraphQlCall
} from '../e2eUtils';
import {adminUserId} from '../../../../_constants/users';
import {usersLibraryId} from '../../../../_constants/libraries';
import {AttributePermissionsActions} from '../../../../_types/permissions';
import {FormElementTypes} from '../../../../_types/forms';

describe('Records', () => {
    describe('Creation', () => {
        const testLibName = 'record_library_test';
        const testLibLink = 'library_link_test';
        const testTreeName = 'test_tree';
        const testAttributeId = 'create_record_test_attribute';
        const testLinkAttributeId = 'create_record_test_link_attribute';
        const testTreeAttributeId = 'create_record_test_tree_attribute';

        beforeAll(async () => {
            // Attribute and library setup
            await gqlSaveAttribute({
                id: testAttributeId,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                required: true,
                label: 'test'
            });
            await gqlSaveAttribute({
                id: testLinkAttributeId,
                type: AttributeTypes.SIMPLE_LINK,
                linkedLibrary: testLibLink,
                required: true,
                label: 'test_link'
            });
            await gqlSaveAttribute({
                id: testTreeAttributeId,
                type: AttributeTypes.TREE,
                multipleValues: false,
                label: 'Test Tree attribute',
                linkedTree: testTreeName
            });

            await gqlSaveLibrary(testLibName, 'Test', [testAttributeId, testLinkAttributeId, testTreeAttributeId]);
            await gqlSaveLibrary(testLibLink, 'Test2', [testAttributeId]);
            await gqlSaveTree(testTreeName, 'Test tree', [testLibName]);

            // Create and activate a record for later use
            const resultCreation = await makeGraphQlCall(`mutation {
                c1: createEmptyRecord(library: "${testLibName}") { record { id } }
            }`);
            const resCreationLink = await makeGraphQlCall(`mutation {
                linkRecordCreated: createEmptyRecord(library: "${testLibLink}") { record { id } },
            }`);
            const recordId = resultCreation.data.data.c1.record.id;
            await makeGraphQlCall(
                `mutation {
                    saveValue(library: "${testLibName}", recordId: "${recordId}", attribute: "${testAttributeId}", value: {
                        payload: "test value"
                    }) { id_value }
                }`,
                true
            );
            await makeGraphQlCall(
                `mutation {
                    saveValue(library: "${testLibName}", recordId: "${recordId}", attribute: "${testLinkAttributeId}", value: {
                        payload: "${resCreationLink.data.data.linkRecordCreated.record.id}"
                    }) { id_value }
                }`,
                true
            );
            await makeGraphQlCall(`mutation {
                a1: activateNewRecord(library: "${testLibName}", recordId: "${recordId}", formId: "creation") {
                    record { id }
                    valuesErrors { message }
                }
            }`);
            await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId});
        });
        afterAll(async () => {
            // Clean up test data for Creation
            // Purge all records in the test library using purgeRecord
            const recordsRes = await makeGraphQlCall(`{
                records(library: "${testLibName}", retrieveInactive: true) {
                    list { id }
                }
            }`);
            const recordIds = recordsRes.data.data.records.list.map((r: {id: string}) => r.id);
            for (const id of recordIds) {
                await makeGraphQlCall(
                    `mutation { purgeRecord(libraryId: "${testLibName}", recordId: "${id}") { id } }`
                );
            }

            // unlink attributes before deleting them
            await gqlSaveLibrary(testLibName, 'Test', []);
            await gqlSaveLibrary(testLibLink, 'Test2', []);

            // Need to delete attribute BEFORE library,
            // Otherwise cache is not deleted and the next saveAttribute will try to update it
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testAttributeId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testLinkAttributeId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testTreeAttributeId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${testLibName}") { id } }`);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${testLibLink}") { id } }`);
            await makeGraphQlCall(`mutation { deleteTree(id: "${testTreeName}") { id } }`);
        });
        test('Create Empty records', async () => {
            // Create an empty record and check its initial state (not active, has permissions)
            const res = await makeGraphQlCall(`mutation {
                c1: createEmptyRecord(library: "${testLibName}") { record { id permissions {edit_record} active } }
            }`);

            expect(res.status).toBe(200);

            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.c1.record.id).toBeTruthy();
            expect(res.data.data.c1.record.permissions.edit_record).toBeDefined();
            expect(res.data.data.c1.record.active).toEqual(false);
        });

        test('Should NOT activate a new record when required fields are missing', async () => {
            // Create an empty record without required fields
            const resCreation = await makeGraphQlCall(`mutation {
                recordCreated: createEmptyRecord(library: "${testLibName}") { record { id } },
            }`);
            expect(resCreation.status).toBe(200);

            // Try to activate the record, expecting validation errors for missing required fields
            const resActivation = await makeGraphQlCall(`mutation {
                recordActivated: activateNewRecord(library: "${testLibName}", recordId: "${resCreation.data.data.recordCreated.record.id}", formId: "creation") {
                    record {
                        id
                    }
                    valuesErrors {
                        attribute
                        message
                    }
                }
            }`);

            expect(resActivation.status).toBe(200);

            expect(resActivation.data.errors).toBeUndefined();
            expect(resActivation.data.data.recordActivated.record).toBe(null);
            expect(resActivation.data.data.recordActivated.valuesErrors[0].message).toBe(
                'Attribute test_link is required'
            );
            expect(resActivation.data.data.recordActivated.valuesErrors[1].message).toBe('Attribute test is required');
        });

        test('Should activate a new record when all required fields are filled', async () => {
            // Create an empty record
            const resCreation = await makeGraphQlCall(`mutation {
                recordCreated: createEmptyRecord(library: "${testLibName}") { record { id } },
                }`);
            expect(resCreation.status).toBe(200);

            // Create a linked record for the required link attribute
            const resCreationLink = await makeGraphQlCall(`mutation {
                linkRecordCreated: createEmptyRecord(library: "${testLibLink}") { record { id } },
            }`);
            expect(resCreationLink.status).toBe(200);

            // Fill required simple attribute
            await makeGraphQlCall(
                `mutation {
                saveValue(library: "${testLibName}", recordId: "${resCreation.data.data.recordCreated.record.id}", attribute: "${testAttributeId}", value: {
                    payload: "test value"
                }) {
                    id_value
                }
            }`,
                true
            );
            // Fill required link attribute
            await makeGraphQlCall(
                `mutation {
                saveValue(library: "${testLibName}", recordId: "${resCreation.data.data.recordCreated.record.id}", attribute: "${testLinkAttributeId}", value: {
                    payload: "${resCreationLink.data.data.linkRecordCreated.record.id}"
                }) {
                    id_value
                }
            }`,
                true
            );
            // Try to activate the record, expecting success (no validation errors)
            const resActivation = await makeGraphQlCall(`mutation {
                recordActivated: activateNewRecord(library: "${testLibName}", recordId: "${resCreation.data.data.recordCreated.record.id}", formId: "creation") {
                    record {
                        id
                    }
                    valuesErrors {
                        attribute
                        message
                    }
                }
            }`);

            expect(resActivation.status).toBe(200);

            expect(resActivation.data.errors).toBeUndefined();
            expect(resActivation.data.data.recordActivated.record).toEqual({
                id: resCreation.data.data.recordCreated.record.id
            });
            expect(resActivation.data.data.recordActivated.valuesErrors).toEqual(null);
        });

        describe('Dependent form with required attributes', () => {
            const dependentAttrId = 'dependent_required_attr';
            const formWithDependency = 'creation_with_dependency';

            beforeAll(async () => {
                // Create a required attribute that will be in a dependent form element
                await gqlSaveAttribute({
                    id: dependentAttrId,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    required: true,
                    label: 'dependent required'
                });
                await gqlSaveLibrary(testLibName, 'Test', [
                    testAttributeId,
                    testLinkAttributeId,
                    testTreeAttributeId,
                    dependentAttrId
                ]);

                // Create a form with a dependent element that is never triggered (dependencyValue never set)
                await makeGraphQlCall(`mutation {
                    saveForm(form: {
                        id: "${formWithDependency}",
                        library: "${testLibName}",
                        elements: [
                            {
                                dependencyValue: {
                                    attribute: "never_triggered",
                                    value: "${testTreeAttributeId}"
                                },
                                elements: [
                                    {
                                        id: "dep_elem",
                                        containerId: "dep_elem_1",
                                        order: 0,
                                        uiElementType: "input_field",
                                        type: ${FormElementTypes.field},
                                        settings: [{ 
                                            key: "attribute",
                                            value: "${dependentAttrId}"
                                        }]
                                    }
                                ]
                            }
                        ]
                    }) { id }
                }`);
            });
            afterAll(async () => {
                await makeGraphQlCall(
                    `mutation { deleteForm(library: "${testLibName}", id: "${formWithDependency}") { id } }`
                );

                await gqlSaveLibrary(testLibName, 'Test', [testAttributeId, testLinkAttributeId, testTreeAttributeId]); // remove dependentAttrId attribute from lib before delete
                await makeGraphQlCall(`mutation { deleteAttribute(id: "${dependentAttrId}") { id } }`, true);
            });

            test('Should activate a new record even if a required field is only in a dependent form (so not filled)', async () => {
                // Create a record without filling the dependent attribute
                const resCreation = await makeGraphQlCall(`mutation {
                    recordCreated: createEmptyRecord(library: "${testLibName}") { record { id } }
                }`);
                expect(resCreation.status).toBe(200);

                // Try to activate the record: no need to fill any attributes
                // should succeed, as the required attribute is not displayed (dependency not triggered)
                const resActivation = await makeGraphQlCall(`mutation {
                    recordActivated: activateNewRecord(
                        library: "${testLibName}",
                        recordId: "${resCreation.data.data.recordCreated.record.id}",
                        formId: "creation_with_dependency") {
                            record { id }
                            valuesErrors { attribute message }
                        }
                }`);

                expect(resActivation.status).toBe(200);
                expect(resActivation.data.errors).toBeUndefined();
                expect(resActivation.data.data.recordActivated.record).toEqual({
                    id: resCreation.data.data.recordCreated.record.id
                });
                expect(resActivation.data.data.recordActivated.valuesErrors).toEqual(null);
            });
        });

        test('should purge the new record when cancel creation', async () => {
            // Create a new record
            const resCreation = await makeGraphQlCall(`mutation {
                c1: createEmptyRecord(library: "${testLibName}") { record { id } }
            }`);
            expect(resCreation.status).toBe(200);

            // Purge (delete) the record before activation
            const resPurge = await makeGraphQlCall(`mutation {
                p1: purgeRecord(libraryId: "${testLibName}", recordId: "${resCreation.data.data.c1.record.id}") { id }
            }`);

            expect(resPurge.status).toBe(200);
            expect(resPurge.data.errors).toBeUndefined();
            expect(resPurge.data.data.p1.id).toBe(resCreation.data.data.c1.record.id);

            // Check that the record no longer exists (even among inactive records)
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${resPurge.data.data.p1.id}"}],
                    retrieveInactive: true
                ) {
                    list {
                        id
                    }
                }
            }`);
            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.records.list.length).toBe(0);
        });
    });

    describe('Get records', () => {
        const testLibName = 'record_library_test';
        const testLibLink = 'library_link_test';
        const testTreeName = 'test_tree';
        const testAttributeId = 'create_record_test_attribute';
        const testLinkAttributeId = 'create_record_test_link_attribute';
        const testTreeAttributeId = 'create_record_test_tree_attribute';

        let recordId: string;
        let recordNode: string;

        beforeAll(async () => {
            // Attribute and library setup
            await gqlSaveAttribute({
                id: testAttributeId,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                required: false,
                label: 'test'
            });
            await gqlSaveAttribute({
                id: testLinkAttributeId,
                type: AttributeTypes.SIMPLE_LINK,
                linkedLibrary: testLibLink,
                required: false,
                label: 'test_link'
            });
            await gqlSaveAttribute({
                id: testTreeAttributeId,
                type: AttributeTypes.TREE,
                multipleValues: false,
                label: 'Test Tree attribute',
                linkedTree: testTreeName
            });

            await gqlSaveLibrary(testLibName, 'Test', [testAttributeId, testLinkAttributeId, testTreeAttributeId]);
            await gqlSaveLibrary(testLibLink, 'Test2', [testAttributeId]);
            await gqlSaveTree(testTreeName, 'Test tree', [testLibName]);

            // Create and activate a record for later use
            const resultCreation = await makeGraphQlCall(`mutation {
                c1: createEmptyRecord(library: "${testLibName}") { record { id } }
            }`);
            const resCreationLink = await makeGraphQlCall(`mutation {
                linkRecordCreated: createEmptyRecord(library: "${testLibLink}") { record { id } },
            }`);
            recordId = resultCreation.data.data.c1.record.id;
            await makeGraphQlCall(
                `mutation {
                    saveValue(library: "${testLibName}", recordId: "${recordId}", attribute: "${testAttributeId}", value: {
                        payload: "test value"
                    }) { id_value }
                }`,
                true
            );
            await makeGraphQlCall(
                `mutation {
                    saveValue(library: "${testLibName}", recordId: "${recordId}", attribute: "${testLinkAttributeId}", value: {
                        payload: "${resCreationLink.data.data.linkRecordCreated.record.id}"
                    }) { id_value }
                }`,
                true
            );
            await makeGraphQlCall(`mutation {
                a1: activateNewRecord(library: "${testLibName}", recordId: "${recordId}", formId: "creation") {
                    record { id }
                    valuesErrors { message }
                }
            }`);
            recordNode = await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId});
        });
        afterAll(async () => {
            // Clean up test data for Get records
            // Purge all records in the test library using purgeRecord
            const recordsRes = await makeGraphQlCall(`{
                records(library: "${testLibName}", retrieveInactive: true) {
                    list { id }
                }
            }`);
            const recordIds = recordsRes.data.data.records.list.map((r: {id: string}) => r.id);
            for (const id of recordIds) {
                await makeGraphQlCall(
                    `mutation { purgeRecord(libraryId: "${testLibName}", recordId: "${id}") { id } }`
                );
            }

            // unlink attributes before deleting them
            await gqlSaveLibrary(testLibName, 'Test', []);
            await gqlSaveLibrary(testLibLink, 'Test2', []);

            // Need to delete attribute BEFORE library,
            // Otherwise cache is not deleted and the next saveAttribute will try to update it
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testAttributeId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testLinkAttributeId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testTreeAttributeId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${testLibName}") { id } }`);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${testLibLink}") { id } }`);
            await makeGraphQlCall(`mutation { deleteTree(id: "${testTreeName}") { id } }`);
        });
        test('Create and activate records', async () => {
            const res = await makeGraphQlCall(`mutation {
                c0: createEmptyRecord(library: "${testLibName}") { record { id permissions {edit_record} active } }
                c1: createEmptyRecord(library: "${testLibName}") { record { id } }
                c2: createEmptyRecord(library: "${testLibName}") { record { id } }
                c3: createEmptyRecord(library: "${testLibName}") { record { id } }
                c4: createEmptyRecord(library: "${testLibName}") { record { id } }
                c5: createEmptyRecord(library: "${testLibName}") { record { id } }
                c6: createEmptyRecord(library: "${testLibName}") { record { id } }
                c7: createEmptyRecord(library: "${testLibName}") { record { id } }
                c8: createEmptyRecord(library: "${testLibName}") { record { id } }
                c9: createEmptyRecord(library: "${testLibName}") { record { id } }
            }`);
            expect(res.status).toBe(200);

            const recordIds = Object.keys(res.data.data).map(key => res.data.data[key].record.id);

            // On active chaque record et on vérifie le résultat
            await Promise.all(
                recordIds.map(async (id, idx) => {
                    const activateRes = await makeGraphQlCall(`mutation {
                        a${idx}: activateNewRecord(library: "${testLibName}", recordId: "${id}", formId: "creation") {
                            valuesErrors {
                                message
                            }
                        }
                    }`);
                    expect(activateRes.status).toBe(200);
                    expect(activateRes.data.data[`a${idx}`].valuesErrors).toEqual(null);
                })
            );
        });

        test('Get records filtered by ID', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recordId}"}]
                ) {
                    list {
                        id
                        permissions {edit_record}
                    }
                }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(1);
            expect(res.data.data.records.list[0].id).toBe(recordId);
            expect(res.data.data.records.list[0].permissions.edit_record).toBeDefined();
        });

        test('Get library details on a record', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recordId}"}]
                ) {
                    list {
                        id
                        library { id }
                        }
                    }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list[0].library.id).toBe(testLibName);
        });

        test('Get record with properties', async () => {
            const result = await makeGraphQlCall(`{
                records(
                    library: "${usersLibraryId}",
                    filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${adminUserId}"}]
                ) {
                    list {
                        properties(attributeIds: ["created_at", "created_by", "user_groups"]) {
                            attributeId
                            attributeProperties {
                                id
                            }
                            recordAttributePermissions {
                                ${AttributePermissionsActions.EDIT_VALUE}
                                ${AttributePermissionsActions.ACCESS_ATTRIBUTE}
                            }
                            values {
                                id_value
                                ... on Value {
                                    valuePayload: payload
                                }
                                ... on LinkValue {
                                    linkPayload: payload {
                                        whoAmI {
                                            label
                                        }
                                    }
                                }
                                ... on TreeValue {
                                    treePayload: payload {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            }`);

            expect(result.data.errors).toBeUndefined();
            expect(result.status).toBe(200);
            expect(result.data.data.records.list[0].properties).toEqual([
                {
                    attributeId: 'created_at',
                    attributeProperties: {
                        id: 'created_at'
                    },
                    recordAttributePermissions: {
                        [AttributePermissionsActions.EDIT_VALUE]: true,
                        [AttributePermissionsActions.ACCESS_ATTRIBUTE]: true
                    },
                    values: [
                        {
                            id_value: null,
                            valuePayload: expect.any(Number)
                        }
                    ]
                },
                {
                    attributeId: 'created_by',
                    attributeProperties: {
                        id: 'created_by'
                    },
                    recordAttributePermissions: {
                        [AttributePermissionsActions.EDIT_VALUE]: true,
                        [AttributePermissionsActions.ACCESS_ATTRIBUTE]: true
                    },
                    values: [
                        {
                            id_value: null,
                            linkPayload: {
                                whoAmI: {
                                    label: 'system'
                                }
                            }
                        }
                    ]
                },
                {
                    attributeId: 'user_groups',
                    attributeProperties: {
                        id: 'user_groups'
                    },
                    recordAttributePermissions: {
                        [AttributePermissionsActions.EDIT_VALUE]: true,
                        [AttributePermissionsActions.ACCESS_ATTRIBUTE]: true
                    },
                    values: [
                        {
                            id_value: expect.any(String),
                            treePayload: {
                                id: '1'
                            }
                        }
                    ]
                }
            ]);
        });

        test('Get record properties with record attribute permissions', async () => {
            // Add/set permissions to the requested attribute
            await makeGraphQlCall(`mutation {
                saveAttribute(attribute: {
                    id: "${testAttributeId}",
                    permissions_conf: {permissionTreeAttributes: ["${testTreeAttributeId}"], relation: and}
                }) {
                    permissions_conf {
                        permissionTreeAttributes {
                            id
                        }
                        relation
                    }
                }
            }`);

            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: record_attribute,
                        applyTo: "${testAttributeId}",
                        usersGroup: null,
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${recordNode}"
                        },
                        actions: [
                            {name: access_attribute, allowed: true},
                            {name: edit_value, allowed: false}
                        ]
                    }
                ) { type }
            }`);

            // Set a value for the tree attribute on which permissions are based
            await gqlSaveValue(testTreeAttributeId, testLibName, recordId, recordNode);

            const result = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${recordId}"}]
                ) {
                    list {
                        properties(attributeIds: ["${testAttributeId}"]) {
                            attributeId
                            recordAttributePermissions {
                                ${AttributePermissionsActions.EDIT_VALUE}
                                ${AttributePermissionsActions.ACCESS_ATTRIBUTE}
                            }
                        }
                    }
                }
            }`);

            expect(result.data.errors).toBeUndefined();
            expect(result.status).toBe(200);
            expect(result.data.data.records.list[0].properties).toEqual([
                {
                    attributeId: testAttributeId,
                    recordAttributePermissions: {
                        [AttributePermissionsActions.EDIT_VALUE]: false,
                        [AttributePermissionsActions.ACCESS_ATTRIBUTE]: true
                    }
                }
            ]);
        });

        test('Get record identity', async () => {
            const res = await makeGraphQlCall(`
                {
                    records(
                        library: "${testLibName}",
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
            expect(res.data.data.records.list[0].whoAmI.library.id).toBe(testLibName);
            expect(res.data.data.records.list[0].whoAmI.label).toBe(null);
        });

        test('Get records paginated', async () => {
            const firstCallRes = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    pagination: {limit: 3, offset: 0}
                ) {
                    totalCount
                    cursor {next prev}
                    list {id}
                }
            }`);

            expect(firstCallRes.data.errors).toBeUndefined();
            expect(firstCallRes.status).toBe(200);
            expect(firstCallRes.data.data.records.list.length).toBe(3);
            expect(firstCallRes.data.data.records.totalCount).toBeGreaterThan(
                firstCallRes.data.data.records.list.length
            );
            expect(firstCallRes.data.data.records.cursor.next).toBeTruthy();

            const cursorCallRes = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    pagination: {
                        limit: 5,
                        cursor: "${firstCallRes.data.data.records.cursor.next}"
                    }) {
                        totalCount
                        cursor {next prev}
                        list {id}
                    }
                }
            `);

            expect(cursorCallRes.data.errors).toBeUndefined();
            expect(cursorCallRes.data.data.records.list.length).toBe(5);
            expect(cursorCallRes.data.data.records.cursor.next).toBeTruthy();
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

    describe('Sort/filter', () => {
        const sfTestLibId = 'records_sort_filter_test_lib';
        const sfTestLibLinkId = 'records_sort_filter_test_lib_linked';
        const sfTestLibTreeId = 'records_sort_filter_test_lib_tree';
        const testTreeId = 'records_sf_test_tree';
        const testSimpleAttrId = 'records_sort_filter_test_attr_simple';
        const testSimpleAttrId2 = 'records_sort_filter_test_attr_simple2';
        const testSimpleExtAttrId = 'records_sort_filter_test_attr_simple_extended';
        const testSimpleLinkAttrId = 'records_sort_filter_test_attr_simple_link';
        const testAdvAttrId = 'records_sort_filter_test_attr_adv';
        const testAdvLinkAttrId = 'records_sort_filter_test_attr_adv_link';
        const testAdvRevLinkAttrId = 'records_sort_filter_test_attr_adv_rev_link';
        const testAdvRevLinkToSimpleLinkAttrId = 'records_sort_filter_test_attr_adv_rev_link_to_simple_link';
        const testTreeAttrId = 'records_sort_filter_test_attr_tree';
        const testAdvThroughLinkAttrId = 'records_sort_filter_test_attr_adv_through_link';

        let sfRecord1: string;
        let sfRecord2: string;
        let sfRecord3: string;
        let sfLinkedRecord1: string;
        let sfLinkedRecord2: string;
        let sfLinkedRecord3: string;
        let sfTreeRecord1: string;
        let nodeTreeRecord1: string;
        let sfTreeRecord2: string;
        let nodeTreeRecord2: string;
        let sfTreeRecord3: string;
        let nodeTreeRecord3: string;
        let sfTreeRecord4: string;
        let nodeTreeRecord4: string;
        let sfTreeRecord5: string;
        let nodeTreeRecord5: string;
        let sfTreeRecord6: string;

        beforeAll(async () => {
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
                id: testSimpleAttrId2,
                type: AttributeTypes.SIMPLE,
                label: 'test 2',
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
                id: testAdvRevLinkAttrId,
                type: AttributeTypes.ADVANCED_LINK,
                label: 'test',
                linkedLibrary: sfTestLibId,
                reverseLink: testAdvLinkAttrId
            });
            await gqlSaveAttribute({
                id: testAdvRevLinkToSimpleLinkAttrId,
                type: AttributeTypes.ADVANCED_LINK,
                label: 'test',
                linkedLibrary: sfTestLibId,
                reverseLink: testSimpleLinkAttrId
            });
            await gqlSaveAttribute({
                id: testTreeAttrId,
                type: AttributeTypes.TREE,
                label: 'test',
                linkedTree: testTreeId
            });
            await gqlSaveAttribute({
                id: testAdvThroughLinkAttrId,
                type: AttributeTypes.ADVANCED,
                label: 'test',
                format: AttributeFormats.TEXT
            });

            // Save attributes on libs
            await gqlSaveLibrary(sfTestLibId, 'Test', [
                testSimpleAttrId,
                testSimpleAttrId2,
                testSimpleExtAttrId,
                testAdvAttrId,
                testSimpleLinkAttrId,
                testAdvLinkAttrId,
                testTreeAttrId
            ]);
            await gqlSaveLibrary(sfTestLibLinkId, 'Test', [
                testSimpleAttrId,
                testAdvThroughLinkAttrId,
                testAdvRevLinkAttrId,
                testAdvRevLinkToSimpleLinkAttrId
            ]);
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
            sfTreeRecord4 = await gqlCreateRecord(sfTestLibTreeId);
            sfTreeRecord5 = await gqlCreateRecord(sfTestLibTreeId);
            sfTreeRecord6 = await gqlCreateRecord(sfTestLibTreeId);

            // Save values on linked records
            await makeGraphQlCall(`mutation {
                v1: saveValue(
                    library: "${sfTestLibLinkId}",
                    recordId: "${sfLinkedRecord1}",
                    attribute: "${testSimpleAttrId}",
                    value: {payload: "C"}) { id_value }
                v2: saveValue(
                    library: "${sfTestLibLinkId}",
                    recordId: "${sfLinkedRecord2}",
                    attribute: "${testSimpleAttrId}",
                    value: {payload: "A"}) { id_value }
                v3: saveValue(
                    library: "${sfTestLibLinkId}",
                    recordId: "${sfLinkedRecord3}",
                    attribute: "${testSimpleAttrId}",
                    value: {payload: "B"}) { id_value }
                v4: saveValue(
                    library: "${sfTestLibLinkId}",
                    recordId: "${sfLinkedRecord1}",
                    attribute: "${testAdvThroughLinkAttrId}",
                    value: {payload: "adv_value"}) { id_value }
            }`);

            // Save values on tree records
            await makeGraphQlCall(`mutation {
                v1: saveValue(
                    library: "${sfTestLibTreeId}",
                    recordId: "${sfTreeRecord1}",
                    attribute: "${testSimpleAttrId}",
                    value: {payload: "C"}) { id_value }
                v2: saveValue(
                    library: "${sfTestLibTreeId}",
                    recordId: "${sfTreeRecord2}",
                    attribute: "${testSimpleAttrId}",
                    value: {payload: "A"}) { id_value }
                v3: saveValue(
                    library: "${sfTestLibTreeId}",
                    recordId: "${sfTreeRecord3}",
                    attribute: "${testSimpleAttrId}",
                    value: {payload: "B"}) { id_value }
            }`);

            // Add element to tree
            nodeTreeRecord1 = await gqlAddElemToTree(testTreeId, {id: sfTreeRecord1, library: sfTestLibTreeId});
            nodeTreeRecord2 = await gqlAddElemToTree(testTreeId, {id: sfTreeRecord2, library: sfTestLibTreeId});
            nodeTreeRecord3 = await gqlAddElemToTree(testTreeId, {id: sfTreeRecord3, library: sfTestLibTreeId});

            // Add branch to tree to test classified / not classified filters
            nodeTreeRecord4 = await gqlAddElemToTree(testTreeId, {id: sfTreeRecord4, library: sfTestLibTreeId});
            nodeTreeRecord5 = await gqlAddElemToTree(
                testTreeId,
                {id: sfTreeRecord5, library: sfTestLibTreeId},
                nodeTreeRecord4
            );
            await gqlAddElemToTree(testTreeId, {id: sfTreeRecord6, library: sfTestLibTreeId}, nodeTreeRecord5);
        });
        afterAll(async () => {
            // Clean up test data for Sort/filter
            // Purge all records in the test library using purgeRecord
            const recordsRes = await makeGraphQlCall(`{
                sfRecords: records(library: "${sfTestLibId}", retrieveInactive: true) {
                    list { id }
                }
            }`);
            const recordIds = recordsRes.data.data.sfRecords.list.map((r: {id: string}) => r.id);
            for (const id of recordIds) {
                await makeGraphQlCall(
                    `mutation { purgeRecord(libraryId: "${sfTestLibId}", recordId: "${id}") { id } }`
                );
            }
            // Purge all records in the test library using purgeRecord
            const linkRecordsRes = await makeGraphQlCall(`{
                sfLinkedRecords: records(library: "${sfTestLibLinkId}", retrieveInactive: true) {
                    list { id }
                }
            }`);
            const linkedRecordIds = linkRecordsRes.data.data.sfLinkedRecords.list.map((r: {id: string}) => r.id);
            for (const id of linkedRecordIds) {
                await makeGraphQlCall(
                    `mutation { purgeRecord(libraryId: "${sfTestLibLinkId}", recordId: "${id}") { id } }`
                );
            }
            // Purge all records in the test library using purgeRecord
            const treeRecordsRes = await makeGraphQlCall(`{
                sfTreeRecords: records(library: "${sfTestLibTreeId}", retrieveInactive: true) {
                    list { id }
                }
            }`);
            const treeRecordIds = treeRecordsRes.data.data.sfTreeRecords.list.map((r: {id: string}) => r.id);
            for (const id of treeRecordIds) {
                await makeGraphQlCall(
                    `mutation { purgeRecord(libraryId: "${sfTestLibTreeId}", recordId: "${id}") { id } }`
                );
            }

            // unlink attributes before deleting them
            await gqlSaveLibrary(sfTestLibId, 'Test', [testTreeAttrId]);
            await gqlSaveLibrary(sfTestLibLinkId, 'Test', [
                testAdvThroughLinkAttrId,
                testAdvRevLinkAttrId,
                testAdvRevLinkToSimpleLinkAttrId
            ]);
            await gqlSaveLibrary(sfTestLibTreeId, 'Test', []);

            // Need to delete attribute BEFORE library,
            // Otherwise cache is not deleted and the next saveAttribute will try to update it
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testSimpleAttrId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testSimpleAttrId2}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testSimpleExtAttrId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testSimpleLinkAttrId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testAdvAttrId}") { id } }`, true);
            await makeGraphQlCall(`mutation { deleteAttribute(id: "${testAdvLinkAttrId}") { id } }`, true);

            await makeGraphQlCall(`mutation { deleteLibrary(id: "${sfTestLibId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${sfTestLibLinkId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${sfTestLibTreeId}") { id } }`);

            await makeGraphQlCall(`mutation { deleteTree(id: "${testTreeId}") { id } }`);
        });

        describe('On simple attribute', () => {
            beforeAll(async () => {
                // Save values on records
                await makeGraphQlCall(`mutation {
                    v1: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testSimpleAttrId}",
                        value: {payload: "C"}) { id_value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testSimpleAttrId}",
                        value: {payload: "A"}) { id_value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testSimpleAttrId}",
                        value: {payload: "B"}) { id_value }
                    v4: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testSimpleAttrId2}",
                        value: {payload: "1"}) { id_value }
                    v5: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testSimpleAttrId2}",
                        value: {payload: "1"}) { id_value }
                    v6: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testSimpleAttrId2}",
                        value: {payload: "2"}) { id_value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.EQUAL}, value: "C"}]
                    ) { list {id} }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    records(library: "${sfTestLibId}", sort: {field: "${testSimpleAttrId}", order: asc}) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(3);
                expect(res.data.data.records.list[0].id).toBe(sfRecord2);
                expect(res.data.data.records.list[1].id).toBe(sfRecord3);
                expect(res.data.data.records.list[2].id).toBe(sfRecord1);
            });

            describe('Multiple sorts', () => {
                // +--------------+---------------------+--------------------+
                // |              | testSimpleAttribute | testSimpleAttrId2  |
                // +--------------+---------------------+--------------------+
                // | sfRecord1    | C                   | 1                  |
                // | sfRecord2    | A                   | 1                  |
                // | sfRecord3    | B                   | 2                  |
                // +--------------+---------------------+--------------------+

                const _makeCall = async (
                    testSimpleAttrId2Order: 'asc' | 'desc',
                    testSimpleAttrIdOrder: 'asc' | 'desc'
                ) =>
                    makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        multipleSort: [
                            {field: "${testSimpleAttrId2}", order: ${testSimpleAttrId2Order}},
                            {field: "${testSimpleAttrId}", order: ${testSimpleAttrIdOrder}}
                        ]
                    ) {
                        list {
                            id
                        }
                    }
                }`);

                test('Sort on multiple attributes asc / asc', async () => {
                    const res = await _makeCall('asc', 'asc');

                    expect(res.data.errors).toBeUndefined();
                    expect(res.data.data.records.list.map((record: {id: string}) => record.id)).toEqual([
                        sfRecord2,
                        sfRecord1,
                        sfRecord3
                    ]);
                });

                test('Sort on multiple attributes desc / asc', async () => {
                    const res = await _makeCall('desc', 'asc');

                    expect(res.data.errors).toBeUndefined();
                    expect(res.data.data.records.list.map((record: {id: string}) => record.id)).toEqual([
                        sfRecord3,
                        sfRecord2,
                        sfRecord1
                    ]);
                });

                test('Sort on multiple attributes asc / desc', async () => {
                    const res = await _makeCall('asc', 'desc');

                    expect(res.data.errors).toBeUndefined();
                    expect(res.data.data.records.list.map((record: {id: string}) => record.id)).toEqual([
                        sfRecord1,
                        sfRecord2,
                        sfRecord3
                    ]);
                });

                test('Sort on multiple attributes desc / desc', async () => {
                    const res = await _makeCall('desc', 'desc');

                    expect(res.data.errors).toBeUndefined();
                    expect(res.data.data.records.list.map((record: {id: string}) => record.id)).toEqual([
                        sfRecord3,
                        sfRecord1,
                        sfRecord2
                    ]);
                });
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
                        value: {payload: "{\\"name\\": \\"C\\"}"}) { id_value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testSimpleExtAttrId}",
                        value: {payload: "{\\"name\\": \\"A\\"}"}) { id_value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testSimpleExtAttrId}",
                        value: {payload: "{\\"name\\": \\"B\\"}"}) { id_value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        filters: [
                            {field: "${testSimpleExtAttrId}.name", condition: ${AttributeCondition.EQUAL}, value: "C"}
                        ]
                    ) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    records(library: "${sfTestLibId}", sort: {field: "${testSimpleExtAttrId}.name", order: asc}) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(3);
                expect(res.data.data.records.list[0].id).toBe(sfRecord2);
                expect(res.data.data.records.list[1].id).toBe(sfRecord3);
                expect(res.data.data.records.list[2].id).toBe(sfRecord1);
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
                        value: {payload: "${sfLinkedRecord1}"}) { id_value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testSimpleLinkAttrId}",
                        value: {payload: "${sfLinkedRecord2}"}) { id_value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testSimpleLinkAttrId}",
                        value: {payload: "${sfLinkedRecord3}"}) { id_value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        filters: [
                            {
                                field: "${testSimpleLinkAttrId}.${testSimpleAttrId}",
                                condition: ${AttributeCondition.EQUAL},
                                value: "C"
                            }
                        ]
                    ) {
                        list {id}
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfRecord1);
            });

            test('Filter on advanced attribute through simple link', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        filters: [{
                            field: "${testSimpleLinkAttrId}.${testAdvThroughLinkAttrId}",
                            condition: ${AttributeCondition.EQUAL},
                            value: "adv_value"
                        }]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        sort: {field: "${testSimpleLinkAttrId}.${testSimpleAttrId}", order: asc}
                    ) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(3);
                expect(res.data.data.records.list[0].id).toBe(sfRecord2);
                expect(res.data.data.records.list[1].id).toBe(sfRecord3);
                expect(res.data.data.records.list[2].id).toBe(sfRecord1);
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
                        value: {payload: "C"}) { id_value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testAdvAttrId}",
                        value: {payload: "A"}) { id_value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testAdvAttrId}",
                        value: {payload: "B"}) { id_value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        filters: [{field: "${testAdvAttrId}", condition: ${AttributeCondition.EQUAL}, value: "C"}]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    records(library: "${sfTestLibId}", sort: {field: "${testAdvAttrId}", order: asc}) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(3);
                expect(res.data.data.records.list[0].id).toBe(sfRecord2);
                expect(res.data.data.records.list[1].id).toBe(sfRecord3);
                expect(res.data.data.records.list[2].id).toBe(sfRecord1);
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
                        value: {payload: "${sfLinkedRecord1}"}) { id_value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testAdvLinkAttrId}",
                        value: {payload: "${sfLinkedRecord2}"}) { id_value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testAdvLinkAttrId}",
                        value: {payload: "${sfLinkedRecord3}"}) { id_value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        filters: [
                            {
                                field: "${testAdvLinkAttrId}.${testSimpleAttrId}",
                                condition: ${AttributeCondition.EQUAL},
                                value: "C"
                            }
                        ]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfRecord1);
            });

            test('Filter on advanced attribute through advanced link', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        filters: [{
                            field: "${testAdvLinkAttrId}.${testAdvThroughLinkAttrId}",
                            condition: ${AttributeCondition.EQUAL},
                            value: "adv_value"
                        }]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        sort: {field: "${testAdvLinkAttrId}.${testSimpleAttrId}", order: asc}
                    ) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(3);
                expect(res.data.data.records.list[0].id).toBe(sfRecord2);
                expect(res.data.data.records.list[1].id).toBe(sfRecord3);
                expect(res.data.data.records.list[2].id).toBe(sfRecord1);
            });
        });

        describe('On advanced reverse link attribute', () => {
            beforeAll(async () => {
                // Save values on records
                await makeGraphQlCall(`mutation {
                    v1: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testAdvLinkAttrId}",
                        value: {payload: "${sfLinkedRecord1}"}) { id_value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testAdvLinkAttrId}",
                        value: {payload: "${sfLinkedRecord2}"}) { id_value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testAdvLinkAttrId}",
                        value: {payload: "${sfLinkedRecord3}"}) { id_value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibLinkId}",
                        filters: [
                            {
                                field: "${testAdvRevLinkAttrId}",
                                condition: ${AttributeCondition.EQUAL},
                                value: "${sfRecord1}"
                            }
                        ]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfLinkedRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibLinkId}",
                        sort: {field: "${testAdvRevLinkAttrId}.${testSimpleAttrId}", order: asc}
                    ) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(3);
                expect(res.data.data.records.list[0].id).toBe(sfLinkedRecord2);
                expect(res.data.data.records.list[1].id).toBe(sfLinkedRecord3);
                expect(res.data.data.records.list[2].id).toBe(sfLinkedRecord1);
            });
        });

        describe('On advanced reverse link into simple link attribute', () => {
            beforeAll(async () => {
                // Save values on records
                await makeGraphQlCall(`mutation {
                    v1: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord1}",
                        attribute: "${testSimpleLinkAttrId}",
                        value: {payload: "${sfLinkedRecord1}"}) { id_value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testSimpleLinkAttrId}",
                        value: {payload: "${sfLinkedRecord2}"}) { id_value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testSimpleLinkAttrId}",
                        value: {payload: "${sfLinkedRecord3}"}) { id_value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibLinkId}",
                        filters: [
                            {
                                field: "${testAdvRevLinkToSimpleLinkAttrId}",
                                condition: ${AttributeCondition.EQUAL},
                                value: "${sfRecord1}"
                            }
                        ]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfLinkedRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibLinkId}",
                        sort: {field: "${testAdvRevLinkToSimpleLinkAttrId}.${testSimpleAttrId}", order: asc}
                    ) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(3);
                expect(res.data.data.records.list[0].id).toBe(sfLinkedRecord2);
                expect(res.data.data.records.list[1].id).toBe(sfLinkedRecord3);
                expect(res.data.data.records.list[2].id).toBe(sfLinkedRecord1);
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
                        value: {payload: "${nodeTreeRecord1}"}) { id_value }
                    v2: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord2}",
                        attribute: "${testTreeAttrId}",
                        value: {payload: "${nodeTreeRecord2}"}) { id_value }
                    v3: saveValue(
                        library: "${sfTestLibId}",
                        recordId: "${sfRecord3}",
                        attribute: "${testTreeAttrId}",
                        value: {payload: "${nodeTreeRecord3}"}) { id_value }
                  }`);
            });

            test('Filter', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        filters: [{
                            field: "${testTreeAttrId}.${sfTestLibTreeId}.${testSimpleAttrId}",
                            condition: ${AttributeCondition.EQUAL},
                            value: "C"
                        }]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data.records.list.length).toBe(1);
                expect(res.data.data.records.list[0].id).toBe(sfRecord1);
            });

            test('Sort', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibId}",
                        sort: {
                            field: "${testTreeAttrId}.${sfTestLibTreeId}.${testSimpleAttrId}",
                            order: asc
                        }
                    ) {
                        list {
                            id
                        }
                    }
                }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);

                expect(res.data.data.records.list.length).toBe(3);
                expect(res.data.data.records.list[0].id).toBe(sfRecord2);
                expect(res.data.data.records.list[1].id).toBe(sfRecord3);
                expect(res.data.data.records.list[2].id).toBe(sfRecord1);
            });

            test('Classified', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibTreeId}",
                        filters: [{
                            value: "${nodeTreeRecord4}",
                            condition: ${TreeCondition.CLASSIFIED_IN},
                            treeId: "${testTreeId}"
                        }]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);

                expect(res.data.data.records.list).toHaveLength(2);
                expect(res.data.data.records.list[0].id).toBe(sfTreeRecord6);
                expect(res.data.data.records.list[1].id).toBe(sfTreeRecord5);
            });

            test('Not Classified', async () => {
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${sfTestLibTreeId}",
                        filters: [{
                            value: "${nodeTreeRecord4}",
                            condition: ${TreeCondition.NOT_CLASSIFIED_IN},
                            treeId: "${testTreeId}"
                        }]
                    ) { list {id}} }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);

                expect(res.data.data.records.list.length).toBe(4);
                expect(res.data.data.records.list[0].id).toBe(sfTreeRecord4);
                expect(res.data.data.records.list[1].id).toBe(sfTreeRecord3);
                expect(res.data.data.records.list[2].id).toBe(sfTreeRecord2);
                expect(res.data.data.records.list[3].id).toBe(sfTreeRecord1);
            });
        });
    });
});
