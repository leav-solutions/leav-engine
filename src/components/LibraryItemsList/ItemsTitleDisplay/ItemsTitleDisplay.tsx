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

const WrapperItem = styled.div`
    display: grid;
    justify-items: center;
    align-items: start;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    grid-template-rows: repeat(auto-fit, auto);
`;

const CustomSegment = styled(Segment)`
    &&& {
        height: calc(100% - 13rem);
        overflow-y: scroll;
        margin-bottom: 0;
        border-radius: 0.25rem 0.25rem 0 0;
        border-bottom: none;
    }
`;

const CustomPagination = styled(Segment)`
    &&& {
        margin-top: 0;
        border-radius: 0 0 0.25rem 0.25rem;
    }
`;

const CustomCard = styled(Card)`
    &&& {
        max-width: 15rem;
        min-width: 8rem;
        height: 15rem;
    }
`;

function ItemsTitleDisplay({stateItems, dispatchItems}: IItemsTitleDisplayProps): JSX.Element {
    return (
        <>
            <CustomSegment>
                <WrapperItem>
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
                </WrapperItem>
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
