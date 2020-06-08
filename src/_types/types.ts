export interface ILabel {
    fr: string;
    en: string;
    [x: string]: string;
}

export interface ILibrary {
    id: string;
    label: ILabel;
    gqlNames: {
        query: string;
    };
}

export interface IPreview {
    small: string;
    medium: string;
    big: string;
    pages: string;
}

export interface IItem {
    id: string;
    label?: string;
    preview?: IPreview;
    color?: string;
    library?: {
        id: string;
        label: ILabel;
    };
}

export interface RecordIdentity_whoAmI extends IItem {}

export enum PreviewAttributes {
    'small',
    'medium',
    'big',
    'pages'
}

export enum AvailableLanguage {
    en = 'en',
    fr = 'fr'
}

export interface IFilters {
    key: any;
    operator?: operatorFilter;
    where: whereFilter;
    value: string;
    attribute: string;
    active: boolean;
}

export enum operatorFilter {
    and = 'and',
    or = 'or'
}

export enum whereFilter {
    contains = 'contains',
    notContains = 'notContains',
    equal = 'equal',
    notEqual = 'notEqual',
    beginWith = 'beginWith',
    endWith = 'endWith',
    empty = 'empty',
    notEmpty = 'notEmpty',
    greaterThan = 'greaterThan',
    lessThan = 'lessThan',
    exist = 'exist',
    searchIn = 'searchIn'
}
