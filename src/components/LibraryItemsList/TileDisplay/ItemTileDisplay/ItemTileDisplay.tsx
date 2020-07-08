import React, {useEffect, useState} from 'react';
import {Button, Card, Checkbox} from 'semantic-ui-react';
import styled from 'styled-components';
import {getPreviewUrl} from '../../../../utils';
import {IItem} from '../../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../../LibraryItemsListReducer';
import RecordPreview from '../../LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';

interface IItemTileDisplayProps {
    item: IItem;
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    showRecordEdition: (item: IItem) => void;
}

const CustomCard = styled(Card)`
    &&& {
        max-width: 15rem;
        min-width: 8rem;
        height: 15rem;
        margin: auto auto 1rem auto;
    }
`;

const ImageWrapper = styled.div`
    position: relative;
`;

const ActionsWrapper = styled.div`
    display: flex;
    justify-content: center;

    &:hover {
        .actions {
            animation: show-actions 300ms ease;
            opacity: 1;
            background: hsla(0, 0%, 0%, 0.2);
        }
    }

    @keyframes show-actions {
        from {
            opacity: 0;
            background: none;
        }
        to {
            opacity: 1;
            background: hsla(0, 0%, 0%, 0.2);
        }
    }
`;

const Selection = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
`;

const CustomCheckbox = styled(Checkbox)`
    height: 100%;
    width: 100%;
`;

const Actions = styled.div`
    position: absolute;
    display: grid;
    grid-template-columns: 1fr 1fr;
    opacity: 0;
    width: 100%;
    height: 100%;

    justify-items: center;
    align-items: center;
    justify-content: center;
    grid-gap: 1rem;

    padding: 2rem 5rem;
    border-radius: 0.25rem 0.25rem 0 0;
`;

function ItemTileDisplay({item, stateItems, dispatchItems, showRecordEdition}: IItemTileDisplayProps): JSX.Element {
    const [isSelected, setIsSelect] = useState<boolean>(!!stateItems.itemsSelected[item.id]);

    const handleClick = () => {
        if (stateItems.selectionMode) {
            setIsSelect(s => !s);

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
                itemsSelected: {...stateItems.itemsSelected, [item.id]: !isSelected}
            });
        }
    };

    const switchSelectionMode = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
            selectionMode: !stateItems.selectionMode
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {...stateItems.itemsSelected, [item.id]: true}
        });
    };

    useEffect(() => {
        setIsSelect(stateItems.itemsSelected[item.id]);
    }, [stateItems.itemsSelected, item]);

    return (
        <CustomCard>
            <ImageWrapper>
                <ActionsWrapper>
                    {stateItems.selectionMode ? (
                        <Selection>
                            <CustomCheckbox checked={isSelected} onClick={handleClick} />
                        </Selection>
                    ) : (
                        <Actions className="actions">
                            <Button circular icon="check" onClick={switchSelectionMode} />
                            <Button circular icon="write" onClick={() => showRecordEdition(item)} />
                            <Button circular icon="like" />
                            <Button circular icon="ellipsis horizontal" />
                        </Actions>
                    )}
                </ActionsWrapper>
                <RecordPreview
                    label={item.label || item.id}
                    image={item.preview?.medium ? getPreviewUrl(item.preview.medium) : ''}
                    tile={true}
                />
            </ImageWrapper>
            <Card.Content>
                <Card.Header>{item.label || item.id}</Card.Header>
                {item.label && (
                    <Card.Meta>
                        <span className="date">{item.id}</span>
                    </Card.Meta>
                )}
            </Card.Content>
        </CustomCard>
    );
}

export default ItemTileDisplay;
