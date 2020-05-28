import React, {useState} from 'react';
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

const HeaderTable = styled(Table)`
    margin-bottom: 0 !important;
    border-bottom: 0 !important;
    border-radius: 0 !important;
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
}

function LibraryItemsListTable({
    items,
    setItems,
    totalCount,
    pagination,
    offset,
    setOffset
}: ILibraryItemsListTableProps): JSX.Element {
    const {t: translate} = useTranslation();

    const t = (trad: string, options = {}) => translate(`items_list.table.${trad}`, options);

    const [modeSelection, setModeSelection] = useState<boolean>(false);

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
            <HeaderTable fixed>
                <Table.Header>
                    <Table.Row>
                        {modeSelection && <Table.HeaderCell>{t('selected')}</Table.HeaderCell>}
                        {tableCells.map(cell => (
                            <Table.HeaderCell key={cell.name}>
                                <Dropdown text={cell.display} key={cell.name}>
                                    <Dropdown.Menu>
                                        <Dropdown.Item text={t('header-cell-menu.sort-ascend')} />
                                        <Dropdown.Item text={t('header-cell-menu.sort-descend')} />
                                        <Dropdown.Item text={t('header-cell-menu.cancel-sort')} />
                                        <Dropdown.Item text={t('header-cell-menu.sort-advance')} />
                                        <Dropdown.Item text={t('header-cell-menu.regroup')} />
                                        <Dropdown.Divider />
                                        <Dropdown.Item text={t('header-cell-menu.regroup')} />
                                        <Dropdown.Divider />
                                        <Dropdown.Item text={t('header-cell-menu.choose-columns')} />
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Table.HeaderCell>
                        ))}
                    </Table.Row>
                </Table.Header>
            </HeaderTable>
            <TableWrapper>
                <Table fixed selectable className="table-items">
                    <Table.Body>
                        {items &&
                            items?.map(item => (
                                <LibraryItemsListTableRow
                                    key={item.id}
                                    item={item}
                                    modeSelection={modeSelection}
                                    setModeSelection={setModeSelection}
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
