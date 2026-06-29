import {UsersAttributes} from '../../../../_constants/systemAttributes';
import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {SystemTrees} from '../../../../_constants/systemTrees';
import {adminsGroupId, adminUserId} from '../../../../_constants/users';
import {RecordFilterCondition, SortOrder, ViewV2Shortcut, ViewV2Types} from '../../_gqlTypes';
import {
    adminUserSdk,
    e2eNonAdminGroupId,
    e2eUser,
    getSdkWithUser,
    gqlAddElemToTree,
    gqlCreateRecord,
    guestUserSdk,
    makeGraphQlCall,
    nonAdminUserSdk,
} from '../e2eUtils';

describe('ViewsV2', () => {
    const testLibName = 'test_views_v2_lib';
    let viewId: string;

    beforeAll(async () => {
        await adminUserSdk.SaveLibrary({library: {id: testLibName, label: {en: 'Test Lib'}}});
    });

    describe('CRUD operations', () => {
        test('Create viewV2', async () => {
            const {createViewV2} = await adminUserSdk.CreateViewV2({
                view: {
                    library: testLibName,
                    display: {
                        type: ViewV2Types.list,
                        attributes: [
                            {attributeId: 'id', visible: true},
                            {attributeId: 'label', visible: true},
                        ],
                    },
                    shared: true,
                    label: {en: 'test_first_view'},
                    filters: [
                        {
                            pinned: false,
                            attributes: ['label'],
                            values: ['Test'],
                            condition: RecordFilterCondition.EQUAL,
                        },
                    ],
                    sorts: [{pinned: false, attributes: ['created_at'], order: SortOrder.asc}],
                },
            });

            viewId = createViewV2.id;
            expect(viewId).toBeTruthy();
        });

        test('Get viewsV2', async () => {
            const {viewsV2} = await adminUserSdk.GetViewsV2({library: testLibName});

            expect(viewsV2.list.length).toBeGreaterThanOrEqual(1);

            const createdView = viewsV2.list[0];
            expect(createdView.created_by.whoAmI.id).toBeTruthy();
            expect(createdView.shared).toBe(true);
            expect(createdView.label).toEqual({en: 'test_first_view'});
            expect(createdView.display).toEqual({
                type: ViewV2Types.list,
                attributes: [
                    {attribute: expect.objectContaining({id: 'id'}), visible: true},
                    {attribute: expect.objectContaining({id: 'label'}), visible: true},
                ],
            });
            expect(createdView.filters).toEqual([
                {
                    pinned: false,
                    attributes: [expect.objectContaining({id: 'label'})],
                    values: ['Test'],
                    condition: RecordFilterCondition.EQUAL,
                },
            ]);
            expect(createdView.sorts).toEqual([
                {
                    pinned: false,
                    attributes: [expect.objectContaining({id: 'created_at'})],
                    order: SortOrder.asc,
                },
            ]);
            expect(createdView.shortcuts).toEqual([ViewV2Shortcut.display]);
        });

        test('Create viewV2 with an explicit shortcuts list', async () => {
            const {createViewV2} = await adminUserSdk.CreateViewV2({
                view: {
                    library: testLibName,
                    display: {type: ViewV2Types.list, attributes: [{attributeId: 'id', visible: true}]},
                    shared: true,
                    label: {en: 'test_view_with_shortcuts'},
                    filters: [],
                    sorts: [],
                    shortcuts: [ViewV2Shortcut.display, ViewV2Shortcut.filters, ViewV2Shortcut.catalog],
                },
            });

            const {viewsV2} = await adminUserSdk.GetViewsV2({library: testLibName});
            const createdView = viewsV2.list.find(view => view.id === createViewV2.id);
            expect(createdView?.shortcuts).toEqual([
                ViewV2Shortcut.display,
                ViewV2Shortcut.filters,
                ViewV2Shortcut.catalog,
            ]);
        });

        test('Update viewV2', async () => {
            const {updateViewV2} = await adminUserSdk.UpdateViewV2({
                view: {
                    id: viewId,
                    display: {
                        type: ViewV2Types.list,
                        attributes: [
                            {attributeId: 'id', visible: true},
                            {attributeId: 'label', visible: true},
                        ],
                    },
                },
            });

            expect(updateViewV2.id).toBe(viewId);
            expect(updateViewV2.display.type).toBe(ViewV2Types.list);
        });

        test('Delete viewV2', async () => {
            const {deleteViewV2} = await adminUserSdk.DeleteViewV2({viewId});
            expect(deleteViewV2.id).toBe(viewId);
        });
    });

    describe('Permissions', () => {
        const createViewAsAdmin = async (shared: boolean): Promise<string> => {
            const {createViewV2} = await adminUserSdk.CreateViewV2({
                view: {
                    library: testLibName,
                    display: {
                        type: ViewV2Types.list,
                        attributes: [
                            {attributeId: 'id', visible: true},
                            {attributeId: 'label', visible: true},
                        ],
                    },
                    shared,
                    label: {en: 'test_first_view'},
                    filters: [
                        {
                            pinned: false,
                            attributes: ['label'],
                            values: ['Test'],
                            condition: RecordFilterCondition.EQUAL,
                        },
                    ],
                    sorts: [{pinned: false, attributes: ['created_at'], order: SortOrder.asc}],
                },
            });
            return createViewV2.id;
        };

        // Produces a view owned by another user than the admin (the guest), to exercise the admin override.
        const createViewAsGuest = async (shared: boolean): Promise<string> => {
            const {createViewV2} = await guestUserSdk.CreateViewV2({
                view: {
                    library: testLibName,
                    display: {
                        type: ViewV2Types.list,
                        attributes: [{attributeId: 'id', visible: true}],
                    },
                    shared,
                    label: {en: 'guest_view'},
                    filters: [],
                    sorts: [],
                },
            });
            return createViewV2.id;
        };

        describe('Private viewsV2', () => {
            it('Should not be able to get viewsV2 owned by other users', async () => {
                const id = await createViewAsAdmin(false);
                await expect(guestUserSdk.GetViewV2({viewId: id})).rejects.toThrow(/VALIDATION_ERROR/);
            });

            it('Should not be able to edit viewsV2 owned by other users', async () => {
                const id = await createViewAsAdmin(false);
                await expect(
                    guestUserSdk.UpdateViewV2({view: {id, display: {type: ViewV2Types.list, attributes: []}}}),
                ).rejects.toThrow(/USER_IS_NOT_VIEW_OWNER/);
            });

            it('Should not be able to delete viewsV2 owned by other users', async () => {
                const id = await createViewAsAdmin(false);
                await expect(guestUserSdk.DeleteViewV2({viewId: id})).rejects.toThrow(/USER_IS_NOT_VIEW_OWNER/);
            });
        });

        describe('Shared viewsV2', () => {
            it('Should be able to get viewsV2 owned by other users', async () => {
                const id = await createViewAsAdmin(true);
                await guestUserSdk.GetViewV2({viewId: id});
            });

            it('Should expose the real creator identity to a user who can see it', async () => {
                const id = await createViewAsAdmin(true);

                // The admin can see their own creator record → real identity, no fallback label.
                const {viewV2} = await adminUserSdk.GetViewV2({viewId: id});
                expect(viewV2.created_by.id).toBe(adminUserId);
                expect(viewV2.created_by.whoAmI.id).toBe(adminUserId);
                expect(viewV2.created_by.whoAmI.label).not.toBe('an administrator');
            });

            describe('Creator restricted by permissions', () => {
                let readerSdk: typeof adminUserSdk;
                let readerGroupNodeId: string;

                beforeAll(async () => {
                    // 1. Extend the `users` library permissions via its `user_groups` tree attribute.
                    //    saveLibrary does an ArangoDB UPDATE → existing attributes/label are preserved.
                    await makeGraphQlCall(`mutation {
                        saveLibrary(library: {
                            id: "${SystemLibraries.USERS}",
                            permissions_conf: {permissionTreeAttributes: ["${UsersAttributes.USER_GROUPS}"], relation: and}
                        }) { id }
                    }`);

                    // 2. Dedicated reader group (keeps the deny scoped → parallel-safe).
                    const readerGroupRecordId = await gqlCreateRecord(SystemLibraries.USERS_GROUPS);
                    readerGroupNodeId = await gqlAddElemToTree(SystemTrees.USERS_GROUPS, {
                        id: readerGroupRecordId,
                        library: SystemLibraries.USERS_GROUPS,
                    });

                    // 3. Reader user (must exist for auth; its groups come from the JWT claim).
                    const {createRecord} = await adminUserSdk.CreateRecord({
                        library: SystemLibraries.USERS,
                        data: {values: [{attribute: UsersAttributes.EMAIL, payload: 'view_reader@test.com'}]},
                    });
                    readerSdk = getSdkWithUser(
                        e2eUser({userId: createRecord.record!.id, groupsId: [readerGroupNodeId]}),
                    );

                    // 4. Deny access_record on the Administrators node (where the admin creator is
                    //    classified) for the reader group only.
                    await makeGraphQlCall(`mutation {
                        savePermission(permission: {
                            type: record,
                            applyTo: "${SystemLibraries.USERS}",
                            usersGroup: "${readerGroupNodeId}",
                            permissionTreeTarget: {tree: "${SystemTrees.USERS_GROUPS}", nodeId: "${adminsGroupId}"},
                            actions: [{name: access_record, allowed: false}]
                        }) { type }
                    }`);
                });

                afterAll(async () => {
                    // Reset the deny, then disable the permission tree on `users` (restore default).
                    await makeGraphQlCall(`mutation {
                        savePermission(permission: {
                            type: record,
                            applyTo: "${SystemLibraries.USERS}",
                            usersGroup: "${readerGroupNodeId}",
                            permissionTreeTarget: {tree: "${SystemTrees.USERS_GROUPS}", nodeId: "${adminsGroupId}"},
                            actions: [{name: access_record, allowed: null}]
                        }) { type }
                    }`);
                    await makeGraphQlCall(`mutation {
                        saveLibrary(library: {
                            id: "${SystemLibraries.USERS}",
                            permissions_conf: {permissionTreeAttributes: [], relation: and}
                        }) { id }
                    }`);
                });

                it('falls back to a generic identity when the creator is not visible to the reader', async () => {
                    const sharedViewId = await createViewAsAdmin(true);

                    const {viewV2} = await readerSdk.GetViewV2({viewId: sharedViewId});
                    // The real creator id is preserved (so `isOwner` checks keep working)...
                    expect(viewV2.created_by.id).toBe(adminUserId);
                    expect(viewV2.created_by.whoAmI.id).toBe(adminUserId);
                    // ...but the label is masked, without leaking the admin identity.
                    expect(viewV2.created_by.whoAmI.label).toBe('an administrator');

                    // Same fallback through the list query.
                    const {viewsV2} = await readerSdk.GetViewsV2({library: testLibName});
                    const sharedView = viewsV2.list.find(view => view.id === sharedViewId);
                    expect(sharedView?.created_by.id).toBe(adminUserId);
                    expect(sharedView?.created_by.whoAmI.label).toBe('an administrator');
                });
            });

            it('Should not be able to edit shared viewsV2 owned by other users', async () => {
                const id = await createViewAsAdmin(true);
                await expect(
                    guestUserSdk.UpdateViewV2({view: {id, display: {type: ViewV2Types.list, attributes: []}}}),
                ).rejects.toThrow(/USER_IS_NOT_VIEW_OWNER/);
            });

            it('Should not be able to delete shared viewsV2 owned by other users', async () => {
                const id = await createViewAsAdmin(true);
                await expect(guestUserSdk.DeleteViewV2({viewId: id})).rejects.toThrow(/USER_IS_NOT_VIEW_OWNER/);
            });
        });

        describe('Admin override on viewsV2 owned by other users', () => {
            it('Should be able to edit a shared viewV2 owned by another user', async () => {
                const id = await createViewAsGuest(true);
                const {updateViewV2} = await adminUserSdk.UpdateViewV2({
                    view: {id, label: {en: 'edited_by_admin'}},
                });
                expect(updateViewV2.id).toBe(id);
            });

            it('Should be able to delete a shared viewV2 owned by another user', async () => {
                const id = await createViewAsGuest(true);
                const {deleteViewV2} = await adminUserSdk.DeleteViewV2({viewId: id});
                expect(deleteViewV2.id).toBe(id);
            });

            it('Should not be able to edit a private viewV2 owned by another user', async () => {
                const id = await createViewAsGuest(false);
                await expect(
                    adminUserSdk.UpdateViewV2({view: {id, display: {type: ViewV2Types.list, attributes: []}}}),
                ).rejects.toThrow(/USER_IS_NOT_VIEW_OWNER/);
            });

            it('Should not be able to delete a private viewV2 owned by another user', async () => {
                const id = await createViewAsGuest(false);
                await expect(adminUserSdk.DeleteViewV2({viewId: id})).rejects.toThrow(/USER_IS_NOT_VIEW_OWNER/);
            });
        });

        // Proves the override is driven by the `manage_views` library permission, not by admin-group
        // membership: a non-admin user whose group is granted the permission gains the same power.
        describe('manage_views permission on viewsV2 owned by other users', () => {
            beforeAll(async () => {
                // Grant manage_views on the test library to the non-admin user's group.
                await makeGraphQlCall(`mutation {
                    savePermission(permission: {
                        type: library,
                        applyTo: "${testLibName}",
                        usersGroup: "${e2eNonAdminGroupId()}",
                        actions: [{name: manage_views, allowed: true}]
                    }) { type }
                }`);
            });

            afterAll(async () => {
                await makeGraphQlCall(`mutation {
                    savePermission(permission: {
                        type: library,
                        applyTo: "${testLibName}",
                        usersGroup: "${e2eNonAdminGroupId()}",
                        actions: [{name: manage_views, allowed: null}]
                    }) { type }
                }`);
            });

            it('Should let a granted non-admin user edit a shared viewV2 owned by another user', async () => {
                const id = await createViewAsGuest(true);
                const {updateViewV2} = await nonAdminUserSdk.UpdateViewV2({
                    view: {id, label: {en: 'edited_by_manager'}},
                });
                expect(updateViewV2.id).toBe(id);
            });

            it('Should let a granted non-admin user delete a shared viewV2 owned by another user', async () => {
                const id = await createViewAsGuest(true);
                const {deleteViewV2} = await nonAdminUserSdk.DeleteViewV2({viewId: id});
                expect(deleteViewV2.id).toBe(id);
            });

            it('Should still forbid a granted non-admin user on a private viewV2 owned by another user', async () => {
                const id = await createViewAsGuest(false);
                await expect(nonAdminUserSdk.UpdateViewV2({view: {id, label: {en: 'nope'}}})).rejects.toThrow(
                    /USER_IS_NOT_VIEW_OWNER/,
                );
            });
        });
    });
});
