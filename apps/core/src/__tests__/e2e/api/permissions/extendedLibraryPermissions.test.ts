import {RecordPermissionsActions} from '../../../../_types/permissions';
import {AttributeTypes} from '../../../../_types/attribute';
import {AttributeCondition} from '../../../../_types/record';
import {
    e2eGuestUser,
    e2eNonAdminGroupId,
    e2eNonAdminUser,
    adminUserSdk,
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveTree,
    type IMakeGraphQlCallOptions,
    makeGraphQlCall,
} from '../e2eUtils';

// Extended library permissions using a tree with a library for tree elements
// particularly apps/core/src/domain/record/helpers/getAccessPermissionFilters.ts
describe('ExtendedLibraryPermissions', () => {
    const permNodeLibName = 'extended_library_permissions_test_node_lib'; // for tree element
    const permTreeName = 'extended_library_permissions_test_tree';
    const libName = 'extended_library_permissions_test_lib';
    const libTreeAttr = 'extended_library_permissions_attribute'; // tree attribute
    let permTreeNodeRecord1Id: string;
    let permTreeNodeRecord2Id: string;
    let permTreeNode1Id: string;
    let permTreeNode2Id: string;
    let record1Id: string;
    let record2Id: string;

    beforeAll(async () => {
        await adminUserSdk.SaveLibrary({library: {id: permNodeLibName, label: {en: 'Test node lib'}}});
        await gqlSaveTree(permTreeName, 'Permissions tree', [permNodeLibName]);

        permTreeNodeRecord1Id = await gqlCreateRecord(permNodeLibName);
        permTreeNodeRecord2Id = await gqlCreateRecord(permNodeLibName);

        permTreeNode1Id = await gqlAddElemToTree(
            permTreeName,
            {id: permTreeNodeRecord1Id, library: permNodeLibName},
            null,
            2,
        );
        permTreeNode2Id = await gqlAddElemToTree(
            permTreeName,
            {id: permTreeNodeRecord2Id, library: permNodeLibName},
            null,
            2,
        );

        // Create library using permission tree
        await gqlSaveAttribute({
            id: libTreeAttr,
            label: 'Test Attr tree record permissions',
            type: AttributeTypes.TREE,
            linkedTree: permTreeName,
            multipleValues: false,
        });

        await makeGraphQlCall(
            `mutation {
            saveLibrary(library: {
                id: "${libName}",
                attributes: [
                    "${libTreeAttr}"
                ],
                permissions_conf: {permissionTreeAttributes: ["${libTreeAttr}"], relation: and}
            }) {
                id
            }
        }`,
        );

        record1Id = await gqlCreateRecord(libName);
        record2Id = await gqlCreateRecord(libName);

        await makeGraphQlCall(
            `mutation {
            saveValue(
                library: "${libName}",
                recordId: "${record1Id}",
                attribute: "${libTreeAttr}",
                value: {
                    payload: "${permTreeNode1Id}"
                }
            ) {
                id_value
            }
        }`,
        );
        await makeGraphQlCall(
            `mutation {
            saveValue(
                library: "${libName}",
                recordId: "${record2Id}",
                attribute: "${libTreeAttr}",
                value: {
                    payload: "${permTreeNode2Id}"
                }
            ) {
                id_value
            }
        }`,
        );
    });

    afterAll(async () => {
        await makeGraphQlCall(
            `mutation {
            d1: deleteRecord(library: "${permNodeLibName}", id: "${permTreeNodeRecord1Id}") { id }
            d2: deleteRecord(library: "${permNodeLibName}", id: "${permTreeNodeRecord2Id}") { id }
            d10: deleteLibrary(id: "${libName}") { id }
            d11: deleteTree(id: "${permTreeName}") { id }
            d12: deleteLibrary(id: "${permNodeLibName}") { id }
            d20: deleteAttribute(id: "${libTreeAttr}") { id }
        }`,
        );
    });

    describe('no perm', () => {
        it('record should get all of them', async () => {
            const records = await getLibRecords({});

            expect(records.length).toBe(2);
        });

        it('record should get some of them with filter', async () => {
            const records = await getLibRecords({
                filters: `[
                {
                    condition: ${AttributeCondition.EQUAL},
                    field: "${libTreeAttr}.${permNodeLibName}.id",
                    value: "${permTreeNodeRecord1Id}"
                }
            ]`,
            });

            expect(records.length).toBe(1);
            expect(records[0].id).toBe(record1Id);
        });
    });

    describe('disable access_record on node 1 for everybody', () => {
        beforeAll(async () => {
            await makeGraphQlCall(
                `mutation {
                savePermission(
                    permission: {
                        type: record,
                        applyTo: "${libName}",
                        usersGroup: null,
                        permissionTreeTarget: {
                            tree: "${permTreeName}", nodeId: "${permTreeNode1Id}"
                        },
                        actions: [
                            {name: ${RecordPermissionsActions.ACCESS_RECORD}, allowed: false},
                        ]
                    }
                ) { 
                    type
                }
            }`,
            );
        });

        afterAll(async () => {
            await makeGraphQlCall(
                `mutation {
                savePermission(
                    permission: {
                        type: record,
                        applyTo: "${libName}",
                        usersGroup: null,
                        permissionTreeTarget: {
                            tree: "${permTreeName}", nodeId: "${permTreeNode1Id}"
                        },
                        actions: [
                            {name: ${RecordPermissionsActions.ACCESS_RECORD}, allowed: null},
                        ]
                    }
                ) { 
                    type
                }
            }`,
            );
        });

        it('record should get only one of them', async () => {
            const records = await getLibRecords({
                options: {
                    user: e2eNonAdminUser(),
                },
            });

            expect(records.length).toBe(1);
            expect(records[0].id).toBe(record2Id);
        });

        it('record should get none of them with filter on node 1', async () => {
            const records = await getLibRecords({
                filters: `[
                {
                    condition: ${AttributeCondition.EQUAL},
                    field: "${libTreeAttr}.${permNodeLibName}.id",
                    value: "${permTreeNodeRecord1Id}"
                }
            ]`,
                options: {
                    user: e2eNonAdminUser(),
                },
            });

            expect(records.length).toBe(0);
        });

        it('record should get one of them with filter on node 2', async () => {
            const records = await getLibRecords({
                filters: `[
                {
                    condition: ${AttributeCondition.EQUAL},
                    field: "${libTreeAttr}.${permNodeLibName}.id",
                    value: "${permTreeNodeRecord2Id}"
                }
            ]`,
                options: {
                    user: e2eNonAdminUser(),
                },
            });

            expect(records.length).toBe(1);
            expect(records[0].id).toBe(record2Id);
        });

        describe('except current user group (admin)', () => {
            beforeAll(async () => {
                await makeGraphQlCall(
                    `mutation {
                    savePermission(
                        permission: {
                            type: record,
                            applyTo: "${libName}",
                            usersGroup: "${e2eNonAdminGroupId()}",
                            permissionTreeTarget: {
                                tree: "${permTreeName}", nodeId: "${permTreeNode1Id}"
                            },
                            actions: [
                                {name: ${RecordPermissionsActions.ACCESS_RECORD}, allowed: true},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
                );
            });

            afterAll(async () => {
                await makeGraphQlCall(
                    `mutation {
                    savePermission(
                        permission: {
                            type: record,
                            applyTo: "${libName}",
                            usersGroup: "${e2eNonAdminGroupId()}",
                            permissionTreeTarget: {
                                tree: "${permTreeName}", nodeId: "${permTreeNode1Id}"
                            },
                            actions: [
                                {name: ${RecordPermissionsActions.ACCESS_RECORD}, allowed: null},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
                );
            });

            // To improve those test, would be fine to be able to make call as another user than admin
            it('record should get all records', async () => {
                const records = await getLibRecords({
                    options: {
                        user: e2eNonAdminUser(),
                    },
                });

                expect(records.length).toBe(2);
            });

            it('non admin user should get only one of them', async () => {
                const records = await getLibRecords({options: {user: e2eGuestUser()}});

                expect(records.length).toBe(1);
                expect(records[0].id).toBe(record2Id);
            });

            it('non admin user should get none of them with filter on node 1', async () => {
                const records = await getLibRecords({
                    filters: `[
                    {
                        condition: ${AttributeCondition.EQUAL},
                        field: "${libTreeAttr}.${permNodeLibName}.id",
                        value: "${permTreeNodeRecord1Id}"
                    }
                ]`,
                    options: {user: e2eGuestUser()},
                });

                expect(records.length).toBe(0);
            });

            it('non admin user should get one of them with filter on node 2', async () => {
                const records = await getLibRecords({
                    filters: `[
                    {
                        condition: ${AttributeCondition.EQUAL},
                        field: "${libTreeAttr}.${permNodeLibName}.id",
                        value: "${permTreeNodeRecord2Id}"
                    }
                ]`,
                    options: {user: e2eGuestUser()},
                });

                expect(records.length).toBe(1);
                expect(records[0].id).toBe(record2Id);
            });
        });
    });

    // Skip test suite as feature behind a flag not enabled by default, may be remove in future
    describe.skip('disable access_record_by_default on node 1 for everybody', () => {
        beforeAll(async () => {
            await makeGraphQlCall(
                `mutation {
                savePermission(
                    permission: {
                        type: record,
                        applyTo: "${libName}",
                        usersGroup: null,
                        permissionTreeTarget: {
                            tree: "${permTreeName}", nodeId: "${permTreeNode1Id}"
                        },
                        actions: [
                            {name: ${RecordPermissionsActions.ACCESS_RECORD_BY_DEFAULT}, allowed: false},
                        ]
                    }
                ) { 
                    type
                }
            }`,
            );
        });

        afterAll(async () => {
            await makeGraphQlCall(
                `mutation {
                savePermission(
                    permission: {
                        type: record,
                        applyTo: "${libName}",
                        usersGroup: null,
                        permissionTreeTarget: {
                            tree: "${permTreeName}", nodeId: "${permTreeNode1Id}"
                        },
                        actions: [
                            {name: ${RecordPermissionsActions.ACCESS_RECORD_BY_DEFAULT}, allowed: null},
                        ]
                    }
                ) { 
                    type
                }
            }`,
            );
        });

        it('record should get only one of them', async () => {
            const records = await getLibRecords({
                options: {
                    user: e2eNonAdminUser(),
                },
            });

            expect(records.length).toBe(1);
            expect(records[0].id).toBe(record2Id);
        });
        it('record should get hidden one with filter on node 1', async () => {
            const records = await getLibRecords({
                filters: `[
                {
                    condition: ${AttributeCondition.EQUAL},
                    field: "${libTreeAttr}.${permNodeLibName}.id",
                    value: "${permTreeNodeRecord1Id}"
                }
            ]`,
                options: {
                    user: e2eNonAdminUser(),
                },
            });

            expect(records.length).toBe(1);
            expect(records[0].id).toBe(record1Id);
        });

        it('record should get one of them with filter on node 2', async () => {
            const records = await getLibRecords({
                filters: `[
                {
                    condition: ${AttributeCondition.EQUAL},
                    field: "${libTreeAttr}.${permNodeLibName}.id",
                    value: "${permTreeNodeRecord2Id}"
                }
            ]`,
                options: {
                    user: e2eNonAdminUser(),
                },
            });

            expect(records.length).toBe(1);
            expect(records[0].id).toBe(record2Id);
        });

        describe('except current user group (admin)', () => {
            beforeAll(async () => {
                await makeGraphQlCall(
                    `mutation {
                    savePermission(
                        permission: {
                            type: record,
                            applyTo: "${libName}",
                            usersGroup: "${e2eNonAdminGroupId()}",
                            permissionTreeTarget: {
                                tree: "${permTreeName}", nodeId: "${permTreeNode1Id}"
                            },
                            actions: [
                                {name: ${RecordPermissionsActions.ACCESS_RECORD_BY_DEFAULT}, allowed: true},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
                );
            });

            afterAll(async () => {
                await makeGraphQlCall(
                    `mutation {
                    savePermission(
                        permission: {
                            type: record,
                            applyTo: "${libName}",
                            usersGroup: "${e2eNonAdminGroupId()}",
                            permissionTreeTarget: {
                                tree: "${permTreeName}", nodeId: "${permTreeNode1Id}"
                            },
                            actions: [
                                {name: ${RecordPermissionsActions.ACCESS_RECORD_BY_DEFAULT}, allowed: null},
                            ]
                        }
                    ) { 
                        type
                    }
                }`,
                );
            });

            // To improve those test, would be fine to be able to make call as another user than admin
            it('record should get all records', async () => {
                const records = await getLibRecords({
                    options: {
                        user: e2eNonAdminUser(),
                    },
                });

                expect(records.length).toBe(2);
            });

            it('non admin user should get only one of them', async () => {
                const records = await getLibRecords({options: {user: e2eGuestUser()}});

                expect(records.length).toBe(1);
                expect(records[0].id).toBe(record2Id);
            });

            it('non admin user should get one of them with filter on node 1', async () => {
                const records = await getLibRecords({
                    filters: `[
                    {
                        condition: ${AttributeCondition.EQUAL},
                        field: "${libTreeAttr}.${permNodeLibName}.id",
                        value: "${permTreeNodeRecord1Id}"
                    }
                ]`,
                    options: {user: e2eGuestUser()},
                });

                expect(records.length).toBe(1);
                expect(records[0].id).toBe(record1Id);
            });

            it('non admin user should get one of them with filter on node 2', async () => {
                const records = await getLibRecords({
                    filters: `[
                            {
                                condition: ${AttributeCondition.EQUAL},
                                field: "${libTreeAttr}.${permNodeLibName}.id",
                                value: "${permTreeNodeRecord2Id}"
                            }
                        ]`,
                    options: {user: e2eGuestUser()},
                });

                expect(records.length).toBe(1);
                expect(records[0].id).toBe(record2Id);
            });
        });
    });

    async function getLibRecords({filters, options}: {filters?: string; options?: IMakeGraphQlCallOptions}) {
        const query = `query {
            records(
                library: "${libName}",
                filters: ${filters ?? '[]'},
            ) {
                list {
                    id
                }
            }
        }`;
        const res = await makeGraphQlCall(query, options);

        expect(res.status).toBe(200);

        return res.data.data.records.list;
    }
});
