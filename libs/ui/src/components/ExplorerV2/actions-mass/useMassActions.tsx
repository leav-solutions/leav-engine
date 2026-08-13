import {closeKitSnackBar, KitCheckbox, KitDropDown, KitSpace, openKitSnackBar} from 'aristid-ds';
import {type Dispatch, useCallback, useEffect, useState} from 'react';
import {RecordFilterCondition, RecordFilterOperator} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import {type IMassActions, type MassSelection} from '../_types';
import {MASS_SELECTION_ALL} from '../_constants';
import {type IViewSettingsAction, type IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings-v2';
import {prepareFiltersForRequest} from '_ui/components/Filters';
import {type IUIFiltersState} from '_ui/components/Filters/context/filtersReducer';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCaretDown} from '@fortawesome/free-solid-svg-icons';
import {ResultsCount} from './ResultsCount';

/**
 * Hook used to manage mass selection as the snackbar and all kind of selection (manual, all in page, all in filters)
 *
 * @param isEnabled - whether the selection is present
 * @param loading - whether results are reloading; disables selection interactions while true
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
    loading,
    store: {dispatch, view},
    filtersStore: {filters, filtersOperator},
    totalCountFiltered,
    totalCountLibrary,
    allVisibleKeys,
    massActions,
    snackbarId,
}: {
    isEnabled: boolean;
    loading: boolean;
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

    const _setSelectedKeys = useCallback(
        (keys: MassSelection) =>
            dispatch({
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: keys,
            }),
        [dispatch],
    );

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
                            view.massSelection === MASS_SELECTION_ALL ? view.fulltextSearch || undefined : undefined,
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
    const isSelectionInteractionDisabled = loading || totalCountFiltered === 0;
    const hasSelectedAllAvailableItems =
        view.massSelection === MASS_SELECTION_ALL || view.massSelection.length === totalCountFiltered;
    const hasSelectedAllVisibleItems =
        view.massSelection.length >= allVisibleKeys.length &&
        allVisibleKeys.find(visibleKey => view.massSelection.includes(visibleKey)) !== undefined;
    const hasSelectedSomeItems =
        view.massSelection !== MASS_SELECTION_ALL &&
        view.massSelection.length > 0 &&
        view.massSelection.length < totalCountFiltered;

    const _selectAllButton = isOnePage ? (
        <KitCheckbox
            aria-checked={hasSelectedSomeItems ? 'mixed' : hasSelectedAllAvailableItems ? 'true' : 'false'}
            indeterminate={hasSelectedSomeItems}
            checked={hasSelectedAllAvailableItems}
            disabled={isSelectionInteractionDisabled}
            onChange={() => {
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
                        : hasSelectedAllVisibleItems
                          ? {
                                key: 'toggle_page_selection',
                                label: t('explorer.massAction.toggle_selection.deselect_page', {
                                    count: allVisibleKeys.length,
                                }),
                                disabled: isSelectionInteractionDisabled,
                                onClick: () =>
                                    _setSelectedKeys(
                                        [...view.massSelection].filter(key => !allVisibleKeys.includes(String(key))),
                                    ),
                            }
                          : {
                                key: 'toggle_page_selection',
                                label: t('explorer.massAction.toggle_selection.select_page', {
                                    count: allVisibleKeys.length,
                                }),
                                disabled: isSelectionInteractionDisabled,
                                onClick: () =>
                                    _setSelectedKeys([...new Set([...view.massSelection, ...allVisibleKeys])]),
                            },
                    !hasSelectedAllAvailableItems
                        ? {
                              key: 'select_all_selection',
                              label: t('explorer.massAction.toggle_selection.select_all', {count: totalCountFiltered}),
                              disabled: isSelectionInteractionDisabled,
                              onClick: async () => {
                                  _setSelectedKeys(MASS_SELECTION_ALL);
                              },
                          }
                        : null,
                    hasSelectedAllAvailableItems ||
                    (!hasSelectedAllAvailableItems && !hasSelectedAllVisibleItems && view.massSelection.length >= 2)
                        ? {
                              key: 'deselect_all_selection',
                              label: t('explorer.massAction.toggle_selection.deselect_all'),
                              disabled: isSelectionInteractionDisabled,
                              onClick: async () => {
                                  _setSelectedKeys([]);
                              },
                          }
                        : null,
                ],
            }}
        >
            <KitCheckbox
                aria-checked={hasSelectedSomeItems ? 'mixed' : hasSelectedAllAvailableItems ? 'true' : 'false'}
                indeterminate={hasSelectedSomeItems}
                checked={hasSelectedAllAvailableItems}
            >
                <KitSpace size="xxs">
                    <ResultsCount
                        t={t}
                        isInactive={isInactive}
                        totalCountFiltered={totalCountFiltered}
                        totalCountLibrary={totalCountLibrary}
                    />
                    <FontAwesomeIcon icon={faCaretDown} size="2xs" />
                </KitSpace>
            </KitCheckbox>
        </KitDropDown>
    );

    return {
        selectAllButton: isEnabled ? _selectAllButton : null,
        setSelectedKeys: isEnabled ? _setSelectedKeys : null,
    };
};
