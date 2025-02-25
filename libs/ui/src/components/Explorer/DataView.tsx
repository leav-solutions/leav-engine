// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {cloneElement, ComponentProps, FunctionComponent, Key, memo, ReactNode} from 'react';
import {KitButton, KitDropDown, KitPagination, KitTable} from 'aristid-ds';
import type {KitTableColumnType} from 'aristid-ds/dist/Kit/DataDisplay/Table/types';
import {FaEllipsisH} from 'react-icons/fa';
import {Override} from '@leav/utils';
import styled from 'styled-components';
import isEqual from 'lodash/isEqual';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IExplorerData, IItemAction, IItemData} from './_types';
import {TableCell} from './TableCell';
import {IdCard} from './IdCard';
import {defaultPaginationHeight, useTableScrollableHeight} from './useTableScrollableHeight';
import {useColumnWidth} from './useColumnWidth';

const USELESS = '';

const tableHeaderHeight = 56;
const tableHeaderMinLineHeight = 22;

const DataViewContainerDivStyled = styled.div`
    flex: 1 1 min-content;
    max-height: minmax(0, 1fr);
    overflow: hidden;

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

const StyledActionsList = styled.div`
    display: inline-flex;
    gap: calc(var(--general-spacing-xs) * 1px);
`;

// TODO: Table component should be updated fix header display
const StyledTable = styled(KitTable)`
    .ant-table-thead > tr > th {
        padding-top: calc(var(--general-spacing-xxs) * 1px) !important;
        padding-bottom: calc(var(--general-spacing-xxs) * 1px) !important;
        height: ${tableHeaderHeight}px;

        .ant-table-cell {
            min-height: ${tableHeaderMinLineHeight}px;
            height: auto !important;
            padding: 0 calc(var(--general-spacing-s) * 1px) 0 0;
        }
    }
`;

const ActionsHeaderStyledDiv = styled.div`
    justify-self: right;
    text-align: left;
