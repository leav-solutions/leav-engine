// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {cloneElement, FunctionComponent, memo, ReactNode} from 'react';
import {KitButton, KitDropDown, KitPagination, KitSpace, KitTable, useKitTheme} from 'aristid-ds';
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
        justify-content: flex-end;
        display: flex;
        padding-top: calc(var(--general-spacing-xs) * 1px);
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
export const DataView: FunctionComponent<IDataViewProps> = memo(
    ({dataGroupedFilteredSorted, attributesToDisplay, attributesProperties, paginationProps, itemActions}) => {
        const {t} = useSharedTranslation();
        const {theme} = useKitTheme();

        const {containerRef, scrollHeight} = useTableScrollableHeight(!!paginationProps);

        const _getActionButtons = (actions: Array<Override<IItemAction, {callback: () => void}>>): ReactNode => {
            const isLessThanFourActions = actions.length < 4;

            return isLessThanFourActions ? (
                <KitSpace>
                    {actions.map(({label, icon, isDanger, callback}, index) => (
                        <KitButton title={label} icon={icon} onClick={callback} danger={isDanger} key={index}>
                            {label}
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

        // TODO: handle columns width based on attribute type/format
        return (
            <DataViewContainerDivStyled ref={containerRef}>
                <KitTable
                    borderedRows
                    cellsBackgroundColor={theme.utilities.light}
                    backgroundColor={theme.colors.primary['50']}
                    showHeader={dataGroupedFilteredSorted.length > 0}
                    columns={columns}
                    scroll={{y: scrollHeight}}
                    dataSource={dataGroupedFilteredSorted}
                    tableLayout="fixed"
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
    isEqual
);
