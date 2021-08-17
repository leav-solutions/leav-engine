// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, SearchOutlined} from '@ant-design/icons';
import {Button, Pagination, Space} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import SearchModal from 'components/SearchModal';
import Dimmer from 'components/shared/Dimmer';
import List from 'components/shared/List';
import RecordCard from 'components/shared/RecordCard';
import {IGetRecordsFromLibraryQueryElement} from 'graphQL/queries/records/getRecordsFromLibraryQueryTypes';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {
    GET_FORM_forms_list_elements_elements_attribute_LinkAttribute,
    GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values
} from '_gqlTypes/GET_FORM';
import {ISharedStateSelectionSearch, PreviewSize} from '_types/types';
import QuickSearch from './QuickSearch';

type ValueFromList = GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values;

export interface IOnAddValues {
    id: string;
    label: string;
}

interface IValuesAddProps {
    attribute: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute;
    onAdd: (values: IOnAddValues[]) => void;
    onClose: () => void;
}

const Wrapper = styled.div`
    background-color: ${themingVar['@leav-secondary-bg']};
    padding: 1em;
    z-index: 1;
    position: relative;
`;

const SearchActions = styled.div`
    margin: 0 0 1em 0;
    width: 100%;
    display: flex;
    direction: row;
    align-items: center;
`;

const FooterWrapper = styled.div`
    padding: 0 1em;
    display: flex;
    justify-content: space-between;
`;

const SearchInput = styled(QuickSearch)`
    flex-grow: 1;
    margin-right: 1em;
`;

const CloseButton = styled(CloseOutlined)`
    margin-left: 2em;
`;

const _renderListItem = (item: ValueFromList) => (
    <RecordCard record={item.whoAmI} key={item.id} size={PreviewSize.small} />
);

function ValuesAdd({attribute, onAdd, onClose}: IValuesAddProps): JSX.Element {
    const {t} = useTranslation();
    const valuesList = attribute.linkValuesList.enable ? attribute.linkValuesList.values : [];
    const wrapperRef = useRef<HTMLDivElement>();

    const [elementsList, setElementsList] = useState<ValueFromList[]>(valuesList);
    const [selectedValues, setSelectedValues] = useState<ValueFromList[]>([]);
    const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(valuesList.length);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [source, setSource] = useState<'list' | 'search'>('list');
    const pageSize = 5;

    const _handleItemClick = (valueListItem: ValueFromList) => {
        onAdd([{id: valueListItem.id, label: valueListItem.whoAmI.label}]);
    };

    const _handleClose = () => onClose();

    const _handleSelectionChange = (selection: ValueFromList[]) => setSelectedValues(selection);

    const _handleSubmit = () => {
        onAdd(selectedValues.map(selectedVal => ({id: selectedVal.id, label: selectedVal.whoAmI.label})));
    };

    const _handleClickAdvancedSearch = () => {
        setIsSearchModalVisible(true);
    };

    const _handleSearchModalSubmit = async ({selected}: ISharedStateSelectionSearch) => {
        if (!selected.length) {
            return;
        }

        const selectedRecordToSave = attribute.multiple_values ? selected : [selected[0]];
        const valuesToSave = selectedRecordToSave.map(selectedRecord => ({
            id: selectedRecord.id,
            label: selectedRecord.label
        }));

        onAdd(valuesToSave);
    };

    const _handleSearchResult = (elements: IGetRecordsFromLibraryQueryElement[], totalCount: number) => {
        const results: ValueFromList[] = elements.map(element => ({
            id: element.whoAmI.id,
            whoAmI: element.whoAmI
        }));

        setSource('search');
        setElementsList(results);
        setTotal(totalCount);
    };

    const _handleClearSearch = () => {
        setElementsList(valuesList);
        setTotal(valuesList.length);
        setCurrentPage(1);
        setSource('list');
    };

    const canSearch = !attribute.linkValuesList.enable || attribute.linkValuesList.allowFreeEntry;

    useEffect(() => {
        wrapperRef.current.scrollIntoView({block: 'end'});
    }, []);

    const ListFooter = (
        <FooterWrapper>
            <Pagination
                simple
                total={total}
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

    const offset = (currentPage - 1) * pageSize;
    const pagedList = source === 'list' ? [...elementsList].splice(offset, pageSize) : elementsList;
    return (
        <>
            <Dimmer onClick={_handleClose} />
            <Wrapper data-testid="values-add" ref={wrapperRef}>
                {canSearch && (
                    <SearchActions>
                        <SearchInput
                            library={attribute.linked_library}
                            onResult={_handleSearchResult}
                            onClear={_handleClearSearch}
                            pagination={{limit: pageSize, offset}}
                        />
                        <Button icon={<SearchOutlined />} onClick={_handleClickAdvancedSearch}>
                            {t('record_edition.advanced_search')}
                        </Button>
                        <CloseButton onClick={_handleClose} role="button" />
                    </SearchActions>
                )}
                {!!elementsList.length && (
                    <List
                        dataSource={pagedList}
                        onItemClick={_handleItemClick}
                        renderItemContent={_renderListItem}
                        selectable={attribute.multiple_values}
                        selectedItems={selectedValues}
                        onSelectionChange={_handleSelectionChange}
                        footer={ListFooter}
                    />
                )}
            </Wrapper>
            {isSearchModalVisible && (
                <SearchModal
                    libId={attribute.linked_library.id}
                    visible={isSearchModalVisible}
                    setVisible={setIsSearchModalVisible}
                    submitAction={_handleSearchModalSubmit}
                />
            )}
        </>
    );
}

export default ValuesAdd;
