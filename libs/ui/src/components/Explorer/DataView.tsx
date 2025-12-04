// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, type Key, memo} from 'react';
import {KitPagination, KitTable} from 'aristid-ds';
import {type KitTableColumnType} from 'aristid-ds/dist/Kit/DataDisplay/Table/types';
import styled from 'styled-components';
import isEqual from 'lodash/isEqual';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IExplorerData, type IItemAction, type IItemData} from './_types';
import {TableCell} from './TableCell';
import {defaultPaginationHeight, useTableScrollableHeight} from './useTableScrollableHeight';
import {useColumnWidth} from './useColumnWidth';
import {WHO_AM_I_COLUMN} from './_constants';
import {TableNameCell} from './TableNameCell';
import cn from 'classnames';

const USELESS = '';

const tableRowHeight = 56;
const tableHeaderMinLineHeight = 22;

const DataViewContainerDivStyled = styled.div`
    flex: 1 1 min-content;
    max-height: minmax(0, 1fr);
    overflow: hidden;

    &.headless {
        overflow-y: auto;
    }

    .kit-table {
        padding-bottom: ${defaultPaginationHeight}px;
        position: relative;
    }

    .pagination {
        flex: 0 0 auto;
        justify-content: center;
        display: flex;
        padding-top: calc(var(--general-spacing-xs) * 1px);
    }
`;

// TODO: Table component should be updated fix header display
const StyledTable = styled(KitTable)`
    .ant-table-thead > tr > th {
        padding-top: calc(var(--general-spacing-xxs) * 1px) !important;
        padding-bottom: calc(var(--general-spacing-xxs) * 1px) !important;
        height: ${tableRowHeight}px;

        .ant-table-cell {
            min-height: ${tableHeaderMinLineHeight}px;
            height: auto !important;
            padding: 0 calc(var(--general-spacing-s) * 1px) 0 0;
        }
    }

    .ant-table-tbody > tr:hover .ant-table-cell {
        .actions-list {
            display: inline-flex;
        }
    }

    .ant-table-tbody > tr {
        .ant-table-cell {
            min-height: ${tableRowHeight}px;
            height: auto !important;
        }
    }

    &.row-clickable {
        .ant-table-tbody > tr {
            cursor: pointer;
        }
    }
`;

interface IDataViewProps {
    dataGroupedFilteredSorted: IItemData[];
    itemActions: IItemAction[];
    attributesProperties: IExplorerData['attributes'];
    attributesToDisplay: string[];
    paginationProps?: {
        pageSizeOptions: number[];
        totalCount: number;
        currentPage: number;
        pageSize: number;
        setNewPage: (page: number, pageSize: number) => void;
        setNewPageSize: (page: number, pageSize: number) => void;
    };
    selection: {
        onSelectItem?: null | ((selectedItem: IItemData) => void);
        onSelectionChange: null | ((keys: Key[]) => void);
        isMassSelectionAll: boolean;
        selectedKeys: Key[];
        mode?: 'simple' | 'multiple';
    };
    hideTableHeader: boolean;
}

// TODO: tests will fail if we don't check attributeToDisplay because we have a render with no attributes but data is present. We should check why there's this behavior
const arePropsEqual = (prevProps: IDataViewProps, nextProps: IDataViewProps) =>
    isEqual(
        {
            attributesToDisplay: prevProps.attributesToDisplay,
            data: prevProps.dataGroupedFilteredSorted,
            selectedKeys: prevProps.selection.selectedKeys,
        },
        {
            attributesToDisplay: nextProps.attributesToDisplay,
            data: nextProps.dataGroupedFilteredSorted,
            selectedKeys: nextProps.selection.selectedKeys,
        },
    );

