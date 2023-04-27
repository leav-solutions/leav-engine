// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined} from '@ant-design/icons';
import {useApolloClient} from '@apollo/client';
import {localizedTranslation, Override} from '@leav/utils';
import {Button, Input, Table, TableColumnsType} from 'antd';
import {Key, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {PreviewSize} from '../../../constants';
import {useLang} from '../../../hooks';
import {
    AttributeDetailsFragment as TreeDetailsFragment,
    GetTreesQuery,
    TreeLightFragment,
    useGetTreesQuery
} from '../../../_gqlTypes';
import {getAttributesQuery as getTreesQuery} from '../../../_queries/attributes/getAttributesQuery';
import EditAttributeModal from '../../EditAttributeModal/EditAttributeModal';
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

type TreeType = Override<GetTreesQuery['trees']['list'][number], {label: string}> & {key: string};

interface ITreesListProps {
    onSelect: (selectedTrees: TreeLightFragment[]) => void;
    selected?: string[];
    multiple?: boolean;
    canCreate?: boolean;
    showSelected?: boolean;
}

function TreesList({
    onSelect,
    canCreate = true,
    selected = [],
    multiple = true,
    showSelected = false
}: ITreesListProps): JSX.Element {
    const {t} = useTranslation('shared');
    const {lang} = useLang();
    const {loading, error, data} = useGetTreesQuery();
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(showSelected ? selected : []);
    const [search, setSearch] = useState('');
    const [isNewTreeModalOpen, setIsNewTreeModalOpen] = useState(false);
    const client = useApolloClient();
    const treesByKey = useMemo(() => {
        return data?.trees.list.reduce((acc, library) => {
            acc[library.id] = library;
            return acc;
        }, {});
    }, [data?.trees.list]);

    const _getTreesFromKeys = (keys: Key[]) => {
        return keys.map(key => treesByKey[key]);
    };

    const _handleSelectionChange = (selection: Key[]) => {
        setSelectedRowKeys(selection);
        onSelect(_getTreesFromKeys(selection));
    };

    const _handleRowClick = (record: TreeType) => {
        let newSelection: Key[];

        if (selectedRowKeys.indexOf(record.key) === -1) {
            newSelection = multiple ? [...selectedRowKeys, record.key] : [record.key]; // Add to selection
        } else {
            newSelection = multiple ? selectedRowKeys.filter(key => key !== record.key) : []; // Remove from selection
        }

        setSelectedRowKeys(newSelection);
        onSelect(_getTreesFromKeys(newSelection));
    };

    const _handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
    };

    const _handleClickNewTree = () => {
        setIsNewTreeModalOpen(true);
    };
    const _handleCloseNewAttribute = () => setIsNewTreeModalOpen(false);

    const _handlePostCreate = async (newTree: TreeDetailsFragment) => {
        const allTreesData = client.readQuery<GetTreesQuery>({query: getTreesQuery});

        if (allTreesData) {
            client.writeQuery({
                query: getTreesQuery,
                data: {
                    trees: {
                        ...allTreesData.trees,
                        list: [newTree, ...allTreesData.trees.list]
                    }
                }
            });
        }
        const newSelection = [...selectedRowKeys, newTree.id];
        onSelect(_getTreesFromKeys(newSelection));
        setSelectedRowKeys(newSelection);
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const columns: TableColumnsType<TreeType> = [
        {
            title: t('trees.tree'),
            key: 'tree',
            render: (_, tree) => {
                const treeIdentity: IEntityData = {
                    label: tree.label,
                    subLabel: tree.id,
                    preview: null,
                    color: null
                };
                return <EntityCard entity={treeIdentity} size={PreviewSize.small} />;
            }
        }
    ];

    const tableData: TreeType[] = ([...data?.trees?.list] ?? [])
        .filter(tree => {
            // Do not display already selected libraries
            if (!showSelected && selected.find(selectedTree => selectedTree === tree.id)) {
                return false;
            }

            // Filter based on search
            const label = localizedTranslation(tree.label, lang);
            const searchStr = search.toLowerCase();

            // Search on id or label
            return tree.id.toLowerCase().includes(searchStr) || label.toLowerCase().includes(searchStr);
        })
        .map(tree => ({
            ...tree,
            key: tree.id,
            label: localizedTranslation(tree.label, lang)
        }));

    const tableHeader = (
        <HeaderWrapper>
            <Input.Search onChange={_handleSearchChange} placeholder={t('global.search') + '...'} allowClear />
            {canCreate && (
                <Button type="primary" icon={<PlusOutlined />} onClick={_handleClickNewTree}>
                    {t('trees.new_tree')}
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
            {isNewTreeModalOpen && (
                <EditAttributeModal
                    open={isNewTreeModalOpen}
                    onClose={_handleCloseNewAttribute}
                    onPostCreate={_handlePostCreate}
                    width={790}
                />
            )}
        </>
    );
}

export default TreesList;
