// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Spin} from 'antd';
import {useLang} from 'hooks/LangHook/LangHook';
import {isEqual} from 'lodash';
import get from 'lodash/get';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFlexLayout, useTable} from 'react-table';
import {useSticky} from 'react-table-sticky';
import styled from 'styled-components';
import {localizedLabel} from 'utils';
import {infosCol} from '../../../constants/constants';
import {useStateItem} from '../../../Context/StateItemsContext';
import themingVar from '../../../themingVar';
import {AttributeFormat, AttributeType, ITableItem, ITableItems} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import BodyRow from './BodyRow';
import Header from './Header';

interface ITableColumn {
    Header: string;
    accessor: string;
    key: string;
    sticky?: 'left' | 'right';
    type?: AttributeType;
    format?: AttributeFormat;
    embeddedPath?: string;
}

interface ICustomTableProps {
    scrollHorizontalActive: boolean;
}

const CustomTable = styled.div<ICustomTableProps>`
    min-width: 0px;
    width: 100%;
    border: 1px solid ${themingVar['@divider-color']};
    height: calc(100vh - 11rem);
    overflow-y: scroll;

    &.sticky {
        overflow: scroll;

        .header {
            position: sticky;
            z-index: 1;
        }

        .header {
            top: 0;
        }

        .body {
            position: relative;
            z-index: 0;
        }

        [data-sticky-td] {
            position: sticky;
        }

        [data-sticky-last-left-td] {
            /* box-shadow: 5px 0px 3px -1px #ccc; */
        }

        [data-sticky-first-right-td] {
            /* box-shadow: -5px 0px 3px -1px #ccc; */
        }
    }
`;

CustomTable.displayName = 'CustomTable';

const TableHead = styled.div`
    background: ${themingVar['@leav-secondary-action-bg']};
    width: fit-content;
    min-width: 100%;
    border-left: 4px solid transparent;
`;

const HeaderRow = styled.div``;

const HeaderCell = styled.div`
    background: ${themingVar['@leav-secondary-action-bg']};
    border-right: 1px solid ${themingVar['@divider-color']};

    &:first-child {
        border-left: 1px solid ${themingVar['@divider-color']};
    }

    &:last-child {
        border-right: none;
    }
`;

const TableBody = styled.div`
    width: fit-content;
    min-width: 100%;
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid ${themingVar['@divider-color']};
    padding-top: 8px;
`;

const Table = () => {
    const {t} = useTranslation();
    const {stateItems} = useStateItem();
    const [{lang}] = useLang();

    const [tableColumns, setTableColumns] = useState<ITableColumn[]>([]);
    const [tableData, setTableData] = useState<ITableItems[]>([]);
    const [scrollHorizontalActive, setScrollHorizontalActive] = useState(false);

    //columns
    useEffect(() => {
        const startColumns: ITableColumn[] = [
            {
                Header: t('items_list.table.infos'),
                accessor: infosCol,
                key: infosCol,
                sticky: 'left'
            }
        ];

        let columnsFromFields: ITableColumn[] = [];
        if (stateItems.attributes.length && stateItems.fields.length) {
            columnsFromFields = stateItems.fields.map(field => {
                const validAccessor = field.key.replaceAll('.', '');

                return {
                    Header: field.label,
                    accessor: validAccessor,
                    key: field.key,
                    type: field.type,
                    format: field.embeddedData?.format || field.format,
                    embeddedPath: field.embeddedData?.path
                };
            });
        }

        const columns = [...startColumns, ...columnsFromFields];

        setTableColumns(currentColumns => {
            return !isEqual(currentColumns, columns) ? columns : currentColumns;
        });
    }, [stateItems.fields, stateItems.attributes, t]);

    // data
    useEffect(() => {
        const data = stateItems.items?.reduce((allData, item, index) => {
            if (index < stateItems.pagination) {
                const tableItem: ITableItems = tableColumns.reduce((acc, column) => {
                    // handle selection and infos column
                    if (!column.type) {
                        if (column.accessor === infosCol) {
                            const value = item.whoAmI;
                            const id = item.whoAmI.id;
                            const library = item.whoAmI.library.id;
                            const label = localizedLabel(item.whoAmI.label, lang);

                            const cellData: ITableItem = {value, type: column.type, id, library, label};
                            acc[column.accessor] = cellData;

                            return acc;
                        }
                    }

                    const key = column.key;

                    let value = item.fields[key];
                    if (column.embeddedPath && column.embeddedPath.length) {
                        const pathWithoutRoot = column.embeddedPath.split('.').slice(1).join('.');
                        try {
                            const content = JSON.parse(item.fields[key]);
                            value = get(content, pathWithoutRoot);
                        } catch (e) {
                            value = 'error';
                        }
                    }

                    const id = item.whoAmI.id;

                    acc[column.accessor] = {value, type: column.type, id};

                    return acc;
                }, {});

                return [...allData, tableItem];
            }
            return allData;
        }, [] as any);

        if (data) {
            setTableData([...data]);
        }
    }, [stateItems.items, stateItems.pagination, tableColumns, lang]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const scrollValue = (e.target as HTMLDivElement).scrollLeft;

        if (scrollValue > 0) {
            setScrollHorizontalActive(true);
        } else {
            setScrollHorizontalActive(false);
        }
    };

    const tableInstance = useTable<ITableItems>(
        {
            columns: tableColumns,
            data: tableData
        },
        useFlexLayout,
        useSticky
    );

    const {getTableProps, getTableBodyProps, headerGroups, prepareRow, rows} = tableInstance;

    if (stateItems.itemsLoading) {
        return (
            <>
                <Spin />
            </>
        );
    }

    return (
        <div>
            <CustomTable
                {...getTableProps()}
                className="table sticky"
                data-testid="table"
                onScroll={handleScroll}
                scrollHorizontalActive={scrollHorizontalActive}
            >
                <TableHead className="header sticky">
                    {headerGroups.map(headerGroup => (
                        <HeaderRow {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => {
                                const headerCellProps = column.getHeaderProps();

                                if (column.id === infosCol) {
                                    // define info column row style
                                    headerCellProps.style = {
                                        ...headerCellProps.style,
                                        flex: '1 0 auto',
                                        width: 'auto',
                                        minWidth: '250px'
                                    };
                                }

                                return (
                                    <HeaderCell {...headerCellProps}>
                                        <Header
                                            id={column.id}
                                            name={column.render('Header')?.toString() || ''}
                                            type={AttributeType.simple}
                                        >
                                            {column.render('Header')}
                                        </Header>
                                    </HeaderCell>
                                );
                            })}
                        </HeaderRow>
                    ))}
                </TableHead>
                <TableBody {...getTableBodyProps()} className="body sticky">
                    {rows.map((row, index) => {
                        // Prepare the row for display
                        prepareRow(row);

                        return <BodyRow key={row.id} row={row} index={(index + 1).toString()} />;
                    })}
                </TableBody>
            </CustomTable>
            <Pagination>
                <LibraryItemsListPagination />
            </Pagination>
        </div>
    );
};

export default Table;
