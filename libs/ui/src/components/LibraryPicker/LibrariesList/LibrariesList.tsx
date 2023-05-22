// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined} from '@ant-design/icons';
import {useApolloClient} from '@apollo/client';
import {localizedTranslation, Override} from '@leav/utils';
import {Button, Input, Table, TableColumnsType} from 'antd';
import {Key, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
    GetLibrariesQuery,
    LibraryLightFragment,
    PermissionsActions,
    PermissionTypes,
    SaveLibraryMutation,
    useGetLibrariesQuery,
    useIsAllowedQuery
} from '../../../_gqlTypes';
import {getLibrariesQuery} from '../../../_queries/libraries/getLibrariesQuery';
import {PreviewSize} from '../../../constants';
import {extractPermissionFromQuery} from '../../../helpers/extractPermissionFromQuery';
import {useLang} from '../../../hooks';
import {EditLibraryModal} from '../../EditLibraryModal';
import {EntityCard, IEntityData} from '../../EntityCard';
import {ErrorDisplay} from '../../ErrorDisplay';
import {Loading} from '../../Loading';

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;

    > input {
        flex-grow: 1;
    }
`;

type LibraryType = Override<LibraryLightFragment, {label: string}> & {key: string};

interface ILibrariesListProps {
    onSelect: (selectedLibraries: LibraryLightFragment[]) => void;
    selected?: string[];
    multiple?: boolean;
    showSelected?: boolean;
}

function LibrariesList({
    onSelect,
    selected = [],
    multiple = true,
    showSelected = false
}: ILibrariesListProps): JSX.Element {
    const {t} = useTranslation('shared');
    const {lang} = useLang();
    const {loading, error, data} = useGetLibrariesQuery();

    const isAllowedQueryResult = useIsAllowedQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            type: PermissionTypes.admin,
            actions: [PermissionsActions.admin_create_library]
        }
    });
    const canCreate = extractPermissionFromQuery(isAllowedQueryResult, PermissionsActions.admin_create_library);

    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(showSelected ? selected : []);
    const [search, setSearch] = useState('');
    const [isNewLibraryModalOpen, setIsNewLibraryModalOpen] = useState(false);
    const client = useApolloClient();

    const _handleSelectionChange = (selection: Key[]) => {
        setSelectedRowKeys(selection);
        onSelect(_getLibsFromKeys(selection));
    };

    const _getLibsFromKeys = (keys: Key[], libsList?: LibraryLightFragment[]) => {
        // The list coming from data might not be up to date after a create, so we use the one passed as argument
        const list = libsList ?? data?.libraries?.list ?? [];
        return list.filter(lib => keys.find(k => lib.id === k));
    };

    const _handleRowClick = (record: LibraryType) => {
        let newSelection: Key[];

        if (selectedRowKeys.indexOf(record.key) === -1) {
            newSelection = multiple ? [...selectedRowKeys, record.key] : [record.key]; // Add to selection
        } else {
            newSelection = multiple ? selectedRowKeys.filter(key => key !== record.key) : []; // Remove from selection
        }

        _handleSelectionChange(newSelection);
    };

    const _handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
    };

    const _handleClickNewLibrary = () => {
        setIsNewLibraryModalOpen(true);
    };
    const _handleCloseNewLibrary = () => setIsNewLibraryModalOpen(false);

    const _handlePostCreate = async (newLibrary: SaveLibraryMutation['saveLibrary']) => {
        const allLibrariesData = client.readQuery<GetLibrariesQuery>({query: getLibrariesQuery});

        const newLibsList = [newLibrary, ...(allLibrariesData?.libraries?.list ?? [])];
        if (allLibrariesData) {
            client.writeQuery({
                query: getLibrariesQuery,
                data: {
                    libraries: {
                        ...allLibrariesData.libraries,
                        list: newLibsList
                    }
                }
            });
        }
        const newSelection = [...selectedRowKeys, newLibrary.id];
        setSelectedRowKeys(newSelection);
        onSelect(_getLibsFromKeys(newSelection, newLibsList));
    };

    if (loading) {
        return <Loading />;
    }

    if (error || isAllowedQueryResult.error) {
        return <ErrorDisplay message={error?.message || isAllowedQueryResult?.error?.message} />;
    }

    const columns: TableColumnsType<LibraryType> = [
        {
            title: t('libraries.library'),
            key: 'library',
            render: (_, library) => {
                const libraryIdentity: IEntityData = {
                    label: library.label,
                    subLabel: library.id,
                    preview: library.icon?.whoAmI?.preview?.[PreviewSize.small] ?? null,
                    color: null
                };
                return <EntityCard entity={libraryIdentity} size={PreviewSize.small} />;
            }
        }
    ];

    const tableData: LibraryType[] = ([...data?.libraries?.list] ?? [])
        .filter(lib => {
            // Do not display already selected libraries unless showSelected is true
            if (!showSelected && selected.find(selectedLib => selectedLib === lib.id)) {
                return false;
            }

            // Filter based on search
            const label = localizedTranslation(lib.label, lang);
            const searchStr = search.toLowerCase();

            // Search on id or label
            return lib.id.toLowerCase().includes(searchStr) || label.toLowerCase().includes(searchStr);
        })
        .map(lib => ({
            ...lib,
            key: lib.id,
            label: localizedTranslation(lib.label, lang)
        }));

    const tableHeader = (
        <HeaderWrapper>
            <Input.Search onChange={_handleSearchChange} placeholder={t('libraries.search') + '...'} allowClear />
            {canCreate && (
                <Button type="primary" icon={<PlusOutlined />} onClick={_handleClickNewLibrary}>
                    {t('libraries.new_library')}
                </Button>
            )}
        </HeaderWrapper>
    );

    return (
        <>
            <Table
                size="middle"
                rowSelection={{
                    type: multiple ? 'checkbox' : 'radio',
                    selectedRowKeys,
                    onChange: _handleSelectionChange
                }}
                columns={columns}
                dataSource={tableData}
                bordered
                pagination={false}
                scroll={{y: 'calc(95vh - 20rem)'}}
                title={() => tableHeader}
                onRow={record => ({
                    onClick: () => _handleRowClick(record)
                })}
            />
            {isNewLibraryModalOpen && (
                <EditLibraryModal
                    open={isNewLibraryModalOpen}
                    onClose={_handleCloseNewLibrary}
                    onPostCreate={_handlePostCreate}
                    width={790}
                />
            )}
        </>
    );
}

export default LibrariesList;
