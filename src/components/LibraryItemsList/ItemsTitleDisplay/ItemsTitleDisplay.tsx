import React from 'react';
import {Card, Grid, Menu, Segment} from 'semantic-ui-react';
import {getPreviewUrl} from '../../../utils';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import RecordPreview from '../LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';

interface IItemsTitleDisplayProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function ItemsTitleDisplay({stateItems, dispatchItems}: IItemsTitleDisplayProps): JSX.Element {
    return (
        <Segment>
            <Grid columns={7}>
                {stateItems.items?.map(item => (
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
                    <LibraryItemsListPagination stateItems={stateItems} dispatchItems={dispatchItems} />
                </Menu>
            </Segment>
        </Segment>
    );
}

export default ItemsTitleDisplay;
