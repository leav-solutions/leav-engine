import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Dimmer, Dropdown, Loader, Menu, Segment, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {AttributeType, IRecordEdition, OrderSearch} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import ChooseTableColumns from './ChooseTableColumns';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';
import LibraryItemsModal from './LibraryItemsListTableRow/LibraryItemsModal';

const TableWrapper = styled.div`
    &&& {
        height: calc(100% - 16rem);
        overflow: auto;
        padding: 0;
        margin-top: 0;

        border: 1px solid rgba(34, 36, 38, 0.15);
    }
`;

const HeaderTable = styled(Segment)`
    &&& {
        margin: 0;
        padding: 0;
        border-bottom: 0;
        border-radius: 0;

        display: grid;
        grid-template-columns: repeat(${({columns}) => columns}, 1fr);
    }
`;

const HeaderTableCell = styled.div`
    padding: 1rem;
    justify-self: start;
    align-self: center;
    word-break: keep-all;
    white-space: nowrap;
`;

const TableStyled = styled(Table)`
    &&& {
        border-radius: 0;
    }
`;

const FooterTable = styled(Segment)`
    &&& {
        margin-top: 0;
        border-top: 0;
        border-radius: 0;
    }
`;

interface ITableHeader {
    name: string;
    display: string;
}

interface ILibraryItemsListTableProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

const initialColumnsLimit = 5;

function LibraryItemsListTable({stateItems, dispatchItems}: ILibraryItemsListTableProps): JSX.Element {
    const {t} = useTranslation();

    const [tableColumns, setTableColumn] = useState<ITableHeader[]>([]);
    const [openChangeColumns, setOpenChangeColumns] = useState(false);
    const [recordEdition, setRecordEdition] = useState<IRecordEdition>({
        show: false
    });

    useEffect(() => {
        if (stateItems.attributes.length && !stateItems.columns.length) {
            // initialise columns in state
            const initialTableColumns = stateItems.attributes.reduce(
                (acc, attribute, index) =>
                    index < initialColumnsLimit
                        ? [
                              ...acc,
                              {
                                  name: attribute.id,
                                  display:
                                      typeof attribute.label === 'string'
                                          ? attribute.label
                                          : attribute.label.fr || attribute.label.en,
                                  type: attribute.type
                              }
                          ]
                        : acc,
                [{name: 'infos', display: t('items_list.table.infos'), type: AttributeType.simple}]
            );

            setTableColumn(initialTableColumns);

            const columns = initialTableColumns.map(col => ({id: col.name, type: col.type}));
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_COLUMNS,
                columns
            });
        } else if (stateItems.attributes.length && stateItems.columns.length) {
            setTableColumn(
                stateItems.columns.map(col => {
                    const attribute = stateItems.attributes.find(att => att.id === col.id);
                    if (attribute) {
                        return {
                            name: attribute.id,
                            display:
                                typeof attribute.label === 'string'
                                    ? attribute.label
                                    : attribute.label.fr || attribute.label.en
                        };
                    }
                    // only the infos columns isn't in attributes
                    return {name: 'infos', display: t('items_list.table.infos')};
                })
            );
        }
    }, [t, dispatchItems, stateItems.columns, stateItems.attributes]);

    if (!stateItems.items) {
        return (
            <Segment style={{height: '20rem'}}>
                <Dimmer active inverted>
                    <Loader inverted size="massive" />
                </Dimmer>
            </Segment>
        );
    }

    const handleSort = (attId: string, order: OrderSearch) => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SEARCH_INFOS,
            itemsSortField: 'infos' === attId ? 'id' : attId,
            itemsSortOrder: order
        });
    };

    const handleDesc = (attId: string) => {
        handleSort(attId, OrderSearch.desc);
    };

    const handleAsc = (attId: string) => {
        handleSort(attId, OrderSearch.asc);
    };

    const cancelSort = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.CANCEL_SEARCH,
            itemsSortField: stateItems.attributes[0]?.id || ''
        });
    };

    return (
        <>
            <ChooseTableColumns
                stateItems={stateItems}
                dispatchItems={dispatchItems}
                openChangeColumns={openChangeColumns}
                setOpenChangeColumns={setOpenChangeColumns}
            />
            <HeaderTable secondary columns={tableColumns.length}>
                {tableColumns.map(cell => (
                    <HeaderTableCell key={cell.name}>
                        <Dropdown text={cell.display} key={cell.name}>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    text={t('items_list.table.header-cell-menu.sort-ascend')}
                                    onClick={() => handleAsc(cell.name)}
                                />
                                <Dropdown.Item
                                    text={t('items_list.table.header-cell-menu.sort-descend')}
                                    onClick={() => handleDesc(cell.name)}
                                />
                                <Dropdown.Item
                                    text={t('items_list.table.header-cell-menu.cancel-sort')}
                                    onClick={cancelSort}
                                />
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
                    </HeaderTableCell>
                ))}
            </HeaderTable>
            <TableWrapper>
                <TableStyled fixed selectable className="table-items" striped>
                    <Table.Body>
                        {stateItems.items &&
                            stateItems.items?.map(item => (
                                <LibraryItemsListTableRow
                                    key={item.id}
                                    item={item}
                                    stateItems={stateItems}
                                    dispatchItems={dispatchItems}
                                    showRecordEdition={item => setRecordEdition(re => ({show: true, item}))}
                                />
                            ))}
                    </Table.Body>
                </TableStyled>
            </TableWrapper>

            <FooterTable secondary>
                <div>
                    <Menu pagination>
                        <LibraryItemsListPagination stateItems={stateItems} dispatchItems={dispatchItems} />
                    </Menu>
                </div>
            </FooterTable>

            <LibraryItemsModal
                showModal={recordEdition.show}
                closeModal={() => setRecordEdition(re => ({...re, show: false}))}
                values={recordEdition.item}
                updateValues={item => setRecordEdition(re => ({...re, item}))}
            />
        </>
    );
}

export default LibraryItemsListTable;
