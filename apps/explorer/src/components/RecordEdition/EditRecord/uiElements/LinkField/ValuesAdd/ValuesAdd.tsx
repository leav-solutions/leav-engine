// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {BulbOutlined, CloseOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Button, Divider, Input, InputRef, Space, Spin} from 'antd';
import {PaginationConfig} from 'antd/lib/pagination';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import EditRecordModal from 'components/RecordEdition/EditRecordModal';
import SearchModal from 'components/SearchModal';
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
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {localizedTranslation} from 'utils';
import {SortOrder} from '_gqlTypes/globalTypes';
import {RecordIdentity, RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {
    RECORD_FORM_recordForm_elements_attribute_LinkAttribute,
    RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values
} from '_gqlTypes/RECORD_FORM';
import {ISharedStateSelectionSearch, PreviewSize} from '_types/types';

type ValueFromList = RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values;

interface IValuesAddProps {
    attribute: RECORD_FORM_recordForm_elements_attribute_LinkAttribute;
    onAdd: (values: RecordIdentity[]) => void;
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
    justify-content: space-between;
`;

const SearchInput = styled(Input.Search)`
    flex-grow: 1;
    margin-right: 1em;
`;

const CloseButton = styled(CloseOutlined)`
    margin-left: 2em;
`;

const StartTypingMessage = styled.div`
    padding: 0.5rem;
    font-style: italic;
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
    const searchInputRef = useRef<InputRef>();

    const [selectedValues, setSelectedValues] = useState<ValueFromList[]>([]);
    const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
    const [isCreateRecordModalVisible, setIsCreateRecordModalVisible] = useState<boolean>(false);
    const [valuesListCurrentPage, setValuesListCurrentPage] = useState<number>(1);
    const [searchCurrentPage, setSearchCurrentPage] = useState<number>(1);
    const pageSize = 10;
    const canSearch = !attribute.linkValuesList.enable || attribute.linkValuesList.allowFreeEntry;
    const canCreateRecord = attribute.linked_library.permissions.create_record;

    const [runSearch, {loading, error, data: searchData}] = useLazyQuery<
        IGetRecordsFromLibraryQuery,
        IGetRecordsFromLibraryQueryVariables
    >(getRecordsFromLibraryQuery(attribute.linked_library.id, [], true));

    useEffect(() => {
        wrapperRef.current.scrollIntoView({block: 'nearest'});
        searchInputRef.current?.focus();
    }, []);

    const _handleItemClick = (valueListItem: ValueFromList) => {
        onAdd([valueListItem]);
    };

    const _handleClose = () => onClose();

    const _handleSelectionChange = (selection: ValueFromList[]) => setSelectedValues(selection);

    const _handleSubmit = () => {
        onAdd(selectedValues);
    };

    const _handleClickAdvancedSearch = () => {
        setIsSearchModalVisible(true);
    };

    const _handleOpenCreateRecordModal = () => {
        setIsCreateRecordModalVisible(true);
    };

    const _handleCloseCreateRecordModal = () => {
        setIsCreateRecordModalVisible(false);
    };

    const _handleSearchModalSubmit = async ({selected}: ISharedStateSelectionSearch) => {
        if (!selected.length) {
            return;
        }

        const selectedRecordToSave = attribute.multiple_values ? selected : [selected[0]];
        const valuesToSave = selectedRecordToSave.map(selectedRecord => ({
            id: selectedRecord.id,
            whoAmI: {
                id: selectedRecord.id,
                label: selectedRecord.label,
                library: attribute.linked_library,
                color: null,
                preview: null
            }
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

        if (canSearch && submittedSearch) {
            runSearch({
                variables: {
                    fullText: submittedSearch,
                    limit: pageSize,
                    offset: 0,
                    sortOrder: SortOrder.asc
                }
            });
        }
    };

    const _handleSearchPageChange = (page: number) => {
        if (!searchInputRef.current.input.value) {
            return;
        }
        setSearchCurrentPage(page);
        runSearch({
            variables: {
                fullText: searchInputRef.current.input.value,
                limit: pageSize,
                offset: (page - 1) * pageSize,
                sortOrder: SortOrder.asc
            }
        });
    };

    const _handleAfterCreateRecord = (record: RecordIdentity_whoAmI) => {
        onAdd([
            {
                id: record.id,
                whoAmI: record
            }
        ]);
    };

    const currentSearch = searchInputRef?.current?.input?.value;

    const searchResult =
        searchData && currentSearch
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
                    <CloseButton onClick={_handleClose} role="button" />
                </SearchActions>
                <ListsWrapper>
                    {!filteredValuesList.length && !searchResult.length && currentSearch ? (
                        t('record_edition.no_matching_value')
                    ) : (
                        <></>
                    )}
                    {!!filteredValuesList.length && (
                        <>
                            <Divider orientation="left">{t('record_edition.values_list')}</Divider>
                            <List
                                {...listCommonProps}
                                data-testid="values_list"
                                dataSource={filteredValuesList}
                                pagination={false}
                            />
                        </>
                    )}
                    {canSearch && !!searchResult.length && (
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
                    {canSearch && !currentSearch && (
                        <StartTypingMessage>
                            <BulbOutlined /> {t('record_edition.start_typing_message')}
                        </StartTypingMessage>
                    )}
                </ListsWrapper>
                {attribute.multiple_values && (
                    <FooterWrapper>
                        <Space>
                            {canSearch && (
                                <Button size="small" icon={<SearchOutlined />} onClick={_handleClickAdvancedSearch}>
                                    {t('record_edition.advanced_search')}
                                </Button>
                            )}
                            {canCreateRecord && (
                                <Button size="small" icon={<PlusOutlined />} onClick={_handleOpenCreateRecordModal}>
                                    {t('record_edition.new_record')}
                                </Button>
                            )}
                        </Space>
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
            {isSearchModalVisible && (
                <SearchModal
                    libId={attribute.linked_library.id}
                    visible={isSearchModalVisible}
                    setVisible={setIsSearchModalVisible}
                    submitAction={_handleSearchModalSubmit}
                />
            )}
            {isCreateRecordModalVisible && (
                <EditRecordModal
                    open={isCreateRecordModalVisible}
                    library={attribute.linked_library.id}
                    record={null}
                    onClose={_handleCloseCreateRecordModal}
                    afterCreate={_handleAfterCreateRecord}
                />
            )}
        </>
    );
}

export default ValuesAdd;
