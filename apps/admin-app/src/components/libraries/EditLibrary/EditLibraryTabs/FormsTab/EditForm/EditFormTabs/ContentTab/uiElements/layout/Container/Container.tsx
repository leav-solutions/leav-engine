// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useRef} from 'react';
import {useDrop, XYCoord} from 'react-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
    defaultContainerId,
    FormBuilderActionTypes,
    IFormBuilderStateAndDispatch
} from '../../../formBuilderReducer/formBuilderReducer';
import FormElementWrapper from '../../../FormLayout/FormLayoutElementWrapper/FormElementWrapper';
import {DraggableElementTypes, IFormBuilderDragObject, IFormElement} from '../../../_types';

interface IContainerProps extends Partial<IFormBuilderStateAndDispatch> {
    elementData?: IFormElement;
}

const ContainerWrapper = styled.div<{isOver: boolean; isRootContainer: boolean}>`
    background: ${props => (props.isRootContainer ? '#FFF' : '#EEE')};
    padding: ${props => (props.isRootContainer ? 0 : '2em')};
    color: #aaaaaa;
    text-align: center;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: ${props => (props.isRootContainer ? 'calc(100vh - 18rem)' : 'auto')};
`;

const EmptyContainerPlaceholder = styled.div`
    border: 3px dashed #ddd;
    border-radius: 5px;
    text-align: center;
    padding: 2em;
    font-weight: bold;
`;

function Container({elementData, state, dispatch}: IContainerProps): JSX.Element {
    const {t} = useTranslation();
    const dropRef = useRef<HTMLDivElement>(null);
    const [{isOver}, drop] = useDrop<IFormBuilderDragObject<IFormElement>, {containerId: string}, {isOver: boolean}>({
        accept: [
            DraggableElementTypes.ATTRIBUTE,
            DraggableElementTypes.FORM_ELEMENT,
            DraggableElementTypes.RESERVE_LAYOUT_ELEMENT
        ],
        drop: monitor => {
            return {containerId: elementData?.id || defaultContainerId};
        },
        collect: monitor => ({
            isOver: monitor.isOver({shallow: true})
        }),
        hover: (item, monitor) => {
            const isOverCurrent = monitor.isOver({shallow: true});

            if (
                !state ||
                !dispatch ||
                !elementData ||
                !isOverCurrent ||
                item.currentPos?.containerId === elementData?.id ||
                item.element.id === elementData.id
            ) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = dropRef.current!.getBoundingClientRect();

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

            const {index} = item;

            // Element has not been added yet
            const threshold = 0.5;
            const elemHeight = hoverBoundingRect.bottom - hoverBoundingRect.top;
            const bottomThreshold = elemHeight * threshold;

            const addAtPos =
                hoverClientY < bottomThreshold ? 0 : (state.activeElements[elementData.id] ?? []).length || 0;

            const position = {order: addAtPos, containerId: elementData.id};

            if (index < 0) {
                dispatch({
                    type: FormBuilderActionTypes.ADD_ELEMENT,
                    element: {...item.element},
                    position
                });
            } else {
                dispatch({
                    type: FormBuilderActionTypes.MOVE_ELEMENT,
                    elementId: item.element.id,
                    from: item.currentPos ?? {order: item.element.order, containerId: item.element.containerId},
                    to: position
                });
            }
            item.dropAtPos = position;
            item.currentPos = position;
            item.index = position.order;
        }
    });

    if (!state || !dispatch || !elementData) {
        return <></>;
    }

    drop(dropRef);

    const content = state.activeElements[elementData.id] || [];

    return (
        <ContainerWrapper isOver={isOver} isRootContainer={elementData.id === defaultContainerId} ref={dropRef}>
            {!!content.length ? (
                content.map((c, i) => (
                    <FormElementWrapper key={c.id} element={c} index={i} state={state} dispatch={dispatch} />
                ))
            ) : (
                <EmptyContainerPlaceholder>{t('forms.empty_container')}</EmptyContainerPlaceholder>
            )}
        </ContainerWrapper>
    );
}

export default Container;
