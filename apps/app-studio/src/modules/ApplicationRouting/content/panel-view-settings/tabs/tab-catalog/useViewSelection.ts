import {useState} from 'react';
import {useLang, usePanelEventHandlers} from '@leav/ui';
import {type AppStudioInternalEvent} from '../../../../types';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {useCurrentViewActions} from '../../current-view-section/useCurrentViewActions';
import {useLastUsedView} from './useLastUsedView';

interface IUseViewSelectionResult {
    selectView: (id: string) => void;
    unsavedViewChangesModalProps: {
        isOpen: boolean;
        saveLoading: boolean;
        canSave: boolean;
        onClose: () => void;
        onDiscard: () => void;
        onSave: () => Promise<void>;
    };
}

/**
 * Drives view switching with an unsaved-changes guard. Selecting a different view while the current
 * one is dirty defers the switch behind a confirmation modal; the modal props returned here are meant
 * to be spread onto `UnsavedViewChangesModal`.
 */
export const useViewSelection = (): IUseViewSelectionResult => {
    const {lang} = useLang();
    const {view: currentLoadedView, isDirty} = useCurrentView();
    const {save, saveLoading} = useCurrentViewActions();
    const {dispatch} = usePanelEventHandlers<AppStudioInternalEvent>();
    const {saveLastUsedView} = useLastUsedView();

    // The view we're about to switch to, deferred until the unsaved-changes modal is resolved.
    // The modal is open iff this is non-null (mirrors CurrentViewActions' isForkModalOpen pattern).
    const [pendingViewId, setPendingViewId] = useState<string | null>(null);

    // Same rule as `canSave` in CurrentViewActions: a view without a label can't be saved.
    const hasLabel = (currentLoadedView?.label?.[lang[0]] ?? '').trim() !== '';

    const applySelection = async (id: string) => {
        await saveLastUsedView(id);
        dispatch({type: 'view-settings-select-view', data: {viewId: id}});
    };

    const selectView = async (id: string) => {
        // Clicking the already-loaded view is a no-op (avoids a spurious confirmation modal).
        if (id === currentLoadedView?.id) {
            return;
        }

        // Gate the selection at the source: the event also drives the Explorer and the app-settings
        // highlight, so confirming here keeps every consumer in sync on cancel.
        if (isDirty) {
            setPendingViewId(id);
            return;
        }

        await applySelection(id);
    };

    const handleDiscard = async () => {
        if (pendingViewId !== null) {
            await applySelection(pendingViewId);
        }
        setPendingViewId(null);
    };

    const handleSave = async () => {
        const ok = await save();
        // On failure save() already surfaced the error notif; keep the modal open so edits aren't lost.
        if (ok && pendingViewId !== null) {
            await applySelection(pendingViewId);
            setPendingViewId(null);
        }
    };

    return {
        selectView,
        unsavedViewChangesModalProps: {
            isOpen: pendingViewId !== null,
            saveLoading,
            canSave: hasLabel,
            onClose: () => setPendingViewId(null),
            onDiscard: handleDiscard,
            onSave: handleSave,
        },
    };
};
