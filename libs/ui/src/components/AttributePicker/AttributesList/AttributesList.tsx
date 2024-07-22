// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined, SearchOutlined} from '@ant-design/icons';
import {useApolloClient} from '@apollo/client';
import {localizedTranslation, Override} from '@leav/utils';
import {Table, TableColumnsType, TablePaginationConfig} from 'antd';
import {FilterValue, SorterResult} from 'antd/lib/table/interface';
import {KitButton, KitInput, KitTag} from 'aristid-ds';
import {Key, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {
    defaultPaginationPageSize,
    PreviewSize,
    tagColorByAttributeFormat,
    tagColorByAttributeType
} from '../../../constants';
import {useLang} from '../../../hooks';
import {useSharedTranslation} from '../../../hooks/useSharedTranslation';
import {
    AttributeDetailsFragment,
    AttributeFormat,
    AttributesSortableFields,
    AttributeType,
    GetAttributesQuery,
    GetAttributesQueryVariables,
    PermissionsActions,
    PermissionTypes,
    SortOrder,
    useGetAttributesQuery,
    useIsAllowedQuery
} from '../../../_gqlTypes';
import {getAttributesQuery} from '../../../_queries/attributes/getAttributesQuery';
import {extractPermissionFromQuery} from '../../../_utils';
import {EditAttributeModal} from '../../EditAttributeModal';
import {EntityCard, IEntityData} from '../../EntityCard';
import {ErrorDisplay} from '../../ErrorDisplay';

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;

    .kit-input-wrapper {
        flex-grow: 1;
    }
`;

type ListAttributeType = Override<GetAttributesQuery['attributes']['list'][number], {label: string}> & {key: string};

interface IAttributesListProps {
    onSelect: (selectedAttributes: string[]) => void;
    selected?: string[];
    multiple?: boolean;
    showCreateButton?: boolean;
    baseFilters?: GetAttributesQueryVariables['filters'];
}

function AttributesList({
    onSelect,
    selected = [],
    multiple = true,
    showCreateButton = true,
    baseFilters
}: IAttributesListProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const inputRef = useRef<HTMLInputElement>(null);

    const [pageSize, setPageSize] = useState(defaultPaginationPageSize);
    const [currentPage, setCurrentPage] = useState(1);
    const [sort, setSort] = useState<GetAttributesQueryVariables['sort']>();
    const [filters, setFilters] = useState<GetAttributesQueryVariables['filters']>({});
    const [tableData, setTableData] = useState<ListAttributeType[]>([]);

    const {loading, error, data} = useGetAttributesQuery({
        variables: {
            pagination: {
                limit: pageSize,
                offset: (currentPage - 1) * pageSize
            },
            sort,
            filters: {
                ...filters,
                ...baseFilters
            }
        }
    });

    const isAllowedQueryResult = useIsAllowedQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            type: PermissionTypes.admin,
            actions: [PermissionsActions.admin_create_attribute]
        }
    });
    const canCreate =
        showCreateButton && extractPermissionFromQuery(isAllowedQueryResult, PermissionsActions.admin_create_attribute);

    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(selected);
    const [isNewAttributeModalOpen, setIsNewAttributeModalOpen] = useState(false);
    const client = useApolloClient();

    const _handleSelectionChange = (selection: Key[]) => {
        setSelectedRowKeys(selection);
        onSelect(selection as string[]);
    };

    const _handleRowClick = (record: ListAttributeType) => {
        let newSelection;

        if (selectedRowKeys.indexOf(record.key) === -1) {
            newSelection = multiple ? [...selectedRowKeys, record.key] : [record.key]; // Add to selection
        } else {
            newSelection = multiple ? selectedRowKeys.filter(key => key !== record.key) : []; // Remove from selection
        }

        setSelectedRowKeys(newSelection);
        onSelect(newSelection as string[]);
    };

    const _handleSearchSubmit = (e: React.SyntheticEvent<HTMLInputElement>) => {
        setFilters({
            ...filters,
            label: `%${e.currentTarget.value}%`
        });
    };

    const _handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Handle clearing input only. Submitting input is otherwise handled by "onPressEnter"
        if (!e.currentTarget.value) {
            _handleSearchSubmit(e);
        }
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

    const _handleChange = (
        pagination: TablePaginationConfig,
        filter: Record<string, FilterValue | null>,
        sorter: SorterResult<ListAttributeType> | Array<SorterResult<ListAttributeType>>
    ) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);

        const relevantSorter = Array.isArray(sorter) ? sorter[0] : sorter;
        if (relevantSorter.column && relevantSorter.order) {
            const newSort = {
                field: AttributesSortableFields[relevantSorter.columnKey],
                order: relevantSorter.order === 'ascend' ? SortOrder.asc : SortOrder.desc
            };
            setSort(newSort);
        }

        const newFilters: GetAttributesQueryVariables['filters'] = {};
        for (const [field, filterValue] of Object.entries(filter)) {
            if (filterValue) {
                newFilters[field] = filterValue;
            }
        }
        setFilters(newFilters);
    };

    if (error || isAllowedQueryResult.error) {
        return <ErrorDisplay message={error?.message || isAllowedQueryResult?.error?.message} />;
    }

    const columns: TableColumnsType<ListAttributeType> = [
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
        },
        {
            title: t('attributes.type'),
            dataIndex: 'type',
            key: 'type',
            width: '150px',
            render: (type: AttributeType) => (
                <KitTag
                    style={{borderColor: tagColorByAttributeType[type][0], backgroundColor:tagColorByAttributeType[type][1]}}
                    idCardProps={{
                    description: t(`attributes.type_${type}`)
                }} />
            ),
            filters: Object.values(AttributeType).map(type => ({
                text: t(`attributes.type_${type}`),
                value: type
            })),
            onFilter: (value, record) => record.type === value,
            sorter: (a, b) => {
                const aTypeLabel = t(`attributes.type_${a.type}`);
                const bTypeLabel = t(`attributes.type_${b.type}`);

                return aTypeLabel.localeCompare(bTypeLabel);
            }
        },
        {
            title: t('attributes.format'),
            dataIndex: 'format',
            key: 'format',
            width: '150px',
            render: (format: AttributeFormat) =>
                format ? (
                    <KitTag
                        style={{borderColor: tagColorByAttributeFormat[format][0], backgroundColor:tagColorByAttributeFormat[format][1]}}
                        idCardProps={{
                            description: t(`attributes.format_${format}`)
                        }} />                ) : null,
            filters: Object.values(AttributeFormat).map(format => ({
                text: t(`attributes.format_${format}`),
                value: format
            })),
            onFilter: (value, record) => record.format === value,
            sorter: (a, b) => {
                const aFormatLabel = t(`attributes.format_${a.format}`);
                const bFormatLabel = t(`attributes.format_${b.format}`);

                return aFormatLabel.localeCompare(bFormatLabel);
            }
        }
    ];

    useEffect(() => {
        // To avoid temporary display of "no data" when pagination changes
        if (loading || !data) {
            return;
        }

        const newTableData = data?.attributes?.list
            ? [...data.attributes.list].map(attribute => ({
                  ...attribute,
                  key: attribute.id,
                  label: localizedTranslation(attribute.label, lang)
              }))
            : [];

        setTableData(newTableData);
    }, [loading, data]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    const tableHeader = (
        <HeaderWrapper>
            <KitInput
                onPressEnter={_handleSearchSubmit}
                onChange={_handleSearchChange}
                placeholder={t('global.search') + '...'}
                allowClear
                suffix={<SearchOutlined />}
                // @ts-ignore - ref is a valid prop
                ref={inputRef}
            />
            {canCreate && (
                <KitButton type="primary" icon={<PlusOutlined />} onClick={_handleClickNewAttribute}>
                    {t('attributes.new_attribute')}
                </KitButton>
            )}
        </HeaderWrapper>
    );

    return (
        <>
            <Table
                loading={loading}
                size="middle"
                rowSelection={{
                    type: multiple ? 'checkbox' : 'radio',
                    selectedRowKeys,
                    onChange: _handleSelectionChange
                }}
                columns={columns}
                dataSource={tableData}
                bordered
                pagination={{
                    position: ['bottomCenter'],
                    pageSize,
                    current: currentPage,
                    total: data?.attributes?.totalCount ?? 0,
                    showTotal: total => t('global.total_count', {total})
                }}
                scroll={{y: 'calc(95vh - 20rem)'}}
                title={() => tableHeader}
                onRow={record => ({
                    onClick: () => _handleRowClick(record)
                })}
                onChange={_handleChange}
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
