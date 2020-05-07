import React from 'react';
import {Button, Dropdown, Label, Menu} from 'semantic-ui-react';
import LibraryItemsListPagination from '../LibraryItemsListPagination';

interface ILibraryItemsListMenuPaginationProps {
    totalCount: number;
    offset: number;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    pagination: number;
    setPagination: (pagination: number) => void;
    nbItems: number;
}

function LibraryItemsListMenuPagination({
    totalCount,
    offset,
    setOffset,
    pagination,
    setPagination,
    nbItems
}: ILibraryItemsListMenuPaginationProps): JSX.Element {
    const paginationOptions = [5, 10, 20, 50, 100];

    const offsetDisplay = totalCount > 0 ? offset + 1 : 0;
    const nextOffsetDisplay = offset + pagination > totalCount ? totalCount : offset + pagination;

    const rowStyle = {display: 'flex', justifyContent: 'flex-start', alignItems: 'center'};

    return (
        <Dropdown simple text={`${offsetDisplay} to ${nextOffsetDisplay} / ${totalCount} results`}>
            <Dropdown.Menu>
                <Dropdown.Header>
                    <div>
                        <Button>Select all ({totalCount})</Button>
                        <Button>Select visible ({nbItems})</Button>
                    </div>

                    <div
                        style={{
                            ...rowStyle,
                            position: 'relative',
                            height: '5rem'
                        }}
                    >
                        <Label basic>Go to page</Label>
                        <Menu
                            floated="right"
                            pagination
                            as="div"
                            className="library-list-menu-pagination"
                            style={{position: 'unset', opacity: 1, margin: '0 !important'}}
                        >
                            <LibraryItemsListPagination
                                totalCount={totalCount}
                                pagination={pagination}
                                offset={offset}
                                setOffset={setOffset}
                            />
                        </Menu>
                    </div>

                    <Button.Group as="div">
                        <Label basic>Number of items per page</Label>
                        {paginationOptions.map(pagOption => (
                            <Button
                                basic
                                key={pagOption}
                                active={pagination === pagOption}
                                onClick={() => setPagination(pagOption)}
                                content={pagOption}
                            />
                        ))}
                    </Button.Group>
                </Dropdown.Header>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default LibraryItemsListMenuPagination;
