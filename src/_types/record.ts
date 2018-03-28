import {IAttribute} from './attribute';
import {IAttributeTypeRepo} from 'infra/attributeRepo';

export interface IRecord {
    id?: number;
    library?: string;
    created_at?: number;
    modified_at?: number;
    [attributeName: string]: any;
}

export interface IRecordFilterOption {
    attribute: IAttribute;
    typeRepo: IAttributeTypeRepo;
    value: string | number;
}

export interface IQueryField {
    name: string;
    fields: IQueryField[];
    arguments: Array<{name: string; value: string}>;
}
