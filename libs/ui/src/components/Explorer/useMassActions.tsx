// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {closeKitSnackBar, KitCheckbox, KitDropDown, KitSpace, openKitSnackBar} from 'aristid-ds';
import {Dispatch, useCallback, useEffect} from 'react';
import {FaChevronDown} from 'react-icons/fa';
import {RecordFilterCondition, RecordFilterOperator} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import {IMassActions} from './_types';
import {MASS_SELECTION_ALL} from './_constants';
import {IViewSettingsAction, IViewSettingsState, ViewSettingsActionTypes} from './manage-view-settings';
import {prepareFiltersForRequest} from './_queries/prepareFiltersForRequest';
import {MassSelection} from './manage-view-settings/store-view-settings/viewSettingsReducer';

export const useMassActions = ({
    isEnabled,
    store: {dispatch, view},
    itemsTotal,
    allVisibleKeys,
    massActions
}: {
    isEnabled: boolean;
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    itemsTotal: number;
    allVisibleKeys: string[];
    massActions: IMassActions[];
}) => {
    const {t} = useSharedTranslation();

    useEffect(() => {
        if (view.massSelection === MASS_SELECTION_ALL || view.massSelection.length !== 0) {
            openKitSnackBar({
                duration: 0,
                closable: true,
                onClose: () => _updateSelectedKeys([]),
                message: t('explorer.massAction.selectedItems', {
                    count: view.massSelection === MASS_SELECTION_ALL ? itemsTotal : view.massSelection.length
                }),
                actions: massActions.map(({label, icon, callback}, index) => ({
                    key: index,
                    label,
                    icon,
                    onClick: () =>
                        callback(
                            view.massSelection === MASS_SELECTION_ALL
                                ? prepareFiltersForRequest(view.filters)
                                : interleaveElement(
                                      {operator: RecordFilterOperator.OR},
                                      view.massSelection.map(key => [
                                          {
                                              field: 'id', // TODO: c'est le bon champ ?
                                              condition: RecordFilterCondition.EQUAL,
                                              value: key
                                          }
                                      ])
                                  )
                        )
                }))
            });
        } else {
            closeKitSnackBar();
        }
    }, [view.massSelection, view.filters]);

    const isOnePage = view.pageSize > itemsTotal;
    const hasSelectedAllAvailableItems =
        view.massSelection === MASS_SELECTION_ALL || view.massSelection.length === itemsTotal;
    const hasSelectedSomeItems =
        view.massSelection !== MASS_SELECTION_ALL &&
        view.massSelection.length > 0 &&
        view.massSelection.length < itemsTotal;

    const _selectAllButton = isOnePage ? (
        <KitCheckbox
            indeterminate={hasSelectedSomeItems}
            checked={hasSelectedAllAvailableItems}
            onChange={_ => {
                if (hasSelectedAllAvailableItems) {
                    _updateSelectedKeys([]);
                } else {
                    _updateSelectedKeys(allVisibleKeys);
                }
            }}
        >
            {t('explorer.massAction.itemsTotal', {count: itemsTotal})}
        </KitCheckbox>
    ) : (
        <KitDropDown
            trigger={['click']}
            menu={{
                items: [
                    {
                        key: 'toggle_page_selection',
                        label: t('explorer.massAction.toggle_selection.select_page', {count: view.pageSize}),
                        onClick: () => {
                            _updateSelectedKeys([...new Set([...view.massSelection, ...allVisibleKeys])]);
                        }
                    },
                    {
                        key: 'toggle_all_selection',
                        label: hasSelectedAllAvailableItems
                            ? t('explorer.massAction.toggle_selection.deselect_all', {count: itemsTotal})
                            : t('explorer.massAction.toggle_selection.select_all', {count: itemsTotal}),
                        onClick: async () => {
                            if (hasSelectedAllAvailableItems) {
                                _updateSelectedKeys([]);
                            } else {
                                _updateSelectedKeys(MASS_SELECTION_ALL);
                            }
                        }
                    }
                ]
            }}
        >
            <KitCheckbox indeterminate={hasSelectedSomeItems} checked={hasSelectedAllAvailableItems}>
                <KitSpace size="s">
                    {t('explorer.massAction.itemsTotal', {count: itemsTotal})}
                    <FaChevronDown />
                </KitSpace>
            </KitCheckbox>
        </KitDropDown>
    );

    const _updateSelectedKeys = useCallback(
        (keys: MassSelection) => {
            dispatch({
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: keys
            });
        },
        [dispatch]
    );

    return {
        selectAllButton: isEnabled ? _selectAllButton : null,
        updateSelectedKeys: isEnabled ? _updateSelectedKeys : null
    };
};
