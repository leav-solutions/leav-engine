import {type ComponentProps, type Key, memo, useCallback, useEffect, useState} from 'react';
import {KitPagination, KitTable} from 'aristid-ds';
import {type KitTableColumnType} from 'aristid-ds/dist/Kit/DataDisplay/Table/types';
import styled from 'styled-components';
import isEqual from 'lodash/isEqual';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IDataViewChildProps, type IItemData} from '../_types';
import {TableCell} from '../cells/TableCell';
import {defaultPaginationHeight, useTableScrollableHeight} from './useTableScrollableHeight';
import {useColumnWidth} from './useColumnWidth';
import {WHO_AM_I_COLUMN} from '../_constants';
import {TableNameCell} from './TableNameCell';
import cn from 'classnames';
import {throttle} from 'lodash';

const tableRowHeight = 48;
const tableHeaderMinLineHeight = 22;

const DataViewContainerDivStyled = styled.div`
    flex: 1 1 min-content;
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
            .actions-list {
                margin-left: auto;
            }
        }
    }

    &.row-clickable {
        .ant-table-tbody > tr {
            cursor: pointer;
        }
    }
`;

// TODO: tests will fail if we don't check attributeToDisplay because we have a render with no attributes but data is present. We should check why there's this behavior
const arePropsEqual = (prevProps: IDataViewChildProps, nextProps: IDataViewChildProps) =>
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

export const TableView = memo(
    ({
        dataGroupedFilteredSorted,
        attributesToDisplay,
        attributesProperties,
        libraryColorConfigById,
        paginationProps,
        itemActions,
        selection: {onSelectItem, onSelectionChange, selectedKeys, isMassSelectionAll, mode},
        hideTableHeader = false,
        useSmallHeaderSize = false,
        tableBodyHeight,
    }: IDataViewChildProps) => {
        const {t} = useSharedTranslation();

        const {containerRef, scrollHeight} = useTableScrollableHeight(!!paginationProps);
        const {getFieldColumnWidth} = useColumnWidth();

        const getColumnProps = (attributeName: string) =>
            ({
                title: () => attributesProperties[attributeName]?.label,
                ellipsis: useSmallHeaderSize,
                width: getFieldColumnWidth(attributesProperties[attributeName]),
                shouldCellUpdate: (record, prevRecord) =>
                    isMassSelectionAll ||
                    record.propertiesById[attributeName] !== prevRecord.propertiesById[attributeName],
                render: (_, item) => (
                    <TableCell
                        attributeProperties={attributesProperties[attributeName]}
                        values={item.propertiesById[attributeName]}
                        libraryColorConfigById={libraryColorConfigById}
                    />
                ),
            }) satisfies KitTableColumnType<IItemData>;

        // `attributesProperties` covers every REAL attribute of the library (loaded independently of
        // any record): a stale attribute id left in the view (deleted attribute, cloned view) is the
        // only way `attributesProperties[id]` can miss, so it is filtered out here rather than crashing.
        const missingAttributeIds = attributesToDisplay.filter(id => !attributesProperties[id]);
        const columns = attributesToDisplay.filter(id => attributesProperties[id]).map(getColumnProps);

        // Diagnostics: a missing id isn't always a stale one (deleted attribute, cloned view) — it can
        // also be a metadata query failure or a stale cache entry (see `useExplorerLibraryMetadata`),
        // both of which silently hide ALL columns rather than just one. Keyed on the id set (not on
        // `attributesProperties` itself) so this doesn't re-fire on every unrelated re-render.
        const missingAttributeIdsSignature = missingAttributeIds.join(',');
        useEffect(() => {
            if (missingAttributeIdsSignature) {
                console.warn(
                    `[ExplorerV2] TableView: attribute id(s) not found in attributesProperties, column(s) hidden: ${missingAttributeIdsSignature}`,
                );
            }
        }, [missingAttributeIdsSignature]);

        const whoIAmColumn = useWhoAmIColumn({
            ...getColumnProps(WHO_AM_I_COLUMN),
            fixed: 'left',
            render: (_, item) => (
                <TableNameCell
                    item={item}
                    itemActions={itemActions}
                    hasColorConfigured={libraryColorConfigById[item.libraryId] ?? true}
                />
            ),
            shouldCellUpdate: (record, prevRecord) => isMassSelectionAll || record.whoAmI !== prevRecord.whoAmI,
        });

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
                    headerLineSize="s"
                    columns={[whoIAmColumn, ...columns]}
                    tableLayout="fixed"
                    scroll={{
                        y: tableBodyHeight ?? (hideTableHeader ? '100%' : scrollHeight),
                        x: '100%',
                    }}
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

// This hook exists to change the width of the whoAmI column dynamically.
// The aimed result is a whoAmI column that always expand and is the only one to expand if there is horizontal space available, but never shrinks under its specifed width.
// This behaviour is mostly present to prevent the selection column to expand
function useWhoAmIColumn(props: KitTableColumnType<IItemData> & {width: number}) {
    const {t} = useSharedTranslation();

    const [width, setWidth] = useState<number | string>(props.width);

    // initialize observer only once using the useState initializer
    const [resizeObserver] = useState(
        () =>
            new ResizeObserver(
                throttle(
                    ([node]: ResizeObserverEntry[]) =>
                        setWidth(node.contentRect.width < props.width ? props.width : '100%'),
                    100,
                ),
            ),
    );

    // use the `ref` prop as a callback to retrieve the div element and connect the observer on it
    const onWhoAmIColumnRender = useCallback((node: HTMLDivElement) => {
        resizeObserver.disconnect();
        if (node) {
            resizeObserver.observe(node);
        }
    }, []);

    return {
        ...props,
        title: () => <div ref={onWhoAmIColumnRender}>{t('explorer.name')}</div>,
        width,
    };
}
