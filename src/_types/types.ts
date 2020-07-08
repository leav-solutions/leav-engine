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
    small = 'small',
    medium = 'medium',
    big = 'big',
    pages = 'pages'
}

export enum PreviewSize {
    small = 'small',
    medium = 'medium',
    big = 'big'
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
    attributeId: string;
    active: boolean;
    format?: AttributeFormat;
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

export enum AttributeType {
    simple = 'simple',
    simple_link = 'simple_link',
    advanced = 'advanced',
    advanced_link = 'advanced_link',
    tree = 'tree'
}

export enum operatorFilter {
    and = 'AND',
    or = 'OR',
    openParent = 'OPEN_BRACKET',
    closeParent = 'CLOSE_BRACKET'
}

export enum conditionFilter {
    contains = 'CONTAINS',
    notContains = 'NOT_CONTAINS',
    equal = 'EQUAL',
    notEqual = 'NOT_EQUAL',
    beginWith = 'BEGIN_WITH',
    endWith = 'END_WITH',
    greaterThan = 'GREATER_THAN',
    lessThan = 'LESS_THAN'
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

export enum DisplayListItemTypes {
    listSmall = 'listSmall',
    listMedium = 'listMedium',
    listBig = 'listBig',
    tile = 'tile'
}

export interface IAttribute {
    id: string;
    type: AttributeType;
    format?: AttributeFormat;
    label: ILabel | string;
    isLink: boolean;
    isMultiple: boolean;
}

export interface IItemsColumn {
    id: string;
    type: AttributeType;
}

export interface IRecordEdition {
    show: boolean;
    item?: IItem;
}
