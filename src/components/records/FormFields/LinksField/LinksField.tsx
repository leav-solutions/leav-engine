import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {TreeItem} from 'react-sortable-tree';
import {Button, Dropdown, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../../hooks/useLang';
import {isLinkAttribute, isLinkValue, isTreeAttribute, isTreeValue, localizedLabel} from '../../../../utils';
import {GET_LIBRARIES_libraries_list_attributes} from '../../../../_gqlTypes/GET_LIBRARIES';
import {AttributeType} from '../../../../_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '../../../../_gqlTypes/RecordIdentity';
import {FormLinksAllowedValues, ILinkValue, ITreeLinkValue} from '../../../../_types/records';
import SelectTreeNodeModal from '../../../trees/SelectTreeNodeModal';
import EditRecordModal from '../../EditRecordModal';
import SelectRecordModal from '../../SelectRecordModal';
import LinksFieldElement from './LinksFieldElement';
import LinksFieldTreeElement from './LinksFieldTreeElement';

interface IEditRecordFormLinksProps {
    attribute: GET_LIBRARIES_libraries_list_attributes;
    values: FormLinksAllowedValues[];
    onChange: (value: ILinkValue | ITreeLinkValue, index: number) => void;
    readonly?: boolean;
}

const ElementsCount = styled.div`
    float: right;
`;

const Wrapper = styled.div`
    margin-bottom: 1em;
`;

const AddButton = styled(Button)`
    &&& {
        margin-left: 1em;
    }
`;

function LinksField({values, attribute, onChange, readonly}: IEditRecordFormLinksProps): JSX.Element {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const [isOpenSelectRecordModal, setIsOpenSelectRecordModal] = useState<boolean>(false);
    const [isOpenAddRecordModal, setIsOpenAddRecordModal] = useState<boolean>(false);
    const [isOpenSelectTreeNodeModal, setIsOpenSelectTreeNodeModal] = useState<boolean>(false);
    const valuesToDisplay = values.filter(v => v !== null);

    const _onRecordAdded = (record: RecordIdentity_whoAmI) => {
        onChange(
            {
                linkValue: {
                    id: record.id,
                    whoAmI: record
                },
                id_value: null,
                modified_at: null,
                created_at: null,
                version: null
            },
            values.length
        );
        _handleCloseSelectRecordModal();
    };

    const _handleOpenSelectRecordModal = () => setIsOpenSelectRecordModal(true);
    const _handleCloseSelectRecordModal = () => setIsOpenSelectRecordModal(false);
    const _handleOpenSelectTreeNodeModal = () => setIsOpenSelectTreeNodeModal(true);
    const _handleCloseSelectTreeNodeModal = () => setIsOpenSelectTreeNodeModal(false);
    const _onTreeNodeSelected = ({node}: TreeItem) => {
        const val: ITreeLinkValue = {
            treeValue: {
                record: {whoAmI: node.whoAmI},
                ancestors: node.parents.map(p => ({
                    record: {
                        whoAmI: p.whoAmI
                    }
                }))
            },
            id_value: null,
            modified_at: null,
            created_at: null,
            version: null
        };

        onChange(val, values.length);
        _handleCloseSelectTreeNodeModal();
    };

    const _handleOpenAddRecordModal = () => setIsOpenAddRecordModal(true);

    const _handleCloseAddRecordModal = (record?: RecordIdentity_whoAmI) => {
        if (!!record) {
            onChange(
                {
                    linkValue: {
                        id: record.id,
                        whoAmI: record
                    },
                    id_value: null,
                    modified_at: null,
                    created_at: null,
                    version: null
                },
                values.length
            );
        }
        setIsOpenAddRecordModal(false);
    };

    const _handleAddValue = e => {
        if (attribute.type !== AttributeType.tree) {
            return;
        }
        _handleOpenSelectTreeNodeModal();
    };

    const _handleDeleteLink = index => (valueToDelete: FormLinksAllowedValues) => {
        onChange(
            {
                linkValue: null,
                id_value: valueToDelete.id_value,
                modified_at: null,
                created_at: null,
                version: null
            },
            index
        );
    };

    const addValueBtn = (
        <AddButton
            type="button"
            content={t('records.add_value')}
            icon="plus"
            compact
            basic
            labelPosition="left"
            onClick={_handleAddValue}
        />
    );

    const canAddValue = !readonly && (attribute.multiple_values || !valuesToDisplay.length);

    return (
        <Wrapper id="inputField">
            <Table data-test-id="link_values" compact="very">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>
                            <label>{localizedLabel(attribute.label, availableLanguages)}</label>
                            {canAddValue && isLinkAttribute(attribute) && attribute.linked_library && (
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
                            {canAddValue && attribute.type === AttributeType.tree && addValueBtn}
                            <ElementsCount data-test-id="elements_count">
                                {t('records.links_elements_count', {count: values ? valuesToDisplay.length : 0})}
                            </ElementsCount>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {valuesToDisplay.map((v, i) => {
                        if (!v || (isLinkValue(v) && !v.linkValue) || (isTreeValue(v) && !v.treeValue)) {
                            return undefined;
                        }

                        return isLinkAttribute(attribute) ? (
                            <LinksFieldElement
                                value={v as ILinkValue}
                                key={`${v.id_value}_${(v as ILinkValue).linkValue!.whoAmI.id}`}
                                onDeleteLink={_handleDeleteLink(i)}
                                readonly={readonly}
                            />
                        ) : (
                            <LinksFieldTreeElement
                                key={`${v.id_value}_${(v as ITreeLinkValue).treeValue!.record.whoAmI.id}`}
                                value={v as ITreeLinkValue}
                                onDeleteLink={_handleDeleteLink(i)}
                            />
                        );
                    })}
                </Table.Body>
            </Table>

            {!readonly && isLinkAttribute(attribute) && attribute.linked_library && (
                <>
                    <SelectRecordModal
                        open={isOpenSelectRecordModal}
                        library={attribute.linked_library}
                        onSelect={_onRecordAdded}
                        onClose={_handleCloseSelectRecordModal}
                    />
                    {attribute.linked_library && (
                        <EditRecordModal
                            library={attribute.linked_library}
                            open={isOpenAddRecordModal}
                            onClose={_handleCloseAddRecordModal}
                        />
                    )}
                </>
            )}

            {!readonly && isTreeAttribute(attribute) && attribute.linked_tree && (
                <SelectTreeNodeModal
                    open={isOpenSelectTreeNodeModal}
                    onClose={_handleCloseSelectTreeNodeModal}
                    tree={attribute.linked_tree}
                    onSelect={_onTreeNodeSelected}
                />
            )}
        </Wrapper>
    );
}

export default LinksField;
