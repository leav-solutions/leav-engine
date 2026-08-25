import {type Dispatch, type Key, type ReactElement, useCallback, useMemo, useState} from 'react';
import {
    LibraryBehavior,
    useForcePreviewsGenerationMutation,
    useGetLibraryByIdQuery,
    type RecordFilterInput,
} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type FeatureHook, type IMassActions} from '../_types';
import {type IViewSettingsAction, type IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings';
import {MASS_SELECTION_ALL} from '../_constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faImage} from '@fortawesome/free-solid-svg-icons';
import {GeneratePreviewsModal} from './generate-previews/GeneratePreviewsModal';
import {KitAlert} from 'aristid-ds';
import {ERROR_ALERT_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';

interface IUseGeneratePreviewsMassActionReturn {
    generatePreviewsMassAction: IMassActions | null;
    GeneratePreviewsModal: ReactElement | null;
}

/**
 * Hook that provides a mass action configuration for generating previews for selected or all items
 * from a view/data set
 */
export const useGeneratePreviewsMassAction = ({
    isEnabled,
    store: {view, dispatch},
    totalCount,
    onGeneratePreviews,
}: FeatureHook<{
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    totalCount: number;
    onGeneratePreviews?: IMassActions['callback'];
}>): IUseGeneratePreviewsMassActionReturn => {
    const {t} = useSharedTranslation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [massSelectionFilter, setMassSelectionFilter] = useState<RecordFilterInput[] | undefined>();
    const [startPreviewsGeneration, {loading: isGeneratingPreviews}] = useForcePreviewsGenerationMutation();
    const {data: libraryData} = useGetLibraryByIdQuery({
        variables: {
            id: view.libraryId,
        },
    });

    const _handleConfirmGeneratePreviews = useCallback(
        async (previewSizes: Key[], isFailedOnly: boolean) => {
            if (!massSelectionFilter) {
                return;
            }

            const total = view.massSelection === MASS_SELECTION_ALL ? totalCount : view.massSelection.length;

            try {
                const result = await startPreviewsGeneration({
                    variables: {
                        libraryId: view.libraryId,
                        filters: massSelectionFilter ?? null,
                        failedOnly: isFailedOnly,
                        previewVersionSizeNames: previewSizes as string[],
                    },
                });

                const isSuccess = result.data?.forcePreviewsGeneration ?? false;

                if (isSuccess) {
                    KitAlert.success({
                        showIcon: true,
                        duration: SUCCESS_NOTIFICATION_DURATION,
                        closable: true,
                        message: t('files.previews_generation_success'),
                        description: null,
                    });
                } else {
                    KitAlert.info({
                        showIcon: true,
                        duration: ERROR_ALERT_DURATION,
                        closable: true,
                        message: t('files.previews_generation_nothing_to_do'),
                        description: null,
                    });
                }

                onGeneratePreviews?.(massSelectionFilter, view.massSelection);
                dispatch({type: ViewSettingsActionTypes.CLEAR_MASS_SELECTION});
                setIsModalOpen(false);
            } catch {
                KitAlert.error({
                    showIcon: true,
                    duration: ERROR_ALERT_DURATION,
                    message: t('error.error_occurred'),
                    description: t('explorer.massAction.generate_previews_error_description', {count: total}),
                    closable: true,
                });
            }
        },
        [view.libraryId, view.massSelection, totalCount, massSelectionFilter, onGeneratePreviews, dispatch, t],
    );

    const _handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setMassSelectionFilter(undefined);
    }, []);

    const _generatePreviewsMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.generate_previews'),
            icon: <FontAwesomeIcon icon={faImage} />,
            // keepSelection: the generate-previews modal is a separate component confirmed by
            // _handleConfirmGeneratePreviews, decoupled from this callback's own promise — that
            // function clears the selection itself, after the generation genuinely succeeds.
            keepSelection: true,
            callback: filter => {
                setMassSelectionFilter(filter);
                setIsModalOpen(true);
            },
        }),
        [t],
    );

    const generatePreviewsModal = isEnabled ? (
        <GeneratePreviewsModal
            open={isModalOpen}
            libraryId={view.libraryId}
            isGeneratingPreviews={isGeneratingPreviews}
            onClose={_handleCloseModal}
            onConfirm={_handleConfirmGeneratePreviews}
        />
    ) : null;

    const isLibraryFileBehavior = libraryData?.libraries?.list?.[0]?.behavior === LibraryBehavior.files;

    return {
        generatePreviewsMassAction: isEnabled && isLibraryFileBehavior ? _generatePreviewsMassAction : null,
        GeneratePreviewsModal: isLibraryFileBehavior ? generatePreviewsModal : null,
    };
};
