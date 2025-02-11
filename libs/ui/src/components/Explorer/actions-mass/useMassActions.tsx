// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {closeKitSnackBar, KitCheckbox, KitDropDown, KitSpace, openKitSnackBar} from 'aristid-ds';
import {Dispatch, useCallback, useEffect} from 'react';
import {FaChevronDown} from 'react-icons/fa';
import {RecordFilterCondition, RecordFilterOperator} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import {IMassActions} from '../_types';
import {MASS_SELECTION_ALL} from '../_constants';
import {
    IViewSettingsAction,
    IViewSettingsState,
    useEditSettings,
    ViewSettingsActionTypes
} from '../manage-view-settings';
import {prepareFiltersForRequest} from '../_queries/prepareFiltersForRequest';
import {MassSelection} from '../manage-view-settings/store-view-settings/viewSettingsReducer';

export const SNACKBAR_MASS_ID = 'SNACKBAR_MASS_ID';

/**
 * Hook used to manage mass selection as the snackbar and all kind of selection (manual, all in page, all in filters)
 *
 * @param isEnabled - whether the selection is present
 * @param view - represent the current view
 * @param dispatch - method to change the current view
 * @param totalCount - used for display purpose only
 * @param allVisibleKeys - list of all ids currently selected
 * @param massActions - array of all actions available on mass selection
 */
export const useMassActions = ({
    isEnabled,
    store: {dispatch, view},
    totalCount,
    allVisibleKeys,
    massActions
}: {
    isEnabled: boolean;
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    totalCount: number;
    allVisibleKeys: string[];
    massActions: IMassActions[];
}) => {
    const {t} = useSharedTranslation();
    const {onClose} = useEditSettings();

    useEffect(() => {
        if (view.massSelection === MASS_SELECTION_ALL || view.massSelection.length !== 0) {
            openKitSnackBar({
                duration: 0,
                closable: true,
                snackbarId: SNACKBAR_MASS_ID,
                onClose: () => _setSelectedKeys([]),
                message: t('explorer.massAction.selectedItems', {
                    count: view.massSelection === MASS_SELECTION_ALL ? totalCount : view.massSelection.length
                }),
                actions: massActions.map(({label, icon, callback}, index) => ({
                    key: index,
                    label,
                    icon,
                    onClick: async () => {
                        await callback(
                            view.massSelection === MASS_SELECTION_ALL
                                ? prepareFiltersForRequest(view.filters)
                                : interleaveElement(
                                      {operator: RecordFilterOperator.OR},
                                      view.massSelection.map(key => [
                                          {
                                              field: 'id',
                                              condition: RecordFilterCondition.EQUAL,
                                              value: key
                                          }
                                      ])
                                  )
                        );
                        dispatch({
                            type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                            payload: []
                        });
                    }
                }))
            });
        } else {
            closeKitSnackBar(SNACKBAR_MASS_ID);
        }
    }, [view.massSelection, view.filters, totalCount]);

    const isOnePage = view.pageSize > totalCount;
    const hasSelectedAllAvailableItems =
        view.massSelection === MASS_SELECTION_ALL || view.massSelection.length === totalCount;
    const hasSelectedSomeItems =
        view.massSelection !== MASS_SELECTION_ALL &&
        view.massSelection.length > 0 &&
        view.massSelection.length < totalCount;

    const _selectAllButton = isOnePage ? (
        <KitCheckbox
            indeterminate={hasSelectedSomeItems}
            checked={hasSelectedAllAvailableItems}
            onChange={_ => {
                if (hasSelectedAllAvailableItems) {
                    _setSelectedKeys([]);
                } else {
                    _setSelectedKeys(allVisibleKeys);
                }
            }}
        >
            {t('explorer.massAction.itemsTotal', {count: totalCount})}
        </KitCheckbox>
    ) : (
        <KitDropDown
            trigger={['click']}
            menu={{
                items: [
                    hasSelectedAllAvailableItems
                        ? null
                        : {
                              key: 'toggle_page_selection',
                              label: t('explorer.massAction.toggle_selection.select_page', {count: view.pageSize}),
                              onClick: () => {
                                  _setSelectedKeys([...new Set([...view.massSelection, ...allVisibleKeys])]);
                              }
                          },
                    {
                        key: 'toggle_all_selection',
                        label: hasSelectedAllAvailableItems
                            ? t('explorer.massAction.toggle_selection.deselect_all', {count: totalCount})
                            : t('explorer.massAction.toggle_selection.select_all', {count: totalCount}),
                        onClick: async () => {
                            if (hasSelectedAllAvailableItems) {
                                _setSelectedKeys([]);
                            } else {
                                onClose();
                                _setSelectedKeys(MASS_SELECTION_ALL);
                            }
                        }
                    }
                ]
            }}
        >
            <KitCheckbox indeterminate={hasSelectedSomeItems} checked={hasSelectedAllAvailableItems}>
                <KitSpace size="s">
                    {t('explorer.massAction.itemsTotal', {count: totalCount})}
                    <FaChevronDown />
                </KitSpace>
            </KitCheckbox>
        </KitDropDown>
    );

    const _setSelectedKeys = useCallback(
        (keys: MassSelection) =>
            dispatch({
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: keys
            }),
        [dispatch]
    );

    return {
        selectAllButton: isEnabled ? _selectAllButton : null,
        setSelectedKeys: isEnabled ? _setSelectedKeys : null
    };
};
