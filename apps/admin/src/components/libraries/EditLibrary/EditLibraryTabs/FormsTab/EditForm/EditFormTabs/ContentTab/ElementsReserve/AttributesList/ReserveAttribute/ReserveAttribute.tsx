// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useDrag} from 'react-dnd';
import styled from 'styled-components';
import {v4 as uuidv4} from 'uuid';
import useLang from '../../../../../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../../../../../utils';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../../../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType, FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {useEditFormContext} from '../../../../../hooks/useEditFormContext';
import {defaultContainerId, FormBuilderActionTypes} from '../../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {formElements} from '../../../uiElements';
import {DraggableElementTypes, FieldTypes, IFormBuilderDragObject, IFormElement, IUIElement} from '../../../_types';

interface IReserveAttributeProps {
    attribute: GET_ATTRIBUTES_attributes_list;
}

const Wrapper = styled.div<{$isDragging: boolean}>`
    opacity: ${props => (props.$isDragging ? 0.5 : 1)};
    font-weight: bold;
    cursor: move;
    margin: 0.8em 0;
`;

function ReserveAttribute({attribute}: IReserveAttributeProps): JSX.Element {
    const {dispatch} = useFormBuilderReducer();
    const {lang} = useLang();
    const {readonly} = useEditFormContext();

    const attrLabel = attribute.label;

    const _getElement = () => {
        const elemByFormat: {[format in AttributeFormat]: IUIElement} = {
            [AttributeFormat.boolean]: formElements[FieldTypes.CHECKBOX],
            [AttributeFormat.color]: formElements[FieldTypes.TEXT_INPUT],
            [AttributeFormat.date]: formElements[FieldTypes.DATE],
            [AttributeFormat.encrypted]: formElements[FieldTypes.ENCRYPTED],
            [AttributeFormat.extended]: formElements[FieldTypes.TEXT_INPUT],
            [AttributeFormat.numeric]: formElements[FieldTypes.TEXT_INPUT],
            [AttributeFormat.text]: formElements[FieldTypes.TEXT_INPUT],
            [AttributeFormat.date_range]: formElements[FieldTypes.TEXT_INPUT],
            [AttributeFormat.rich_text]: formElements[FieldTypes.TEXT_INPUT]
        };

        let uiElement: IUIElement;
        switch (attribute.type) {
            case AttributeType.simple_link:
            case AttributeType.advanced_link:
                uiElement = formElements[FieldTypes.LINK];
                break;
            case AttributeType.tree:
                uiElement = formElements[FieldTypes.TREE];
                break;
            default:
                uiElement = elemByFormat[attribute.format!];
                break;
        }

        return {
            id: uuidv4(),
            order: 0,
            type: FormElementTypes.field,
            containerId: defaultContainerId,
            uiElement,
            settings: uiElement.settings.reduce(
                (acc, cur) => ({
                    [cur.name]: cur.defaultValue,
                    ...acc
                }),
                {
                    attribute: attribute.id,
                    label: attrLabel,
                    useAttributeLabel: true
                }
            )
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
        canDrag: !readonly,
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
        <Wrapper ref={drag} $isDragging={isDragging}>
            {localizedLabel(attribute.label, lang)}
        </Wrapper>
    );
}

export default ReserveAttribute;
