// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dispatch, useMemo} from 'react';
import {FaTrash} from 'react-icons/fa';
import {KitModal} from 'aristid-ds';
import {useDeactivateRecordsMutation} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FeatureHook, IMassActions} from '../_types';
import {IViewSettingsAction, IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings';
import {MASS_SELECTION_ALL} from '../_constants';
import type {useExplorerData} from '../_queries/useExplorerData';

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
    refetch
}: FeatureHook<{
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    allVisibleKeys: string[];
    refetch: ReturnType<typeof useExplorerData>['refetch'];
}>) => {
    const {t} = useSharedTranslation();

    const [deactivateRecordsMutation] = useDeactivateRecordsMutation();

    const _deactivateMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.deactivate'),
            icon: <FaTrash />,
            callback: massSelectionFilter => {
                KitModal.confirm({
                    type: 'confirm',
                    dangerConfirm: true,
                    content: t('records_deactivation.confirm', {
                        count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length
                    }),
                    okText: t('global.submit') ?? undefined,
                    cancelText: t('global.cancel') ?? undefined,
                    onOk: async () => {
                        await deactivateRecordsMutation({
                            variables: {
                                libraryId: view.libraryId,
                                filters: massSelectionFilter
                            }
                        });
                        if (
                            view.massSelection === MASS_SELECTION_ALL ||
                            allVisibleKeys.every(key => view.massSelection.includes(key))
                        ) {
                            await refetch({
                                pagination: {
                                    limit: view.pageSize,
                                    offset: 0
                                }
                            });
                        } else {
                            await refetch();
                        }
                        dispatch({
                            type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                            payload: []
                        });
                    }
                });
            }
        }),
        [t, deactivateRecordsMutation, view.massSelection, dispatch, view.libraryId, allVisibleKeys, refetch]
    );

    return {
        deactivateMassAction: isEnabled ? _deactivateMassAction : null
    };
};
