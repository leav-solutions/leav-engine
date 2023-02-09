// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars, useLang} from '@leav/ui';
import Paragraph from 'antd/lib/typography/Paragraph';
import Loading from 'components/shared/Loading';
import useSearchReducer from 'hooks/useSearchReducer';
import {isEqual} from 'lodash';
import get from 'lodash/get';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ColumnWithLooseAccessor, useFlexLayout, useTable, UseTableColumnOptions} from 'react-table';
import {useSticky} from 'react-table-sticky';
import styled from 'styled-components';
import {isTypeStandard} from 'utils';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {infosCol, selectionColumn} from '../../../constants/constants';
import {IField, ITableCell, ITableRow} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import BodyRow from './BodyRow';
import Header from './Header';

interface ITableColumn extends UseTableColumnOptions<ITableRow> {
    accessor: string | ((row, rowIndex) => string);
    key: string;
    sticky?: 'left' | 'right';
    type?: AttributeType;
    format?: AttributeFormat;
    embeddedPath?: string;
}

interface ICustomTableProps {
    scrollHorizontalActive: boolean;
}

export const INFOS_COLUMN_WIDTH = '350px';
enum FieldColumnWidth {
    SMALL = 200,
    MEDIUM = 250,
    LARGE = 300
}

const CustomTable = styled.div<ICustomTableProps>`
    grid-area: data;
    height: 100%;
    min-width: 0px;
    width: 100%;
    border: 1px solid ${themeVars.borderLightColor};
    overflow-y: scroll;

    &.sticky {
        overflow: scroll;

        .header {
            position: sticky;
            top: 0;
            z-index: 1;
        }

        .body {
            position: relative;
            z-index: 0;
        }

        [data-sticky-td] {
            position: sticky;
        }
    }
`;

CustomTable.displayName = 'CustomTable';

const TableHead = styled.div`
    background: ${themeVars.headerBg};
    width: fit-content;
    min-width: 100%;
`;

const HeaderRow = styled.div`
    margin-left: 1px; // For better alignment with rows
`;

const HeaderCell = styled.div<{id: string}>`
    background: ${themeVars.headerBg};
    border-right: 1px solid ${themeVars.borderLightColor};
    min-width: 35px;
    max-width: ${p => (p.id === selectionColumn ? '35px' : 'auto')};

    &:last-child {
        border-right: none;
    }
`;

const TableBody = styled.div`
    width: fit-content;
    min-width: 100%;
`;

const Pagination = styled.div`
    align-self: start;
    grid-area: pagination;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid ${themeVars.borderLightColor};
    padding-top: 8px;
`;

const _getFieldColumWidth = (field: IField): FieldColumnWidth => {
    if (!isTypeStandard(field.type) || field.multipleValues) {
        return FieldColumnWidth.LARGE;
    }

    switch (field.format) {
        case AttributeFormat.numeric:
        case AttributeFormat.boolean:
        case AttributeFormat.date:
            return FieldColumnWidth.SMALL;
        case AttributeFormat.date_range:
            return FieldColumnWidth.LARGE;
        default:
            return FieldColumnWidth.MEDIUM;
    }
};

