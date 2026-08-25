import {type ComponentProps, type Key, memo, type MouseEvent, useCallback, useEffect, useRef, useState} from 'react';
import {KitPagination, KitTable} from 'aristid-ds';
import {type KitTableColumnType} from 'aristid-ds/dist/Kit/DataDisplay/Table/types';
import {type TableColumnsType} from 'antd';
import styled from 'styled-components';
import isEqual from 'lodash/isEqual';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type PropertyValueFragment} from '_ui/_gqlTypes';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {type IDataViewChildProps, type IItemData} from '../_types';
import {TableCell} from '../cells/TableCell';
import {defaultPaginationHeight, useTableScrollableHeight} from './useTableScrollableHeight';
import {useColumnWidth} from './useColumnWidth';
import {WHO_AM_I_COLUMN} from '../_constants';
import {isRowClickIgnored} from './isRowClickIgnored';
import {TableNameCell} from './TableNameCell';
import cn from 'classnames';
import {throttle} from 'lodash';
import {isColumnSplittable} from '../column-split/isColumnSplittable';
import {useColumnSplitSources} from '../column-split/useColumnSplitSources';
import {useOptimisticSplitValues} from '../column-split/useOptimisticSplitValues';
import {buildSplitColumnGroup} from '../column-split/buildSplitColumnGroup';
import {ColumnSplitHeader} from '../column-split/ColumnSplitHeader';
import {columnHeaderCellWithButton} from '../column-split/columnSplit.module.css';
import {type IColumnSplit} from '../column-split/_types';

/** Module-level so that a count-only column keeps a stable reference across renders. */
const emptyValues: PropertyValueFragment[] = [];

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
    .ant-table-thead::after {
        height: 0 !important;
    }

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

/** Column split is table-only, so it enters here rather than in the shared `IDataViewChildProps`
 *  (same pattern as `kanban/KanbanView`'s own `groupByAttributeId`/`kanbanColumns`). */
type ITableViewProps = IDataViewChildProps & {columnSplit: IColumnSplit};

