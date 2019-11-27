import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {TreeItem} from 'react-sortable-tree';
import {Button, Dropdown, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../../../../hooks/useLang';
import {isLinkAttribute, localizedLabel} from '../../../../../../utils/utils';
import {GET_LIBRARIES_libraries_list_attributes} from '../../../../../../_gqlTypes/GET_LIBRARIES';
import {AttributeType} from '../../../../../../_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '../../../../../../_gqlTypes/RecordIdentity';
import {FormLinksAllowedValues, ILinkValue, ITreeLinkValue} from '../../../../../../_types/records';
import SelectTreeNodeModal from '../../../../../trees/SelectTreeNodeModal';
import EditRecordModal from '../../../../EditRecordModal';
import SelectRecordModal from '../../../../SelectRecordModal';
import EditRecordFormLinksElement from './EditRecordFormLinksElement';
import EditRecordFormLinksTreeElement from './EditRecordFormLinksTreeElement';

interface IEditRecordFormLinksProps {
    values: FormLinksAllowedValues | FormLinksAllowedValues[];
    attribute: GET_LIBRARIES_libraries_list_attributes;
    onChange: (value: ILinkValue | ITreeLinkValue) => void;
    readOnly?: boolean;
}

/* tslint:disable-next-line:variable-name */
const ElementsCount = styled.div`
    float: right;
`;

function EditRecordFormLinks({values, attribute, onChange, readOnly = false}: IEditRecordFormLinksProps): JSX.Element {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const [isOpenSelectRecordModal, setIsOpenSelectRecordModal] = useState<boolean>(false);
    const [isOpenAddRecordModal, setIsOpenAddRecordModal] = useState<boolean>(false);
    const [isOpenSelectTreeNodeModal, setIsOpenSelectTreeNodeModal] = useState<boolean>(false);
    const valuesToDisplay = Array.isArray(values) ? values : [values];

    const isLinkAttr = useMemo(() => isLinkAttribute(attribute), [attribute]);

    const _onRecordAdded = (record: RecordIdentity_whoAmI) => {
        onChange({
            value: {
                id: record.id,
                whoAmI: record
            },
            id_value: null,
            raw_value: null,
            modified_at: null,
            created_at: null,
            version: null
        });
        _handleCloseSelectRecordModal();
    };

    const _handleOpenSelectRecordModal = () => setIsOpenSelectRecordModal(true);
    const _handleCloseSelectRecordModal = () => setIsOpenSelectRecordModal(false);

    const _handleOpenSelectTreeNodeModal = () => setIsOpenSelectTreeNodeModal(true);
    const _handleCloseSelectTreeNodeModal = () => setIsOpenSelectTreeNodeModal(false);
    const _onTreeNodeSelected = ({node}: TreeItem) => {
        const val: ITreeLinkValue = {
            value: {
                record: {whoAmI: node.whoAmI},
                ancestors: node.parents.map(p => ({
                    record: {
                        whoAmI: p.whoAmI
                    }
                }))
            },
            id_value: null,
            raw_value: null,
            modified_at: null,
            created_at: null,
            version: null
        };
        onChange(val);
        _handleCloseSelectTreeNodeModal();
    };

    const _handleOpenAddRecordModal = () => setIsOpenAddRecordModal(true);
    const _handleCloseAddRecordModal = (record?: RecordIdentity_whoAmI) => {
        if (!!record) {
            onChange({
                value: {
                    id: record.id,
                    whoAmI: record
                },
                id_value: null,
                raw_value: null,
                modified_at: null,
                created_at: null,
                version: null
            });
        }
        setIsOpenAddRecordModal(false);
    };

    const _handleAddValue = e => {
        if (attribute.type !== AttributeType.tree) {
            return;
        }

        _handleOpenSelectTreeNodeModal();
    };

    const _handleDeleteLink = (valueToDelete: FormLinksAllowedValues) =>
        onChange({
            ...valueToDelete,
            value: null
        });

    const addValueBtn = (
        <Button
            type="button"
            content={t('records.add_value')}
            icon="plus"
            compact
            basic
            labelPosition="left"
            onClick={_handleAddValue}
        />
    );

    return (
        <>
            <label>{localizedLabel(attribute.label, availableLanguages)}</label>
            <Table data-test-id="link_values" compact="very">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>
                            {!readOnly && isLinkAttr && attribute.linked_library && (
                                <Dropdown trigger={addValueBtn} icon={false}>
                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            data-test-id="add_value_btn"
                                            onClick={_handleOpenSelectRecordModal}
                                            icon="search"
                                            text={t('records.select_record')}
                                        />
                                        <Dropdown.Item
                                            data-test-id="add_value_create_btn"
                                            onClick={_handleOpenAddRecordModal}
                                            icon="plus circle"
                                            text={t('records.create_record')}
                                        />
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
                            {!readOnly && attribute.type === AttributeType.tree && addValueBtn}
                            <ElementsCount data-test-id="elements_count">
                                {t('records.links_elements_count', {count: valuesToDisplay.length})}
                            </ElementsCount>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {valuesToDisplay.map(v => {
                        if (!v || !v.value) {
                            return undefined;
                        }

                        return isLinkAttr ? (
                            <EditRecordFormLinksElement
                                value={v as ILinkValue}
                                key={`${v.id_value}_${(v as ILinkValue).value!.whoAmI.id}`}
                                onDeleteLink={_handleDeleteLink}
                                readOnly={readOnly}
                            />
                        ) : (
                            <EditRecordFormLinksTreeElement
                                key={`${v.id_value}_${(v as ITreeLinkValue).value!.record.whoAmI.id}`}
                                value={v as ITreeLinkValue}
                                onDeleteLink={_handleDeleteLink}
                            />
                        );
                    })}
                </Table.Body>
            </Table>
            {!readOnly && isLinkAttr && attribute.linked_library && (
                <>
                    <SelectRecordModal
                        open={isOpenSelectRecordModal}
                        library={attribute.linked_library}
                        onSelect={_onRecordAdded}
                        onClose={_handleCloseSelectRecordModal}
                    />
                    <EditRecordModal
                        library={attribute.linked_library}
                        open={isOpenAddRecordModal}
                        onClose={_handleCloseAddRecordModal}
                    />
                </>
            )}
            {!readOnly && attribute.type === AttributeType.tree && attribute.linked_tree && (
                <SelectTreeNodeModal
                    open={isOpenSelectTreeNodeModal}
                    onClose={_handleCloseSelectTreeNodeModal}
                    tree={attribute.linked_tree}
                    onSelect={_onTreeNodeSelected}
                />
            )}
        </>
    );
}

export default EditRecordFormLinks;
