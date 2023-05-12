// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeElement} from './records';
import {IKeyValue} from './shared';

export enum FormLayoutElementType {
    DIVIDER = 'divider',
    TABS = 'tabs',
    FIELDS_CONTAINER = 'fields_container'
}

export enum FormFieldType {
    TEXT_INPUT = 'input_field',
    DATE = 'date',
    CHECKBOX = 'checkbox',
    ENCRYPTED = 'encrypted',
    DROPDOWN = 'dropdown',
    TEXT_BLOCK = 'text_block'
}

export interface IForm {
    id: string;
    library: string;
    system?: boolean;
    label?: IKeyValue<string>;
    dependencyAttributes?: string[];
    layout?: IFormLayoutElement[];
    fields?: IFormDependentFields[];
}

export type IFormStrict = Required<IForm>;

export interface IFormLayoutElement {
    id: string;
    order: number;
    type: FormLayoutElementType;
    settings: IKeyValue<string>;
}

export interface IFormDivider extends IFormLayoutElement {
    type: FormLayoutElementType.DIVIDER;
    title?: string;
}

export interface IFormTabs extends IFormLayoutElement {
    type: FormLayoutElementType.TABS;
    tabs: IFormTab[];
}

export interface IFormTab {
    title: string;
    content: IFormLayoutElement[];
}

export interface IFormFieldsContainer {
    type: FormLayoutElementType.FIELDS_CONTAINER;
}

export interface IFormDependentFields {
    dependency?: {[treeAttributeId: string]: ITreeElement} | null;
    fields: IField[];
}

export interface IField {
    id: string;
    containerId: string;
    type: FormFieldType;
    settings: IKeyValue<string | boolean>;
    component: (props) => JSX.Element;
}

export interface IActiveField extends IField {
    herited: boolean;
}

export interface IFormInputField extends IField {
    type: FormFieldType.TEXT_INPUT;
    settings: {
        attribute: string;
        required: boolean;
        input?: string;
        label?: IKeyValue<string>;
        description?: IKeyValue<string>;
    } & IKeyValue<string | boolean>;
}

export interface IFormTextBlock extends IField {
    type: FormFieldType.TEXT_BLOCK;
    content?: string;
}

/**
 * Accepted fields to filter attributes list
 */
export interface IFormFilterOptions {
    id?: string;
    library?: string;
    system?: boolean;
    label?: string;
}
