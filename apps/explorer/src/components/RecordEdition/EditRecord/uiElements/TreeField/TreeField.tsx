// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileAddOutlined} from '@ant-design/icons';
import {ICommonFieldsSettings} from '@leav/types/src';
import {Button, List} from 'antd';
import {ITreeNode} from 'components/shared/SelectTreeNodeModal/SelectTreeNodeModal';
import {IRecordPropertyTree} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {GET_FORM_forms_list_elements_elements_attribute_TreeAttribute} from '_gqlTypes/GET_FORM';
import SelectTreeNodeModal from '../../../../shared/SelectTreeNodeModal';
import useDeleteValueMutation from '../../hooks/useDeleteValueMutation';
import useSaveValueMutation from '../../hooks/useSaveValueMutation';
import NoValue from '../../shared/NoValue';
import {IFormElementProps} from '../../_types';
import TreeFieldValue from './TreeFieldValue';

const Wrapper = styled.div`
    margin-bottom: 1.5em;

    .ant-list-items {
        max-height: 320px;
        overflow-y: auto;
    }
`;

const FieldLabel = styled.div`
    position: absolute;
    left: 5px;
    top: -0.85em;
    font-size: 1.1em;
    background: ${themingVar['@default-bg']};
    padding: 0 0.5em;
    color: rgba(0, 0, 0, 0.5);
    z-index: 1;
`;

const FooterWrapper = styled.div`
    text-align: right;
`;

function TreeField({element, recordValues, record}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();
    const attribute = element.attribute as GET_FORM_forms_list_elements_elements_attribute_TreeAttribute;
    const fieldValues = (recordValues[element.attribute.id] as IRecordPropertyTree[]) ?? [];

    const {deleteValue} = useDeleteValueMutation(record, attribute.id);
    const {saveValue} = useSaveValueMutation(record, attribute.id);
    const [showSelectTreeNodeModal, setShowSelectTreeNodeModal] = useState<boolean>();

    const data = fieldValues.map(val => ({
        ...val,
        key: val.id_value
    }));

    const renderItem = (value: IRecordPropertyTree) => {
        const _handleDelete = async () => deleteValue(value.id_value);
        return <TreeFieldValue value={value} attribute={attribute} onDelete={_handleDelete} />;
    };

    const isReadOnly = element.attribute?.system;

    const canAddValue = !isReadOnly && (attribute.multiple_values || !fieldValues.length);

    const _handleCloseSelectTreeNodeModal = () => setShowSelectTreeNodeModal(false);

    const _handleAddValue = () => {
        setShowSelectTreeNodeModal(true);
    };

    const _handleSubmitSelectTreeNodeModal = (treeNode: ITreeNode) => {
        saveValue({
            idValue: null,
            value: treeNode.key
        });
    };

    const ListFooter =
        fieldValues.length && canAddValue ? (
            <FooterWrapper>
                <Button icon={<FileAddOutlined />} onClick={_handleAddValue} size="small">
                    {t('record_edition.add_value')}
                </Button>
            </FooterWrapper>
        ) : null;

    return (
        <>
            <Wrapper>
                <FieldLabel>{element.settings.label}</FieldLabel>
                <List
                    dataSource={data}
                    renderItem={renderItem}
                    bordered
                    split
                    locale={{
                        emptyText: <NoValue canAddValue={canAddValue} onAddValue={_handleAddValue} />
                    }}
                    footer={ListFooter}
                />
            </Wrapper>
            {showSelectTreeNodeModal && (
                <SelectTreeNodeModal
                    visible={showSelectTreeNodeModal}
                    onClose={_handleCloseSelectTreeNodeModal}
                    onSubmit={_handleSubmitSelectTreeNodeModal}
                    tree={attribute.linked_tree}
                />
            )}
        </>
    );
}

export default TreeField;
