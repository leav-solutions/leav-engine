import React from 'react';
import {useDrag} from 'react-dnd';
import styled from 'styled-components';
import {v4 as uuidv4} from 'uuid';
import useLang from '../../../../../../../../../../../hooks/useLang';
import {isLinkAttribute, localizedLabel} from '../../../../../../../../../../../utils';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../../../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {
    defaultContainerId,
    FormBuilderActionTypes,
    IFormBuilderStateAndDispatch
} from '../../../formBuilderReducer/formBuilderReducer';
import {formElements} from '../../../uiElements';
import {DraggableElementTypes, FieldTypes, IFormBuilderDragObject, IFormElement, IUIElement} from '../../../_types';

interface IReserveAttributeProps extends IFormBuilderStateAndDispatch {
    attribute: GET_ATTRIBUTES_attributes_list;
}

const Wrapper = styled.div<{isDragging: boolean}>`
    opacity: ${props => (props.isDragging ? 0.5 : 1)};
    font-weight: bold;
    cursor: move;
    margin: 0.8em 0;
`;

function ReserveAttribute({attribute, dispatch}: IReserveAttributeProps): JSX.Element {
    const {lang} = useLang();

    const attrLabel = localizedLabel(attribute.label, lang);

    const _getElement = () => {
        const elemByFormat: {[format in AttributeFormat]: IUIElement} = {
            [AttributeFormat.boolean]: formElements[FieldTypes.CHECKBOX],
            [AttributeFormat.date]: formElements[FieldTypes.DATE],
            [AttributeFormat.encrypted]: formElements[FieldTypes.ENCRYPTED],
            [AttributeFormat.extended]: formElements[FieldTypes.TEXT_INPUT],
            [AttributeFormat.numeric]: formElements[FieldTypes.TEXT_INPUT],
            [AttributeFormat.text]: formElements[FieldTypes.TEXT_INPUT]
        };

        return {
            id: uuidv4(),
            order: 0,
            type: FormElementTypes.field,
            containerId: defaultContainerId,
            uiElement: isLinkAttribute(attribute, false)
                ? formElements[FieldTypes.TEXT_INPUT]
                : elemByFormat[attribute.format!],
            settings: {
                attribute: attribute.id,
                label: attrLabel
            }
        };
    };

    const [{isDragging}, drag] = useDrag<
        IFormBuilderDragObject<IFormElement>,
        IFormBuilderDragObject<IFormElement>,
        {isDragging: boolean}
    >({
        item: {type: DraggableElementTypes.ATTRIBUTE, element: _getElement(), index: -1},
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        }),
        end: (dropResult, monitor) => {
            if (monitor.didDrop()) {
                // Item has already been added, don't do anything
                if (typeof monitor.getItem().dropAtPos !== 'undefined') {
                    return;
                }

                const position = {
                    order: monitor.getItem().dropAtPos?.order || 0,
                    containerId: monitor.getDropResult().containerId
                };

                dispatch({
                    type: FormBuilderActionTypes.ADD_ELEMENT,
                    element: {...monitor.getItem().element, containerId: position.containerId},
                    position
                });
            }
        }
    });

    return (
        <Wrapper ref={drag} isDragging={isDragging}>
            {attrLabel}
        </Wrapper>
    );
}

export default ReserveAttribute;
