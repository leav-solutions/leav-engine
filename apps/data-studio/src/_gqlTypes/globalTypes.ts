/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ApplicationEventTypes {
    DELETE = 'DELETE',
    SAVE = 'SAVE'
}

export enum ApplicationType {
    external = 'external',
    internal = 'internal'
}

export enum AttributeFormat {
    boolean = 'boolean',
    color = 'color',
    date = 'date',
    date_range = 'date_range',
    encrypted = 'encrypted',
    extended = 'extended',
    numeric = 'numeric',
    rich_text = 'rich_text',
    text = 'text'
}

export enum AttributeType {
    advanced = 'advanced',
    advanced_link = 'advanced_link',
    simple = 'simple',
    simple_link = 'simple_link',
    tree = 'tree'
}

export enum FormElementTypes {
    field = 'field',
    layout = 'layout'
}

export enum ImportMode {
    insert = 'insert',
    update = 'update',
    upsert = 'upsert'
}

export enum ImportType {
    IGNORE = 'IGNORE',
    LINK = 'LINK',
    STANDARD = 'STANDARD'
}

export enum LibraryBehavior {
    directories = 'directories',
    files = 'files',
    standard = 'standard'
}

export enum PermissionTypes {
    admin = 'admin',
    application = 'application',
    attribute = 'attribute',
    library = 'library',
    record = 'record',
    record_attribute = 'record_attribute',
    tree = 'tree',
    tree_library = 'tree_library',
    tree_node = 'tree_node'
}

export enum PermissionsActions {
    access_application = 'access_application',
    access_attribute = 'access_attribute',
    access_library = 'access_library',
    access_record = 'access_record',
    access_tree = 'access_tree',
    admin_access_api_keys = 'admin_access_api_keys',
    admin_access_applications = 'admin_access_applications',
    admin_access_attributes = 'admin_access_attributes',
    admin_access_libraries = 'admin_access_libraries',
    admin_access_permissions = 'admin_access_permissions',
    admin_access_tasks = 'admin_access_tasks',
    admin_access_trees = 'admin_access_trees',
    admin_access_version_profiles = 'admin_access_version_profiles',
    admin_application = 'admin_application',
    admin_cancel_task = 'admin_cancel_task',
    admin_create_api_key = 'admin_create_api_key',
    admin_create_application = 'admin_create_application',
    admin_create_attribute = 'admin_create_attribute',
    admin_create_library = 'admin_create_library',
    admin_create_tree = 'admin_create_tree',
    admin_create_version_profile = 'admin_create_version_profile',
    admin_delete_api_key = 'admin_delete_api_key',
    admin_delete_application = 'admin_delete_application',
    admin_delete_attribute = 'admin_delete_attribute',
    admin_delete_library = 'admin_delete_library',
    admin_delete_task = 'admin_delete_task',
    admin_delete_tree = 'admin_delete_tree',
    admin_delete_version_profile = 'admin_delete_version_profile',
    admin_edit_api_key = 'admin_edit_api_key',
    admin_edit_application = 'admin_edit_application',
    admin_edit_attribute = 'admin_edit_attribute',
    admin_edit_global_settings = 'admin_edit_global_settings',
    admin_edit_library = 'admin_edit_library',
    admin_edit_permission = 'admin_edit_permission',
    admin_edit_tree = 'admin_edit_tree',
    admin_edit_version_profile = 'admin_edit_version_profile',
    admin_library = 'admin_library',
    admin_manage_global_preferences = 'admin_manage_global_preferences',
    create_record = 'create_record',
    delete_record = 'delete_record',
    detach = 'detach',
    edit_children = 'edit_children',
    edit_record = 'edit_record',
    edit_value = 'edit_value'
}

export enum RecordFilterCondition {
    BEGIN_WITH = 'BEGIN_WITH',
    BETWEEN = 'BETWEEN',
    CLASSIFIED_IN = 'CLASSIFIED_IN',
    CONTAINS = 'CONTAINS',
    END_AFTER = 'END_AFTER',
    END_BEFORE = 'END_BEFORE',
    END_ON = 'END_ON',
    END_WITH = 'END_WITH',
    EQUAL = 'EQUAL',
    GREATER_THAN = 'GREATER_THAN',
    IS_EMPTY = 'IS_EMPTY',
    IS_NOT_EMPTY = 'IS_NOT_EMPTY',
    LAST_MONTH = 'LAST_MONTH',
    LESS_THAN = 'LESS_THAN',
    NEXT_MONTH = 'NEXT_MONTH',
    NOT_CLASSIFIED_IN = 'NOT_CLASSIFIED_IN',
    NOT_CONTAINS = 'NOT_CONTAINS',
    NOT_EQUAL = 'NOT_EQUAL',
    START_AFTER = 'START_AFTER',
    START_BEFORE = 'START_BEFORE',
    START_ON = 'START_ON',
    TODAY = 'TODAY',
    TOMORROW = 'TOMORROW',
    VALUES_COUNT_EQUAL = 'VALUES_COUNT_EQUAL',
    VALUES_COUNT_GREATER_THAN = 'VALUES_COUNT_GREATER_THAN',
    VALUES_COUNT_LOWER_THAN = 'VALUES_COUNT_LOWER_THAN',
    YESTERDAY = 'YESTERDAY'
}

