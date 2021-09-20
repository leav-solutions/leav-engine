// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Divider, Pagination, Space} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import Dimmer from 'components/shared/Dimmer';
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
    GET_FORM_forms_list_elements_elements_attribute_TreeAttribute,
    GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values
} from '_gqlTypes/GET_FORM';
import PathsList from '../PathsList';

interface IValuesAddProps {
    attribute: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute;
    onAdd: (values: ITreeNodeWithRecord[]) => void;
    onClose: () => void;
}

const Wrapper = styled.div`
    background-color: ${themingVar['@default-bg']};
    padding: 1em;
    z-index: 1;
    position: relative;
`;

const FooterWrapper = styled.div`
    padding: 0 1em;
    display: flex;
    justify-content: space-between;
`;

const BreadcrumbWrapper = styled.div`
    & .record-card .label {
        font-weight: normal;
    }
`;

type ValueFromList = GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_treeValuesList_values;

function ValuesAdd({attribute, onAdd, onClose}: IValuesAddProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const valuesList = attribute.treeValuesList.enable ? attribute.treeValuesList.values : [];
    const wrapperRef = useRef<HTMLDivElement>();
    const pageSize = 5;
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [selectedValues, setSelectedValues] = useState<ValueFromList[]>([]);

    useEffect(() => {
        wrapperRef.current.scrollIntoView({block: 'end'});
    }, []);

    const _handleSelectionChange = (selection: ValueFromList[]) => setSelectedValues(selection);

    const _handleSelect = (node: ITreeNodeWithRecord, selected: boolean) => {
        if (selected) {
            onAdd([node]);
        }
    };

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
        onAdd(
            selectedValues.map(selectedVal => {
                const recordKey = getTreeRecordKey(selectedVal.record);
                return {
                    record: selectedVal.record,
                    id: recordKey,
                    key: recordKey,
                    title: selectedVal.record.whoAmI.label,
                    children: null
                };
            })
        );
    };

    const _renderListItem = (item: ValueFromList) => {
        const pathToDisplay = item.ancestors[0] ? [item.ancestors[0]] : [];

        return (
            <BreadcrumbWrapper>
                <PathsList paths={pathToDisplay} recordCardSettings={{withLibrary: false, withPreview: false}} />
            </BreadcrumbWrapper>
        );
    };

    const ListFooter = (
        <FooterWrapper>
            <Pagination
                simple
                total={valuesList.length}
                pageSize={pageSize}
                showSizeChanger
                current={currentPage}
                onChange={page => setCurrentPage(page)}
            />
            {attribute.multiple_values && (
                <Space>
                    <Button size="small" onClick={_handleClose}>
                        {t('global.cancel')}
                    </Button>
                    <PrimaryBtn size="small" onClick={_handleSubmit}>
                        {t('global.submit')}
                    </PrimaryBtn>
                </Space>
            )}
        </FooterWrapper>
    );
    return (
        <>
            <Dimmer onClick={_handleClose} />
            <Wrapper data-testid="values-add" ref={wrapperRef}>
                {valuesList.length && (
                    <>
                        <Divider orientation="left">{t('record_edition.values_list')}</Divider>
                        <List
                            dataSource={valuesList}
                            onItemClick={_handleItemClick}
                            renderItemContent={_renderListItem}
                            selectable={attribute.multiple_values}
                            selectedItems={selectedValues}
                            onSelectionChange={_handleSelectionChange}
                            footer={ListFooter}
                        />
                    </>
                )}
                <Divider orientation="left">{localizedTranslation(attribute.linked_tree.label, lang)}</Divider>
                <SelectTreeNode tree={attribute.linked_tree} onSelect={_handleSelect} />
            </Wrapper>
        </>
    );
}

export default ValuesAdd;
