import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {type FeatureHook, type IEntrypointLink, type IMassActions} from '../_types';
import {type IViewSettingsAction, type IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings-v2';
import {type Dispatch, type Key, useMemo} from 'react';
import {useExplorerData} from '../_queries/useExplorerData';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useConfirmModal} from '_ui/hooks/useConfirmModal/useConfirmModal';
import {MASS_SELECTION_ALL} from '../_constants';
import {BREAK_TWO_LINES} from '_ui/constants';
import {type IValueToSubmit} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {type IUIFiltersState} from '_ui/components/Filters/context/filtersReducer';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';

export const useDeleteLinkValues = ({
    isEnabled,
    store: {view, dispatch},
    filtersStore: {filters, filtersOperator},
    attributeIds,
    badgeAttributeIds,
    pagination,
    allVisibleKeys,
    onDelete,
    refetch,
}: FeatureHook<{
    pagination: null | {limit: number; offset: number};
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    filtersStore: IUIFiltersState;
    /** Must match the explorer's own split, or this second query refetches the avoided identities. */
    attributeIds: string[];
    badgeAttributeIds: string[];
    allVisibleKeys: string[];
    onDelete?: IMassActions['callback'];
    refetch: ReturnType<typeof useExplorerData>['refetch'];
}>) => {
    const {t} = useSharedTranslation();
    const {openConfirmModal} = useConfirmModal();
    const {saveValues} = useSaveValueBatchMutation();

    const isLink = view.entrypoint.type === 'link';
    const {data: linkData, canEditLinkAttributeValues: canUnlinkValues} = useExplorerData({
        entrypoint: view.entrypoint,
        libraryId: view.libraryId,
        attributeIds,
        badgeAttributeIds,
        fulltextSearch: view.fulltextSearch,
        pagination,
        sorts: view.sort,
        filtersOperator,
        filters,
        skip: !isLink,
    });

    const _unlinkMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.deactivate'),
            icon: <FontAwesomeIcon icon={faTrash} />,
            deselectAll: true,
            callback: massSelectionFilter => {
                openConfirmModal({
                    title:
                        t('explorer.delete_link', {
                            count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length,
                        }) ?? undefined,
                    content:
                        t('explorer.delete_link_description', {
                            count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length,
                        }) +
                        BREAK_TWO_LINES +
                        t('global.are_you_sure'),
                    okText: t('global.submit') ?? undefined,
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
                                    value: null,
                                })) ?? [];
                        } else {
                            values = (linkData?.records ?? []).reduce<IValueToSubmit[]>((acc, {id_value, key}) => {
                                if (view.massSelection.includes(key)) {
                                    acc.push({
                                        attribute: entrypoint.linkAttributeId,
                                        idValue: id_value ?? null,
                                        value: null,
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
                                        id: entrypoint.parentLibraryId,
                                    },
                                },
                                values,
                                undefined,
                                true,
                            );

                            onDelete?.(
                                massSelectionFilter,
                                values.map(({idValue}) => idValue as Key),
                            );
                            await refetch();
                        }
                        dispatch({
                            type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                            payload: [],
                        });
                    },
                });
            },
        }),
        [t, saveValues, view.massSelection, dispatch, view.libraryId, allVisibleKeys],
    );

    return {
        unlinkMassAction: isEnabled && canUnlinkValues ? _unlinkMassAction : null,
    };
};
