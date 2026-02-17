// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {closeKitSnackBar, KitCheckbox, KitDropDown, KitSpace, KitTypography, openKitSnackBar} from 'aristid-ds';
import {type Dispatch, useCallback, useEffect, useRef, useState} from 'react';
import {RecordFilterCondition, RecordFilterOperator} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import {type IMassActions, type MassSelection} from '../_types';
import {MASS_SELECTION_ALL} from '../_constants';
import {type IViewSettingsAction, type IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings';
import {prepareFiltersForRequest} from '_ui/components/Filters';
import {type IUIFiltersState} from '_ui/components/Filters/context/filtersReducer';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';
import {ResultsCount} from './ResultsCount';

/**
 * Hook used to manage mass selection as the snackbar and all kind of selection (manual, all in page, all in filters)
 *
 * @param isEnabled - whether the selection is present
 * @param view - represent the current view
 * @param dispatch - method to change the current view
 * @param totalCountFiltered - number of results with the current filters
 * @param totalCountLibrary - number of total items in the library (without filters)
 * @param allVisibleKeys - list of all ids currently selected
 * @param massActions - array of all actions available on mass selection
 * @param snackbarId - id of the snackbar displayed
 */
export const useMassActions = ({
    isEnabled,
    store: {dispatch, view},
    filtersStore: {filters, filtersOperator},
    totalCountFiltered,
    totalCountLibrary,
    allVisibleKeys,
    massActions,
    snackbarId,
}: {
    isEnabled: boolean;
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    filtersStore: IUIFiltersState;
    totalCountFiltered: number;
    totalCountLibrary: number;
    allVisibleKeys: string[];
    massActions: IMassActions[];
    snackbarId: string;
}) => {
    const {t} = useSharedTranslation();
    const [isInactive, setIsInactive] = useState(false);

    useEffect(() => {
        setIsInactive(filters.filter(f => f.field === 'active')?.[0]?.value === 'false');
    }, [filters]);

    useEffect(() => {
        if (view.massSelection === MASS_SELECTION_ALL || view.massSelection.length !== 0) {
            openKitSnackBar({
                duration: 0,
                closable: true,
                snackbarId,
                toasterId: snackbarId,
                onClose: () => _setSelectedKeys([]),
                message: t('explorer.massAction.selectedItems', {
                    count: view.massSelection === MASS_SELECTION_ALL ? totalCountFiltered : view.massSelection.length,
                }),
                actions: massActions.map(({label, icon, deselectAll, callback}, index) => ({
                    key: index,
                    label,
                    icon,
                    onClick: async () => {
                        await callback(
                            view.massSelection === MASS_SELECTION_ALL
                                ? prepareFiltersForRequest(filters, filtersOperator)
                                : interleaveElement(
                                      {operator: RecordFilterOperator.OR},
                                      view.massSelection.map(key => [
                                          {
                                              field: 'id',
                                              condition: RecordFilterCondition.EQUAL,
                                              value: String(key),
                                          },
                                      ]),
                                  ),
                            view.massSelection,
                        );
                        if (deselectAll) {
                            dispatch({
                                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                                payload: [],
                            });
                        }
                    },
                })),
            });
        } else {
            closeKitSnackBar(snackbarId);
        }
    }, [view.massSelection, filters, totalCountFiltered]);

    useEffect(() => () => closeKitSnackBar(snackbarId), []);

    const isOnePage = view.pageSize > totalCountFiltered;
    const hasSelectedAllAvailableItems =
        view.massSelection === MASS_SELECTION_ALL || view.massSelection.length === totalCountFiltered;
    const hasSelectedSomeItems =
        view.massSelection !== MASS_SELECTION_ALL &&
        view.massSelection.length > 0 &&
        view.massSelection.length < totalCountFiltered;

    const _selectAllButton = isOnePage ? (
        <KitCheckbox
            aria-checked={hasSelectedSomeItems ? 'mixed' : hasSelectedAllAvailableItems ? 'true' : 'false'}
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
            <ResultsCount
                t={t}
                isInactive={isInactive}
                totalCountFiltered={totalCountFiltered}
                totalCountLibrary={totalCountLibrary}
            />
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
                              },
                          },
                    {
                        key: 'toggle_all_selection',
                        label: hasSelectedAllAvailableItems
                            ? t('explorer.massAction.toggle_selection.deselect_all', {count: totalCountFiltered})
                            : t('explorer.massAction.toggle_selection.select_all', {count: totalCountFiltered}),
                        onClick: async () => {
                            if (hasSelectedAllAvailableItems) {
                                _setSelectedKeys([]);
                            } else {
                                _setSelectedKeys(MASS_SELECTION_ALL);
                            }
                        },
                    },
                ],
            }}
        >
            <KitCheckbox
                aria-checked={hasSelectedSomeItems ? 'mixed' : hasSelectedAllAvailableItems ? 'true' : 'false'}
                indeterminate={hasSelectedSomeItems}
                checked={hasSelectedAllAvailableItems}
            >
                <KitSpace size="xs">
                    <ResultsCount
                        t={t}
                        isInactive={isInactive}
                        totalCountFiltered={totalCountFiltered}
                        totalCountLibrary={totalCountLibrary}
                    />
                    <FontAwesomeIcon icon={faChevronDown} />
                </KitSpace>
            </KitCheckbox>
        </KitDropDown>
    );

    const _setSelectedKeys = useCallback(
        (keys: MassSelection) =>
            dispatch({
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: keys,
            }),
        [dispatch],
    );

    return {
        selectAllButton: isEnabled ? _selectAllButton : null,
        setSelectedKeys: isEnabled ? _setSelectedKeys : null,
    };
};
