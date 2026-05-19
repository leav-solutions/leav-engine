import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useBlocker} from 'react-router-dom';
import {BREAK_TWO_LINES} from '_ui/constants';
import {useConfirmModal} from '_ui/hooks/useConfirmModal';

type UseAutomationFormNavigationParams = {
    shouldBlockNavigation: boolean;
};

/**
 * Registers a navigation blocker on the automation form: when the form has
 * unsaved changes, any attempt to navigate away (Cancel button, BackButton,
 * sidebar, browser back/forward, programmatic navigate) is intercepted and a
 * confirmation modal is opened. Confirming proceeds to the requested
 * destination; cancelling stays on the form.
 *
 * The blocker is bypassed while `isSubmitting` is true so that the navigation
 * triggered by a successful submit does not surface the confirmation modal.
 */
export const useAutomationFormNavigation = ({shouldBlockNavigation}: UseAutomationFormNavigationParams) => {
    const {t} = useTranslation();
    const {openConfirmModal} = useConfirmModal();

    const blocker = useBlocker(
        ({currentLocation, nextLocation}) =>
            shouldBlockNavigation && currentLocation.pathname !== nextLocation.pathname,
    );

    useEffect(() => {
        if (blocker.state !== 'blocked') {
            return;
        }

        openConfirmModal({
            title: t('automation.form.unsaved_changes.title'),
            content: t('automation.form.unsaved_changes.content') + BREAK_TWO_LINES + t('admin.are_you_sure'),
            onOk: () => blocker.proceed(),
            onCancel: () => blocker.reset(),
        });
    }, [blocker, openConfirmModal, t]);
};
