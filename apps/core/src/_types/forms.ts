// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IKeyValue} from './shared';
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
    dependencyAttributes?: string[];
    elements: IFormElementWithValues[];
}

export enum FormElementTypes {
    field = 'field',
    layout = 'layout'
}

export type IFormStrict = Required<IForm>;

export interface IFormElementsDependency {
    attribute: string;
    value: string;
}

export interface IFormDependentElements {
    dependencyValue?: IFormElementsDependency | null;
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
export interface IFormFilterOptions extends ICoreEntityFilterOptions {
    library?: string;
}
