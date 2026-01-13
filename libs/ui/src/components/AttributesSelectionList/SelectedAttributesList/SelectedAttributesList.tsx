// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DndContext, closestCenter} from '@dnd-kit/core';
import {SortableContext, verticalListSortingStrategy, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import styled from 'styled-components';
import {infosCol} from '_ui/components/LibraryItemsList/constants';
import {AttributesSelectionListActionTypes} from '../reducer/attributesSelectionListReducer';
import {useAttributesSelectionListState} from '../reducer/attributesSelectionListStateContext';
import SelectedAttribute from './SelectedAttribute/SelectedAttribute';
import {type ISelectedAttribute} from '_ui/types';

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
    const selection = state.selectedAttributes.filter(a => a.path !== infosCol);

    const handleDragEnd = event => {
        const {active, over} = event;
        if (!over || active.id === over.id) {
            return;
        }
        const from = selection.findIndex(item => item.path === active.id);
        const to = selection.findIndex(item => item.path === over.id);
        if (from === -1 || to === -1) {
            return;
        }
        dispatch({type: AttributesSelectionListActionTypes.MOVE_SELECTED_ATTRIBUTE, from, to});
    };

    return (
        <WrapperItemSelected>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={selection.map(a => a.path)} strategy={verticalListSortingStrategy}>
                    {selection.map(selectedAttribute => (
                        <SortableItem key={selectedAttribute.path} selectedAttribute={selectedAttribute} />
                    ))}
                </SortableContext>
            </DndContext>
        </WrapperItemSelected>
    );
}

function SortableItem({selectedAttribute}: {selectedAttribute: ISelectedAttribute}) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({
        id: selectedAttribute.path,
    });
    const style = {transform: CSS.Transform.toString(transform), transition};

    return (
        <CustomCard ref={setNodeRef} style={style} {...attributes}>
            <SelectedAttribute selectedAttribute={selectedAttribute} handleProps={listeners} />
        </CustomCard>
    );
}

export default SelectedAttributesList;
