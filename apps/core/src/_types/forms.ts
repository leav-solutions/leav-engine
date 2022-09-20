// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IKeyValue} from './shared';
import {ITreeElement} from './tree';
import {IValue} from './value';

export interface IForm extends ICoreEntity {
    library: string;
    system?: boolean;
    dependencyAttributes?: string[];
    elements?: IFormDependentElements[];
}

export interface IRecordForm {
    id: string;
    library: string;
    system: boolean;
    recordId: string;
    elements: IFormElementWithValues[];
}

export enum FormElementTypes {
    field = 'field',
    layout = 'layout'
}

export type IFormStrict = Required<IForm>;

export interface IFormElementsDependency {
    attribute: string;
    value: ITreeElement;
}

export interface IFormDependentElements {
    dependency?: IFormElementsDependency | null;
    elements: IFormElement[];
}

export interface IFormElement {
    id: string;
    order: number;
    type: FormElementTypes;
    uiElementType: string;
    containerId: string;
    settings?: IKeyValue<any>;
}

export interface IFormElementWithValues extends IFormElement {
    values?: IValue[];
    valueError?: string;
}

export type IFormElementWithValuesAndChildren = IFormElementWithValues & {
    children: IFormElementWithValuesAndChildren[];
};

/**
 * Accepted fields to filter attributes list
 */
export interface IFormFilterOptions {
    id?: string;
    library?: string;
    system?: boolean;
    label?: string;
}
