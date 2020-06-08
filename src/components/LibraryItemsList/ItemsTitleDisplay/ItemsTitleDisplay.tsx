import React from 'react';
import {Card, Grid, Menu, Segment} from 'semantic-ui-react';
import {getPreviewUrl} from '../../../utils';
import {IItem} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import RecordPreview from '../LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';

interface IItemsTitleDisplayProps {
    items?: IItem[];
    totalCount: number;
    pagination: number;
    offset: number;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    modeSelection: boolean;
    setModeSelection: React.Dispatch<React.SetStateAction<boolean>>;
    selected: {[x: string]: boolean};
    setSelected: React.Dispatch<React.SetStateAction<{[x: string]: boolean}>>;
}

function ItemsTitleDisplay({
    items,
    totalCount,
    pagination,
    offset,
    setOffset,
    modeSelection,
    setModeSelection,
    selected,
    setSelected
}: IItemsTitleDisplayProps): JSX.Element {
    return (
        <Segment>
            <Grid columns={7}>
                {items?.map(item => (
                    <Grid.Column key={item.id}>
                        <Card>
                            <RecordPreview
                                label={item.label || item.id}
                                image={item.preview?.medium ? getPreviewUrl(item.preview.medium) : ''}
                                tile={true}
                            />
                            <Card.Content>
                                <Card.Header>{item.label || `id: ${item.id}`}</Card.Header>
                                {item.label && (
                                    <Card.Meta>
                                        <span className="date">{item.id}</span>
                                    </Card.Meta>
                                )}
                            </Card.Content>
                        </Card>
                    </Grid.Column>
                ))}
            </Grid>
            <Segment secondary>
                <Menu pagination>
                    <LibraryItemsListPagination
                        totalCount={totalCount}
                        pagination={pagination}
                        offset={offset}
                        setOffset={setOffset}
                    />
                </Menu>
            </Segment>
        </Segment>
    );
}

export default ItemsTitleDisplay;
