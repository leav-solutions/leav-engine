import React from 'react';
import {Card, Menu, Segment} from 'semantic-ui-react';
import styled from 'styled-components';
import {getPreviewUrl} from '../../../utils';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import RecordPreview from '../LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';

interface IItemsTitleDisplayProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

const CustomSegment = styled(Segment)`
    height: calc(100% - 13rem);
    overflow-y: scroll;
    margin-bottom: 0 !important;
    border-radius: 0.25rem 0.25rem 0 0 !important;
    border-bottom: none !important;

    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
    align-content: start;
    align-items: start;

    &::after {
        content: '';
        flex: auto;
    }
`;

const CustomPagination = styled(Segment)`
    margin-top: 0 !important;
    border-radius: 0 0 0.25rem 0.25rem !important;
`;

const CustomCard = styled(Card)`
    max-width: 15rem !important;
    min-width: 8rem;
    height: 15rem;
    margin: 1rem !important;
`;

function ItemsTitleDisplay({stateItems, dispatchItems}: IItemsTitleDisplayProps): JSX.Element {
    return (
        <>
            <CustomSegment>
                {stateItems.items?.map(item => (
                    <CustomCard key={item.id}>
                        <RecordPreview
                            label={item.label || item.id}
                            image={item.preview?.medium ? getPreviewUrl(item.preview.medium) : ''}
                            tile={true}
                        />
                        <Card.Content>
                            <Card.Header>{item.label || item.id}</Card.Header>
                            {item.label && (
                                <Card.Meta>
                                    <span className="date">{item.id}</span>
                                </Card.Meta>
                            )}
                        </Card.Content>
                    </CustomCard>
                ))}
            </CustomSegment>
            <CustomPagination secondary>
                <Menu pagination>
                    <LibraryItemsListPagination stateItems={stateItems} dispatchItems={dispatchItems} />
                </Menu>
            </CustomPagination>
        </>
    );
}

export default ItemsTitleDisplay;
