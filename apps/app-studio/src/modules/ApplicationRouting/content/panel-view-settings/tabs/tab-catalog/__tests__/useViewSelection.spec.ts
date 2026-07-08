import * as leavUi from '@leav/ui';
import {act, renderHook} from '_ui/_tests/testUtils';
import * as UseCurrentView from '../../../store-current-view/useCurrentView';
import * as UseCurrentViewActions from '../../../current-view-section/useCurrentViewActions';
import * as UseLastUsedView from '../useLastUsedView';
import {useViewSelection} from '../useViewSelection';

describe('useViewSelection', () => {
    const spyOnUsePanelEventHandlers = vi.spyOn(leavUi, 'usePanelEventHandlers');
    const spyOnUseCurrentView = vi.spyOn(UseCurrentView, 'useCurrentView');
    const spyOnUseCurrentViewActions = vi.spyOn(UseCurrentViewActions, 'useCurrentViewActions');
    const spyOnUseLastUsedView = vi.spyOn(UseLastUsedView, 'useLastUsedView');

    const loadedViewId = 'view-1';
    const otherViewId = 'view-2';

    const dispatch = vi.fn();
    const save = vi.fn();
    const saveLastUsedView = vi.fn();

    const selectViewEvent = (viewId: string) => ({type: 'view-settings-select-view', data: {viewId}});

    // Test lang defaults to 'fr', so the label key must be 'fr' for `hasLabel` to see it.
    const setupCurrentView = ({isDirty = false, label = {fr: 'My view'}} = {}) => {
        spyOnUseCurrentView.mockReturnValue({view: {id: loadedViewId, label}, isDirty} as any);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        spyOnUsePanelEventHandlers.mockReturnValue({dispatch} as any);
        spyOnUseCurrentViewActions.mockReturnValue({save, saveLoading: false} as any);
        spyOnUseLastUsedView.mockReturnValue({saveLastUsedView, lastUsedViewId: undefined} as any);
        save.mockResolvedValue(true);
        setupCurrentView();
    });

    describe('selectView', () => {
        it('does nothing when selecting the view already loaded', async () => {
            const {result} = renderHook(() => useViewSelection());

            await act(async () => {
                await result.current.selectView(loadedViewId);
            });

            expect(dispatch).not.toHaveBeenCalled();
            expect(saveLastUsedView).not.toHaveBeenCalled();
            expect(result.current.unsavedViewChangesModalProps.isOpen).toBe(false);
        });

        it('persists last used and dispatches the select event when the current view is not dirty', async () => {
            const {result} = renderHook(() => useViewSelection());

            await act(async () => {
                await result.current.selectView(otherViewId);
            });

            expect(saveLastUsedView).toHaveBeenCalledWith(otherViewId);
            expect(dispatch).toHaveBeenCalledWith(selectViewEvent(otherViewId));
            expect(result.current.unsavedViewChangesModalProps.isOpen).toBe(false);
        });

        it('opens the unsaved-changes modal instead of applying when the current view is dirty', async () => {
            setupCurrentView({isDirty: true});
            const {result} = renderHook(() => useViewSelection());

            await act(async () => {
                await result.current.selectView(otherViewId);
            });

            expect(result.current.unsavedViewChangesModalProps.isOpen).toBe(true);
            expect(dispatch).not.toHaveBeenCalled();
            expect(saveLastUsedView).not.toHaveBeenCalled();
        });
    });

    describe('unsavedViewChangesModalProps', () => {
        it('reports the modal closed initially', () => {
            const {result} = renderHook(() => useViewSelection());

            expect(result.current.unsavedViewChangesModalProps.isOpen).toBe(false);
        });

        it('reflects saveLoading from the current view actions', () => {
            spyOnUseCurrentViewActions.mockReturnValue({save, saveLoading: true} as any);
            const {result} = renderHook(() => useViewSelection());

            expect(result.current.unsavedViewChangesModalProps.saveLoading).toBe(true);
        });

        it('reports canSave true when the current view has a non-empty label', () => {
            const {result} = renderHook(() => useViewSelection());

            expect(result.current.unsavedViewChangesModalProps.canSave).toBe(true);
        });

        it('reports canSave false when the current view label is empty', () => {
            setupCurrentView({label: {fr: '   '}});
            const {result} = renderHook(() => useViewSelection());

            expect(result.current.unsavedViewChangesModalProps.canSave).toBe(false);
        });

        it('closes the modal without applying the pending view on close', async () => {
            setupCurrentView({isDirty: true});
            const {result} = renderHook(() => useViewSelection());

            await act(async () => {
                await result.current.selectView(otherViewId);
            });
            act(() => {
                result.current.unsavedViewChangesModalProps.onClose();
            });

            expect(result.current.unsavedViewChangesModalProps.isOpen).toBe(false);
            expect(dispatch).not.toHaveBeenCalled();
        });
    });

    describe('onDiscard', () => {
        it('applies the pending view then closes the modal', async () => {
            setupCurrentView({isDirty: true});
            const {result} = renderHook(() => useViewSelection());

            await act(async () => {
                await result.current.selectView(otherViewId);
            });
            await act(async () => {
                await result.current.unsavedViewChangesModalProps.onDiscard();
            });

            expect(save).not.toHaveBeenCalled();
            expect(dispatch).toHaveBeenCalledWith(selectViewEvent(otherViewId));
            expect(result.current.unsavedViewChangesModalProps.isOpen).toBe(false);
        });
    });

    describe('onSave', () => {
        it('applies the pending view and closes the modal when save succeeds', async () => {
            setupCurrentView({isDirty: true});
            const {result} = renderHook(() => useViewSelection());

            await act(async () => {
                await result.current.selectView(otherViewId);
            });
            await act(async () => {
                await result.current.unsavedViewChangesModalProps.onSave();
            });

            expect(save).toHaveBeenCalledTimes(1);
            expect(dispatch).toHaveBeenCalledWith(selectViewEvent(otherViewId));
            expect(result.current.unsavedViewChangesModalProps.isOpen).toBe(false);
        });

        it('keeps the modal open and does not apply the pending view when save fails', async () => {
            save.mockResolvedValue(false);
            setupCurrentView({isDirty: true});
            const {result} = renderHook(() => useViewSelection());

            await act(async () => {
                await result.current.selectView(otherViewId);
            });
            await act(async () => {
                await result.current.unsavedViewChangesModalProps.onSave();
            });

            expect(save).toHaveBeenCalledTimes(1);
            expect(dispatch).not.toHaveBeenCalled();
            expect(result.current.unsavedViewChangesModalProps.isOpen).toBe(true);
        });
    });
});
