import {IKeyValue} from './shared';
import {ISystemTranslation} from './systemTranslation';
import {ITreeElement} from './tree';

export interface IForm {
    id: string;
    library: string;
    system?: boolean;
    label?: ISystemTranslation;
    dependencyAttributes?: string[];
    elements?: IFormDependentElements[];
}

export enum FormElementTypes {
    field = 'field',
    layout = 'layout'
}

export type IFormStrict = Required<IForm>;

export interface IFormDependentElements {
    dependency?: {attribute: string; value: ITreeElement} | null;
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

/**
 * Accepted fields to filter attributes list
 */
export interface IFormFilterOptions {
    id?: string;
    library?: string;
    system?: boolean;
    label?: string;
}
