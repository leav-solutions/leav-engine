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
import {useLang} from '../../../hooks';
import {GetLibrariesQuery, SaveLibraryMutation, useGetLibrariesQuery} from '../../../_gqlTypes';
import {getLibrariesQuery} from '../../../_queries/libraries/getLibrariesQuery';
import {EditLibraryModal} from '../../EditLibraryModal';
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

type LibraryType = Override<GetLibrariesQuery['libraries']['list'][number], {label: string}> & {key: string};

interface ILibrariesListProps {
    onSelect: (selectedLibraries: string[]) => void;
    selected?: string[];
    multiple?: boolean;
    canCreate?: boolean;
}

function LibrariesList({onSelect, canCreate = true, selected = [], multiple = true}: ILibrariesListProps): JSX.Element {
    const {t} = useTranslation('shared');
    const {lang} = useLang();
    const {loading, error, data} = useGetLibrariesQuery();
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
    const [search, setSearch] = useState('');
    const [isNewLibraryModalOpen, setIsNewLibraryModalOpen] = useState(false);
    const client = useApolloClient();

    const _handleSelectionChange = (selection: Key[]) => {
        setSelectedRowKeys(selection);
        onSelect(selection as string[]);
    };

    const _handleRowClick = (record: LibraryType) => {
        let newSelection;

        if (selectedRowKeys.indexOf(record.key) === -1) {
            newSelection = multiple ? [...selectedRowKeys, record.key] : [record.key]; // Add to selection
        } else {
            newSelection = multiple ? selectedRowKeys.filter(key => key !== record.key) : []; // Remove from selection
        }

        setSelectedRowKeys(newSelection);
        onSelect(newSelection as string[]);
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

        if (allLibrariesData) {
            client.writeQuery({
                query: getLibrariesQuery,
                data: {
                    libraries: {
                        ...allLibrariesData.libraries,
                        list: [newLibrary, ...allLibrariesData.libraries.list]
                    }
                }
            });
        }
        const newSelection = [...selectedRowKeys, newLibrary.id];
        onSelect(newSelection as string[]);
        setSelectedRowKeys(newSelection);
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const columns: TableColumnsType<LibraryType> = [
        {
            title: t('libraries.label'),
            dataIndex: 'label',
            key: 'label'
        },
        {
            title: t('libraries.id'),
            dataIndex: 'id',
            key: 'id'
        }
    ];

    const tableData: LibraryType[] = ([...data?.libraries?.list] ?? [])
        .filter(lib => {
            // Do not display already selected libraries
            if (selected.find(selectedLib => selectedLib === lib.id)) {
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
