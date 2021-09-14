// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, SearchOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Button, Divider, Input, Space, Spin} from 'antd';
import Search from 'antd/lib/input/Search';
import {PaginationConfig} from 'antd/lib/pagination';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import SearchModal from 'components/SearchModal';
import Dimmer from 'components/shared/Dimmer';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import List from 'components/shared/List';
import {IListProps} from 'components/shared/List/List';
import RecordCard from 'components/shared/RecordCard';
import {getRecordsFromLibraryQuery} from 'graphQL/queries/records/getRecordsFromLibraryQuery';
import {
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from 'graphQL/queries/records/getRecordsFromLibraryQueryTypes';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {localizedTranslation} from 'utils';
import {
    GET_FORM_forms_list_elements_elements_attribute_LinkAttribute,
    GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values
} from '_gqlTypes/GET_FORM';
import {SortOrder} from '_gqlTypes/globalTypes';
import {ISharedStateSelectionSearch, PreviewSize} from '_types/types';

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
    background-color: ${themingVar['@default-bg']};
    padding: 1em;
    z-index: 1;
    position: relative;

    & .record-card .label {
        font-weight: normal;
        padding: 0.2em;
    }

    & .ant-list-pagination {
        margin-top: 5px;
    }
`;
const ListsWrapper = styled.div`
    max-height: 30rem;
    overflow-y: scroll;
`;

const SearchActions = styled.div`
    margin: 0 0 1em 0;
    width: 100%;
    display: flex;
    direction: row;
    align-items: center;
`;

const FooterWrapper = styled(Space)`
    padding-top: 1em;
    width: 100%;
    display: flex;
    justify-content: flex-end;
`;

const SearchInput = styled(Search)`
    flex-grow: 1;
    margin-right: 1em;
`;

const CloseButton = styled(CloseOutlined)`
    margin-left: 2em;
`;

const _renderListItem = (item: ValueFromList) => (
    <RecordCard record={item.whoAmI} key={item.id} size={PreviewSize.small} withLibrary={false} withPreview={false} />
);

function ValuesAdd({attribute, onAdd, onClose}: IValuesAddProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const valuesList = attribute.linkValuesList.enable ? attribute.linkValuesList.values : [];
    const [filteredValuesList, setFilteredValuesList] = useState<ValueFromList[]>(valuesList);

    const wrapperRef = useRef<HTMLDivElement>();
    const searchInputRef = useRef<Input>();

    const [selectedValues, setSelectedValues] = useState<ValueFromList[]>([]);
    const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
    const [valuesListCurrentPage, setValuesListCurrentPage] = useState<number>(1);
    const [searchCurrentPage, setSearchCurrentPage] = useState<number>(1);
    const pageSize = 10;
    const canSearch = !attribute.linkValuesList.enable || attribute.linkValuesList.allowFreeEntry;

    const {loading, error, data: searchData, refetch: runSearch} = useQuery<
        IGetRecordsFromLibraryQuery,
        IGetRecordsFromLibraryQueryVariables
    >(getRecordsFromLibraryQuery(attribute.linked_library.id), {
        variables: {
            limit: pageSize,
            sortOrder: SortOrder.asc
        },
        skip: !canSearch
    });

    useEffect(() => {
        wrapperRef.current.scrollIntoView({block: 'end'});
        searchInputRef.current?.focus();
    }, []);

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

    const _handleSearchSubmit = (submittedSearch: string) => {
        setValuesListCurrentPage(1);
        setSearchCurrentPage(1);

        if (valuesList.length) {
            const newValuesList = valuesList.filter(value => {
                const regex = new RegExp(submittedSearch.toLowerCase());
                const label = String(value.whoAmI?.label) ?? '';
                return !submittedSearch || value.id.match(regex) || label.toLowerCase().match(regex);
            });
            setFilteredValuesList(newValuesList);
        }

        if (canSearch) {
            runSearch({
                fullText: submittedSearch,
                limit: pageSize,
                offset: 0,
                sortOrder: SortOrder.asc
            });
        }
    };

    const _handleSearchPageChange = (page: number) => {
        setSearchCurrentPage(page);
        runSearch({
            fullText: searchInputRef.current.input.value,
            limit: pageSize,
            offset: (page - 1) * pageSize,
            sortOrder: SortOrder.asc
        });
    };

    const offset = (valuesListCurrentPage - 1) * pageSize;
    const pagedValuesList = [...filteredValuesList].splice(offset, pageSize);

    const searchResult = searchData
        ? searchData[attribute.linked_library.id].list.map(record => ({
              id: record.whoAmI.id,
              whoAmI: record.whoAmI
          }))
        : [];

    const listCommonProps: Partial<IListProps<ValueFromList>> = {
        onItemClick: _handleItemClick,
        renderItemContent: _renderListItem,
        selectable: attribute.multiple_values,
        selectedItems: selectedValues,
        onSelectionChange: _handleSelectionChange,
        locale: {emptyText: t('record_edition.no_matching_value')}
    };
    const paginationCommonProps: Partial<PaginationConfig> = {
        simple: true,
        pageSize,
        current: valuesListCurrentPage
    };

    return (
        <>
            <Dimmer onClick={_handleClose} />
            <Wrapper data-testid="values-add" ref={wrapperRef}>
                <SearchActions>
                    <SearchInput
                        placeholder={t('record_edition.search_elements')}
                        onSearch={_handleSearchSubmit}
                        loading={loading}
                        allowClear
                        ref={searchInputRef}
                        aria-label={t('record_edition.search_elements')}
                    />
                    {canSearch && (
                        <Button icon={<SearchOutlined />} onClick={_handleClickAdvancedSearch}>
                            {t('record_edition.advanced_search')}
                        </Button>
                    )}
                    <CloseButton onClick={_handleClose} role="button" />
                </SearchActions>
                <ListsWrapper>
                    {!!valuesList.length && (
                        <>
                            <Divider orientation="left">{t('record_edition.values_list')}</Divider>
                            <List
                                {...listCommonProps}
                                data-testid="values_list"
                                dataSource={pagedValuesList}
                                pagination={{
                                    ...paginationCommonProps,
                                    total: filteredValuesList.length,
                                    current: valuesListCurrentPage,
                                    onChange: setValuesListCurrentPage
                                }}
                            />
                        </>
                    )}
                    {canSearch && (
                        <>
                            <Divider orientation="left">
                                {localizedTranslation(attribute.linked_library.label, lang)}
                            </Divider>
                            {loading && <Spin />}
                            {error && <ErrorDisplay message={error.message} />}
                            {!loading && !error && (
                                <List
                                    {...listCommonProps}
                                    data-testid="search_result"
                                    dataSource={searchResult}
                                    pagination={{
                                        ...paginationCommonProps,
                                        total: searchData?.[attribute.linked_library.id].totalCount ?? 0,
                                        current: searchCurrentPage,
                                        onChange: _handleSearchPageChange
                                    }}
                                />
                            )}
                        </>
                    )}
                </ListsWrapper>
                {attribute.multiple_values && (
                    <FooterWrapper>
                        <Button size="small" onClick={_handleClose}>
                            {t('global.cancel')}
                        </Button>
                        <PrimaryBtn size="small" onClick={_handleSubmit}>
                            {t('global.submit')}
                        </PrimaryBtn>
                    </FooterWrapper>
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
