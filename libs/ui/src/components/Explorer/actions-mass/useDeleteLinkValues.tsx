// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {type FeatureHook, type IEntrypointLink, type IMassActions} from '../_types';
import {type IViewSettingsAction, type IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings';
import {type Dispatch, type Key, useMemo} from 'react';
import {useExplorerData} from '../_queries/useExplorerData';
import {FaTrash} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitModal} from 'aristid-ds';
import {BREAK_TWO_LINES, MASS_SELECTION_ALL} from '../_constants';
import {type IValueToSubmit} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {FiltersOperator, UIFilter} from '_ui/components/Filters';
import {type IUIFiltersState} from '_ui/components/Filters/context/filtersReducer';

export const useDeleteLinkValues = ({
    isEnabled,
    store: {view, dispatch},
    filtersStore: {filters, filtersOperator},
    pagination,
    allVisibleKeys,
    onDelete,
    refetch
}: FeatureHook<{
    pagination: null | {limit: number; offset: number};
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    filtersStore: IUIFiltersState;
    allVisibleKeys: string[];
    onDelete?: IMassActions['callback'];
    refetch: ReturnType<typeof useExplorerData>['refetch'];
}>) => {
    const {t} = useSharedTranslation();
    const {saveValues} = useSaveValueBatchMutation();

    const isLink = view.entrypoint.type === 'link';
    const {data: linkData, canEditLinkAttributeValues: canUnlinkValues} = useExplorerData({
        entrypoint: view.entrypoint,
        libraryId: view.libraryId,
        attributeIds: view.attributesIds,
        fulltextSearch: view.fulltextSearch,
        pagination,
        sorts: view.sort,
        filtersOperator,
        filters,
        skip: !isLink
    });

    const _unlinkMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.deactivate'),
            icon: <FaTrash />,
            callback: massSelectionFilter => {
                KitModal.confirm({
                    width: '100%',
                    style: {content: {width: '90vw', maxWidth: '656px'}},
                    type: 'confirm',
                    icon: false,
                    title:
                        t('explorer.delete_link', {
                            count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length
                        }) ?? undefined,
                    content:
                        t('explorer.delete_link_description', {
                            count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length
                        }) +
                        BREAK_TWO_LINES +
                        t('global.are_you_sure'),
                    okText: t('global.submit') ?? undefined,
                    cancelText: t('global.cancel') ?? undefined,
                    onOk: async () => {
                        const entrypoint = view.entrypoint as IEntrypointLink;
                        let values: IValueToSubmit[];
                        if (
                            view.massSelection === MASS_SELECTION_ALL ||
                            allVisibleKeys.every(key => view.massSelection.includes(key))
                        ) {
                            values =
                                (linkData?.records ?? []).map(({id_value}) => ({
                                    attribute: entrypoint.linkAttributeId,
                                    idValue: id_value ?? null,
                                    value: null
                                })) ?? [];
                        } else {
                            values = (linkData?.records ?? []).reduce<IValueToSubmit[]>((acc, {id_value, key}) => {
                                if (view.massSelection.includes(key)) {
                                    acc.push({
                                        attribute: entrypoint.linkAttributeId,
                                        idValue: id_value ?? null,
                                        value: null
                                    });
                                }
                                return acc;
                            }, []);
                        }

                        if (values.length > 0) {
                            await saveValues(
                                {
                                    id: entrypoint.parentRecordId,
                                    library: {
                                        id: entrypoint.parentLibraryId
                                    }
                                },
                                values,
                                undefined,
                                true
                            );

                            onDelete?.(
                                massSelectionFilter,
                                values.map(({idValue}) => idValue as Key)
                            );
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
        [t, saveValues, view.massSelection, dispatch, view.libraryId, allVisibleKeys]
    );

    return {
        unlinkMassAction: isEnabled && canUnlinkValues ? _unlinkMassAction : null
    };
};
