import {DragObjectWithType} from 'react-dnd';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../../../../_gqlTypes/GET_ATTRIBUTES';
import {FormElementTypes} from '../../../../../../../../_gqlTypes/globalTypes';
import {IKeyValue} from '../../../../../../../../_types/shared';

export const PLACEHOLDER_ID = '__placeholder__';

export enum UIElementTypes {
    DIVIDER = 'divider',
    FIELDS_CONTAINER = 'fields_container',
    TEXT_BLOCK = 'text_block',
    TABS = 'tabs'
}

export enum FieldTypes {
    TEXT_INPUT = 'input_field',
    DATE = 'date',
    CHECKBOX = 'checkbox',
    ENCRYPTED = 'encrypted',
    DROPDOWN = 'dropdown'
}

export enum DraggableElementTypes {
    RESERVE_LAYOUT_ELEMENT = 'RESERVE_LAYOUT_ELEMENT',
    ATTRIBUTE = 'ATTRIBUTE',
    FORM_ELEMENT = 'FORM_ELEMENT'
}

export interface IFormElement {
    id: string;
    order: number;
    type: FormElementTypes;
    uiElement: IUIElement;
    containerId: string;
    settings?: IKeyValue<any>;
    herited?: boolean;
}

export interface IUIElement {
    type: UIElementTypes | FieldTypes;
    component: JSX.Element;
    canDrop: (dropCandidate: IFormElement) => boolean;
    settings?: string[];
}

export interface IFormElementProps<T extends object> {
    elementData?: IFormElement;
    settings: T;
}

export interface ICommonFieldsSettings {
    label?: string;
    attribute?: GET_ATTRIBUTES_attributes_list;
}

export interface IFormElementPos {
    order: number;
    containerId: string;
}

export interface IFormBuilderDragObject<T extends IUIElement | IFormElement> extends DragObjectWithType {
    type: DraggableElementTypes;
    element: T;
    index: number;
    currentPos?: IFormElementPos;
    originPos?: IFormElementPos;
    dropAtPos?: IFormElementPos;
}
