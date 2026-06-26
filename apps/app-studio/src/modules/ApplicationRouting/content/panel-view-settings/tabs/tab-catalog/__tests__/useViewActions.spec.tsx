import * as leavUi from '@leav/ui';
import {renderHook} from '_ui/_tests/testUtils';
import * as UseIsAdminUser from '../../../../../../../config/user/useIsAdminUser';
import * as UseCurrentView from '../../../store-current-view/useCurrentView';
import * as UseDeleteView from '../useDeleteView';
import {type View} from '../useViewCatalog';
import {useViewActions} from '../useViewActions';

describe('useViewActions', () => {
    const spyOnUseUser = jest.spyOn(leavUi, 'useUser');
    const spyOnUseConfirmModal = jest.spyOn(leavUi, 'useConfirmModal');
    const spyOnUseCurrentView = jest.spyOn(UseCurrentView, 'useCurrentView');
    const spyOnUseDeleteView = jest.spyOn(UseDeleteView, 'useDeleteView');
    const spyOnUseIsAdminUser = jest.spyOn(UseIsAdminUser, 'useIsAdminUser');

    const currentUserId = 'user-1';
    const libraryId = 'products';
    const loadedViewId = 'view-loaded';

    const deleteView = jest.fn();
    const openConfirmModal = jest.fn();

    const makeView = (overrides: Partial<View> = {}): View =>
        ({
            id: 'view-1',
            label: {fr: 'My view'},
            shared: false,
            created_by: {id: currentUserId},
            ...overrides,
        }) as View;

    const getActions = (view: View) => renderHook(() => useViewActions(libraryId)).result.current.getViewActions(view);
    const findAction = (view: View, key: string) => getActions(view).find(action => action.key === key);

    beforeEach(() => {
        jest.clearAllMocks();
        spyOnUseUser.mockReturnValue({userData: {userId: currentUserId}} as any);
        spyOnUseConfirmModal.mockReturnValue({openConfirmModal} as any);
        spyOnUseCurrentView.mockReturnValue({view: {id: loadedViewId}} as any);
        spyOnUseDeleteView.mockReturnValue({deleteView, deleteLoading: false} as any);
        spyOnUseIsAdminUser.mockReturnValue(false);
        deleteView.mockResolvedValue(true);
    });

    describe('getViewActions', () => {
        it('always exposes the copy-id action', () => {
            expect(findAction(makeView(), 'copy-id')).toBeDefined();
        });

        it('enables the copy-id action when the view is shared', () => {
            expect(findAction(makeView({shared: true}), 'copy-id')?.disabled).toBe(false);
        });

        it('disables the copy-id action when the view is not shared', () => {
            expect(findAction(makeView({shared: false}), 'copy-id')?.disabled).toBe(true);
        });

        it('adds the delete action when the current user owns the view', () => {
            expect(findAction(makeView({created_by: {id: currentUserId}}), 'delete')).toBeDefined();
        });

        it('omits the delete action when the current user does not own the view', () => {
            expect(findAction(makeView({created_by: {id: 'someone-else'}}), 'delete')).toBeUndefined();
        });

        it('adds the delete action when an admin views a shared view owned by another user', () => {
            spyOnUseIsAdminUser.mockReturnValue(true);
            expect(findAction(makeView({created_by: {id: 'someone-else'}, shared: true}), 'delete')).toBeDefined();
        });

        it('omits the delete action when an admin views a private view owned by another user', () => {
            spyOnUseIsAdminUser.mockReturnValue(true);
            expect(findAction(makeView({created_by: {id: 'someone-else'}, shared: false}), 'delete')).toBeUndefined();
        });

        it('disables the delete action when the view is the one currently loaded', () => {
            expect(findAction(makeView({id: loadedViewId}), 'delete')?.disabled).toBe(true);
        });

        it('opens the confirm modal and deletes the view on delete click', () => {
            openConfirmModal.mockImplementation(({onOk}) => onOk());
            const view = makeView();

            findAction(view, 'delete')?.onClick({} as any);

            expect(openConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({title: 'view_settings.delete_view_confirm_title'}),
            );
            expect(deleteView).toHaveBeenCalledWith(view.id, libraryId);
        });

        it('uses the standard confirm content when deleting a non-shared view', () => {
            findAction(makeView({shared: false}), 'delete')?.onClick({} as any);

            expect(openConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({content: 'view_settings.delete_view_confirm_content'}),
            );
        });

        it('uses the shared-specific confirm content when deleting a shared view', () => {
            findAction(makeView({shared: true}), 'delete')?.onClick({} as any);

            expect(openConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({content: 'view_settings.delete_view_confirm_content_shared'}),
            );
        });
    });
});
