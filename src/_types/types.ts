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

export type IPreview = {
    small: string;
    medium: string;
    big: string;
    pages: string;
} | null;

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

export interface IFilterSeparatorCommon {
    key: number;
    id: string;
}

export interface IFilter extends IFilterSeparatorCommon {
    type: FilterTypes.filter;
    operator?: boolean;
    condition: ConditionFilter;
    value: string;
    attributeId: string;
    active: boolean;
    format?: AttributeFormat;
    originAttributeData?: IOriginAttributeData;
    extendedData?: IExtendedData;
    treeData?: ITreeData;
    valueSize?: number | 'auto';
}

export interface IFilterSeparator extends IFilterSeparatorCommon {
    type: FilterTypes.separator;
    active: boolean;
}

export enum AttributeFormat {
    text = 'text',
    numeric = 'numeric',
    date = 'date',
    encrypted = 'encrypted',
    boolean = 'boolean',
    extended = 'extended'
}

export enum AttributeType {
    simple = 'simple',
    simple_link = 'simple_link',
    advanced = 'advanced',
    advanced_link = 'advanced_link',
    tree = 'tree'
}

export enum OperatorFilter {
    and = 'AND',
    or = 'OR',
    openParent = 'OPEN_BRACKET',
    closeParent = 'CLOSE_BRACKET'
}

export enum ConditionFilter {
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
    condition?: ConditionFilter;
    operator?: OperatorFilter;
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
    library: string;
    type: AttributeType;
    format?: AttributeFormat;
    label: ILabel | string;
    isLink: boolean;
    isMultiple: boolean;
    linkedLibrary?: string;
    linkedTree?: string;
    originAttributeData?: IOriginAttributeData;
}

export type ExtendFormat = string | {[key: string]: ExtendFormat[]};

export interface IExtendedData {
    path: string;
    format: AttributeFormat;
}

export interface IItemsColumn {
    id: string;
    library: string;
    type: AttributeType;
    originAttributeData?: IOriginAttributeData;
    extendedData?: IExtendedData;
    treeData?: ITreeData;
}

export interface ITableHeaderOld {
    name: string;
    display: string;
    type: AttributeType;
}

export interface ITableHeader {
    title: string | any;
    type: AttributeType;
    library: string;
    dataIndex: string;
    key: string;
    width?: number;
    onHeaderCell?: (
        column: any
    ) => {
        width: number;
        onResize: any;
    };
    render: (text: string) => JSX.Element;
}

export interface IRecordEdition {
    show: boolean;
    item?: IItem;
}

export interface IAccordionActive {
    id: string;
    library: string;
    depth: number;
}

export interface IAttributesChecked {
    id: string;
    library: string;
    label: string | ILabel;
    type: AttributeType;
    depth: number;
    checked: boolean;
    originAttributeData?: IOriginAttributeData;
    extendedData?: IExtendedData;
    treeData?: ITreeData;
}

export interface IOriginAttributeData {
    id: string;
    type: AttributeType;
}

export interface ITreeData {
    attributeTreeId: string;
    libraryTypeName: string;
}

export interface IEmbeddedFields {
    id: string;
    format: AttributeFormat;
    label: ILabel;
    embedded_fields: IEmbeddedFields[];
}

export interface IGroupEmbeddedFields {
    [attributeId: string]: {
        embedded_fields: {[key: string]: IEmbeddedFields};
    };
}

export interface IAttributeSelected {
    id: string;
    library: string;
    originAttributeData?: IOriginAttributeData;
    extendedData?: IExtendedData;
    treeData?: ITreeData;
}

export interface ITree {
    id: string;
    label: ILabel;
    libraries: {
        id: string;
        label: ILabel;
    }[];
}

export interface INavigationPath {
    id: string;
    library: string;
    label?: string | null;
}

export enum NotificationType {
    basic = 'basic',
    success = 'success',
    warning = 'warning',
    error = 'error'
}

export enum NotificationPriority {
    low = 'low',
    medium = 'medium',
    high = 'high'
}

export interface IBaseNotification {
    content: string;
    type: NotificationType;
}

export interface INotification extends IBaseNotification {
    time?: number;
    priority?: NotificationPriority;
}

export type ILang = string[];
