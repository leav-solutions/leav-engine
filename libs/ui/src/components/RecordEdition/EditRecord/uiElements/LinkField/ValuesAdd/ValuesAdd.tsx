// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    BulbOutlined,
    CloseOutlined,
    CloudUploadOutlined,
    FolderAddOutlined,
    PlusOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import {Button, Divider, Input, InputRef, Space, Spin} from 'antd';
import {PaginationConfig} from 'antd/lib/pagination';
import {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {CreateDirectory} from '_ui/components/CreateDirectory';
import {ErrorDisplay} from '_ui/components/ErrorDisplay';
import List from '_ui/components/List';
import {IListProps} from '_ui/components/List/List';
import {RecordCard} from '_ui/components/RecordCard';
import EditRecordModal from '_ui/components/RecordEdition/EditRecordModal';
import {SearchModal} from '_ui/components/SearchModal';
import {UploadFiles} from '_ui/components/UploadFiles';
import {PreviewSize} from '_ui/constants';
import {useLang} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IRecordIdentity, IRecordIdentityWhoAmI} from '_ui/types/records';
import {
    CreateDirectoryMutation,
    LibraryBehavior,
    RecordFormAttributeLinkAttributeFragment,
    UploadMutation
} from '_ui/_gqlTypes';
import {
    getRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '_ui/_queries/records/getRecordsFromLibraryQuery';

type ValueFromList = RecordFormAttributeLinkAttributeFragment['linkValuesList']['values'][0];

interface IValuesAddProps {
    attribute: RecordFormAttributeLinkAttributeFragment;
    onAdd: (values: IRecordIdentity[]) => void;
    onClose: () => void;
}

const Wrapper = styled.div`
    background-color: ${themeVars.defaultBg};
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
    <RecordCard
        record={item.whoAmI}
        key={item.id}
        size={PreviewSize.small}
        withLibrary={false}
        simplistic
        style={{margin: '0.3rem 0'}}
    />
);

function ValuesAdd({attribute, onAdd, onClose}: IValuesAddProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const valuesList = attribute.linkValuesList.enable ? attribute.linkValuesList.values : [];
    const [filteredValuesList, setFilteredValuesList] = useState<ValueFromList[]>(valuesList);

    const wrapperRef = useRef<HTMLDivElement>();
    const searchInputRef = useRef<InputRef>();

    const [selectedValues, setSelectedValues] = useState<ValueFromList[]>([]);
    const [isUploadFilesModalVisible, setIsUploadFilesModalVisible] = useState<boolean>(false);
    const [isCreateDirectoryModalVisible, setIsCreateDirectoryModalVisible] = useState<boolean>(false);
    const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
    const [isCreateRecordModalVisible, setIsCreateRecordModalVisible] = useState<boolean>(false);
    const [valuesListCurrentPage, setValuesListCurrentPage] = useState<number>(1);
    const [searchCurrentPage, setSearchCurrentPage] = useState<number>(1);
    const pageSize = 10;
    const canSearch = !attribute.linkValuesList.enable || attribute.linkValuesList.allowFreeEntry;
    const canCreateRecord =
        attribute.linked_library.permissions.create_record &&
        attribute.linked_library.behavior !== LibraryBehavior.files &&
        attribute.linked_library.behavior !== LibraryBehavior.directories;
    const canUploadFile =
        attribute.linked_library.permissions.create_record &&
        attribute.linked_library.behavior === LibraryBehavior.files;
    const canCreateDirectory =
        attribute.linked_library.permissions.create_record &&
        attribute.linked_library.behavior === LibraryBehavior.directories;

    const [runSearch, {loading, error, data: searchData}] = useLazyQuery<
        IGetRecordsFromLibraryQuery,
        IGetRecordsFromLibraryQueryVariables
    >(getRecordsFromLibraryQuery([], true));

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

    const _handleClickUploadFiles = () => setIsUploadFilesModalVisible(true);
    const _handleCloseUploadFiles = () => setIsUploadFilesModalVisible(false);

    const _handleClickCreateDirectoryModal = () => setIsCreateDirectoryModalVisible(true);
    const _handleCloseCreateDirectoryModal = () => setIsCreateDirectoryModalVisible(false);

    const _onUploadFilesCompleted = async (data: UploadMutation['upload']) => {
        const toAdd = data.map(d => {
            return {id: d.record.id, whoAmI: d.record.whoAmI};
        });

        onAdd(toAdd);
    };

    const _onCreateDirectoryCompleted = async (data: CreateDirectoryMutation['createDirectory']) => {
        onAdd([{id: data.id, whoAmI: data.whoAmI}]);
    };

    const _handleOpenCreateRecordModal = () => {
        setIsCreateRecordModalVisible(true);
    };

    const _handleCloseCreateRecordModal = () => {
        setIsCreateRecordModalVisible(false);
    };

    const _handleSearchModalSubmit = async ({selected}) => {
        if (!selected.length) {
            return;
        }

        const selectedRecordToSave = attribute.multiple_values ? selected : [selected[0]];
        const valuesToSave = selectedRecordToSave.map(selectedRecord => ({
            id: selectedRecord.id,
            whoAmI: {
                id: selectedRecord.id,
                label: selectedRecord.label,
                subLabel: null,
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
                    library: attribute.linked_library.id,
                    fullText: submittedSearch,
                    limit: pageSize,
                    offset: 0
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
                library: attribute.linked_library.id,
                fullText: searchInputRef.current.input.value,
                limit: pageSize,
                offset: (page - 1) * pageSize
            }
        });
    };

    const _handleAfterCreateRecord = (record: IRecordIdentityWhoAmI) => {
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
            ? searchData.records.list.map(record => ({
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
                                        total: searchData?.records.totalCount ?? 0,
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
                        {canUploadFile && (
                            <Button size="small" icon={<CloudUploadOutlined />} onClick={_handleClickUploadFiles}>
                                {t('upload.title')}
                            </Button>
                        )}
                        {canCreateDirectory && (
                            <Button
                                size="small"
                                icon={<FolderAddOutlined />}
                                onClick={_handleClickCreateDirectoryModal}
                            >
                                {t('create_directory.title')}
                            </Button>
                        )}
                    </Space>
                    <Space>
                        <Button size="small" onClick={_handleClose}>
                            {t('global.cancel')}
                        </Button>
                        <Button type="primary" size="small" onClick={_handleSubmit}>
                            {t('global.submit')}
                        </Button>
                    </Space>
                </FooterWrapper>
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
            {isUploadFilesModalVisible && (
                <UploadFiles
                    libraryId={attribute.linked_library.id}
                    multiple={attribute.multiple_values}
                    onCompleted={_onUploadFilesCompleted}
                    onClose={_handleCloseUploadFiles}
                />
            )}
            {isCreateDirectoryModalVisible && (
                <CreateDirectory
                    libraryId={attribute.linked_library.id}
                    onCompleted={_onCreateDirectoryCompleted}
                    onClose={_handleCloseCreateDirectoryModal}
                />
            )}
        </>
    );
}

export default ValuesAdd;