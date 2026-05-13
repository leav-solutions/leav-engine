import {useDrag} from 'react-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes';
import {useEditFormContext} from '../../../../../hooks/useEditFormContext';
import {defaultContainerId, FormBuilderActionTypes} from '../../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {DraggableElementTypes, type IFormBuilderDragObject, type IFormElement, type IUIElement} from '../../../_types';

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
        id: window.crypto.randomUUID(),
        order: 0,
        containerId: defaultContainerId,
        type: FormElementTypes.layout,
        uiElement: element,
    };

    const [{isDragging}, drag] = useDrag<
        IFormBuilderDragObject<IFormElement>,
        {containerId: string},
        {isDragging: boolean}
    >({
        type: DraggableElementTypes.RESERVE_LAYOUT_ELEMENT,
        item: {
            type: DraggableElementTypes.RESERVE_LAYOUT_ELEMENT,
            element: formElement,
            index: -1,
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
        canDrag: !readonly,
        end: (_, monitor) => {
            if (monitor.didDrop()) {
                // Item has already been added, don't do anything
                if (typeof monitor.getItem().dropAtPos !== 'undefined') {
                    return;
                }

                const dropResult = monitor.getDropResult();
                const position = {
                    order: monitor.getItem().dropAtPos?.order || 0,
                    containerId: dropResult?.containerId ?? defaultContainerId,
                };

                dispatch({
                    type: FormBuilderActionTypes.ADD_ELEMENT,
                    element: {...monitor.getItem().element, containerId: position.containerId},
                    position,
                });
            } else {
                const containerId = monitor.getItem().dropAtPos?.containerId || defaultContainerId;

                dispatch({
                    type: FormBuilderActionTypes.REMOVE_ELEMENT,
                    element: {...monitor.getItem().element, containerId},
                });
            }
        },
    });

    return (
        <Wrapper $isDragging={isDragging} ref={drag}>
            {t(`forms.elements.${element.type}`)}
        </Wrapper>
    );
}

export default ReserveLayoutElement;
