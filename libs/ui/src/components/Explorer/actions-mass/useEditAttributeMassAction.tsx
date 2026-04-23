// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {KitAlert, KitEmpty, KitNotification, KitSelect, KitSpace, KitTypography} from 'aristid-ds';
import {localizedTranslation} from '@leav/utils';
import {type RecordFilterInput, type SaveValueBulkMappingInput, useSaveValueBulkMutation} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ERROR_ALERT_DURATION, INFO_NOTIFICATION_DURATION} from '_ui/constants';
import {useLang} from '_ui/hooks';
import {MASS_SELECTION_ALL} from '../_constants';
import {type FeatureHook} from '../_types';
import {type IViewSettingsState} from '../manage-view-settings';
import {EditTreeAttributeValuesMapping} from './edit-attribute/EditTreeAttributeValuesMapping';
import {EditAttributeMassActionModal} from './edit-attribute/EditAttributeMassActionModal';
import {useMassEditableAttributes} from './edit-attribute/useMassEditableAttributes';
import {type MassEditableAttribute} from './edit-attribute/_types';

const EDITION_MAPPING_DEFAULT_VALUES = {count: 0, mapping: []};

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
    const {lang: availableLanguages} = useLang();
    const {t} = useSharedTranslation();

    const [openModal, setOpenModal] = useState(false);

    // Represent the current selection, used to apply modifications to correct records
    const [massSelectionFilters, setMassSelectionFilters] = useState<RecordFilterInput[]>([]);

    const editableAttributes = useMassEditableAttributes({libraryId: view.libraryId});

    const [selectedAttribute, setSelectedAttribute] = useState<MassEditableAttribute | null>(null);
    const [executeSaveValueBulk] = useSaveValueBulkMutation();
    const [editionMapping, setEditionMapping] = useState<{count: number; mapping: SaveValueBulkMappingInput[]}>(
        EDITION_MAPPING_DEFAULT_VALUES,
    );
    useEffect(() => {
        setEditionMapping(EDITION_MAPPING_DEFAULT_VALUES);
    }, [selectedAttribute]);

    const _closeModal = () => {
        setOpenModal(false);
        setMassSelectionFilters([]);
        setSelectedAttribute(null);
        setEditionMapping(EDITION_MAPPING_DEFAULT_VALUES);
    };

    const bulkCount = view.massSelection === MASS_SELECTION_ALL ? totalCount : view.massSelection.length;

    const _saveEditionMapping = () => {
        if (!selectedAttribute || editionMapping.count === 0) {
            return;
        }

        executeSaveValueBulk({
            variables: {
                libraryId: view.libraryId,
                recordsFilters: massSelectionFilters,
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
            callback: (_massSelectionFilter: RecordFilterInput[]) => {
                setMassSelectionFilters(_massSelectionFilter);
                setSelectedAttribute(null);
                setEditionMapping(EDITION_MAPPING_DEFAULT_VALUES);
                setOpenModal(true);
            },
        },
        editAttributeMassActionModal: (
            <EditAttributeMassActionModal
                isOpen={openModal}
                bulkCount={bulkCount}
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
                            label: localizedTranslation(attribute.label, availableLanguages),
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
                            setAttributeMapping={({before, after, occurrenceCount}) => {
                                setEditionMapping(
                                    before === after
                                        ? {
                                              count: editionMapping.count - occurrenceCount,
                                              mapping: [
                                                  {
                                                      values: (editionMapping.mapping[0]?.values ?? []).filter(
                                                          value => value.before !== before,
                                                      ),
                                                  },
                                              ],
                                          }
                                        : {
                                              count: editionMapping.count + occurrenceCount,
                                              mapping: [
                                                  {
                                                      values: (editionMapping.mapping[0]?.values ?? [])
                                                          .filter(value => value.before !== before)
                                                          .concat([{before, after}]),
                                                  },
                                              ],
                                          },
                                );
                            }}
                        />
                    ) : selectedAttribute.isSimpleWorkflow ? (
                        <EditTreeAttributeValuesMapping
                            libraryId={view.libraryId}
                            attribute={selectedAttribute}
                            massSelectionFilters={massSelectionFilters}
                            setAttributeMapping={({before, after, occurrenceCount}) => {
                                setEditionMapping(
                                    before === after
                                        ? {
                                              count: editionMapping.count - occurrenceCount,
                                              mapping: [
                                                  {
                                                      values: (editionMapping.mapping[0]?.values ?? []).filter(
                                                          value => value.before !== before,
                                                      ),
                                                  },
                                              ],
                                          }
                                        : {
                                              count: editionMapping.count + occurrenceCount,
                                              mapping: [
                                                  {
                                                      values: (editionMapping.mapping[0]?.values ?? [])
                                                          .filter(value => value.before !== before)
                                                          .concat([{before, after}]),
                                                  },
                                              ],
                                          },
                                );
                            }}
                        />
                    ) : selectedAttribute.isMonoDependencyWorkflow ? (
                        /* TODO: */
                        <KitEmpty description="WIP" />
                    ) : null)}
            </EditAttributeMassActionModal>
        ),
    };
};
