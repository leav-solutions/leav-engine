// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined, SearchOutlined} from '@ant-design/icons';
import {localizedTranslation, Override} from '@leav/utils';
import {Table, TableColumnsType, TablePaginationConfig} from 'antd';
import {FilterValue, SorterResult} from 'antd/es/table/interface';
import {KitButton, KitInput, KitTag} from 'aristid-ds';
import {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {defaultPaginationPageSize, tagColorByAttributeFormat, tagColorByAttributeType} from '../../../../../constants';
import {useLang} from '../../../../../hooks';
import {useSharedTranslation} from '../../../../../hooks/useSharedTranslation';
import {
    AttributeFormat,
    AttributesSortableFields,
    AttributeType,
    GetAttributesQuery,
    GetAttributesQueryVariables,
    LibraryAttributesFragment,
    SortOrder,
    useGetAttributesQuery
} from '../../../../../_gqlTypes';
import {AttributePicker} from '../../../../AttributePicker';
import {AttributeCell} from './AttributeCell';
import {DeleteButton} from './DeleteButton';

interface IAttributesListProps {
    readOnly: boolean;
    library: string;
    onDeleteAttribute: (attribute: LibraryAttributesFragment) => Promise<void>;
    onAddAttributes: (attributes: string[]) => Promise<void>;
}

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;

    .kit-input-wrapper {
        flex-grow: 1;
    }
`;

// To fix a cosmetic issue with the table header (see https://github.com/ant-design/ant-design/issues/41975)
const Wrapper = styled.div`
    && .ant-table-header {
        border-radius: 0;
    }
`;

export type AttributeListType = Override<GetAttributesQuery['attributes']['list'][number], {label: string}> & {
    key: string;
};

function AttributesList({library, readOnly, onDeleteAttribute, onAddAttributes}: IAttributesListProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const [isAddAttributeModalOpen, setIsAddAttributeModalOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const [pageSize, setPageSize] = useState(defaultPaginationPageSize);
    const [currentPage, setCurrentPage] = useState(1);
    const [sort, setSort] = useState<GetAttributesQueryVariables['sort']>();
    const [filters, setFilters] = useState<GetAttributesQueryVariables['filters']>({});
    const [tableData, setTableData] = useState<AttributeListType[]>([]);

    const {loading, error, data, refetch} = useGetAttributesQuery({
        variables: {
            pagination: {
                limit: pageSize,
                offset: (currentPage - 1) * pageSize
            },
            sort,
            filters: {
                ...filters,
                libraries: [library]
            }
        }
    });

    const _handleSubmitAddAttribute = async (selectedAttributes: string[]) => {
        await onAddAttributes(selectedAttributes);
        refetch();
    };

    const _handleDeleteAttribute = (attribute: LibraryAttributesFragment) => async () => {
        await onDeleteAttribute(attribute);
        refetch();
    };

    const _handleClickNewAttribute = () => {
        setIsAddAttributeModalOpen(true);
    };

    const _handleCloseAddAttributeModal = () => setIsAddAttributeModalOpen(false);

    const _handleChange = (
        pagination: TablePaginationConfig,
        filter: Record<string, FilterValue | null>,
        sorter: SorterResult<AttributeListType> | Array<SorterResult<AttributeListType>>
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

    const columns: TableColumnsType<AttributeListType> = [
        {
            title: t('attributes.attribute'),
            key: 'label',
            render: (_, attribute) => <AttributeCell attribute={attribute} />
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
                        }} />
                ) : null,
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
        },
        {
            key: 'delete',
            title: <span></span>,
            dataIndex: 'id',
            width: '50px',
            align: 'center',
            render: (_, attribute) => (
                <DeleteButton readOnly={readOnly} attribute={attribute} onDelete={_handleDeleteAttribute(attribute)} />
            )
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
            {!readOnly && (
                <KitButton type="primary" icon={<PlusOutlined />} onClick={_handleClickNewAttribute}>
                    {t('attributes.add_attribute')}
                </KitButton>
            )}
        </HeaderWrapper>
    );

    return (
        <Wrapper>
            <Table
                loading={loading}
                size="middle"
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
                scroll={{y: 'calc(95vh - 26rem)'}}
                title={() => tableHeader}
                onChange={_handleChange}
            />
            {isAddAttributeModalOpen && (
                <AttributePicker
                    multiple
                    onClose={_handleCloseAddAttributeModal}
                    onSubmit={_handleSubmitAddAttribute}
                    open={isAddAttributeModalOpen}
                    baseFilters={{librariesExcluded: [library]}}
                />
            )}
        </Wrapper>
    );
}

export default AttributesList;
