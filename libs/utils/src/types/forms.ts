// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IKeyValue} from './helpers';

export enum FormUIElementTypes {
    DIVIDER = 'divider',
    FIELDS_CONTAINER = 'fields_container',
    TAB_FIELDS_CONTAINER = 'tab_fields_container',
    TEXT_BLOCK = 'text_block',
    TABS = 'tabs',
    FRAME = 'frame'
}

export enum FormFieldTypes {
    TEXT_INPUT = 'input_field',
    DATE = 'date',
    CHECKBOX = 'checkbox',
    ENCRYPTED = 'encrypted',
    DROPDOWN = 'dropdown',
    LINK = 'link',
    TREE = 'tree'
}

export enum TabsDirection {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical'
}

export interface ICommonFieldsSettings {
    label?: Record<string, string | null>;
    attribute?: string;
    useAttributeLabel?: boolean;
}

export interface IRequiredFieldsSettings extends ICommonFieldsSettings {
    required?: boolean;
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

export interface IFormFrameSettings {
    url: string;
    height?: string;
}

export interface IFormDateFieldSettings extends ICommonFieldsSettings {
    withTime: boolean;
}

export interface IFormLinkFieldSettings extends ICommonFieldsSettings {
    columns: Array<{
        id: string;
        label: Record<string, string>;
    }>;
    displayRecordIdentity: boolean;
    tagDisplayMode: boolean;
}

export const FORM_ROOT_CONTAINER_ID = '__root';
