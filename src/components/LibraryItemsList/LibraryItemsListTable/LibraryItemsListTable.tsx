import {CheckOutlined, CloseOutlined, DownOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Card, Dropdown, Menu, Spin, Table} from 'antd';
import objectPath from 'object-path';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {
    checkTypeIsLink,
    displayTypeToPreviewSize,
    getItemKeyFromColumn,
    getSortFieldByAttributeType,
    localizedLabel,
    paginationOptions
} from '../../../utils';
import {
    AttributeFormat,
    AttributeType,
    IItemsColumn,
    IRecordEdition,
    ITableHeader,
    OrderSearch,
    PreviewSize
} from '../../../_types/types';
import RecordCard from '../../shared/RecordCard';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import ChooseTableColumns from './ChooseTableColumns';
import LibraryItemsModal from './LibraryItemsListTableRow/LibraryItemsModal';

interface ILibraryItemsListTableProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

const initialColumnsLimit = 5;

function LibraryItemsListTable({stateItems, dispatchItems}: ILibraryItemsListTableProps): JSX.Element {
    const {t} = useTranslation();

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    const [tableColumns, setTableColumn] = useState<ITableHeader[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [openChangeColumns, setOpenChangeColumns] = useState(false);
    const [recordEdition, setRecordEdition] = useState<IRecordEdition>({
        show: false
    });

    useEffect(() => {
        if (stateItems.attributes.length && !stateItems.columns.length) {
            // initialize columns in state
            const initialTableColumns: ITableHeader[] = stateItems.attributes.reduce(
                (acc, attribute, index) =>
                    index < initialColumnsLimit
                        ? [
                              ...acc,
                              {
                                  key: attribute.id,
                                  dataIndex: attribute.id,
                                  title: (
                                      <Header
                                          stateItems={stateItems}
                                          dispatchItems={dispatchItems}
                                          name={attribute.id}
                                          type={attribute.type}
                                          setOpenChangeColumns={setOpenChangeColumns}
                                      >
                                          {typeof attribute.label === 'string'
                                              ? attribute.label
                                              : attribute.label.fr || attribute.label.en}
                                      </Header>
                                  ),
                                  library: attribute.library,
                                  type: attribute.type,
                                  render: text => <span>{text}</span>
                              }
                          ]
                        : acc,
                [
                    {
                        key: 'infos',
                        dataIndex: 'infos',
                        title: (
                            <Header
                                stateItems={stateItems}
                                dispatchItems={dispatchItems}
                                name={'infos'}
                                type={AttributeType.simple}
                                setOpenChangeColumns={setOpenChangeColumns}
                            >
                                {t('items_list.table.infos')}
                            </Header>
                        ),
                        library: stateItems.attributes[0].library,
                        type: AttributeType.simple,
                        fixed: 'left',
                        render: text => <span>{text}</span>
                    } as ITableHeader
                ]
            );

            setTableColumn(initialTableColumns);

            const columns = initialTableColumns.map(col => ({id: col.key, library: col.library, type: col.type}));
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_COLUMNS,
                columns
            });
        } else if (stateItems.attributes.length && stateItems.columns.length) {
            setTableColumn(
                stateItems.columns.map(col => {
                    const attribute = stateItems.attributes.find(att => att.id === col.id);

                    if (attribute) {
                        const display = col.extendedData?.path
                            ? col.extendedData?.path.split('.').pop() || ''
                            : typeof attribute.label === 'string'
                            ? attribute.label
                            : localizedLabel(attribute.label, lang);

                        return {
                            title: (
                                <Header
                                    stateItems={stateItems}
                                    dispatchItems={dispatchItems}
                                    name={attribute.id}
                                    type={attribute.type}
                                    setOpenChangeColumns={setOpenChangeColumns}
                                >
                                    {display}
                                </Header>
                            ),
                            type: attribute.type,
                            dataIndex: getItemKeyFromColumn(col),
                            key: col.id,
                            library: col.library,
                            render: text => (
                                <Cell
                                    value={text}
                                    column={col}
                                    size={displayTypeToPreviewSize(stateItems.displayType)}
                                    format={attribute.format}
                                />
                            )
                        };
                    }

                    // only the infos columns isn't in attributes
                    return {
                        title: (
                            <Header
                                stateItems={stateItems}
                                dispatchItems={dispatchItems}
                                name={'infos'}
                                type={AttributeType.simple}
                                setOpenChangeColumns={setOpenChangeColumns}
                            >
                                {t('items_list.table.infos')}
                            </Header>
                        ),
                        type: AttributeType.simple,
                        library: '',
                        dataIndex: 'infos',
                        key: 'infos',
                        fixed: 'left',
                        render: text => (
                            <Cell
                                value={text}
                                size={displayTypeToPreviewSize(stateItems.displayType)}
                                format={AttributeFormat.text}
                            />
                        )
                    };
                })
            );
        }
    }, [t, dispatchItems, stateItems, lang]);

    useEffect(() => {
        if (stateItems.items) {
            setTableData(
                stateItems.items.reduce((acc, item) => {
                    return [
                        ...acc,
                        {
                            key: item.id,
                            ...item
                        }
                    ];
                }, [] as any)
            );
        }
    }, [stateItems.items, stateItems.columns, setTableData]);

    if (!stateItems.items) {
        return (
            <Card style={{height: '20rem'}}>
                <div>
                    <Spin />
                </div>
            </Card>
        );
    }

    const handlePageChange = (page: number, pageSize?: number) => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_OFFSET,
            offset: (page - 1) * (pageSize ?? 0)
        });
    };

    const setPagination = (current: number, size: number) => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_PAGINATION,
            pagination: size
        });
    };

    return (
        <>
            <ChooseTableColumns
                stateItems={stateItems}
                dispatchItems={dispatchItems}
                openChangeColumns={openChangeColumns}
                setOpenChangeColumns={setOpenChangeColumns}
            />

            <Table
                columns={tableColumns}
                dataSource={tableData}
                scroll={{y: 'calc(100vh - 15rem)'}}
                pagination={{
                    total: stateItems.itemsTotalCount,
                    pageSize: stateItems.pagination,
                    current: stateItems.offset / stateItems.pagination + 1,
                    showSizeChanger: true,
                    pageSizeOptions: paginationOptions.map(option => option.toString()),
                    onChange: handlePageChange,
                    onShowSizeChange: setPagination
                }}
            />

            <LibraryItemsModal
                showModal={recordEdition.show}
                closeModal={() => setRecordEdition(re => ({...re, show: false}))}
                values={recordEdition.item}
                updateValues={item => setRecordEdition(re => ({...re, item}))}
            />
        </>
    );
}

