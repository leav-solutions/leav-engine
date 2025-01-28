// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {cloneElement, FunctionComponent, memo, ReactNode} from 'react';
import {KitButton, KitDropDown, KitPagination, KitTable, useKitTheme} from 'aristid-ds';
import type {KitTableColumnType} from 'aristid-ds/dist/Kit/DataDisplay/Table/types';
import {FaEllipsisH} from 'react-icons/fa';
import {Override} from '@leav/utils';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IExplorerData, IItemAction, IItemData} from './_types';
import {TableCell} from './TableCell';
import {IdCard} from './IdCard';
import {defaultPaginationHeight, useTableScrollableHeight} from './useTableScrollableHeight';
import isEqual from 'lodash/isEqual';
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
        justify-content: flex-end;
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
        totalItems: number;
        currentPage: number;
        pageSize: number;
        setNewPage: (page: number, pageSize: number) => void;
        setNewPageSize: (page: number, pageSize: number) => void;
    };
}

// TODO: tests will fail if we don't check attributeToDisplay because we have a render with no attributes but data is present. We should check why there's this behavior
const arePropsEqual = (prevProps: IDataViewProps, nextProps: IDataViewProps) =>
    isEqual(
        {attributesToDisplay: prevProps.attributesToDisplay, data: prevProps.dataGroupedFilteredSorted},
        {attributesToDisplay: nextProps.attributesToDisplay, data: nextProps.dataGroupedFilteredSorted}
    );

export const DataView: FunctionComponent<IDataViewProps> = memo(
    ({dataGroupedFilteredSorted, attributesToDisplay, attributesProperties, paginationProps, itemActions}) => {
        const {t} = useSharedTranslation();
        const {theme} = useKitTheme();

        const {containerRef, scrollHeight} = useTableScrollableHeight(!!paginationProps);
        const {ref, getFieldColumnWidth, columnWidth} = useColumnWidth();

        const _getActionButtons = (
            actions: Array<Override<IItemAction, {callback: () => void}>>,
            columnRef: typeof ref | null
        ): ReactNode => {
            const isLessThanFourActions = actions.length < 4;

            return (
                <StyledActionsList ref={columnRef}>
                    {isLessThanFourActions ? (
                        <>
                            {actions.map(({label, icon, isDanger, callback}, actionIndex) => (
                                <KitButton
                                    title={label}
                                    icon={icon}
                                    onClick={callback}
                                    danger={isDanger}
                                    key={actionIndex}
                                >
                                    {label}
                                </KitButton>
                            ))}
                        </>
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
                    )}
                </StyledActionsList>
            );
        };

        const columns = attributesToDisplay
            .map<KitTableColumnType<IItemData>>(attributeName => ({
                title: attributeName === 'whoAmI' ? '' : attributesProperties[attributeName].label,
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
                              title: t('explorer.actions'),
                              dataIndex: USELESS,
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

        // TODO: handle columns width based on attribute type/format
        return (
            <DataViewContainerDivStyled ref={containerRef}>
                <StyledTable
                    borderedRows
                    cellsBackgroundColor={theme.utilities.light}
                    backgroundColor={theme.colors.primary['50']}
                    showHeader={dataGroupedFilteredSorted.length > 0}
                    columns={columns}
                    tableLayout="fixed"
                    scroll={{y: scrollHeight, x: '100%'}}
                    dataSource={dataGroupedFilteredSorted}
                    pagination={false}
                />
                {paginationProps && (
                    <div className="pagination">
                        <KitPagination
                            showSizeChanger
                            showTotal={(total, [from, to]) => t('explorer.pagination-total-number', {from, to, total})}
                            total={paginationProps?.totalItems}
                            defaultCurrent={paginationProps?.currentPage}
                            defaultPageSize={paginationProps?.pageSize}
                            pageSizeOptions={paginationProps?.pageSizeOptions}
                            onChange={paginationProps?.setNewPage}
                            onShowSizeChange={paginationProps?.setNewPageSize}
                        />
                    </div>
                )}
            </DataViewContainerDivStyled>
        );
    },
    arePropsEqual
);
