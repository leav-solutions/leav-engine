import React from 'react';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import styled from 'styled-components';
import {infosCol} from '../../../constants/constants';
import {reorder} from '../../../utils';
import {IAttributesChecked} from '../../../_types/types';
import ItemSelected from '../ItemSelected';
import {
    ListAttributeReducerAction,
    ListAttributeReducerActionTypes,
    ListAttributeState
} from '../ListAttributesReducer';

const WrapperItemSelected = styled.div`
    overflow-y: auto;
    height: calc(100vh - 15rem);

    &&& > *:first-child {
        margin-top: 0;
    }

    &&& > *:last-child {
        margin-bottom: 0;
    }
`;

const CustomCard = styled.div`
    &&& {
        padding: 0;
        margin: 0 8px 24px 8px;
        display: flex;
        justify-content: space-between;
        border: 1px solid #f0f0f0;
        border-radius: 2px;
        min-height: 5rem;
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
        background: #fff;
    }
`;

interface IListItemsSelectedProps {
    stateListAttribute: ListAttributeState;
    dispatchListAttribute: React.Dispatch<ListAttributeReducerAction>;
}

function ListItemsSelected({stateListAttribute, dispatchListAttribute}: IListItemsSelectedProps): JSX.Element {
    const items = stateListAttribute.attributesChecked.filter(attributeChecked => attributeChecked.checked);

    const removeAttributeChecked = (attributeCheckedToRemove: IAttributesChecked) => {
        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: stateListAttribute.attributesChecked.filter(attributeChecked =>
                attributeChecked.id === attributeCheckedToRemove.id
                    ? attributeChecked.library !== attributeCheckedToRemove.library
                    : true
            )
        });
    };

    const onDragEnd = result => {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index || result.destination.index < 1) {
            return;
        }

        const newItems = reorder(items, result.source.index, result.destination.index);

        dispatchListAttribute({
            type: ListAttributeReducerActionTypes.SET_ATTRS_CHECKED,
            attributesChecked: [...newItems]
        });
    };

    return (
        <WrapperItemSelected>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="list-items-selected">
                    {provided => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {items.map(
                                (item, index) =>
                                    item.id !== infosCol && (
                                        <Draggable
                                            key={`${item.id}_${item.library}_${item.extendedData?.path}`}
                                            index={index}
                                            draggableId={`${item.id}_${item.library}_${item.extendedData?.path}`}
                                        >
                                            {provided => (
                                                <CustomCard ref={provided.innerRef} {...provided.draggableProps}>
                                                    <ItemSelected
                                                        attributeChecked={item}
                                                        removeAttributeChecked={removeAttributeChecked}
                                                        stateListAttribute={stateListAttribute}
                                                        handleProps={provided.dragHandleProps}
                                                    />
                                                </CustomCard>
                                            )}
                                        </Draggable>
                                    )
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </WrapperItemSelected>
    );
}

export default ListItemsSelected;
