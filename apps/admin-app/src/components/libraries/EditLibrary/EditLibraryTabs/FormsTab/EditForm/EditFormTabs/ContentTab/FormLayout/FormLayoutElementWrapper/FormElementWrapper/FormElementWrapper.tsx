// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/react-hooks';
import React, {useRef, useState} from 'react';
import {useDrag, useDrop, XYCoord} from 'react-dnd';
import {Button, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../../../../../../../../../hooks/useLang';
import {getAttributesQuery} from '../../../../../../../../../../../queries/attributes/getAttributesQuery';
import {localizedLabel} from '../../../../../../../../../../../utils';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../../../../../../../../../../../_gqlTypes/GET_ATTRIBUTES';
import Loading from '../../../../../../../../../../shared/Loading';
import {FormBuilderActionTypes, IFormBuilderStateAndDispatch} from '../../../formBuilderReducer/formBuilderReducer';
import {DraggableElementTypes, IFormBuilderDragObject, IFormElement, IFormElementPos} from '../../../_types';

interface IFieldWrapperProps extends IFormBuilderStateAndDispatch {
    element: IFormElement;
    index: number;
}

const HoverBtnGroup = styled(Button.Group)`
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
    z-index: 10;
`;

const Wrapper = styled.div<{isOver: boolean; isHerited: boolean}>`
    position: relative;
    background: ${props => (props.isHerited ? '#C3FFF9' : '#FFF')};
    margin: 1em 0;
    border-radius: 5px;
    border-width: 1px;
    border-style: dashed;
    border-color: ${props => (props.isOver ? '#999' : '#DDD')};
    display: flex;
    color: #aaaaaa;
    min-height: 4em;
`;

const ElementHandle = styled.div`
    text-align: center;
    align-self: center;
    width: 2em;
    cursor: move;
`;

const UiElementWrapper = styled.div<{isHerited: boolean}>`
    width: 100%;
    text-align: left;
    padding: 0.5em;
    border-left: ${props => (props.isHerited ? 'none' : '1px solid #aaa')};
    display: flex;

    & > div {
        flex-grow: 1;
    }
`;

function FormElementWrapper({element, index, dispatch, state}: IFieldWrapperProps): JSX.Element {
    const {lang} = useLang();
    const dropRef = useRef<HTMLDivElement>(null);

    // Load attribute data
    const {loading, error, data} = useQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(getAttributesQuery, {
        variables: {id: String(element?.settings?.attribute) || null},
        skip: !element?.settings?.attribute
    });

    const [hover, setHover] = useState<boolean>(false);

    const [, drop] = useDrop<
        IFormBuilderDragObject<IFormElement>,
        IFormBuilderDragObject<IFormElement>,
        {isOver: boolean}
    >({
        accept: [
            DraggableElementTypes.ATTRIBUTE,
            DraggableElementTypes.FORM_ELEMENT,
            DraggableElementTypes.RESERVE_LAYOUT_ELEMENT
        ],
        collect: monitor => ({
            isOver: !!monitor.isOver() && element.uiElement.canDrop(monitor.getItem())
        }),
        canDrop: dragItem => element.uiElement.canDrop(dragItem.element),
        hover: (item, monitor) => {
            const isOverCurrent = monitor.isOver({shallow: true});
            if (item.element.id === element.id || !isOverCurrent) {
                return;
            }

            const itemFromPos: IFormElementPos = item.currentPos
                ? {...item.currentPos}
                : {order: 999, containerId: element.containerId};

            // Determine rectangle on screen
            const hoverBoundingRect = dropRef.current!.getBoundingClientRect();

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

            const elemIndex = index;
            const dragIndex = item.index;
            const dragDown = dragIndex <= elemIndex;
            const dragUp = dragIndex > elemIndex;

            const threshold = 0.5;
            const elemHeight = hoverBoundingRect.bottom - hoverBoundingRect.top;
            const bottomThreshold = elemHeight * threshold;
            const topThreshold = elemHeight - elemHeight * (1 - threshold);

            item.dropAtPos = {order: elemIndex, containerId: element.containerId};
            if (
                (dragDown && hoverClientY > topThreshold) ||
                (dragUp && hoverClientY < bottomThreshold) ||
                dragIndex < 0
            ) {
                const nextPos = elemIndex;

                item.currentPos = {order: nextPos, containerId: element.containerId};
                item.dropAtPos = {order: nextPos, containerId: element.containerId};

                if (dragIndex < 0) {
                    item.index = nextPos;
                }

                // Add placeholder at pos
                if (dragIndex < 0) {
                    dispatch({
                        type: FormBuilderActionTypes.ADD_ELEMENT,
                        element: {...item.element},
                        position: {order: nextPos, containerId: element.containerId}
                    });
                } else if (dragIndex !== nextPos) {
                    dispatch({
                        type: FormBuilderActionTypes.MOVE_ELEMENT,
                        elementId: item.element.id,
                        from: itemFromPos,
                        to: item.dropAtPos
                    });
                }
                item.index = nextPos;
            }
        }
    });

    const [, drag, preview] = useDrag<
        IFormBuilderDragObject<IFormElement>,
        IFormBuilderDragObject<IFormElement>,
        {isDragging: boolean}
    >({
        item: {
            type: DraggableElementTypes.ATTRIBUTE,
            element,
            index,
            currentPos: {order: index, containerId: element.containerId},
            originPos: {order: index, containerId: element.containerId}
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        }),
        end: (dropResult, monitor) => {
            if (!monitor.didDrop()) {
                // Move element back to its origin
                dispatch({
                    type: FormBuilderActionTypes.MOVE_ELEMENT,
                    elementId: monitor.getItem().element.id,
                    from: monitor.getItem().currentPos,
                    to: monitor.getItem().originPos
                });
            }
        }
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div>ERROR {error}</div>;
    }

    const _handleMouseEnter = () => setHover(true);
    const _handleMouseLeave = () => setHover(false);
    const _handleSettingsClick = () => {
        dispatch({type: FormBuilderActionTypes.OPEN_SETTINGS, element});
    };

    const _handleDeleteClick = () => {
        dispatch({type: FormBuilderActionTypes.REMOVE_ELEMENT, element});
    };

    const attrData = data?.attributes?.list[0];

    const fieldSettings = {
        ...element.settings,
        attribute: typeof element?.settings?.attribute !== 'undefined' ? attrData : null,
        label: element?.settings?.label || (attrData && localizedLabel(attrData.label, lang)) || element.type
    };

    drop(preview(dropRef));
    return (
        <Wrapper
            ref={dropRef}
            onMouseEnter={_handleMouseEnter}
            onMouseLeave={_handleMouseLeave}
            isOver={false}
            isHerited={!!element.herited}
        >
            {hover && (
                <HoverBtnGroup icon>
                    <Button onClick={_handleSettingsClick}>
                        <Icon name="cog" />
                    </Button>
                    {
                        <Button onClick={_handleDeleteClick}>
                            <Icon name="cancel" />
                        </Button>
                    }
                </HoverBtnGroup>
            )}
            {!element.herited && (
                <ElementHandle ref={drag}>
                    <Icon name="bars" fitted />
                </ElementHandle>
            )}
            <UiElementWrapper isHerited={!!element.herited}>
                <element.uiElement.component.type
                    elementData={element}
                    settings={fieldSettings}
                    state={state}
                    dispatch={dispatch}
                />
            </UiElementWrapper>
        </Wrapper>
    );
}

export default FormElementWrapper;