const Table = () => {
    const {t} = useTranslation();
    const {lang} = useLang();

    const {state: searchState} = useSearchReducer();
    const [tableColumns, setTableColumns] = useState<ITableColumn[]>([]);
    const [tableData, setTableData] = useState<ITableRow[]>([]);
    const [scrollHorizontalActive, setScrollHorizontalActive] = useState(false);

    //columns
    useEffect(() => {
        const startColumns: ITableColumn[] = [
            {
                Header: '',
                accessor: selectionColumn,
                key: selectionColumn,
                sticky: 'left',
                width: 35,
                maxWidth: 35,
                minWidth: 30
            },
            {
                Header: t('items_list.table.infos'),
                accessor: infosCol,
                key: infosCol,
                sticky: 'left'
            }
        ];

        let columnsFromFields: ITableColumn[] = [];
        if (searchState.attributes.length && searchState.fields.length) {
            columnsFromFields = searchState.fields.map(field => {
                const validAccessor = field.key.replaceAll('.', '');

                return {
                    Header: (
                        <Paragraph
                            ellipsis={{
                                rows: 2,
                                tooltip: field.label
                            }}
                            style={{marginBottom: 0, textAlign: 'center'}}
                        >
                            {field.label}
                        </Paragraph>
                    ),
                    accessor: validAccessor,
                    key: field.key,
                    type: field.type,
                    format: field.embeddedData?.format || field.format,
                    embeddedPath: field.embeddedData?.path,
                    width: _getFieldColumWidth(field)
                };
            });
        }

        const columns = [...startColumns, ...columnsFromFields];

        setTableColumns(currentColumns => {
            return !isEqual(currentColumns, columns) ? columns : currentColumns;
        });
    }, [searchState.fields, searchState.attributes, t]);

    // data
    useEffect(() => {
        if (!tableColumns.length) {
            return;
        }

        const data: ITableRow[] = searchState.records.reduce((allData, record, index) => {
            if (index < searchState.pagination) {
                const tableItem: ITableRow = tableColumns.reduce(
                    (acc, column) => {
                        // handle selection and infos column
                        if (!column.type) {
                            if (column.accessor === infosCol) {
                                const value = record.whoAmI;

                                const cellData: ITableCell = {value, type: column.type};
                                acc[column.accessor] = cellData;

                                return acc;
                            }
                        }

                        const key = column.key;
                        let value = record.fields[key];
                        if (column.embeddedPath && column.embeddedPath.length) {
                            const pathWithoutRoot = column.embeddedPath.split('.').slice(1).join('.');
                            try {
                                const content = JSON.parse(record.fields[key]);
                                value = get(content, pathWithoutRoot);
                            } catch (e) {
                                value = 'error';
                            }
                        }

                        acc[column.accessor as string] = {value, type: column.type, format: column.format};

                        return acc;
                    },
                    {[selectionColumn]: null, record: record.whoAmI}
                );

                return [...allData, tableItem];
            }
            return allData;
        }, []);

        if (data) {
            setTableData([...data]);
        }
    }, [searchState.records, searchState.pagination, tableColumns, lang]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const scrollValue = (e.target as HTMLDivElement).scrollLeft;

        if (scrollValue > 0) {
            setScrollHorizontalActive(true);
        } else {
            setScrollHorizontalActive(false);
        }
    };

    const tableInstance = useTable<ITableRow>(
        {
            columns: tableColumns as Array<ColumnWithLooseAccessor<ITableRow>>,
            data: tableData
        },
        useFlexLayout,
        useSticky
    );

    const {getTableProps, getTableBodyProps, headerGroups, prepareRow, rows, data} = tableInstance;

    // It means we're still computing columns and data,
    // so we don't want to render the table to avoid a first render with  empty cells
    if (searchState.records.length && !data.length) {
        return <Loading />;
    }

    return (
        <>
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
                                        minWidth: INFOS_COLUMN_WIDTH,
                                        maxWidth: INFOS_COLUMN_WIDTH
                                    };
                                }

                                return (
                                    <HeaderCell {...headerCellProps} id={column.id}>
                                        {((column as unknown) as ITableColumn).key !== selectionColumn && (
                                            <Header
                                                id={((column as unknown) as ITableColumn).key}
                                                type={AttributeType.simple}
                                            >
                                                {column.render('Header')}
                                            </Header>
                                        )}
                                    </HeaderCell>
                                );
                            })}
                        </HeaderRow>
                    ))}
                </TableHead>
                <TableBody {...getTableBodyProps()} className="body sticky">
                    {rows.map(row => {
                        // Prepare the row for display
                        prepareRow(row);

                        return <BodyRow key={row.id} row={row} />;
                    })}
                </TableBody>
            </CustomTable>
            <Pagination>
                <LibraryItemsListPagination />
            </Pagination>
        </>
    );
};

export default Table;
