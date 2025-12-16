// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type AttributeDetailsFragment,
    AttributeType,
    type RecordFilterInput,
    useSaveValueBulkMutation,
} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useEffect, useMemo, useState} from 'react';
import {FaEdit} from 'react-icons/fa';
import {MASS_SELECTION_ALL} from '../_constants';
import {type FeatureHook, type IMassActions} from '../_types';
import {type IViewSettingsState} from '../manage-view-settings';
import {EditTreeAttributeValuesMapping} from './edit-attribute/EditTreeAttributeValuesMapping';
import {EditAttributeMassActionModal} from './edit-attribute/EditAttributeMassActionModal';
import {useListEditableAttributeHook} from './edit-attribute/useListEditableAttributeHook';
import {useCountValuesOccurrencesHook} from './edit-attribute/useCountValuesOccurrencesHook';
import {KitAlert, KitNotification} from 'aristid-ds';
import {ERROR_ALERT_DURATION, INFO_NOTIFICATION_DURATION} from '_ui/constants';
import {Loading} from '_ui/components/Loading';

export const useEditAttributeMassAction = ({
    isEnabled,
    store: {view},
    totalCount,
}: FeatureHook<{
    store: {
        view: IViewSettingsState;
    };
    totalCount: number;
}>) => {
    if (!isEnabled) {
        return {
            editAttributeMassAction: null,
            editAttributeMassActionModal: null,
        };
    }

    const {t} = useSharedTranslation();

    const [selectedAttribute, setSelectedAttribute] = useState<AttributeDetailsFragment | undefined>(undefined);
    const [massSelectionFilter, setMassSelectionFilter] = useState<RecordFilterInput[]>([]);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [editionMapping, setEditionMapping] = useState<Array<{before: string | null; after: string | null}>>([]);

    const editableAttributes = useListEditableAttributeHook({libraryId: view.libraryId});
    const valuesOccurrences = useCountValuesOccurrencesHook({
        attributeId: selectedAttribute?.id,
        libraryId: view.libraryId,
        recordFilters: massSelectionFilter,
    });

    const [executeSaveValueBulk] = useSaveValueBulkMutation();

    useEffect(() => {
        setEditionMapping([]);
    }, [selectedAttribute]);

    const _editAttributeMassAction: IMassActions = useMemo(
        () => ({
            label: t('explorer.massAction.editAttribute'),
            icon: <FaEdit />,
            deselectAll: false,
            callback: _massSelectionFilter => {
                setMassSelectionFilter(_massSelectionFilter);
                setEditionMapping([]);
                setOpenModal(true);
            },
        }),
        [t, view.massSelection],
    );

    const closeModal = () => {
        setOpenModal(false);
        setMassSelectionFilter([]);
        setSelectedAttribute(undefined);
        setEditionMapping([]);
    };

    const isMappingCompleted = useMemo(
        () =>
            valuesOccurrences.noValueCount === 0
                ? editionMapping.length === valuesOccurrences.occurrences.length
                : editionMapping.length === valuesOccurrences.occurrences.length + 1, // for undefined values
        [editionMapping, valuesOccurrences],
    );

    const bulkCounter = useMemo(
        () => (view.massSelection === MASS_SELECTION_ALL ? totalCount : view.massSelection.length),
        [view.massSelection, totalCount],
    );

    const onOkButtonClick = async () => {
        if (!selectedAttribute || !isMappingCompleted) {
            return;
        }
        try {
            await executeSaveValueBulk({
                variables: {
                    libraryId: view.libraryId,
                    recordsFilters: massSelectionFilter,
                    attributeId: selectedAttribute.id,
                    mapValues: editionMapping,
                },
            });

            closeModal();
            KitNotification.info({
                message: t('explorer.massAction.editAttribute_submit_notification_title'),
                description: t('explorer.massAction.editAttribute_submit_notification_description', {
                    counter: bulkCounter,
                }),
                duration: INFO_NOTIFICATION_DURATION,
                closable: true,
            });
        } catch (error) {
            KitAlert.error({
                showIcon: true,
                duration: ERROR_ALERT_DURATION,
                message: t('error.error_occurred'),
                description: t('explorer.massAction.editAttribute_submit_error'),
                closable: true,
            });
        }
    };

    if (editableAttributes.length === 0) {
        return {
            editAttributeMassAction: null,
            editAttributeMassActionModal: null,
        };
    }

    return {
        editAttributeMassAction: _editAttributeMassAction,
        editAttributeMassActionModal: (
            <EditAttributeMassActionModal
                isOpen={openModal}
                attributes={editableAttributes}
                setSelectedAttribute={setSelectedAttribute}
                massSelectionFilter={massSelectionFilter}
                elementsCount={bulkCounter}
                disableOkButton={!isMappingCompleted}
                onOkButtonClick={onOkButtonClick}
                onCancelButtonClick={closeModal}
            >
                {selectedAttribute != null && valuesOccurrences.loading ? <Loading /> : null}
                {selectedAttribute?.type === AttributeType.tree && (
                    <EditTreeAttributeValuesMapping
                        selectedAttribute={selectedAttribute}
                        valuesOccurrences={valuesOccurrences}
                        setAttributeMapping={(before, after) => {
                            setEditionMapping(
                                editionMapping.filter(mapping => mapping.before !== before).concat([{before, after}]),
                            );
                        }}
                    />
                )}
            </EditAttributeMassActionModal>
        ),
    };
};
