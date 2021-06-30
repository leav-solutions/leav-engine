// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import styled from 'styled-components';
import {TreesSelectionListActionTypes} from '../reducer/treesSelectionListReducer';
import {useTreesSelectionListState} from '../reducer/treesSelectionListStateContext';
import SelectedTree from './SelectedTree/SelectedTree';

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

function SelectedTreesList(): JSX.Element {
    const {state, dispatch} = useTreesSelectionListState();

    const selection = state.selectedTrees;

    const _onDragEnd = result => {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        dispatch({
            type: TreesSelectionListActionTypes.MOVE_SELECTED_TREE,
            from: result.source.index,
            to: result.destination.index
        });
    };

    return (
        <WrapperItemSelected>
            <DragDropContext onDragEnd={_onDragEnd}>
                <Droppable droppableId="list-trees-selected">
                    {provided => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {selection.map((selectedTree, index) => (
                                <Draggable key={index} index={index} draggableId={String(index)}>
                                    {dragProvided => (
                                        <CustomCard ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                                            <SelectedTree
                                                selectedTree={selectedTree}
                                                handleProps={dragProvided.dragHandleProps}
                                            />
                                        </CustomCard>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </WrapperItemSelected>
    );
}

export default SelectedTreesList;