// TODO: tests will fail if we don't check attributeToDisplay because we have a render with no attributes but data is present. We should check why there's this behavior
const arePropsEqual = (prevProps: ITableViewProps, nextProps: ITableViewProps) =>
    isEqual(
        {
            attributesToDisplay: prevProps.attributesToDisplay,
            data: prevProps.dataGroupedFilteredSorted,
            selectedKeys: prevProps.selection.selectedKeys,
            // Without this, clicking the split/collapse button has no effect: `columnSplit` is a new
            // object reference on every Explorer.tsx render, but its content is what actually matters
            // (ExplorerV2/CLAUDE.md, "Éclatement de colonne" — TableView is memoized on three props only).
            splitAttributeIds: prevProps.columnSplit.splitAttributeIds,
        },
        {
            attributesToDisplay: nextProps.attributesToDisplay,
            data: nextProps.dataGroupedFilteredSorted,
            selectedKeys: nextProps.selection.selectedKeys,
            splitAttributeIds: nextProps.columnSplit.splitAttributeIds,
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
        columnSplit,
    }: ITableViewProps) => {
        const {t} = useSharedTranslation();
        // Resolved ONCE for the whole table and threaded down to the split cells: called from
        // `ColumnSplitCell` it would instantiate one Apollo mutation per cell (rows × sub-columns), all
        // re-rendered on every render of this component.
        const {saveValues} = useSaveValueBatchMutation();

        const {containerRef, scrollHeight} = useTableScrollableHeight(!!paginationProps);
        const {getFieldColumnWidth} = useColumnWidth();

        // `items` is `dataGroupedFilteredSorted` with the optimistic overlay merged into the touched
        // rows — the very array to feed the table, so that a split toggle changes the identity of the
        // clicked row only (see `useOptimisticSplitValues`). Identical to the prop when no write is in
        // flight, which is the normal state of the table.
        const {items, ...optimisticSplitValues} = useOptimisticSplitValues(
            dataGroupedFilteredSorted,
            attributesProperties,
        );

        // `shouldCellUpdate` only ever sees `(record, prevRecord)`: a change of the column-level
        // `isEditionDisabled` is structurally invisible to it — both records carry the same data — so
        // the split cells would keep the `disabled` they were last rendered with. Tracked here to force
        // ONE pass of cell updates on the flip, in both directions: the effect only runs after the
        // commit that consumed the flag.
        const previousEditionDisabledRef = useRef(columnSplit.isEditionDisabled);
        const hasEditionDisabledChanged = previousEditionDisabledRef.current !== columnSplit.isEditionDisabled;
        useEffect(() => {
            previousEditionDisabledRef.current = columnSplit.isEditionDisabled;
        }, [columnSplit.isEditionDisabled]);

        // `attributesProperties` covers every REAL attribute of the library (loaded independently of
        // any record): a stale attribute id left in the view (deleted attribute, cloned view) is the
        // only way `attributesProperties[id]` can miss, so it is filtered out here rather than crashing.
        const missingAttributeIds = attributesToDisplay.filter(id => !attributesProperties[id]);
        const displayedAttributeIds = attributesToDisplay.filter(id => attributesProperties[id]);

        // The sub-columns of every splittable displayed column, resolved whether or not it is currently
        // split: a tree's flatness is only knowable from its nodes, and the button must already be
        // disabled (with its reason) before the user clicks it.
        const splitSources = useColumnSplitSources(
            displayedAttributeIds.map(id => attributesProperties[id]).filter(isColumnSplittable),
        );

        const getColumnProps = (attributeName: string) => {
            const attribute = attributesProperties[attributeName];
            // `attribute` is undefined for the synthetic WHO_AM_I_COLUMN (not a real attribute) — its
            // `title`/`render` are always overridden by `useWhoAmIColumn` below, hence the optional
            // chaining kept below on the plain-label branch. `splitSources` only holds splittable
            // attributes, so a hit there IS the "this column offers the split button" test.
            const splitSource = attribute ? splitSources[attributeName] : undefined;

            const renderTitle = () =>
                attribute && splitSource ? (
                    <ColumnSplitHeader
                        label={attribute.label}
                        isSplit={false}
                        onToggle={() => columnSplit.toggleSplit(attributeName)}
                        // The attribute is flagged splittable but has nothing to split into right
                        // now (values list emptied or opened up since, multi-level tree, root nodes
                        // that failed to load): the button stays visible and says why.
                        disabledReason={
                            splitSource.unavailableReasonKey ? t(splitSource.unavailableReasonKey) : undefined
                        }
                    />
                ) : (
                    attribute?.label
                );

            return {
                className: splitSource ? columnHeaderCellWithButton : undefined,
                title: renderTitle,
                ellipsis: useSmallHeaderSize,
                width: getFieldColumnWidth(attribute),
                shouldCellUpdate: (record, prevRecord) =>
                    isMassSelectionAll ||
                    record.propertiesById[attributeName] !== prevRecord.propertiesById[attributeName] ||
                    record.valuesCountById[attributeName] !== prevRecord.valuesCountById[attributeName],
                render: (_, item) => (
                    <TableCell
                        attributeProperties={attributesProperties[attributeName]}
                        // propertiesById/valuesCountById are disjoint; emptyValues keeps a stable ref.
                        values={item.propertiesById[attributeName] ?? emptyValues}
                        valuesCount={item.valuesCountById[attributeName]}
                        libraryColorConfigById={libraryColorConfigById}
                    />
                ),
            } satisfies KitTableColumnType<IItemData>;
        };

        const getSplitOptions = (attributeId?: string) =>
            attributeId && columnSplit.splitAttributeIds.includes(attributeId)
                ? (splitSources[attributeId]?.options ?? [])
                : [];

        const columns: TableColumnsType<IItemData> = displayedAttributeIds.map((attributeName, index) => {
            const splitOptions = getSplitOptions(attributeName);

            // The column is split but has no option to split into — values list emptied server-side
            // since, non-flat tree, or root nodes not back yet: fall back to the plain column, whose
            // header carries the split button (disabled, with its reason, unless it is just loading).
            return splitOptions.length > 0
                ? buildSplitColumnGroup({
                      attribute: attributesProperties[attributeName],
                      options: splitOptions,
                      optimisticSplitValues,
                      isEditionDisabled: columnSplit.isEditionDisabled,
                      hasEditionDisabledChanged,
                      isLastColumn: index === displayedAttributeIds.length - 1,
                      isFollowedBySplitColumn: getSplitOptions(displayedAttributeIds[index + 1]).length > 0,
                      onCollapse: () => columnSplit.toggleSplit(attributeName),
                      saveValues,
                      t,
                  })
                : getColumnProps(attributeName);
        });

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
                    dataSource={items}
                    pagination={false}
                    rowSelection={_rowSelection}
                    onRow={(item: IItemData) => ({
                        onClick: (event: MouseEvent<HTMLElement>) => {
                            // Cells hosting their own controls (split columns) opt out of on row click.
                            if (isRowClickIgnored(event.target)) {
                                return;
                            }

                            itemActionToUseOnRowClick?.callback(item);
                        },
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
