// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DragObjectWithType} from 'react-dnd';
import {GET_ATTRIBUTES_attributes_list} from '_gqlTypes/GET_ATTRIBUTES';
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
    DROPDOWN = 'dropdown',
    LINK = 'link',
    TREE = 'tree'
}

export enum DraggableElementTypes {
    RESERVE_LAYOUT_ELEMENT = 'RESERVE_LAYOUT_ELEMENT',
    ATTRIBUTE = 'ATTRIBUTE',
    FORM_ELEMENT = 'FORM_ELEMENT'
}

export enum TabsDirection {
    VERTICAL = 'VERTICAL',
    HORIZONTAL = 'HORIZONTAL'
}

export interface IFormElement {
    id: string;
    order: number;
    type: FormElementTypes;
    uiElement: IUIElement;
    containerId: string;
    settings?: IKeyValue<unknown>;
    herited?: boolean;
}

export enum FormElementSettingsInputTypes {
    NONE = 'NONE',
    ATTRIBUTE_SELECTION = 'ATTRIBUTE_SELECTION',
    ATTRIBUTE_SELECTION_MULTIPLE = 'ATTRIBUTE_SELECTION_MULTIPLE',
    INPUT = 'INPUT',
    CHECKBOX = 'CHECKBOX',
    RTE = 'RTE',
    SELECT = 'SELECT'
}

export interface IFormElementSettings {
    name: string;
    inputType: FormElementSettingsInputTypes;
    getInputSettings?: (attributeProps: GET_ATTRIBUTES_attributes_list) => IKeyValue<any>;
    options?: string[];
    defaultValue?: any;
}

export interface IUIElement {
    type: UIElementTypes | FieldTypes;
    component: JSX.Element;
    canDrop: (dropCandidate: IFormElement) => boolean;
    settings?: IFormElementSettings[];
}

export interface IFormElementProps<SettingsType extends object> {
    elementData?: IFormElement;
    settings: SettingsType;
}

export interface ICommonFieldsSettings {
    label?: string;
    attribute?: string;
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

export type SettingsOnChangeFunc = (name: string, value: string | boolean) => void;

export interface ISettingsFieldCommonProps {
    onChange: SettingsOnChangeFunc;
    fieldName: string;
}

export type SettingsFieldSpecificProps<FieldPropsType> = Omit<FieldPropsType, keyof ISettingsFieldCommonProps>;