export enum RecordFilterOperator {
    AND = 'AND',
    CLOSE_BRACKET = 'CLOSE_BRACKET',
    OPEN_BRACKET = 'OPEN_BRACKET',
    OR = 'OR'
}

export enum SortOrder {
    asc = 'asc',
    desc = 'desc'
}

export enum TaskStatus {
    CANCELED = 'CANCELED',
    CREATED = 'CREATED',
    DONE = 'DONE',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    PENDING_CANCEL = 'PENDING_CANCEL',
    RUNNING = 'RUNNING'
}

export enum TaskType {
    EXPORT = 'EXPORT',
    IMPORT_CONFIG = 'IMPORT_CONFIG',
    IMPORT_DATA = 'IMPORT_DATA',
    INDEXATION = 'INDEXATION'
}

export enum TreeBehavior {
    files = 'files',
    standard = 'standard'
}

export enum TreeEventTypes {
    add = 'add',
    move = 'move',
    remove = 'remove'
}

export enum ViewSizes {
    BIG = 'BIG',
    MEDIUM = 'MEDIUM',
    SMALL = 'SMALL'
}

export enum ViewTypes {
    cards = 'cards',
    list = 'list',
    timeline = 'timeline'
}

export interface ApplicationEventFiltersInput {
    ignoreOwnEvents?: boolean | null;
    applicationId?: string | null;
    events?: ApplicationEventTypes[] | null;
}

export interface DeleteTaskInput {
    id: string;
    archive: boolean;
}

export interface CreateRecordDataInput {
    version?: ValueVersionInput[] | null;
    values?: ValueBatchInput[] | null;
}

export interface FileInput {
    data: Upload;
    uid: string;
    size?: number | null;
    replace?: boolean | null;
}

export interface LibrariesFiltersInput {
    id?: string[] | null;
    label?: string[] | null;
    system?: boolean | null;
    behavior?: LibraryBehavior[] | null;
}

export interface Pagination {
    limit: number;
    offset: number;
}

/**
 * Element on which we want to retrieve record or attribute permission. Record ID is mandatory,
 * attributeId is only required for attribute permission
 * libraryId and recordId are mandatory for tree node permission
 */
export interface PermissionTarget {
    attributeId?: string | null;
    recordId?: string | null;
    libraryId?: string | null;
    nodeId?: string | null;
}

export interface RecordFilterInput {
    field?: string | null;
    value?: string | null;
    condition?: RecordFilterCondition | null;
    operator?: RecordFilterOperator | null;
    treeId?: string | null;
}

export interface RecordSortInput {
    field: string;
    order: SortOrder;
}

export interface SheetInput {
    type: ImportType;
    mode: ImportMode;
    library: string;
    mapping?: (string | null)[] | null;
    keyIndex?: number | null;
    linkAttribute?: string | null;
    keyToIndex?: number | null;
    treeLinkLibrary?: string | null;
}

export interface TaskFiltersInput {
    id?: string | null;
    created_by?: string | null;
    status?: TaskStatus | null;
    archive?: boolean | null;
    type?: TaskType | null;
}

export interface TreeElementInput {
    id: string;
    library: string;
}

export interface TreeEventFiltersInput {
    ignoreOwnEvents?: boolean | null;
    treeId: string;
    nodes?: (string | null)[] | null;
    events?: TreeEventTypes[] | null;
}

export interface TreesFiltersInput {
    id?: string[] | null;
    label?: string[] | null;
    system?: boolean | null;
    behavior?: TreeBehavior | null;
    library?: string | null;
}

export interface UploadFiltersInput {
    userId?: string | null;
    uid?: string | null;
}

export interface ValueBatchInput {
    attribute?: string | null;
    id_value?: string | null;
    value?: string | null;
    metadata?: (ValueMetadataInput | null)[] | null;
}

export interface ValueInput {
    id_value?: string | null;
    value?: string | null;
    metadata?: (ValueMetadataInput | null)[] | null;
    version?: (ValueVersionInput | null)[] | null;
}

export interface ValueMetadataInput {
    name: string;
    value?: string | null;
}

export interface ValueVersionInput {
    treeId: string;
    treeNodeId: string;
}

export interface ViewDisplayInput {
    type: ViewTypes;
    size: ViewSizes;
}

export interface ViewInput {
    id?: string | null;
    library: string;
    display: ViewDisplayInput;
    shared: boolean;
    label?: SystemTranslation | null;
    description?: SystemTranslation | null;
    color?: string | null;
    filters?: RecordFilterInput[] | null;
    sort?: RecordSortInput | null;
    valuesVersions?: ViewValuesVersionInput[] | null;
    settings?: ViewSettingsInput[] | null;
}

export interface ViewSettingsInput {
    name: string;
    value?: Any | null;
}

export interface ViewValuesVersionInput {
    treeId: string;
    treeNode: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
