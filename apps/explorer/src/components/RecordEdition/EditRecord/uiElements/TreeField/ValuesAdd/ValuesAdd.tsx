// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Divider, Space} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import List from 'components/shared/List';
import SelectTreeNode from 'components/shared/SelectTreeNode';
import {ITreeNodeWithRecord} from 'components/shared/SelectTreeNodeModal/SelectTreeNodeModal';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {getTreeRecordKey, localizedTranslation} from 'utils';
import {
    RECORD_FORM_recordForm_elements_attribute_TreeAttribute,
    RECORD_FORM_recordForm_elements_values_TreeValue_treeValue
} from '_gqlTypes/RECORD_FORM';
import PathsList from '../PathsList';

interface IValuesAddProps {
    attribute: RECORD_FORM_recordForm_elements_attribute_TreeAttribute;
    onAdd: (values: ITreeNodeWithRecord[]) => void;
    onClose: () => void;
}

const Wrapper = styled.div`
    background-color: ${themingVar['@default-bg']};
    z-index: 1;
    position: relative;
`;

const SelectionWrapper = styled.div`
    padding: 1em;
    max-height: 350px;
    overflow: auto;
`;

const FooterWrapper = styled.div`
    padding: 0.5em 1em;
    display: flex;
    justify-content: flex-end;
    background: ${themingVar['@background-color-light']};
`;

const BreadcrumbWrapper = styled.div`
    & .record-card .label {
        font-weight: normal;
    }
`;

type ValueFromList = RECORD_FORM_recordForm_elements_values_TreeValue_treeValue;

function ValuesAdd({attribute, onAdd, onClose}: IValuesAddProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const valuesList = attribute.treeValuesList.enable ? attribute.treeValuesList.values : [];
    const wrapperRef = useRef<HTMLDivElement>();

    const [selectedValuesFromTree, setSelectedValuesFromTree] = useState<ITreeNodeWithRecord[]>([]);
    const [selectedValuesFromList, setSelectedValuesFromList] = useState<ValueFromList[]>([]);

    useEffect(() => {
        wrapperRef.current.scrollIntoView({block: 'nearest'});
    }, []);

    const _handleSelectionChange = (selection: ValueFromList[]) => setSelectedValuesFromList(selection);

    const _handleSelect = (node: ITreeNodeWithRecord, selected: boolean) => {
        if (selected) {
            onAdd([node]);
        }
    };

    const _handleCheck = (selectedNodes: ITreeNodeWithRecord[]) => setSelectedValuesFromTree(selectedNodes);

    const _handleClose = () => onClose();

    const _handleItemClick = (valueListItem: ValueFromList) => {
        const recordKey = getTreeRecordKey(valueListItem.record);
        onAdd([
            {
                record: valueListItem.record,
                key: recordKey,
                id: recordKey,
                title: valueListItem.record.whoAmI.label,
                children: null
            }
        ]);
    };

    const _handleSubmit = () => {
        const selection: ITreeNodeWithRecord[] = [
            ...selectedValuesFromList.map(selectedVal => {
                const recordKey = getTreeRecordKey(selectedVal.record);
                return {
                    record: selectedVal.record,
                    id: recordKey,
                    key: recordKey,
                    title: selectedVal.record.whoAmI.label,
                    children: null
                };
            }),
            ...selectedValuesFromTree
        ];

        onAdd(selection);
    };

    const _renderListItem = (item: ValueFromList) => {
        const pathToDisplay = item.ancestors[0] ? [item.ancestors[0]] : [];

        return (
            <BreadcrumbWrapper>
                <PathsList paths={pathToDisplay} recordCardSettings={{withLibrary: false, withPreview: false}} />
            </BreadcrumbWrapper>
        );
    };

    return (
        <>
            <Wrapper data-testid="values-add" ref={wrapperRef}>
                <SelectionWrapper>
                    {!!valuesList.length && (
                        <>
                            <Divider orientation="left">{t('record_edition.values_list')}</Divider>
                            <List
                                dataSource={valuesList}
                                onItemClick={_handleItemClick}
                                renderItemContent={_renderListItem}
                                selectable={attribute.multiple_values}
                                selectedItems={selectedValuesFromList}
                                onSelectionChange={_handleSelectionChange}
                                pagination={false}
                            />
                        </>
                    )}
                    <Divider orientation="left">{localizedTranslation(attribute.linked_tree.label, lang)}</Divider>
                    <SelectTreeNode
                        tree={attribute.linked_tree}
                        onSelect={_handleSelect}
                        onCheck={_handleCheck}
                        multiple={attribute.multiple_values}
                    />
                </SelectionWrapper>
                {attribute.multiple_values && (
                    <FooterWrapper>
                        <Space>
                            <Button size="small" onClick={_handleClose}>
                                {t('global.cancel')}
                            </Button>
                            <PrimaryBtn size="small" onClick={_handleSubmit}>
                                {t('global.submit')}
                            </PrimaryBtn>
                        </Space>
                    </FooterWrapper>
                )}
            </Wrapper>
        </>
    );
}

export default ValuesAdd;
