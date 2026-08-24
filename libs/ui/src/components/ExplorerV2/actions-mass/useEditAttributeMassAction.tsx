import {type Dispatch, useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {KitAlert, KitNotification, KitSelect, KitSpace, KitTypography} from 'aristid-ds';
import {type RecordFilterInput, useSaveValueBulkMutation} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ERROR_ALERT_DURATION, INFO_NOTIFICATION_DURATION} from '_ui/constants';
import {MASS_SELECTION_ALL} from '../_constants';
import {type AttributesPropertiesById, type FeatureHook} from '../_types';
import {type IViewSettingsAction, type IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings-v2';
import {EditTreeAttributeValuesMapping} from './edit-attribute/EditTreeAttributeValuesMapping';
import {EditAttributeMassActionModal} from './edit-attribute/EditAttributeMassActionModal';
import {useMassEditableAttributes} from './edit-attribute/useMassEditableAttributes';
import {EditMonoDependencyWorkflowTreeAttribute} from './edit-attribute/EditMonoDependencyWorkflowTreeAttribute';
import {type MassEditableAttribute} from './edit-attribute/_types';
import {useEditionMappingState} from './edit-attribute/useEditionMappingState';

export const useEditAttributeMassAction = ({
    isEnabled,
    store: {view, dispatch},
    attributesProperties,
    totalCount,
}: FeatureHook<{
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    attributesProperties: AttributesPropertiesById;
    totalCount: number;
}>) => {
    const {t} = useSharedTranslation();

    const [openModal, setOpenModal] = useState(false);

    // Represent the current selection, used to apply modifications to correct records
    const [massSelectionFilters, setMassSelectionFilters] = useState<RecordFilterInput[]>([]);
    // Fulltext search of the current selection (only set on "select all"), scoped alongside the filters
    const [massSelectionSearchQuery, setMassSelectionSearchQuery] = useState<string | undefined>();

    const editableAttributes = useMassEditableAttributes(attributesProperties);

    const [selectedAttribute, setSelectedAttribute] = useState<MassEditableAttribute | null>(null);
    const [executeSaveValueBulk] = useSaveValueBulkMutation({
        update(cache) {
            // Without this evict, Apollo keeps stale listDistinctValues occurrences in cache,
            // preventing a re-edit of the same attribute right after a previous (partial or full) bulk edit.
            cache.evict({fieldName: 'listDistinctValues'});
            cache.gc();
        },
    });
    const {editionMapping, resetEditionMapping, applyMappingChange, applyMonoDependencyWorkflowChange} =
        useEditionMappingState();

    useEffect(() => {
        resetEditionMapping();
    }, [selectedAttribute]);

    const _closeModal = () => {
        setOpenModal(false);
        setMassSelectionFilters([]);
        setMassSelectionSearchQuery(undefined);
        setSelectedAttribute(null);
        resetEditionMapping();
    };

    const bulkCount = view.massSelection === MASS_SELECTION_ALL ? totalCount : view.massSelection.length;

    // Shared by the "edit" button and the submit guard, so the two cannot diverge.
    const canEdit = selectedAttribute !== null && editionMapping.count > 0;

    const _saveEditionMapping = () => {
        if (!canEdit) {
            return;
        }

        executeSaveValueBulk({
            variables: {
                libraryId: view.libraryId,
                recordsFilters: massSelectionFilters,
                searchQuery: massSelectionSearchQuery,
                attributeId: selectedAttribute.id,
                mapping: editionMapping.mapping,
            },
        }).catch(() => {
            KitAlert.error({
                showIcon: true,
                duration: ERROR_ALERT_DURATION,
                message: t('error.error_occurred'),
                description: t('explorer.massAction.editAttribute_submit_error'),
                closable: true,
            });
        });

        _closeModal();
        dispatch({
            type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
            payload: [],
        });

        KitNotification.info({
            message: t('explorer.massAction.editAttribute_submit_notification_title'),
            description:
                t('explorer.massAction.editAttribute_submit_notification_description', {
                    count: editionMapping.count,
                }) ?? undefined,
            duration: INFO_NOTIFICATION_DURATION,
            closable: true,
        });
    };

    // TODO: https://aristid.atlassian.net/browse/LEAVC-830
    if (!isEnabled || editableAttributes.length === 0) {
        return {
            editAttributeMassAction: null,
            editAttributeMassActionModal: null,
        };
    }

    return {
        editAttributeMassAction: {
            label: t('explorer.massAction.editAttribute'),
            icon: <FontAwesomeIcon icon={faEdit} />,
            deselectAll: false,
            callback: (_massSelectionFilter: RecordFilterInput[], _massSelection, _searchQuery?: string) => {
                setMassSelectionFilters(_massSelectionFilter);
                setMassSelectionSearchQuery(_searchQuery);
                setSelectedAttribute(null);
                resetEditionMapping();
                setOpenModal(true);
            },
        },
        editAttributeMassActionModal: (
            <EditAttributeMassActionModal
                isOpen={openModal}
                bulkCount={bulkCount}
                canEdit={canEdit}
                onOkButtonClick={_saveEditionMapping}
                onCancelButtonClick={_closeModal}
            >
                <KitSpace direction="vertical" size="xxs" style={{width: '100%'}}>
                    <KitTypography.Text>
                        {t('explorer.massAction.editAttribute_attribute_select_title')}
                    </KitTypography.Text>
                    <KitSelect
                        size="large"
                        allowClear={false}
                        placeholder={t('explorer.massAction.editAttribute_attribute_select_placeholder')}
                        options={editableAttributes.map(attribute => ({
                            label: attribute.label,
                            value: attribute.id,
                        }))}
                        onChange={(attributeId: string) => {
                            setSelectedAttribute(editableAttributes.find(attribute => attribute.id === attributeId)!);
                        }}
                    />
                </KitSpace>
                {selectedAttribute != null &&
                    (selectedAttribute.hasEmptyDependency ? (
                        <EditTreeAttributeValuesMapping
                            libraryId={view.libraryId}
                            attribute={selectedAttribute}
                            massSelectionFilters={massSelectionFilters}
                            massSelectionSearchQuery={massSelectionSearchQuery}
                            setAttributeMapping={applyMappingChange}
                        />
                    ) : selectedAttribute.isSimpleWorkflow ? (
                        <EditTreeAttributeValuesMapping
                            libraryId={view.libraryId}
                            attribute={selectedAttribute}
                            massSelectionFilters={massSelectionFilters}
                            massSelectionSearchQuery={massSelectionSearchQuery}
                            setAttributeMapping={applyMappingChange}
                        />
                    ) : selectedAttribute.isMonoDependencyWorkflow ? (
                        <EditMonoDependencyWorkflowTreeAttribute
                            libraryId={view.libraryId}
                            attribute={selectedAttribute}
                            massSelectionFilters={massSelectionFilters}
                            massSelectionSearchQuery={massSelectionSearchQuery}
                            setAttributeMapping={applyMonoDependencyWorkflowChange}
                        />
                    ) : null)}
            </EditAttributeMassActionModal>
        ),
    };
};
