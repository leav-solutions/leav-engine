import {ISystemTranslation} from './systemTranslation';
import {ITreeElement} from './tree';

export enum FormLayoutElementType {
    DIVIDER = 'divider',
    TABS = 'tabs',
    FIELDS_CONTAINER = 'fields_container'
}

export enum FormFieldType {
    INPUT_FIELD = 'input_field',
    TEXT_BLOCK = 'text_block'
}

export interface IForm {
    id: string;
    library: string;
    system?: boolean;
    label?: ISystemTranslation;
    dependencyAttributes?: string[];
    layout?: IFormLayoutElement[];
    fields?: IFormDependentFields[];
}

export type IFormStrict = Required<IForm>;

export interface IFormLayoutElement {
    id: string;
    type?: FormLayoutElementType;
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
    containerId: string;
    type: FormFieldType;
}

export interface IFormInputField extends IField {
    type: FormFieldType.INPUT_FIELD;
    attribute: string;
    required: boolean;
    input?: string;
    label?: ISystemTranslation;
    description?: ISystemTranslation;
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
