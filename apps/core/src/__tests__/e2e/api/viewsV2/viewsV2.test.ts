import {RecordFilterCondition, SortOrder, ViewV2Types} from '../../_gqlTypes';
import {adminUserSdk, guestUserSdk} from '../e2eUtils';

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
                    sorts: [{attributes: ['created_at'], order: SortOrder.asc}],
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
                    attributes: [expect.objectContaining({id: 'created_at'})],
                    order: SortOrder.asc,
                },
            ]);
        });

        test('Update viewV2', async () => {
            const {updateViewV2} = await adminUserSdk.UpdateViewV2({
                view: {id: viewId, display: {type: ViewV2Types.list}},
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
                    sorts: [{attributes: ['created_at'], order: SortOrder.asc}],
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
                    guestUserSdk.UpdateViewV2({view: {id, display: {type: ViewV2Types.list}}}),
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

            it('Should not be able to edit shared viewsV2 owned by other users', async () => {
                const id = await createViewAsAdmin(true);
                await expect(
                    guestUserSdk.UpdateViewV2({view: {id, display: {type: ViewV2Types.list}}}),
                ).rejects.toThrow(/USER_IS_NOT_VIEW_OWNER/);
            });

            it('Should not be able to delete shared viewsV2 owned by other users', async () => {
                const id = await createViewAsAdmin(true);
                await expect(guestUserSdk.DeleteViewV2({viewId: id})).rejects.toThrow(/USER_IS_NOT_VIEW_OWNER/);
            });
        });
    });
});
