// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Dispatch, type ReactElement, useCallback, useMemo, useState} from 'react';
import {FaFileExport} from 'react-icons/fa';
import {KitAlert, KitNotification} from 'aristid-ds';
import {useExportLazyQuery, type RecordFilterInput} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type FeatureHook, type IMassActions} from '../_types';
import {type IViewSettingsAction, type IViewSettingsState} from '../manage-view-settings';
import {MASS_SELECTION_ALL} from '../_constants';
import {ERROR_ALERT_DURATION, INFO_NOTIFICATION_DURATION} from '_ui/constants';
import {ExportProfileSelectionModal} from './export/ExportProfileSelectionModal';

interface IUseExportMassActionReturn {
    exportMassAction: IMassActions | null;
    ExportModal: ReactElement | null;
}

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
}>): IUseExportMassActionReturn => {
    const {t} = useSharedTranslation();

    const [exportQuery] = useExportLazyQuery();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [massSelectionFilter, setMassSelectionFilter] = useState<RecordFilterInput[] | undefined>();

    const _handleConfirmExport = useCallback(
        async (profileLabel: string) => {
            if (!massSelectionFilter) {
                return;
            }

            const total = view.massSelection === MASS_SELECTION_ALL ? totalCount : view.massSelection.length;
            setIsExporting(true);

            try {
                const {data, error} = await exportQuery({
                    variables: {
                        library: view.libraryId,
                        filters: massSelectionFilter,
                        profile: profileLabel,
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
                setIsModalOpen(false);
            } catch (e) {
                if (e.extensions?.code === 'CUSTOM_CONFIG_ERROR') {
                    KitAlert.error({
                        showIcon: true,
                        duration: ERROR_ALERT_DURATION,
                        message: t('error.error_occurred', {count: total}),
                        description: t('explorer.massAction.export_config_error_description', {
                            library: view.libraryId,
                        }),
                        closable: true,
                    });
                } else {
                    KitAlert.error({
                        showIcon: true,
                        duration: ERROR_ALERT_DURATION,
                        message: t('error.error_occurred'),
                        description: t('explorer.massAction.export_error_description', {count: total}),
                        closable: true,
                    });
                }
            } finally {
                setIsExporting(false);
            }
        },
        [exportQuery, view.libraryId, view.massSelection, totalCount, massSelectionFilter, onExport, t],
    );

    const _handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setMassSelectionFilter(undefined);
    }, []);

    const _exportMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.export'),
            icon: <FaFileExport />,
            deselectAll: false,
            callback: filter => {
                setMassSelectionFilter(filter);
                setIsModalOpen(true);
            },
        }),
        [t],
    );

    const exportModal = isEnabled ? (
        <ExportProfileSelectionModal
            open={isModalOpen}
            libraryId={view.libraryId}
            isLoading={isExporting}
            onClose={_handleCloseModal}
            onConfirm={_handleConfirmExport}
        />
    ) : null;

    return {
        exportMassAction: isEnabled ? _exportMassAction : null,
        ExportModal: exportModal,
    };
};
