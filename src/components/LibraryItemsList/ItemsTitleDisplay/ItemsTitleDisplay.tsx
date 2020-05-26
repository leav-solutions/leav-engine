import React from 'react';
import {Card, Grid, Segment} from 'semantic-ui-react';
import {getPreviewUrl} from '../../../utils';
import {IItem} from '../../../_types/types';
import RecordPreview from '../LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';

interface IItemsTitleDisplayProps {
    items?: IItem[];
}

function ItemsTitleDisplay({items}: IItemsTitleDisplayProps): JSX.Element {
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
        </Segment>
    );
}

export default ItemsTitleDisplay;
