// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useDrag} from 'react-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {v4 as uuidv4} from 'uuid';
import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {useEditFormContext} from '../../../../../hooks/useEditFormContext';
import {defaultContainerId, FormBuilderActionTypes} from '../../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {DraggableElementTypes, IFormBuilderDragObject, IFormElement, IUIElement} from '../../../_types';

interface IReserveLayoutElementProps {
    element: IUIElement;
}

const Wrapper = styled.div<{$isDragging: boolean}>`
    opacity: ${props => (props.$isDragging ? 0.5 : 1)};
    font-weight: bold;
    cursor: move;
    margin: 1em 0;
`;

function ReserveLayoutElement({element}: IReserveLayoutElementProps): JSX.Element {
    const {dispatch} = useFormBuilderReducer();
    const {t} = useTranslation();
    const {readonly} = useEditFormContext();

    const formElement = {
        id: uuidv4(),
        order: 0,
        containerId: defaultContainerId,
        type: FormElementTypes.layout,
        uiElement: element
    };

    const [{isDragging}, drag] = useDrag<
        IFormBuilderDragObject<IFormElement>,
        IFormBuilderDragObject<IFormElement>,
        {isDragging: boolean}
    >({
        item: {
            type: DraggableElementTypes.RESERVE_LAYOUT_ELEMENT,
            element: formElement,
            index: -1
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        }),
        canDrag: !readonly,
        end: (_, monitor) => {
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
            } else {
                const containerId = monitor.getItem().dropAtPos?.containerId || defaultContainerId;

                dispatch({
                    type: FormBuilderActionTypes.REMOVE_ELEMENT,
                    element: {...monitor.getItem().element, containerId}
                });
            }
        }
    });

    return (
        <Wrapper $isDragging={isDragging} ref={drag}>
            {t(`forms.elements.${element.type}`)}
        </Wrapper>
    );
}

export default ReserveLayoutElement;
