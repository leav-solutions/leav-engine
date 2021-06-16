// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IKeyValue} from './utils';

export enum FormUIElementTypes {
    DIVIDER = 'divider',
    FIELDS_CONTAINER = 'fields_container',
    TEXT_BLOCK = 'text_block',
    TABS = 'tabs'
}

export enum FormFieldTypes {
    TEXT_INPUT = 'input_field',
    DATE = 'date',
    CHECKBOX = 'checkbox',
    ENCRYPTED = 'encrypted',
    DROPDOWN = 'dropdown',
    LINK = 'link'
}

export enum TabsDirection {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical'
}

export interface ICommonFieldsSettings {
    label?: string;
    attribute?: string;
}

export interface IFormDividerSettings {
    title?: string;
}

export interface IFormTabSettings {
    label?: IKeyValue<string>;
    id: string;
}

export interface IFormTabsSettings {
    tabs: IFormTabSettings[];
    direction: TabsDirection;
}

export interface IFormTextBlockSettings {
    content?: string;
}

export interface IFormDateFieldSettings extends ICommonFieldsSettings {
    withTime: boolean;
}

export interface IFormLinkFieldSettings extends ICommonFieldsSettings {
    columns: Array<{
        id: string;
        label: Record<string, string>;
    }>;
}
