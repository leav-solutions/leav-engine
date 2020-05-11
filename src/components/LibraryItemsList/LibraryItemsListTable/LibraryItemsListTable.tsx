import * as _ from 'lodash';
import React, {useState} from 'react';
import {Dimmer, Loader, Menu, Segment, Table} from 'semantic-ui-react';
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
    const [column, setColumn] = useState<string>();
    const [direction, setDirection] = useState<'ascending' | 'descending'>();

    const tableCells = [
        {name: 'preview', display: 'Preview'},
        {name: 'selected', display: 'Selected'},
        {name: 'id', display: 'Id'},
        {name: 'label', display: 'Label'},
        {name: 'adLabel', display: 'Ad Label'},
        {name: 'name', display: 'Designation'},
        {name: 'ean', display: 'EAN'},
        {name: 'category', display: 'Category'},
        {name: 'opLabel', display: 'Operation Label'},
        {name: 'opCode', display: 'Operation Code'}
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

    const handleSort = (clickedColumn: string) => () => {
        if (column !== clickedColumn) {
            setColumn(clickedColumn);
            setItems(_.sortBy(items, [clickedColumn]));
            setDirection('ascending');
        } else {
            setItems(items.reverse());
            setDirection(direction === 'ascending' ? 'descending' : 'ascending');
        }
    };

    return (
        <Table sortable selectable className="table-items">
            <Table.Header>
                <Table.Row>
                    {tableCells.map(cell => (
                        <Table.HeaderCell
                            key={cell.name}
                            sorted={column === cell.name ? direction : undefined}
                            onClick={handleSort(cell.name)}
                        >
                            <span>{cell.display}</span>
                        </Table.HeaderCell>
                    ))}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {items && items?.map(item => <LibraryItemsListTableRow key={item.id} item={item} />)}
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
