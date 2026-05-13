import {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {BREAK_TWO_LINES} from '_ui/constants';
import {useConfirmModal} from '_ui/hooks/useConfirmModal';

type UseAutomationFormNavigationParams = {
    hasUnsavedChanges: boolean;
    onCancel: () => void;
};

/**
 * Handles navigation away from the automation form.
 * Shows a confirmation modal if there are unsaved changes, and intercepts
 * browser back/forward navigation via the popstate event.
 */
export const useAutomationFormNavigation = ({hasUnsavedChanges, onCancel}: UseAutomationFormNavigationParams) => {
    const {t} = useTranslation();
    const {openConfirmModal} = useConfirmModal();

    const handleCancel = useCallback(() => {
        if (!hasUnsavedChanges) {
            onCancel();
            return;
        }

        openConfirmModal({
            title: t('automation.form.unsaved_changes.title'),
            content: t('automation.form.unsaved_changes.content') + BREAK_TWO_LINES + t('admin.are_you_sure'),
            onOk: onCancel,
        });
    }, [hasUnsavedChanges, onCancel, t, openConfirmModal]);

    // Note: useBlocker (react-router-dom) would be the idiomatic way to intercept all navigations,
    // but it requires a data router (createBrowserRouter). Until the admin router is migrated,
    // we fall back to the native popstate event to catch browser back/forward navigation.
    useEffect(() => {
        window.addEventListener('popstate', handleCancel);
        return () => window.removeEventListener('popstate', handleCancel);
    }, [handleCancel]);

    return {handleCancel};
};
