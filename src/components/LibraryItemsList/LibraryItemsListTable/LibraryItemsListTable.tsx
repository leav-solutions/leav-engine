import React from 'react';
import {Checkbox, Dimmer, Loader, Menu, Segment, Table} from 'semantic-ui-react';
import {getPreviewUrl} from '../../../utils';
import {IItems} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';

interface ILibraryItemsListTableProps {
    items?: IItems[];
    totalCount: number;
    pagination: number;
    offset: number;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
}

function LibraryItemsListTable({
    items,
    totalCount,
    pagination,
    offset,
    setOffset
}: ILibraryItemsListTableProps): JSX.Element {
    const tableCells = [
        'Preview',
        'Selected',
        'Id',
        'Label',
        'Ad Label',
        'Designation',
        'EAN',
        'Category',
        'Operation Label',
        'Operation Code'
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
        <Table>
            <Table.Header>
                <Table.Row>
                    {tableCells.map(cell => (
                        <Table.HeaderCell key={cell}>{cell}</Table.HeaderCell>
                    ))}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {items &&
                    items?.map(item => (
                        <Table.Row key={item.id}>
                            <Table.Cell>
                                {item.whoAmI?.preview?.small ? (
                                    <img src={getPreviewUrl(item.whoAmI?.preview?.small)} alt="preview" />
                                ) : (
                                    <span>No Image</span>
                                )}
                            </Table.Cell>
                            <Table.Cell>
                                <Checkbox />
                            </Table.Cell>

                            <Table.Cell>{item.whoAmI?.id}</Table.Cell>
                            <Table.Cell>{item.whoAmI?.label}</Table.Cell>
                            <Table.Cell>{''}</Table.Cell>
                            <Table.Cell>{''}</Table.Cell>
                            <Table.Cell>{''}</Table.Cell>
                            <Table.Cell>{''}</Table.Cell>
                            <Table.Cell>{''}</Table.Cell>
                            <Table.Cell>{''}</Table.Cell>
                        </Table.Row>
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
