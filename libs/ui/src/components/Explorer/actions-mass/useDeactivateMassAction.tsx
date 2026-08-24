import {type Dispatch, useMemo} from 'react';
import {KitAlert} from 'aristid-ds';
import {useDeactivateRecordsMutation} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useConfirmModal} from '_ui/hooks/useConfirmModal/useConfirmModal';
import {type FeatureHook, type IMassActions} from '../_types';
import {type IViewSettingsAction, type IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings';
import {MASS_SELECTION_ALL} from '../_constants';
import {type useExplorerData} from '../_queries/useExplorerData';
import {SUCCESS_ALERT_DURATION, BREAK_TWO_LINES} from '_ui/constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';

/**
 * Hook used to get the action for mass actions only available on selection.
 *
 * When the mutation for deactivation is done, the Apollo cache will be clean (`Record` and `RecordIdentity`)
 * from deactivated record.
 *
 * @param isEnabled - whether the action is present
 * @param view - represent the current view
 * @param dispatch - method to change the current view
 * @param libraryId - concerned library
 * @param allVisibleKeys - list of all visible keys used to know if we need to change page
 * @param refetch - method to get fresh data when we delete last page
 */
export const useDeactivateMassAction = ({
    isEnabled,
    store: {view, dispatch},
    allVisibleKeys,
    totalCount,
    onDeactivate,
    refetch,
}: FeatureHook<{
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    allVisibleKeys: string[];
    totalCount: number;
    onDeactivate?: IMassActions['callback'];
    refetch: ReturnType<typeof useExplorerData>['refetch'];
}>) => {
    const {t} = useSharedTranslation();
    const {openConfirmModal} = useConfirmModal();

    const [deactivateRecordsMutation] = useDeactivateRecordsMutation();

    const _deactivateMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.deactivate'),
            icon: <FontAwesomeIcon icon={faTrash} />,
            deselectAll: false,
            callback: (massSelectionFilter, _massSelection, searchQuery) => {
                openConfirmModal({
                    title:
                        t('explorer.deactivate_item', {
                            count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length,
                        }) ?? undefined,
                    content:
                        t('explorer.deactivate_item_description', {
                            count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length,
                        }) +
                        BREAK_TWO_LINES +
                        t('global.are_you_sure'),
                    onOk: async () => {
                        const {data} = await deactivateRecordsMutation({
                            variables: {
                                libraryId: view.libraryId,
                                filters: massSelectionFilter,
                                searchQuery,
                            },
                        });
                        const total =
                            view.massSelection === MASS_SELECTION_ALL ? totalCount : view.massSelection.length;
                        KitAlert.success({
                            showIcon: true,
                            duration: SUCCESS_ALERT_DURATION,
                            message: t('explorer.massAction.deactivate_message'),
                            description: t('explorer.massAction.deactivate_description', {
                                count: data?.deactivateRecords.length,
                                total,
                            }),
                            closable: true,
                        });
                        if (
                            view.massSelection === MASS_SELECTION_ALL ||
                            allVisibleKeys.every(key => view.massSelection.includes(key))
                        ) {
                            await refetch({
                                pagination: {
                                    limit: view.pageSize,
                                    offset: 0,
                                },
                            });
                        } else {
                            await refetch();
                        }
                        onDeactivate?.(massSelectionFilter, view.massSelection);
                        dispatch({
                            type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                            payload: [],
                        });
                    },
                });
            },
        }),
        [t, deactivateRecordsMutation, view.massSelection, dispatch, view.libraryId, allVisibleKeys, refetch],
    );

    return {
        deactivateMassAction: isEnabled ? _deactivateMassAction : null,
    };
};
