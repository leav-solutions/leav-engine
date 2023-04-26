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
import {PreviewSize} from '../../../constants';
import {useLang} from '../../../hooks';
import {AttributeDetailsFragment, GetAttributesQuery, useGetAttributesQuery} from '../../../_gqlTypes';
import {getAttributesQuery} from '../../../_queries/attributes/getAttributesQuery';
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

type AttributeType = Override<GetAttributesQuery['attributes']['list'][number], {label: string}> & {key: string};

interface IAttributesListProps {
    onSelect: (selectedAttributes: string[]) => void;
    selected?: string[];
    multiple?: boolean;
    canCreate?: boolean;
}

function AttributesList({
    onSelect,
    canCreate = true,
    selected = [],
    multiple = true
}: IAttributesListProps): JSX.Element {
    const {t} = useTranslation('shared');
    const {lang} = useLang();
    const {loading, error, data} = useGetAttributesQuery();
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
    const [search, setSearch] = useState('');
    const [isNewAttributeModalOpen, setIsNewAttributeModalOpen] = useState(false);
    const client = useApolloClient();

    const _handleSelectionChange = (selection: Key[]) => {
        setSelectedRowKeys(selection);
        onSelect(selection as string[]);
    };

    const _handleRowClick = (record: AttributeType) => {
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

    const _handleClickNewAttribute = () => {
        setIsNewAttributeModalOpen(true);
    };
    const _handleCloseNewAttribute = () => setIsNewAttributeModalOpen(false);

    const _handlePostCreate = async (newAttribute: AttributeDetailsFragment) => {
        const allAttributesData = client.readQuery<GetAttributesQuery>({query: getAttributesQuery});

        if (allAttributesData) {
            client.writeQuery({
                query: getAttributesQuery,
                data: {
                    attributes: {
                        ...allAttributesData.attributes,
                        list: [newAttribute, ...allAttributesData.attributes.list]
                    }
                }
            });
        }
        const newSelection = [...selectedRowKeys, newAttribute.id];
        onSelect(newSelection as string[]);
        setSelectedRowKeys(newSelection);
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const columns: TableColumnsType<AttributeType> = [
        {
            title: t('attributes.attribute'),
            key: 'attribute',
            render: (_, attribute) => {
                const attributeIdentity: IEntityData = {
                    label: attribute.label,
                    subLabel: attribute.id,
                    preview: null,
                    color: null
                };
                return <EntityCard entity={attributeIdentity} size={PreviewSize.small} />;
            }
        }
    ];

    const tableData: AttributeType[] = ([...data?.attributes?.list] ?? [])
        .filter(attribute => {
            // Do not display already selected libraries
            if (selected.find(selectedAttribute => selectedAttribute === attribute.id)) {
                return false;
            }

            // Filter based on search
            const label = localizedTranslation(attribute.label, lang);
            const searchStr = search.toLowerCase();

            // Search on id or label
            return attribute.id.toLowerCase().includes(searchStr) || label.toLowerCase().includes(searchStr);
        })
        .map(attribute => ({
            ...attribute,
            key: attribute.id,
            label: localizedTranslation(attribute.label, lang)
        }));

    const tableHeader = (
        <HeaderWrapper>
            <Input.Search onChange={_handleSearchChange} placeholder={t('global.search') + '...'} allowClear />
            {canCreate && (
                <Button type="primary" icon={<PlusOutlined />} onClick={_handleClickNewAttribute}>
                    {t('attributes.new_attribute')}
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
            {isNewAttributeModalOpen && (
                <EditAttributeModal
                    open={isNewAttributeModalOpen}
                    onClose={_handleCloseNewAttribute}
                    onPostCreate={_handlePostCreate}
                    width={790}
                />
            )}
        </>
    );
}

export default AttributesList;
