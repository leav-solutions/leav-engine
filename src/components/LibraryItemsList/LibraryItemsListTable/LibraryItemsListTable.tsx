import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimmer, Dropdown, Loader, Menu, Segment, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {IItem} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

const TableWrapper = styled.div`
    height: calc(100% - 20rem);
    overflow: auto;
    padding: 0 !important;
    margin-top: 0 !important;
`;

const HeaderTable = styled(Segment)`
    margin-bottom: 0 !important;
    border-bottom: 0 !important;
    border-radius: 0 !important;

    display: grid;
    grid-template-columns: repeat(${({columns, selection}) => (selection ? columns + 1 : columns)}, 1fr);
`;

const FooterTable = styled(Segment)`
    margin-top: 0 !important;
    border-top: 0 !important;
    border-radius: 0 !important;
`;

interface ILibraryItemsListTableProps {
    items?: IItem[];
    setItems: (items: IItem[]) => void;
    totalCount: number;
    pagination: number;
    offset: number;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    modeSelection: boolean;
    setModeSelection: React.Dispatch<React.SetStateAction<boolean>>;
    selected: {[x: string]: boolean};
    setSelected: React.Dispatch<React.SetStateAction<{[x: string]: boolean}>>;
}

function LibraryItemsListTable({
    items,
    totalCount,
    pagination,
    offset,
    setOffset,
    modeSelection,
    setModeSelection,
    selected,
    setSelected
}: ILibraryItemsListTableProps): JSX.Element {
    const {t: translate} = useTranslation();

    const t = (trad: string, options = {}) => translate(`items_list.table.${trad}`, options);

    const tableCells = [
        {name: 'infos', display: t('infos')},
        {name: 'adLabel', display: t('ad_label')},
        {name: 'ean', display: t('ean')},
        {name: 'category', display: t('category')},
        {name: 'opCode', display: t('op_code')}
    ];

    if (!items) {
        return (
            <Segment style={{height: '20rem'}}>
                <Dimmer active inverted>
                    <Loader inverted size="massive" />
                </Dimmer>
            </Segment>
        );
    }

    return (
        <>
            <HeaderTable secondary columns={tableCells.length} selection={modeSelection ? 1 : 0}>
                {modeSelection && <div>{t('selected')}</div>}
                {tableCells.map(cell => (
                    <div key={cell.name}>
                        <Dropdown text={cell.display} key={cell.name}>
                            <Dropdown.Menu>
                                <Dropdown.Item text={t('header-cell-menu.sort-ascend')} />
                                <Dropdown.Item text={t('header-cell-menu.sort-descend')} />
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
                        {items &&
                            items?.map(item => (
                                <LibraryItemsListTableRow
                                    key={item.id}
                                    item={item}
                                    modeSelection={modeSelection}
                                    setModeSelection={setModeSelection}
                                    selected={selected}
                                    setSelected={setSelected}
                                />
                            ))}
                    </Table.Body>
                </Table>
            </TableWrapper>

            <FooterTable secondary>
                <>
                    <div>
                        <Menu pagination>
                            <LibraryItemsListPagination
                                totalCount={totalCount}
                                pagination={pagination}
                                offset={offset}
                                setOffset={setOffset}
                            />
                        </Menu>
                    </div>
                </>
            </FooterTable>
        </>
    );
}

export default LibraryItemsListTable;