interface HeaderPros {
    children: React.ReactNode;
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    name: string;
    type: AttributeType;
    setOpenChangeColumns: any;
}

const Header = ({children, stateItems, dispatchItems, name, type, setOpenChangeColumns}: HeaderPros) => {
    const {t} = useTranslation();

    const handleSort = (attId: string, order: OrderSearch, attType: AttributeType) => {
        const newSortField = getSortFieldByAttributeType(attId, attType);

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SEARCH_INFOS,
            itemsSortField: newSortField,
            itemsSortOrder: order
        });
    };

    const handleDesc = (attId: string, attType: AttributeType) => {
        handleSort(attId, OrderSearch.desc, attType);
    };

    const handleAsc = (attId: string, attType: AttributeType) => {
        handleSort(attId, OrderSearch.asc, attType);
    };

    const cancelSort = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.CANCEL_SEARCH,
            itemsSortField: stateItems.attributes[0]?.id || ''
        });
    };
    return (
        <Dropdown
            overlay={
                <Menu>
                    <Menu.Item onClick={() => handleAsc(name, type)}>
                        {t('items_list.table.header-cell-menu.sort-ascend')}
                    </Menu.Item>
                    <Menu.Item onClick={() => handleDesc(name, type)}>
                        {t('items_list.table.header-cell-menu.sort-descend')}
                    </Menu.Item>
                    <Menu.Item onClick={cancelSort}>{t('items_list.table.header-cell-menu.cancel-sort')}</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item>{t('items_list.table.header-cell-menu.sort-advance')}</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item>{t('items_list.table.header-cell-menu.regroup')}</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item onClick={() => setOpenChangeColumns(true)}>
                        {t('items_list.table.header-cell-menu.choose-columns')}
                    </Menu.Item>
                </Menu>
            }
        >
            <span>
                {children} <DownOutlined />
            </span>
        </Dropdown>
    );
};

interface CellProps {
    value: any;
    column?: IItemsColumn;
    size: PreviewSize;
    format?: AttributeFormat;
    isMultiple?: boolean;
}

const Cell = ({value, column, size, format, isMultiple}: CellProps) => {
    if (value !== undefined && value !== null) {
        // handle infos column
        if (!column) {
            return <RecordCard record={{...value}} size={size} />;
        }

        switch (format) {
            case AttributeFormat.extended:
                if (column.extendedData) {
                    let parseValue = {};

                    try {
                        parseValue = JSON.parse(value);
                    } catch {
                        return 'error';
                    }

                    // Remove the attribute name from the path and change it to array
                    const extendedPathArr = column.extendedData.path.split('.');
                    extendedPathArr.shift();

                    return (
                        <Cell
                            value={objectPath.get(parseValue, extendedPathArr)}
                            column={column}
                            size={size}
                            format={column.extendedData.format}
                            isMultiple={isMultiple}
                        />
                    );
                }
                return;
            case AttributeFormat.boolean:
                return value ? <CheckOutlined /> : <CloseOutlined />;
            case AttributeFormat.numeric:
            case AttributeFormat.text:
            default:
                if (isMultiple) {
                    return value?.map(val => (
                        <Cell
                            value={val}
                            column={column}
                            size={size}
                            format={format}
                            isMultiple={!!Array.isArray(val)}
                        />
                    ));
                } else if (checkTypeIsLink(column.type)) {
                    return <RecordCard record={{...value.whoAmI}} size={size} />;
                } else if (column.type === AttributeType.tree) {
                    return <RecordCard key={value?.record?.whoAmI?.id} record={{...value.record.whoAmI}} size={size} />;
                }

                return value;
        }
    }

    return <span>{value}</span>;
};

export default LibraryItemsListTable;