export const DataView: FunctionComponent<IDataViewProps> = memo(
    ({
        dataGroupedFilteredSorted,
        attributesToDisplay,
        attributesProperties,
        paginationProps,
        itemActions,
        selection: {onSelectItem, onSelectionChange, selectedKeys, isMassSelectionAll, mode},
        hideTableHeader = false,
    }) => {
        const {t} = useSharedTranslation();

        const {containerRef, scrollHeight} = useTableScrollableHeight(!!paginationProps);
        const {getFieldColumnWidth} = useColumnWidth();

        const columns = attributesToDisplay.map<KitTableColumnType<IItemData>>(attributeName => ({
            title: attributeName === WHO_AM_I_COLUMN ? t('explorer.name') : attributesProperties[attributeName].label,
            dataIndex: USELESS,
            width: getFieldColumnWidth(attributesProperties[attributeName]),
            shouldCellUpdate: (record, prevRecord) =>
                isMassSelectionAll ||
                (attributeName === WHO_AM_I_COLUMN
                    ? record.whoAmI !== prevRecord.whoAmI
                    : record.propertiesById[attributeName] !== prevRecord.propertiesById[attributeName]),
            render: (_, item) =>
                attributeName === WHO_AM_I_COLUMN ? (
                    <TableNameCell item={item} itemActions={itemActions} />
                ) : (
                    <TableCell
                        attributeProperties={attributesProperties[attributeName]}
                        values={item.propertiesById[attributeName]}
                    />
                ),
        }));

        const itemActionToUseOnRowClick = itemActions.find(itemAction => itemAction.useItemActionOnRowClick);

        const _rowSelection: ComponentProps<typeof KitTable>['rowSelection'] =
            onSelectionChange === null
                ? undefined
                : {
                      type: mode === 'simple' ? 'radio' : 'checkbox',
                      columnTitle: ' ', // blank string to hide select all checkbox from <KitTable />
                      selectedRowKeys: selectedKeys,
                      preserveSelectedRowKeys: true,
                      // TODO: review types from antd directly
                      onChange: (selectedRowKeys: Key[]) => {
                          const lastSelectedKey = selectedRowKeys[selectedRowKeys.length - 1];
                          const lastSelectedItem = dataGroupedFilteredSorted.find(data => data.key === lastSelectedKey);

                          onSelectionChange(selectedRowKeys);

                          if (lastSelectedItem) {
                              onSelectItem?.(lastSelectedItem);
                          }
                      },
                      getCheckboxProps: isMassSelectionAll
                          ? () => ({
                                disabled: true,
                            })
                          : undefined,
                  };

        // TODO: handle columns width based on attribute type/format
        return (
            <DataViewContainerDivStyled ref={containerRef} className={cn({headless: hideTableHeader})}>
                <StyledTable
                    className={cn({
                        'row-clickable': itemActionToUseOnRowClick,
                    })}
                    showHeader={dataGroupedFilteredSorted.length > 0 && !hideTableHeader}
                    columns={columns}
                    tableLayout="fixed"
                    scroll={{y: hideTableHeader ? '100%' : scrollHeight, x: '100%'}}
                    dataSource={dataGroupedFilteredSorted}
                    pagination={false}
                    rowSelection={_rowSelection}
                    onRow={(item: IItemData) => ({
                        onClick: () => itemActionToUseOnRowClick?.callback(item),
                    })}
                />
                {paginationProps && (
                    <div className="pagination">
                        <KitPagination
                            aria-label="pagination"
                            showSizeChanger
                            showTotal={(total, [from, to]) =>
                                t('explorer.pagination-total-number', {from, to, count: total})
                            }
                            total={paginationProps.totalCount}
                            defaultCurrent={paginationProps.currentPage}
                            defaultPageSize={paginationProps.pageSize}
                            pageSizeOptions={paginationProps.pageSizeOptions}
                            onChange={paginationProps.setNewPage}
                            onShowSizeChange={paginationProps.setNewPageSize}
                        />
                    </div>
                )}
            </DataViewContainerDivStyled>
        );
    },
    arePropsEqual,
);
