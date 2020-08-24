import {Dropdown, Menu} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getSortFieldByAttributeType} from '../../../../utils';
import {AttributeType, ITableHeaderOld, OrderSearch} from '../../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../../LibraryItemsListReducer';

interface IHeaderTableCellProps {
    cell: ITableHeaderOld;
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    setOpenChangeColumns: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderTableCellStyled = styled.div`
    padding: 1rem;
    justify-self: start;
    align-self: center;
    word-break: keep-all;
    white-space: nowrap;
`;

function HeaderTableCell({cell, stateItems, dispatchItems, setOpenChangeColumns}: IHeaderTableCellProps): JSX.Element {
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
        <HeaderTableCellStyled>
            <Dropdown
                overlay={
                    <Menu>
                        <Menu.Item onClick={() => handleAsc(cell.name, cell.type)}>
                            {t('items_list.table.header-cell-menu.sort-ascend')}
                        </Menu.Item>
                        <Menu.Item onClick={() => handleDesc(cell.name, cell.type)}>
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
                <span>{cell.display}</span>
            </Dropdown>
        </HeaderTableCellStyled>
    );
}

export default HeaderTableCell;
