import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dropdown} from 'semantic-ui-react';
import styled from 'styled-components';
import {getSortFieldByAttributeType} from '../../../../utils';
import {AttributeType, ITableHeader, OrderSearch} from '../../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../../LibraryItemsListReducer';

interface IHeaderTableCellProps {
    cell: ITableHeader;
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
            <Dropdown text={cell.display}>
                <Dropdown.Menu>
                    <Dropdown.Item
                        text={t('items_list.table.header-cell-menu.sort-ascend')}
                        onClick={() => handleAsc(cell.name, cell.type)}
                    />
                    <Dropdown.Item
                        text={t('items_list.table.header-cell-menu.sort-descend')}
                        onClick={() => handleDesc(cell.name, cell.type)}
                    />
                    <Dropdown.Item text={t('items_list.table.header-cell-menu.cancel-sort')} onClick={cancelSort} />
                    <Dropdown.Divider />
                    <Dropdown.Item text={t('items_list.table.header-cell-menu.sort-advance')} />
                    <Dropdown.Divider />
                    <Dropdown.Item text={t('items_list.table.header-cell-menu.regroup')} />
                    <Dropdown.Divider />
                    <Dropdown.Item
                        text={t('items_list.table.header-cell-menu.choose-columns')}
                        onClick={() => setOpenChangeColumns(true)}
                    />
                </Dropdown.Menu>
            </Dropdown>
        </HeaderTableCellStyled>
    );
}

export default HeaderTableCell;
