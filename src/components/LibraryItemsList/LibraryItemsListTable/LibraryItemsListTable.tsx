import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Dimmer, Dropdown, Loader, Menu, Segment, Table} from 'semantic-ui-react';
import {IItem} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

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
        {name: 'actions', display: t('actions')},
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
        <Table selectable className="table-items">
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

            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell colSpan={tableCells.length}>
                        <Menu floated="right" pagination>
                            <LibraryItemsListPagination
                                totalCount={totalCount}
                                pagination={pagination}
                                offset={offset}
                                setOffset={setOffset}
                            />
                        </Menu>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}

export default LibraryItemsListTable;
