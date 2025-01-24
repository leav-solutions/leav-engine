// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {cloneElement, ComponentProps, FunctionComponent, memo, ReactNode} from 'react';
import {KitButton, KitDropDown, KitPagination, KitSpace, KitTable, useKitTheme} from 'aristid-ds';
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

const USELESS = '';

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

interface IDataViewProps {
    dataGroupedFilteredSorted: IItemData[];
    itemActions: IItemAction[];
    iconsOnlyItemActions: boolean;
    attributesProperties: IExplorerData['attributes'];
    attributesToDisplay: string[];
    paginationProps?: {
        pageSizeOptions: number[];
        itemsTotal: number;
        currentPage: number;
        pageSize: number;
        setNewPage: (page: number, pageSize: number) => void;
        setNewPageSize: (page: number, pageSize: number) => void;
    };
    selection: {
        updateSelectedKeys: null | ((keys: string[]) => void);
        selectedKeys: string[];
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
        selection: {updateSelectedKeys, selectedKeys},
        iconsOnlyItemActions
    }) => {
        const {t} = useSharedTranslation();

        const {containerRef, scrollHeight} = useTableScrollableHeight(!!paginationProps);

        const _getActionButtons = (actions: Array<Override<IItemAction, {callback: () => void}>>): ReactNode => {
            const isLessThanFourActions = actions.length < 4;

            return isLessThanFourActions ? (
                <KitSpace>
                    {actions.map(({label, icon, iconOnly, isDanger, callback}, index) => (
                        <KitButton title={label} icon={icon} onClick={callback} danger={isDanger} key={index}>
                            {!iconsOnlyItemActions && !iconOnly && label}
                        </KitButton>
                    ))}
                </KitSpace>
            ) : (
                <>
                    <KitButton
                        type="tertiary"
                        icon={actions[0].icon}
                        onClick={actions[0].callback}
                        title={actions[0].label}
                        danger={actions[0].isDanger}
                    />
                    <KitButton
                        type="tertiary"
                        icon={actions[1].icon}
                        onClick={actions[1].callback}
                        title={actions[1].label}
                        danger={actions[1].isDanger}
                    />
                    <KitDropDown
                        menu={{
                            items: actions.slice(2).map(({callback, icon, label, isDanger}) => ({
                                key: label,
                                title: label,
                                danger: isDanger,
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
            );
        };

        const columns = attributesToDisplay
            .map<KitTableColumnType<IItemData>>(attributeName => ({
                title: attributeName === 'whoAmI' ? '' : attributesProperties[attributeName].label,
                dataIndex: USELESS,
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
                              title: t('explorer.actions'),
                              dataIndex: USELESS,
                              shouldCellUpdate: () => false,
                              render: (_, item) =>
                                  _getActionButtons(
                                      itemActions.map(action => ({
                                          ...action,
                                          callback: () => action.callback(item)
                                      }))
                                  )
                          }
                      ]
            );

        const _rowSelection: ComponentProps<typeof KitTable>['rowSelection'] =
            updateSelectedKeys === null
                ? undefined
                : {
                      type: 'checkbox',
                      columnTitle: ' ', // empty string to hide select all checkbox from <KitTable />
                      selectedRowKeys: selectedKeys,
                      preserveSelectedRowKeys: true,
                      // TODO: review types from antd directly
                      onChange: (selectedRowKeys: string[], _selectedRows: IItemData[], _info: {type: string}) =>
                          updateSelectedKeys(selectedRowKeys)
                  };

        // TODO: handle columns width based on attribute type/format
        return (
            <DataViewContainerDivStyled ref={containerRef}>
                <KitTable
                    showHeader={dataGroupedFilteredSorted.length > 0}
                    columns={columns}
                    scroll={{y: scrollHeight}}
                    dataSource={dataGroupedFilteredSorted}
                    tableLayout="fixed"
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
                            total={paginationProps.itemsTotal}
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
