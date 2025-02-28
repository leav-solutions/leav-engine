// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {FeatureHook, IEntrypointLink, IMassActions} from '../_types';
import {IViewSettingsAction, IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings';
import {Dispatch, useMemo} from 'react';
import {useExplorerData} from '../_queries/useExplorerData';
import {FaTrash} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitModal} from 'aristid-ds';
import {MASS_SELECTION_ALL} from '../_constants';
import {IValueToSubmit} from '_ui/components/RecordEdition/EditRecordContent/_types';

export const useDeleteLinkValues = ({
    isEnabled,
    store: {view, dispatch},
    pagination,
    allVisibleKeys,
    refetch
}: FeatureHook<{
    pagination: null | {limit: number; offset: number};
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    allVisibleKeys: string[];
    refetch: ReturnType<typeof useExplorerData>['refetch'];
}>) => {
    const {t} = useSharedTranslation();
    const {saveValues} = useSaveValueBatchMutation();

    const isLink = view.entrypoint.type === 'link';
    const {data: linkData} = useExplorerData({
        entrypoint: view.entrypoint,
        libraryId: view.libraryId,
        attributeIds: view.attributesIds,
        fulltextSearch: view.fulltextSearch,
        pagination,
        sorts: view.sort,
        filters: view.filters,
        skip: !isLink
    });

    const _unlinkMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.deactivate'),
            icon: <FaTrash />,
            callback: () => {
                KitModal.confirm({
                    type: 'confirm',
                    dangerConfirm: true,
                    content: t('record_edition.delete_links_confirm', {
                        count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length
                    }),
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
                            values = (linkData?.records ?? []).reduce<IValueToSubmit[]>((acc, {id_value, itemId}) => {
                                if (view.massSelection.includes(itemId)) {
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
        unlinkMassAction: isEnabled ? _unlinkMassAction : null
    };
};
