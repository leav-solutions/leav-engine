// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/** Base type for drag objects - DragObjectWithType was removed in react-dnd v14 */
interface IDragObjectWithType {
    type: string | symbol;
}
import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {type FormElementTypes} from '_gqlTypes';
import {type IKeyValue} from '../../../../../../../../_types/shared';

export const PLACEHOLDER_ID = '__placeholder__';

export enum UIElementTypes {
    DIVIDER = 'divider',
    FIELDS_CONTAINER = 'fields_container',
    TEXT_BLOCK = 'text_block',
    TABS = 'tabs',
    FRAME = 'frame',
}

export enum FieldTypes {
    TEXT_INPUT = 'input_field',
    DATE = 'date',
    CHECKBOX = 'checkbox',
    ENCRYPTED = 'encrypted',
    DROPDOWN = 'dropdown',
    LINK = 'link',
    TREE = 'tree',
}

export enum DraggableElementTypes {
    RESERVE_LAYOUT_ELEMENT = 'RESERVE_LAYOUT_ELEMENT',
    ATTRIBUTE = 'ATTRIBUTE',
    FORM_ELEMENT = 'FORM_ELEMENT',
}

export enum TabsDirection {
    VERTICAL = 'VERTICAL',
    HORIZONTAL = 'HORIZONTAL',
}

export enum DisplayMode {
    EXPLORER = 'EXPLORER',
    TAG = 'TAG',
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
    TRANSLATED_INPUT = 'TRANSLATED_INPUT',
    ATTRIBUTE_SELECTION = 'ATTRIBUTE_SELECTION',
    ATTRIBUTE_SELECTION_MULTIPLE = 'ATTRIBUTE_SELECTION_MULTIPLE',
    INPUT = 'INPUT',
    CHECKBOX = 'CHECKBOX',
    RTE = 'RTE',
    SELECT = 'SELECT',
}

export interface IFormElementSettings {
    name: string;
    inputType: FormElementSettingsInputTypes;
    getInputSettings?: (attributeProps: GET_ATTRIBUTE_BY_ID_attributes_list) => IKeyValue<any>;
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
    label?: SystemTranslation;
    attribute?: string;
}

export interface IFormElementPos {
    order: number;
    containerId: string;
}

export interface IFormBuilderDragObject<T extends IUIElement | IFormElement> extends IDragObjectWithType {
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
    disabled: boolean;
    fieldName: string;
    defaultValue?: string | boolean;
}

export type SettingsFieldSpecificProps<FieldPropsType> = Omit<FieldPropsType, keyof ISettingsFieldCommonProps>;