`;

interface IDataViewProps {
    dataGroupedFilteredSorted: IItemData[];
    itemActions: IItemAction[];
    iconsOnlyItemActions: boolean;
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
        onSelectionChange: null | ((keys: Key[]) => void);
        isMassSelectionAll: boolean;
        selectedKeys: Key[];
    };
}

// TODO: tests will fail if we don't check attributeToDisplay because we have a render with no attributes but data is present. We should check why there's this behavior
const arePropsEqual = (prevProps: IDataViewProps, nextProps: IDataViewProps) =>
    isEqual(
        {
            attributesToDisplay: prevProps.attributesToDisplay,
            data: prevProps.dataGroupedFilteredSorted,
            selectedKeys: prevProps.selection.selectedKeys
        },
        {
            attributesToDisplay: nextProps.attributesToDisplay,
            data: nextProps.dataGroupedFilteredSorted,
            selectedKeys: nextProps.selection.selectedKeys
        }
    );

export const DataView: FunctionComponent<IDataViewProps> = memo(
    ({
        dataGroupedFilteredSorted,
        attributesToDisplay,
        attributesProperties,
        paginationProps,
        itemActions,
        selection: {onSelectionChange, selectedKeys, isMassSelectionAll},
        iconsOnlyItemActions
    }) => {
        const {t} = useSharedTranslation();

        const {containerRef, scrollHeight} = useTableScrollableHeight(!!paginationProps);
        const {ref, getFieldColumnWidth, columnWidth, actionsColumnHeaderWidth} = useColumnWidth();

        const _getActionButtons = (
            actions: Array<Override<IItemAction, {callback: () => void}>>,
            columnRef: typeof ref | null
        ): ReactNode => {
            const isLessThanFourActions = actions.length < 4;

            return (
                <StyledActionsList ref={columnRef}>
                    {isLessThanFourActions ? (
                        <>
                            {actions.map(({label, icon, isDanger, iconOnly, callback, disabled}, actionIndex) => (
                                <KitButton
                                    key={actionIndex}
                                    title={label}
                                    icon={icon}
                                    onClick={callback}
                                    danger={isDanger}
                                    disabled={disabled}
                                >
                                    {!iconsOnlyItemActions && !iconOnly && label}
                                </KitButton>
                            ))}
                        </>
                    ) : (
                        <>
                            <KitButton
                                type="tertiary"
                                icon={actions[0].icon}
                                title={actions[0].label}
                                onClick={actions[0].callback}
                                danger={actions[0].isDanger}
                                disabled={actions[0].disabled}
                            />
                            <KitButton
                                type="tertiary"
                                icon={actions[1].icon}
                                onClick={actions[1].callback}
                                title={actions[1].label}
                                danger={actions[1].isDanger}
                                disabled={actions[1].disabled}
                            />
                            <KitDropDown
                                menu={{
                                    items: actions.slice(2).map(({callback, icon, label, isDanger, disabled}) => ({
                                        key: label,
                                        title: label,
                                        danger: isDanger,
                                        disabled,
                                        label,
                                        icon: icon ? cloneElement(icon, {size: '2em'}) : null, // TODO: find better tuning
                                        onClick: callback
                                    }))
                                }}
                            >
                                <KitButton
                                    title={t('explorer.more-actions') ?? undefined}
                                    type="tertiary"
                                    icon={<FaEllipsisH />}
                                />
                            </KitDropDown>
                        </>
                    )}
                </StyledActionsList>
            );
        };

        const columns = attributesToDisplay
            .map<KitTableColumnType<IItemData>>(attributeName => ({
                title: attributeName === 'whoAmI' ? t('explorer.name') : attributesProperties[attributeName].label,
                dataIndex: USELESS,
                width: getFieldColumnWidth(attributesProperties[attributeName]),
                shouldCellUpdate: (record, prevRecord) =>
                    attributeName === 'whoAmI'
                        ? record.whoAmI !== prevRecord.whoAmI
                        : record.propertiesById[attributeName] !== prevRecord.propertiesById[attributeName],
                render: (_, {whoAmI, propertiesById}) =>
                    attributeName === 'whoAmI' ? (
                        <IdCard item={whoAmI} />
                    ) : (
                        <TableCell
                            attributeProperties={attributesProperties[attributeName]}
                            values={propertiesById[attributeName]}
                        />
                    )
            }))
            .concat(
                itemActions.length === 0
                    ? []
                    : [
                          {
                              title: (
                                  <ActionsHeaderStyledDiv style={{width: `${actionsColumnHeaderWidth}px`}}>
                                      {t('explorer.actions')}
                                  </ActionsHeaderStyledDiv>
                              ),
                              dataIndex: USELESS,
                              align: 'right',
                              className: 'actions',
                              shouldCellUpdate: () => false,
                              width: columnWidth,
                              render: (_, item, index) =>
                                  _getActionButtons(
                                      itemActions.map(action => ({
                                          ...action,
                                          callback: () => action.callback(item)
                                      })),
                                      index === 0 ? ref : null
                                  )
                          }
                      ]
            );

        const _rowSelection: ComponentProps<typeof KitTable>['rowSelection'] =
            onSelectionChange === null
                ? undefined
                : {
                      type: 'checkbox',
                      columnTitle: ' ', // blank string to hide select all checkbox from <KitTable />
                      selectedRowKeys: selectedKeys,
                      preserveSelectedRowKeys: true,
                      // TODO: review types from antd directly
                      onChange: (selectedRowKeys: Key[]) => onSelectionChange(selectedRowKeys),
                      getCheckboxProps: isMassSelectionAll
                          ? () => ({
                                disabled: true
                            })
                          : undefined
                  };

        // TODO: handle columns width based on attribute type/format
        return (
            <DataViewContainerDivStyled ref={containerRef}>
                <StyledTable
                    showHeader={dataGroupedFilteredSorted.length > 0}
                    columns={columns}
                    tableLayout="fixed"
                    scroll={{y: scrollHeight, x: '100%'}}
                    dataSource={dataGroupedFilteredSorted}
                    pagination={false}
                    rowSelection={_rowSelection}
                />
                {paginationProps && (
                    <div className="pagination">
                        <KitPagination
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
    arePropsEqual
);
