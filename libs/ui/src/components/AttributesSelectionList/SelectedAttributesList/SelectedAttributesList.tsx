// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import styled from 'styled-components';
import {infosCol} from '_ui/components/LibraryItemsList/constants';
import {AttributesSelectionListActionTypes} from '../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../reducer/attributesSelectionListStateContext';
import SelectedAttribute from './SelectedAttribute/SelectedAttribute';

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
        margin: 0 10px 10px 10px;
        display: flex;
        justify-content: space-between;
        border: 1px solid #f0f0f0;
        border-radius: 2px;
        min-height: 3rem;
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
        background: #fff;
    }
`;

function SelectedAttributesList(): JSX.Element {
    const {state, dispatch} = useAttributesSelectionListState();

    const selection = state.selectedAttributes;

    const _onDragEnd = result => {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        dispatch({
            type: AttributesSelectionListActionTypes.MOVE_SELECTED_ATTRIBUTE,
            from: result.source.index,
            to: result.destination.index
        });
    };

    return (
        <WrapperItemSelected>
            <DragDropContext onDragEnd={_onDragEnd}>
                <Droppable droppableId="list-attributes-selected">
                    {provided => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {selection.map(
                                (selectedAttribute, index) =>
                                    selectedAttribute.path !== infosCol && (
                                        <Draggable
                                            key={selectedAttribute.path}
                                            index={index}
                                            draggableId={selectedAttribute.path}
                                        >
                                            {dragProvided => (
                                                <CustomCard
                                                    ref={dragProvided.innerRef}
                                                    {...dragProvided.draggableProps}
                                                >
                                                    <SelectedAttribute
                                                        selectedAttribute={selectedAttribute}
                                                        handleProps={dragProvided.dragHandleProps}
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

export default SelectedAttributesList;
