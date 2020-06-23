import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimmer, Dropdown, Loader, Menu, Segment, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {orderSearch} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

const TableWrapper = styled.div`
    height: calc(100% - 16rem);
    overflow: auto;
    padding: 0 !important;
    margin-top: 0 !important;
`;

const HeaderTable = styled(Segment)`
    margin-bottom: 0 !important;
    border-bottom: 0 !important;
    border-radius: 0 !important;

    display: grid;
    grid-template-columns: repeat(${({columns}) => columns}, 1fr);
`;

const FooterTable = styled(Segment)`
    margin-top: 0 !important;
    border-top: 0 !important;
    border-radius: 0 !important;
`;

interface ILibraryItemsListTableProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function LibraryItemsListTable({stateItems, dispatchItems}: ILibraryItemsListTableProps): JSX.Element {
    const {t: translate} = useTranslation();

    const t = (trad: string, options = {}) => translate(`items_list.table.${trad}`, options);

    const tableCells = [
        {name: 'infos', display: t('infos')},
        {name: 'adLabel', display: t('ad_label')},
        {name: 'ean', display: t('ean')},
        {name: 'category', display: t('category')},
        {name: 'opCode', display: t('op_code')}
    ];

    if (!stateItems.items) {
        return (
            <Segment style={{height: '20rem'}}>
                <Dimmer active inverted>
                    <Loader inverted size="massive" />
                </Dimmer>
            </Segment>
        );
    }

    const handleSort = (attId: string, order: orderSearch) => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SEARCH_INFOS,
            itemsSortField: 'infos' === attId ? 'id' : attId,
            itemsSortOrder: order
        });
    };

    const handleDesc = (attId: string) => {
        handleSort(attId, orderSearch.desc);
    };

    const handleAsc = (attId: string) => {
        handleSort(attId, orderSearch.asc);
    };

    return (
        <>
            <HeaderTable secondary columns={tableCells.length}>
                {tableCells.map(cell => (
                    <div key={cell.name}>
                        <Dropdown text={cell.display} key={cell.name}>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    text={t('header-cell-menu.sort-ascend')}
                                    onClick={() => handleAsc(cell.name)}
                                />
                                <Dropdown.Item
                                    text={t('header-cell-menu.sort-descend')}
                                    onClick={() => handleDesc(cell.name)}
                                />
                                <Dropdown.Item text={t('header-cell-menu.cancel-sort')} />
                                <Dropdown.Divider />
                                <Dropdown.Item text={t('header-cell-menu.sort-advance')} />
                                <Dropdown.Divider />
                                <Dropdown.Item text={t('header-cell-menu.regroup')} />
                                <Dropdown.Divider />
                                <Dropdown.Item text={t('header-cell-menu.choose-columns')} />
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ))}
            </HeaderTable>
            <TableWrapper>
                <Table fixed selectable className="table-items" celled>
                    <Table.Body>
                        {stateItems.items &&
                            stateItems.items?.map(item => (
                                <LibraryItemsListTableRow
                                    key={item.id}
                                    item={item}
                                    stateItems={stateItems}
                                    dispatchItems={dispatchItems}
                                />
                            ))}
                    </Table.Body>
                </Table>
            </TableWrapper>

            <FooterTable secondary>
                <div>
                    <Menu pagination>
                        <LibraryItemsListPagination stateItems={stateItems} dispatchItems={dispatchItems} />
                    </Menu>
                </div>
            </FooterTable>
        </>
    );
}

export default LibraryItemsListTable;
