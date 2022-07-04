// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import EditAttributeModal from 'components/attributes/EditAttributeModal';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Table} from 'semantic-ui-react';
import {
    GET_ATTRIBUTE_BY_ID_attributes_list,
    GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_metadata_fields
} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import useLang from '../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../utils';
import {AttributeType} from '../../../../../../_gqlTypes/globalTypes';
import ConfirmedButton from '../../../../../shared/ConfirmedButton';
import DeleteButton from '../../../../../shared/DeleteButton';
import AttributeCreationModal from '../../../../AttributeCreationModal';
import AttributesSelectionModal from '../../../../AttributesSelectionModal';

interface IMetadataListProps {
    fields: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_metadata_fields[];
    readonly: boolean;
    onChange: (newList: string[]) => void;
}

function MetadataList({fields, readonly, onChange}: IMetadataListProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();
    const [attributeEditionModalDisplay, setAttributeEditionModalDisplay] = useState<{
        visible: boolean;
        attribute?: string;
    }>({
        visible: false
    });

    const [showNewAttrModal, setShowNewAttrModal] = useState<boolean>(false);
    const [showAddExistingAttrModal, setShowAddExistingAttrModal] = useState<boolean>(false);
    const _openNewAttrModal = () => {
        setShowNewAttrModal(true);
    };

    const _closeNewAttrModal = () => {
        setShowNewAttrModal(false);
    };

    const _openAddExistingAttrModal = () => {
        setShowAddExistingAttrModal(true);
    };

    const _closeAddExistingAttrModal = () => {
        setShowAddExistingAttrModal(false);
    };

    const _handleDelete = (fieldToDelete: string) =>
        onChange(fields.filter(f => f.id !== fieldToDelete).map(f => f.id));

    const _handleAddNewField = (fieldToAdd: GET_ATTRIBUTE_BY_ID_attributes_list) => {
        onChange([...fields.map(f => f.id), fieldToAdd.id]);
        _closeNewAttrModal();
    };
    const _handleAddExistingField = (fieldIds: string[]) => {
        onChange([...fields.map(f => f.id), ...fieldIds]);
        _closeAddExistingAttrModal();
    };

    const _handleCloseAttributeEditionModal = () => setAttributeEditionModalDisplay({visible: false});

    return (
        <>
            {!readonly && (
                <>
                    <Button
                        data-test-id="metadata-add-field-new"
                        icon
                        labelPosition="left"
                        size="medium"
                        onClick={_openNewAttrModal}
                    >
                        <Icon name="plus" />
                        {t('attributes.new')}
                    </Button>
                    <Button
                        data-test-id="metadata-add-field-existing"
                        icon
                        labelPosition="left"
                        size="medium"
                        onClick={_openAddExistingAttrModal}
                    >
                        <Icon name="plus" />
                        {t('libraries.link_existing_attribute')}
                    </Button>
                </>
            )}

            <Table selectable striped>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={4}>{t('attributes.ID')}</Table.HeaderCell>
                        <Table.HeaderCell width={4}>{t('attributes.label')}</Table.HeaderCell>
                        <Table.HeaderCell width={3}>{t('attributes.type')}</Table.HeaderCell>
                        <Table.HeaderCell width={3}>{t('attributes.format')}</Table.HeaderCell>
                        <Table.HeaderCell width={1} />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {fields.map((f: GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_metadata_fields) => {
                        const _onDelete = () => _handleDelete(f.id);
                        const _handleRowClick = () => {
                            setAttributeEditionModalDisplay({visible: true, attribute: f.id});
                        };
                        const fieldLabel = localizedLabel(f.label, lang);
                        return (
                            <Table.Row key={f.id} onClick={_handleRowClick}>
                                <Table.Cell>{f.id}</Table.Cell>
                                <Table.Cell>{fieldLabel}</Table.Cell>
                                <Table.Cell>{t('attributes.types.' + f.type)}</Table.Cell>
                                <Table.Cell>{f.format ? t('attributes.formats.' + f.format) : ''}</Table.Cell>
                                <Table.Cell>
                                    {!readonly && (
                                        <ConfirmedButton
                                            data-test-id="metadata-delete-button"
                                            confirmMessage={t('attributes.metadata_field_delete_confirm', {
                                                attrLabel: fieldLabel
                                            })}
                                            action={_onDelete}
                                        >
                                            <DeleteButton disabled={false} />
                                        </ConfirmedButton>
                                    )}
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>

            {!readonly && (
                <>
                    {showNewAttrModal && (
                        <AttributeCreationModal
                            open={showNewAttrModal}
                            onClose={_closeNewAttrModal}
                            onPostSave={_handleAddNewField}
                            forcedType={AttributeType.simple}
                        />
                    )}
                    {showAddExistingAttrModal && (
                        <AttributesSelectionModal
                            openModal={showAddExistingAttrModal}
                            onClose={_closeAddExistingAttrModal}
                            onSubmit={_handleAddExistingField}
                            selection={fields.map(f => f.id)}
                            filter={{type: [AttributeType.simple]}}
                        />
                    )}
                    {attributeEditionModalDisplay.visible && (
                        <EditAttributeModal
                            open={true}
                            onClose={_handleCloseAttributeEditionModal}
                            attribute={attributeEditionModalDisplay.attribute}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default MetadataList;
