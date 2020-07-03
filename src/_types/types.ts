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
        filter: string;
        searchableFields: string;
    };
}

export interface IPreview {
    small: string;
    medium: string;
    big: string;
    pages: string;
}

export interface IItem {
    [x: string]: any;
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

export enum FilterTypes {
    filter = 'filter',
    separator = 'separator'
}

export interface IFilter {
    type: FilterTypes.filter;
    key: number;
    operator?: boolean;
    condition: conditionFilter;
    value: string;
    attribute: string;
    active: boolean;
    format: AttributeFormat;
}

export interface IFilterSeparator {
    type: FilterTypes.separator;
    key: number;
    active: boolean;
}

export enum AttributeFormat {
    text = 'text',
    numeric = 'numeric',
    date = 'date',
    encrypted = 'encrypted',
    boolean = 'boolean'
}

export enum operatorFilter {
    and = 'AND',
    or = 'OR',
    openParent = 'OPEN_BRACKET',
    closeParent = 'CLOSE_BRACKET'
}

export enum conditionFilter {
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

export interface IQueryFilter {
    field?: string;
    value?: any;
    condition?: conditionFilter;
    operator?: operatorFilter;
}

export enum OrderSearch {
    desc = 'desc',
    asc = 'asc'
}

export enum displayListItemTypes {
    listSmall = 'listSmall',
    listMedium = 'listMedium',
    listBig = 'listBig',
    tile = 'tile'
}

export interface IAttribute {
    id: string;
    type: string;
    format: AttributeFormat;
    label: ILabel;
}

export interface IItemsColumn {
    id: string;
}
