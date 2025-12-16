// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Dispatch, useMemo} from 'react';
import {FaFileExport} from 'react-icons/fa';
import {KitAlert, KitModal, KitNotification} from 'aristid-ds';
import {useExportLazyQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type FeatureHook, type IMassActions} from '../_types';
import {type IViewSettingsAction, type IViewSettingsState} from '../manage-view-settings';
import {BREAK_TWO_LINES, MASS_SELECTION_ALL} from '../_constants';
import {ERROR_ALERT_DURATION, INFO_NOTIFICATION_DURATION} from '_ui/constants';

/**
 * Hook that provides a mass action configuration for exporting selected or all items
 * from a view/data set
 */
export const useExportMassAction = ({
    isEnabled,
    store: {view, dispatch},
    totalCount,
    onExport,
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
            deselectAll: false,
            callback: massSelectionFilter => {
                KitModal.confirm({
                    width: '100%',
                    style: {content: {width: '90vw', maxWidth: '656px'}},
                    icon: false,
                    type: 'confirm',
                    title:
                        t('explorer.export_item', {
                            count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length,
                        }) ?? undefined,
                    content:
                        t('explorer.export_item_description', {
                            count: view.massSelection === MASS_SELECTION_ALL ? Infinity : view.massSelection.length,
                        }) +
                        BREAK_TWO_LINES +
                        t('global.are_you_sure'),
                    okText: t('global.confirm') ?? undefined,
                    cancelText: t('global.cancel') ?? undefined,
                    onOk: async () => {
                        const total =
                            view.massSelection === MASS_SELECTION_ALL ? totalCount : view.massSelection.length;
                        try {
                            const {error} = await exportQuery({
                                fetchPolicy: 'no-cache',
                                variables: {
                                    library: view.libraryId,
                                    filters: massSelectionFilter,
                                    profile: 'default', // Set 'default' by default, it'll change when we can select a profile from the UI
                                },
                            });
                            if (error) {
                                // Preserve the extensions property which contains the error code
                                const graphQLError = error.graphQLErrors?.[0];
                                const errorWithExtensions = new Error(error.message);
                                (errorWithExtensions as any).extensions = graphQLError?.extensions;
                                throw errorWithExtensions;
                            }

                            KitNotification.info({
                                message: t('explorer.massAction.export_message'),
                                description: t('explorer.massAction.export_description', {
                                    count: total,
                                    total,
                                }),
                                duration: INFO_NOTIFICATION_DURATION,
                                closable: true,
                            });

                            onExport?.(massSelectionFilter, view.massSelection);
                        } catch (e) {
                            if (e.extensions?.code === 'CUSTOM_CONFIG_ERROR') {
                                KitAlert.error({
                                    showIcon: true,
                                    duration: ERROR_ALERT_DURATION,
                                    message: t('explorer.massAction.export_config_error_message'),
                                    description: t('explorer.massAction.export_config_error_description'),
                                    closable: true,
                                });
                            } else {
                                KitAlert.error({
                                    showIcon: true,
                                    duration: ERROR_ALERT_DURATION,
                                    message: t('explorer.massAction.export_error_message'),
                                    description: t('explorer.massAction.export_error_description', {count: total}),
                                    closable: true,
                                });
                            }
                        }
                    },
                });
            },
        }),
        [t, exportQuery, view.massSelection, dispatch, view.libraryId],
    );

    return {
        exportMassAction: isEnabled ? _exportMassAction : null,
    };
};
