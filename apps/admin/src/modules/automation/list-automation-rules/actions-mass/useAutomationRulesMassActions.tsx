import {faSpinner, faToggleOff, faToggleOn, faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {closeKitSnackBar, KitAlert, KitSpace, KitTypography, openKitSnackBar} from 'aristid-ds';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useConfirmModal} from '_ui/hooks/useConfirmModal/useConfirmModal';
import {ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {useDeleteAutomationRulesMutation, useSetAutomationRulesActiveMutation} from '../../../../_gqlTypes';
import {type AutomationRulesData} from '../get-automation-rules-data/useGetAutomationRulesData';
import {AUTOMATION_MASS_ACTIONS_SNACKBAR_ID} from './constants';

type MassActionKey = 'activate' | 'deactivate' | 'delete';

type UseAutomationRulesMassActionsParams = {
    selectedRules: AutomationRulesData[];
    clearSelection: () => void;
    refetchRules: () => Promise<unknown>;
    resetPage: () => void;
};

export const useAutomationRulesMassActions = ({
    selectedRules,
    clearSelection,
    refetchRules,
    resetPage,
}: UseAutomationRulesMassActionsParams) => {
    const {t} = useTranslation();
    const {openConfirmModal} = useConfirmModal();
    // Tracks which action is running, not just whether one is: only the clicked button spins, the
    // other stays with its regular icon while both are disabled.
    const [runningAction, setRunningAction] = useState<MassActionKey | null>(null);
    const isExecuting = runningAction !== null;

    // `no-cache` prevents a cached response from masking an error on retry (same as useEditAutomationRule).
    // No `refetchQueries`: the list is refetched once, explicitly, at the end of the action.
    const [setAutomationRulesActive] = useSetAutomationRulesActiveMutation({fetchPolicy: 'no-cache'});
    // Not `useDeleteAutomationRule` (single-row delete): that hook carries a
    // `refetchQueries: [GetAutomationRulesDataDocument]` meant for the unitary delete button, which
    // stays untouched by this bulk action.
    const [deleteAutomationRules] = useDeleteAutomationRulesMutation({fetchPolicy: 'no-cache'});

    /**
     * The mutation returns the rules it actually processed, so a shorter list than the one requested
     * means a partial failure — same contract as `deactivateRecords` in the Explorer.
     */
    const _displayResultAlert = (processedCount: number, requestedCount: number, action: MassActionKey) => {
        if (processedCount === requestedCount) {
            KitAlert.success({
                showIcon: true,
                duration: SUCCESS_NOTIFICATION_DURATION,
                closable: true,
                message: t(`automation.table.mass_action.${action}.success`, {count: processedCount}),
                description: null,
            });
            return;
        }

        KitAlert.error({
            showIcon: true,
            duration: ERROR_NOTIFICATION_DURATION,
            closable: true,
            message: t(`automation.table.mass_action.${action}.error`, {count: requestedCount - processedCount}),
            description: t('automation.table.mass_action.partial_success', {count: processedCount}),
        });
    };

    const _runAction = async (action: MassActionKey, requestedCount: number, run: () => Promise<number>) => {
        setRunningAction(action);

        try {
            _displayResultAlert(await run(), requestedCount, action);
        } catch (error) {
            KitAlert.error({
                showIcon: true,
                duration: ERROR_NOTIFICATION_DURATION,
                closable: true,
                message: t(`automation.table.mass_action.${action}.error`, {count: requestedCount}),
                description: error instanceof Error ? error.message : String(error),
            });
        } finally {
            // Deleting the last rows of the last page would leave the user on an out-of-range page.
            if (action === 'delete') {
                resetPage();
            }
            // The batch is not transactional: refresh unconditionally so the list shows the real state.
            await refetchRules();
            clearSelection(); // empties the selection, which closes the snackbar
            setRunningAction(null);
        }
    };

    const _setRulesActive = async (rules: AutomationRulesData[], active: boolean) => {
        const {data} = await setAutomationRulesActive({
            variables: {ruleIds: rules.map(({id}) => id), active},
        });

        return data?.setAutomationRulesActive.length ?? 0;
    };

    const _deleteRules = async (rules: AutomationRulesData[]) => {
        const {data} = await deleteAutomationRules({variables: {ruleIds: rules.map(({id}) => id)}});

        return data?.deleteAutomationRules.length ?? 0;
    };

    // The engine refuses to activate a rule with an empty pipeline, so those are filtered out here
    // rather than sent and silently rejected: `nb_actions` is already in the row data, which lets the
    // alert name the reason.
    const rulesToActivate = selectedRules.filter(({active, nb_actions}) => !active && nb_actions > 0);
    const rulesWithEmptyPipeline = selectedRules.filter(({active, nb_actions}) => !active && nb_actions === 0);
    const rulesToDeactivate = selectedRules.filter(({active}) => active);

    const _confirmDelete = () => {
        const activeCount = selectedRules.filter(({active}) => active).length;

        openConfirmModal({
            title: t('automation.table.mass_action.delete.confirm.title'),
            content: (
                <KitSpace direction="vertical" size="s">
                    <KitTypography.Text>
                        {t('automation.table.mass_action.delete.confirm.content', {count: selectedRules.length})}
                    </KitTypography.Text>
                    {activeCount > 0 && (
                        <KitAlert
                            type="warning"
                            showIcon
                            description={t('automation.table.mass_action.delete.confirm.active_warning', {
                                count: activeCount,
                            })}
                        />
                    )}
                </KitSpace>
            ),
            onOk: () => _runAction('delete', selectedRules.length, () => _deleteRules(selectedRules)),
            dangerConfirm: true,
        });
    };

    useEffect(() => {
        if (selectedRules.length === 0) {
            closeKitSnackBar(AUTOMATION_MASS_ACTIONS_SNACKBAR_ID);
            return;
        }

        openKitSnackBar({
            duration: 0, // never auto-dismiss
            closable: true,
            snackbarId: AUTOMATION_MASS_ACTIONS_SNACKBAR_ID,
            toasterId: AUTOMATION_MASS_ACTIONS_SNACKBAR_ID,
            onClose: clearSelection,
            message: t('automation.table.mass_action.selected', {count: selectedRules.length}),
            actions: [
                {
                    key: 'activate',
                    label: t('automation.table.mass_action.activate.label'),
                    icon:
                        runningAction === 'activate' ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                            <FontAwesomeIcon icon={faToggleOn} />
                        ),
                    disabled: isExecuting || rulesToActivate.length === 0,
                    title:
                        rulesWithEmptyPipeline.length > 0
                            ? (t('automation.table.mass_action.activate.skipped_empty_pipeline', {
                                  count: rulesWithEmptyPipeline.length,
                              }) ?? undefined)
                            : undefined,
                    onClick: () =>
                        _runAction('activate', rulesToActivate.length, () => _setRulesActive(rulesToActivate, true)),
                },
                {
                    key: 'deactivate',
                    label: t('automation.table.mass_action.deactivate.label'),
                    icon:
                        runningAction === 'deactivate' ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                            <FontAwesomeIcon icon={faToggleOff} />
                        ),
                    disabled: isExecuting || rulesToDeactivate.length === 0,
                    onClick: () =>
                        _runAction('deactivate', rulesToDeactivate.length, () =>
                            _setRulesActive(rulesToDeactivate, false),
                        ),
                },
                {
                    key: 'delete',
                    label: t('automation.table.mass_action.delete.label'),
                    icon:
                        runningAction === 'delete' ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                            <FontAwesomeIcon icon={faTrash} />
                        ),
                    disabled: isExecuting,
                    onClick: _confirmDelete,
                },
            ],
        });
        // Re-opening with the same snackbarId replaces the previous one, so re-running this effect is
        // idempotent. Keep the dependency list to stable values only, to avoid a flicker on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRules, runningAction]);

    // Leaving the page must not leave an orphan snackbar behind.
    useEffect(() => () => closeKitSnackBar(AUTOMATION_MASS_ACTIONS_SNACKBAR_ID), []);
};
