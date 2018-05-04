export interface IValue {
    id?: number;
    attribute?: string;
    value?: any;
    created_at?: number;
    modified_at?: number;
}

export enum TreeValueTypes {
    ELEMENT = 'element',
    PARENTS = 'parents'
}

export interface IValueOptions {
    valueType?: TreeValueTypes;
}
