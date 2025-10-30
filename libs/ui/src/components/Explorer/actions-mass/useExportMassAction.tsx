// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Dispatch, useMemo} from 'react';
import {FaFileExport} from 'react-icons/fa';
import {KitAlert, KitModal} from 'aristid-ds';
import {useExportLazyQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type FeatureHook, type IMassActions} from '../_types';
import {type IViewSettingsAction, type IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings';
import {MASS_SELECTION_ALL} from '../_constants';
import {ERROR_ALERT_DURATION, SUCCESS_ALERT_DURATION} from '_ui/constants';

/**
 * Hook that provides a mass action configuration for exporting selected or all items
 * from a view/data set
 */
export const useExportMassAction = ({
    isEnabled,
    store: {view, dispatch},
    totalCount,
    onExport
}: FeatureHook<{
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    totalCount: number;
    onExport?: IMassActions['callback'];
}>) => {
    const {t} = useSharedTranslation();

    const [exportQuery] = useExportLazyQuery();

    const _exportMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.export'),
            icon: <FaFileExport />,
            callback: massSelectionFilter => {
                KitModal.confirm({
                    width: '100%',
                    style: {content: {width: '90vw', maxWidth: '656px'}},
                    icon: false,
                    type: 'confirm',
                    content: t('explorer.massAction.export_confirm', {
                        count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length
                    }),
                    okText: t('global.confirm') ?? undefined,
                    cancelText: t('global.cancel') ?? undefined,
                    onOk: async () => {
                        try {
                            const {data, error} = await exportQuery({
                                variables: {
                                    library: view.libraryId,
                                    filters: massSelectionFilter,
                                    profile: 'default'
                                }
                            });
                            if (error) {
                                // Preserve the extensions property which contains the error code
                                const graphQLError = error.graphQLErrors?.[0];
                                const errorWithExtensions = new Error(error.message);
                                (errorWithExtensions as any).extensions = graphQLError?.extensions;
                                throw errorWithExtensions;
                            }
                            const total =
                                view.massSelection === MASS_SELECTION_ALL ? totalCount : view.massSelection.length;
                            KitAlert.success({
                                showIcon: true,
                                duration: SUCCESS_ALERT_DURATION,
                                message: t('explorer.massAction.export_message'),
                                description: t('explorer.massAction.export_description', {
                                    count: data?.export.length,
                                    total
                                }),
                                closable: true
                            });
                            onExport?.(massSelectionFilter, view.massSelection);
                            // Reset selection when export is done
                            dispatch({type: ViewSettingsActionTypes.SET_SELECTED_KEYS, payload: []});
                        } catch (e) {
                            if (e.extensions?.code === 'CUSTOM_CONFIG_ERROR') {
                                KitAlert.error({
                                    showIcon: true,
                                    duration: ERROR_ALERT_DURATION,
                                    message: t('error.error_occurred'),
                                    description: t('explorer.massAction.export_config_error_description', {
                                        library: view.libraryId
                                    }),
                                    closable: true
                                });
                            } else {
                                KitAlert.error({
                                    showIcon: true,
                                    duration: ERROR_ALERT_DURATION,
                                    message: t('error.error_occurred'),
                                    description: t('explorer.massAction.export_error_description'),
                                    closable: true
                                });
                            }
                        }
                    }
                });
            }
        }),
        [t, exportQuery, view.massSelection, dispatch, view.libraryId]
    );

    return {
        exportMassAction: isEnabled ? _exportMassAction : null
    };
};
