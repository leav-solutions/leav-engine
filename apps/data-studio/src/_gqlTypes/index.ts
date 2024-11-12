// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPreviewScalar} from '@leav/utils';
import {gql} from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends {[key: string]: unknown}> = {[K in keyof T]: T[K]};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {[SubKey in K]?: Maybe<T[SubKey]>};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {[SubKey in K]: Maybe<T[SubKey]>};
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    /** Can be anything */
    Any: any;
    /**
     * The DateTime scalar type represents time data,
     *             represented as an ISO-8601 encoded UTC date string.
     */
    DateTime: any;
    /**
     * Object representing the full tree structure.
     *                             On each node we will have record data and children
     */
    FullTreeContent: any;
    /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
    JSON: any;
    /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
    JSONObject: any;
    /** Object containing all previews available for a record */
    Preview: IPreviewScalar;
    /** System entities fields translation (label...) */
    SystemTranslation: any;
    /** System entities fields translation (label...) */
    SystemTranslationOptional: any;
    TaskPriority: any;
    /** The `Upload` scalar type represents a file upload. */
    Upload: any;
};

export type ActionConfigurationInput = {
    error_message?: InputMaybe<Scalars['SystemTranslationOptional']>;
    id: Scalars['ID'];
    params?: InputMaybe<Array<ActionConfigurationParamInput>>;
};

export type ActionConfigurationParamInput = {
    name: Scalars['String'];
    value: Scalars['String'];
};

export enum ActionIoTypes {
    boolean = 'boolean',
    number = 'number',
    object = 'object',
    string = 'string'
}

export type ActionsListConfigurationInput = {
    deleteValue?: InputMaybe<Array<ActionConfigurationInput>>;
    getValue?: InputMaybe<Array<ActionConfigurationInput>>;
    saveValue?: InputMaybe<Array<ActionConfigurationInput>>;
};

export type ApiKeyInput = {
    expiresAt?: InputMaybe<Scalars['Int']>;
    id?: InputMaybe<Scalars['String']>;
    label: Scalars['String'];
    userId: Scalars['String'];
};

export type ApiKeysFiltersInput = {
    createdBy?: InputMaybe<Scalars['Int']>;
    label?: InputMaybe<Scalars['String']>;
    modifiedBy?: InputMaybe<Scalars['Int']>;
    user_id?: InputMaybe<Scalars['String']>;
};

export enum ApiKeysSortableFields {
    createdAt = 'createdAt',
    createdBy = 'createdBy',
    expiresAt = 'expiresAt',
    label = 'label',
    modifiedAt = 'modifiedAt',
    modifiedBy = 'modifiedBy'
}

export type ApplicationEventFiltersInput = {
    applicationId?: InputMaybe<Scalars['ID']>;
    events?: InputMaybe<Array<ApplicationEventTypes>>;
    ignoreOwnEvents?: InputMaybe<Scalars['Boolean']>;
};

export enum ApplicationEventTypes {
    DELETE = 'DELETE',
    SAVE = 'SAVE'
}

export type ApplicationIconInput = {
    libraryId: Scalars['String'];
    recordId: Scalars['String'];
};

export type ApplicationInput = {
    color?: InputMaybe<Scalars['String']>;
    description?: InputMaybe<Scalars['SystemTranslationOptional']>;
    endpoint?: InputMaybe<Scalars['String']>;
    icon?: InputMaybe<ApplicationIconInput>;
    id: Scalars['ID'];
    label?: InputMaybe<Scalars['SystemTranslation']>;
    module?: InputMaybe<Scalars['String']>;
    settings?: InputMaybe<Scalars['JSONObject']>;
    type?: InputMaybe<ApplicationType>;
};

export enum ApplicationSortableFields {
    endpoint = 'endpoint',
    id = 'id',
    module = 'module',
    system = 'system',
    type = 'type'
}

export enum ApplicationType {
    external = 'external',
    internal = 'internal'
}

export type ApplicationsFiltersInput = {
    endpoint?: InputMaybe<Scalars['String']>;
    id?: InputMaybe<Scalars['ID']>;
    label?: InputMaybe<Scalars['String']>;
    module?: InputMaybe<Scalars['String']>;
    system?: InputMaybe<Scalars['Boolean']>;
    type?: InputMaybe<Array<InputMaybe<ApplicationType>>>;
};

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

export type AttributeInput = {
    actions_list?: InputMaybe<ActionsListConfigurationInput>;
    description?: InputMaybe<Scalars['SystemTranslationOptional']>;
    embedded_fields?: InputMaybe<Array<InputMaybe<EmbeddedAttributeInput>>>;
    format?: InputMaybe<AttributeFormat>;
    id: Scalars['ID'];
    label?: InputMaybe<Scalars['SystemTranslation']>;
    linked_library?: InputMaybe<Scalars['String']>;
    linked_tree?: InputMaybe<Scalars['String']>;
    maxLength?: InputMaybe<Scalars['Int']>;
    metadata_fields?: InputMaybe<Array<Scalars['String']>>;
    multiple_values?: InputMaybe<Scalars['Boolean']>;
    permissions_conf?: InputMaybe<TreepermissionsConfInput>;
    readonly?: InputMaybe<Scalars['Boolean']>;
    required?: InputMaybe<Scalars['Boolean']>;
    reverse_link?: InputMaybe<Scalars['String']>;
    type?: InputMaybe<AttributeType>;
    unique?: InputMaybe<Scalars['Boolean']>;
    values_list?: InputMaybe<ValuesListConfInput>;
    versions_conf?: InputMaybe<ValuesVersionsConfInput>;
};

export type AttributePermissionsRecord = {
    id?: InputMaybe<Scalars['String']>;
    library: Scalars['String'];
};

export enum AttributeType {
    advanced = 'advanced',
    advanced_link = 'advanced_link',
    simple = 'simple',
    simple_link = 'simple_link',
    tree = 'tree'
}

export type AttributesFiltersInput = {
    format?: InputMaybe<Array<InputMaybe<AttributeFormat>>>;
    id?: InputMaybe<Scalars['ID']>;
    label?: InputMaybe<Scalars['String']>;
    libraries?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
    librariesExcluded?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
    multiple_values?: InputMaybe<Scalars['Boolean']>;
    system?: InputMaybe<Scalars['Boolean']>;
    type?: InputMaybe<Array<InputMaybe<AttributeType>>>;
    versionable?: InputMaybe<Scalars['Boolean']>;
};

export enum AttributesSortableFields {
    format = 'format',
    id = 'id',
    linked_library = 'linked_library',
    linked_tree = 'linked_tree',
    multiple_values = 'multiple_values',
    type = 'type'
}

export enum AvailableLanguage {
    en = 'en',
    fr = 'fr'
}

export type CreateRecordDataInput = {
    values?: InputMaybe<Array<ValueBatchInput>>;
    version?: InputMaybe<Array<ValueVersionInput>>;
};

export type DeleteTaskInput = {
    archive: Scalars['Boolean'];
    id: Scalars['ID'];
};

export type EmbeddedAttributeInput = {
    description?: InputMaybe<Scalars['SystemTranslationOptional']>;
    embedded_fields?: InputMaybe<Array<InputMaybe<EmbeddedAttributeInput>>>;
    format?: InputMaybe<AttributeFormat>;
    id: Scalars['ID'];
    label?: InputMaybe<Scalars['SystemTranslation']>;
    validation_regex?: InputMaybe<Scalars['String']>;
};

export type FileInput = {
    data: Scalars['Upload'];
    replace?: InputMaybe<Scalars['Boolean']>;
    size?: InputMaybe<Scalars['Int']>;
    uid: Scalars['String'];
};

export enum FileType {
    audio = 'audio',
    document = 'document',
    image = 'image',
    other = 'other',
    video = 'video'
}

export type FormDependencyValueInput = {
    attribute: Scalars['ID'];
    value: Scalars['ID'];
};

export type FormElementInput = {
    containerId: Scalars['ID'];
    id: Scalars['ID'];
    order: Scalars['Int'];
    settings: Array<FormElementSettingsInput>;
    type: FormElementTypes;
    uiElementType: Scalars['String'];
};

export type FormElementSettingsInput = {
    key: Scalars['String'];
    value: Scalars['Any'];
};

export enum FormElementTypes {
    field = 'field',
    layout = 'layout'
}

export type FormElementsByDepsInput = {
    dependencyValue?: InputMaybe<FormDependencyValueInput>;
    elements: Array<FormElementInput>;
};

export type FormFiltersInput = {
    id?: InputMaybe<Scalars['ID']>;
    label?: InputMaybe<Scalars['String']>;
    library: Scalars['ID'];
    system?: InputMaybe<Scalars['Boolean']>;
};

export type FormInput = {
    dependencyAttributes?: InputMaybe<Array<Scalars['ID']>>;
    elements?: InputMaybe<Array<FormElementsByDepsInput>>;
    id: Scalars['ID'];
    label?: InputMaybe<Scalars['SystemTranslation']>;
    library: Scalars['ID'];
};

export enum FormsSortableFields {
    id = 'id',
    library = 'library',
    system = 'system'
}

export type GlobalSettingsFileInput = {
    library: Scalars['String'];
    recordId: Scalars['String'];
};

export type GlobalSettingsInput = {
    favicon?: InputMaybe<GlobalSettingsFileInput>;
    icon?: InputMaybe<GlobalSettingsFileInput>;
    name?: InputMaybe<Scalars['String']>;
};

export enum IoTypes {
    boolean = 'boolean',
    number = 'number',
    object = 'object',
    string = 'string'
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

export enum InfoChannel {
    passive = 'passive',
    trigger = 'trigger'
}

export enum InfoPriority {
    high = 'high',
    low = 'low',
    medium = 'medium'
}

export enum InfoType {
    basic = 'basic',
    error = 'error',
    success = 'success',
    warning = 'warning'
}

export type LibrariesFiltersInput = {
    behavior?: InputMaybe<Array<LibraryBehavior>>;
    id?: InputMaybe<Array<Scalars['ID']>>;
    label?: InputMaybe<Array<Scalars['String']>>;
    system?: InputMaybe<Scalars['Boolean']>;
};

export enum LibrariesSortableFields {
    behavior = 'behavior',
    id = 'id',
    system = 'system'
}

export enum LibraryBehavior {
    directories = 'directories',
    files = 'files',
    standard = 'standard'
}

export type LibraryIconInput = {
    libraryId: Scalars['String'];
    recordId: Scalars['String'];
};

export type LibraryInput = {
    attributes?: InputMaybe<Array<Scalars['ID']>>;
    behavior?: InputMaybe<LibraryBehavior>;
    defaultView?: InputMaybe<Scalars['ID']>;
    fullTextAttributes?: InputMaybe<Array<Scalars['ID']>>;
    icon?: InputMaybe<LibraryIconInput>;
    id: Scalars['ID'];
    label?: InputMaybe<Scalars['SystemTranslation']>;
    permissions_conf?: InputMaybe<TreepermissionsConfInput>;
    previewsSettings?: InputMaybe<Array<LibraryPreviewsSettingsInput>>;
    recordIdentityConf?: InputMaybe<RecordIdentityConfInput>;
};

export type LibraryPreviewsSettingsInput = {
    description?: InputMaybe<Scalars['SystemTranslationOptional']>;
    label: Scalars['SystemTranslation'];
    versions: PreviewVersionInput;
};

export enum LogAction {
    API_KEY_DELETE = 'API_KEY_DELETE',
    API_KEY_SAVE = 'API_KEY_SAVE',
    APP_DELETE = 'APP_DELETE',
    APP_SAVE = 'APP_SAVE',
    ATTRIBUTE_DELETE = 'ATTRIBUTE_DELETE',
    ATTRIBUTE_SAVE = 'ATTRIBUTE_SAVE',
    CONFIG_IMPORT_END = 'CONFIG_IMPORT_END',
    CONFIG_IMPORT_START = 'CONFIG_IMPORT_START',
    DATA_IMPORT_END = 'DATA_IMPORT_END',
    DATA_IMPORT_START = 'DATA_IMPORT_START',
    EXPORT_END = 'EXPORT_END',
    EXPORT_START = 'EXPORT_START',
    GLOBAL_SETTINGS_SAVE = 'GLOBAL_SETTINGS_SAVE',
    LIBRARY_DELETE = 'LIBRARY_DELETE',
    LIBRARY_PURGE = 'LIBRARY_PURGE',
    LIBRARY_SAVE = 'LIBRARY_SAVE',
    PERMISSION_SAVE = 'PERMISSION_SAVE',
    RECORD_DELETE = 'RECORD_DELETE',
    RECORD_SAVE = 'RECORD_SAVE',
    TASKS_DELETE = 'TASKS_DELETE',
    TREE_ADD_ELEMENT = 'TREE_ADD_ELEMENT',
    TREE_DELETE = 'TREE_DELETE',
    TREE_DELETE_ELEMENT = 'TREE_DELETE_ELEMENT',
    TREE_MOVE_ELEMENT = 'TREE_MOVE_ELEMENT',
    TREE_SAVE = 'TREE_SAVE',
    VALUE_DELETE = 'VALUE_DELETE',
    VALUE_SAVE = 'VALUE_SAVE',
    VERSION_PROFILE_DELETE = 'VERSION_PROFILE_DELETE',
    VERSION_PROFILE_SAVE = 'VERSION_PROFILE_SAVE'
}

export type LogFilterInput = {
    actions?: InputMaybe<Array<LogAction>>;
    instanceId?: InputMaybe<Scalars['String']>;
    queryId?: InputMaybe<Scalars['String']>;
    time?: InputMaybe<LogFilterTimeInput>;
    topic?: InputMaybe<LogTopicFilterInput>;
    trigger?: InputMaybe<Scalars['String']>;
    userId?: InputMaybe<Scalars['String']>;
};

export type LogFilterTimeInput = {
    from?: InputMaybe<Scalars['Int']>;
    to?: InputMaybe<Scalars['Int']>;
};

export type LogSortInput = {
    field: LogSortableField;
    order: SortOrder;
};

export enum LogSortableField {
    action = 'action',
    instanceId = 'instanceId',
    queryId = 'queryId',
    time = 'time',
    trigger = 'trigger',
    userId = 'userId'
}

export type LogTopicFilterInput = {
    apiKey?: InputMaybe<Scalars['String']>;
    attribute?: InputMaybe<Scalars['String']>;
    filename?: InputMaybe<Scalars['String']>;
    library?: InputMaybe<Scalars['String']>;
    permission?: InputMaybe<LogTopicPermissionFilterInput>;
    profile?: InputMaybe<Scalars['String']>;
    record?: InputMaybe<LogTopicRecordFilterInput>;
    tree?: InputMaybe<Scalars['String']>;
};

export type LogTopicPermissionFilterInput = {
    applyTo?: InputMaybe<Scalars['String']>;
    type?: InputMaybe<Scalars['String']>;
};

export type LogTopicRecordFilterInput = {
    id?: InputMaybe<Scalars['String']>;
    libraryId?: InputMaybe<Scalars['String']>;
};

export type Pagination = {
    limit: Scalars['Int'];
    offset: Scalars['Int'];
};

export type PermissionActionInput = {
    allowed?: InputMaybe<Scalars['Boolean']>;
    name: PermissionsActions;
};

export type PermissionInput = {
    actions: Array<PermissionActionInput>;
    applyTo?: InputMaybe<Scalars['ID']>;
    permissionTreeTarget?: InputMaybe<PermissionsTreeTargetInput>;
    type: PermissionTypes;
    usersGroup?: InputMaybe<Scalars['ID']>;
};

export type PermissionTarget = {
    attributeId?: InputMaybe<Scalars['ID']>;
    libraryId?: InputMaybe<Scalars['ID']>;
    nodeId?: InputMaybe<Scalars['ID']>;
    recordId?: InputMaybe<Scalars['ID']>;
};

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

export enum PermissionsRelation {
    and = 'and',
    or = 'or'
}

export type PermissionsTreeTargetInput = {
    nodeId?: InputMaybe<Scalars['ID']>;
    tree: Scalars['ID'];
};

export type PreviewVersionInput = {
    background: Scalars['String'];
    density: Scalars['Int'];
    sizes: Array<PreviewVersionSizeInput>;
};

export type PreviewVersionSizeInput = {
    name: Scalars['String'];
    size: Scalars['Int'];
};

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

export type RecordFilterInput = {
    condition?: InputMaybe<RecordFilterCondition>;
    field?: InputMaybe<Scalars['String']>;
    operator?: InputMaybe<RecordFilterOperator>;
    treeId?: InputMaybe<Scalars['String']>;
    value?: InputMaybe<Scalars['String']>;
};

export enum RecordFilterOperator {
    AND = 'AND',
    CLOSE_BRACKET = 'CLOSE_BRACKET',
    OPEN_BRACKET = 'OPEN_BRACKET',
    OR = 'OR'
}

export type RecordIdentityConfInput = {
    color?: InputMaybe<Scalars['ID']>;
    label?: InputMaybe<Scalars['ID']>;
    preview?: InputMaybe<Scalars['ID']>;
    subLabel?: InputMaybe<Scalars['ID']>;
    treeColorPreview?: InputMaybe<Scalars['ID']>;
};

export type RecordInput = {
    id: Scalars['ID'];
    library: Scalars['String'];
};

export type RecordSortInput = {
    field: Scalars['String'];
    order: SortOrder;
};

export type RecordUpdateFilterInput = {
    ignoreOwnEvents?: InputMaybe<Scalars['Boolean']>;
    libraries?: InputMaybe<Array<Scalars['ID']>>;
    records?: InputMaybe<Array<Scalars['ID']>>;
};

export type RecordsPagination = {
    cursor?: InputMaybe<Scalars['String']>;
    limit: Scalars['Int'];
    offset?: InputMaybe<Scalars['Int']>;
};

export type SheetInput = {
    keyIndex?: InputMaybe<Scalars['Int']>;
    keyToIndex?: InputMaybe<Scalars['Int']>;
    library: Scalars['String'];
    linkAttribute?: InputMaybe<Scalars['String']>;
    mapping?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
    mode: ImportMode;
    treeLinkLibrary?: InputMaybe<Scalars['String']>;
    type: ImportType;
};

export type SortApiKeysInput = {
    field: ApiKeysSortableFields;
    order?: InputMaybe<SortOrder>;
};

export type SortApplications = {
    field: ApplicationSortableFields;
    order?: InputMaybe<SortOrder>;
};

export type SortAttributes = {
    field: AttributesSortableFields;
    order?: InputMaybe<SortOrder>;
};

export type SortForms = {
    field: FormsSortableFields;
    order?: InputMaybe<SortOrder>;
};

export type SortLibraries = {
    field: LibrariesSortableFields;
    order?: InputMaybe<SortOrder>;
};

export enum SortOrder {
    asc = 'asc',
    desc = 'desc'
}

export type SortTrees = {
    field: TreesSortableFields;
    order?: InputMaybe<SortOrder>;
};

export type SortVersionProfilesInput = {
    field: VersionProfilesSortableFields;
    order?: InputMaybe<SortOrder>;
};

export type TaskFiltersInput = {
    archive?: InputMaybe<Scalars['Boolean']>;
    created_by?: InputMaybe<Scalars['ID']>;
    id?: InputMaybe<Scalars['ID']>;
    status?: InputMaybe<TaskStatus>;
    type?: InputMaybe<TaskType>;
};

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

export type TreeElementInput = {
    id: Scalars['ID'];
    library: Scalars['String'];
};

export type TreeEventFiltersInput = {
    events?: InputMaybe<Array<TreeEventTypes>>;
    ignoreOwnEvents?: InputMaybe<Scalars['Boolean']>;
    nodes?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
    treeId: Scalars['ID'];
};

export enum TreeEventTypes {
    add = 'add',
    move = 'move',
    remove = 'remove'
}

export type TreeInput = {
    behavior?: InputMaybe<TreeBehavior>;
    id: Scalars['ID'];
    label?: InputMaybe<Scalars['SystemTranslation']>;
    libraries?: InputMaybe<Array<TreeLibraryInput>>;
    permissions_conf?: InputMaybe<Array<TreeNodePermissionsConfInput>>;
};

export type TreeLibraryInput = {
    library: Scalars['ID'];
    settings: TreeLibrarySettingsInput;
};

export type TreeLibrarySettingsInput = {
    allowMultiplePositions: Scalars['Boolean'];
    allowedAtRoot: Scalars['Boolean'];
    allowedChildren: Array<Scalars['String']>;
};

export type TreeNodePermissionsConfInput = {
    libraryId: Scalars['ID'];
    permissionsConf: TreepermissionsConfInput;
};

export type TreepermissionsConfInput = {
    permissionTreeAttributes: Array<Scalars['ID']>;
    relation: PermissionsRelation;
};

export type TreesFiltersInput = {
    behavior?: InputMaybe<TreeBehavior>;
    id?: InputMaybe<Array<Scalars['ID']>>;
    label?: InputMaybe<Array<Scalars['String']>>;
    library?: InputMaybe<Scalars['String']>;
    system?: InputMaybe<Scalars['Boolean']>;
};

export enum TreesSortableFields {
    behavior = 'behavior',
    id = 'id',
    system = 'system'
}

export type UploadFiltersInput = {
    uid?: InputMaybe<Scalars['String']>;
    userId?: InputMaybe<Scalars['ID']>;
};

export enum UserCoreDataKeys {
    applications_consultation = 'applications_consultation'
}

export type ValueBatchInput = {
    attribute?: InputMaybe<Scalars['ID']>;
    id_value?: InputMaybe<Scalars['ID']>;
    metadata?: InputMaybe<Array<InputMaybe<ValueMetadataInput>>>;
    payload?: InputMaybe<Scalars['String']>;
};

export type ValueInput = {
    id_value?: InputMaybe<Scalars['ID']>;
    metadata?: InputMaybe<Array<InputMaybe<ValueMetadataInput>>>;
    payload?: InputMaybe<Scalars['String']>;
    version?: InputMaybe<Array<InputMaybe<ValueVersionInput>>>;
};

export type ValueMetadataInput = {
    name: Scalars['String'];
    value?: InputMaybe<Scalars['String']>;
};

export type ValueVersionInput = {
    treeId: Scalars['String'];
    treeNodeId: Scalars['String'];
};

export enum ValueVersionMode {
    simple = 'simple',
    smart = 'smart'
}

export type ValuesListConfInput = {
    allowFreeEntry?: InputMaybe<Scalars['Boolean']>;
    allowListUpdate?: InputMaybe<Scalars['Boolean']>;
    enable: Scalars['Boolean'];
    values?: InputMaybe<Array<Scalars['String']>>;
};

export type ValuesVersionsConfInput = {
    mode?: InputMaybe<ValueVersionMode>;
    profile?: InputMaybe<Scalars['String']>;
    versionable: Scalars['Boolean'];
};

export type VersionProfileInput = {
    description?: InputMaybe<Scalars['SystemTranslationOptional']>;
    id: Scalars['String'];
    label?: InputMaybe<Scalars['SystemTranslation']>;
    trees?: InputMaybe<Array<Scalars['String']>>;
};

export type VersionProfilesFiltersInput = {
    id?: InputMaybe<Scalars['ID']>;
    label?: InputMaybe<Scalars['String']>;
    trees?: InputMaybe<Scalars['String']>;
};

export enum VersionProfilesSortableFields {
    id = 'id'
}

export type ViewDisplayInput = {
    size: ViewSizes;
    type: ViewTypes;
};

export type ViewInput = {
    color?: InputMaybe<Scalars['String']>;
    description?: InputMaybe<Scalars['SystemTranslationOptional']>;
    display: ViewDisplayInput;
    filters?: InputMaybe<Array<RecordFilterInput>>;
    id?: InputMaybe<Scalars['String']>;
    label?: InputMaybe<Scalars['SystemTranslation']>;
    library: Scalars['String'];
    settings?: InputMaybe<Array<ViewSettingsInput>>;
    shared: Scalars['Boolean'];
    sort?: InputMaybe<RecordSortInput>;
    valuesVersions?: InputMaybe<Array<ViewValuesVersionInput>>;
};

export type ViewSettingsInput = {
    name: Scalars['String'];
    value?: InputMaybe<Scalars['Any']>;
};

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

export type ViewValuesVersionInput = {
    treeId: Scalars['String'];
    treeNode: Scalars['String'];
};

export type ApplicationDetailsFragment = {
    id: string;
    label: any;
    type: ApplicationType;
    description?: any | null;
    endpoint?: string | null;
    url?: string | null;
    color?: string | null;
    module?: string | null;
    settings?: any | null;
    icon?: {
        id: string;
        whoAmI: {
            id: string;
            label?: string | null;
            subLabel?: string | null;
            color?: string | null;
            preview?: IPreviewScalar | null;
            library: {id: string; behavior: LibraryBehavior; label?: any | null};
        };
    } | null;
    permissions: {access_application: boolean; admin_application: boolean};
};

export type RecordIdentityFragment = {
    id: string;
    whoAmI: {
        id: string;
        label?: string | null;
        subLabel?: string | null;
        color?: string | null;
        preview?: IPreviewScalar | null;
        library: {id: string; behavior: LibraryBehavior; label?: any | null};
    };
};

export type CancelTaskMutationVariables = Exact<{
    taskId: Scalars['ID'];
}>;

export type CancelTaskMutation = {cancelTask: boolean};

export type DeleteTasksMutationVariables = Exact<{
    tasks: Array<DeleteTaskInput> | DeleteTaskInput;
}>;

export type DeleteTasksMutation = {deleteTasks: boolean};

export type AddTreeElementMutationVariables = Exact<{
    treeId: Scalars['ID'];
    element: TreeElementInput;
    parent?: InputMaybe<Scalars['ID']>;
    order?: InputMaybe<Scalars['Int']>;
}>;

export type AddTreeElementMutation = {treeAddElement: {id: string}};

export type MoveTreeElementMutationVariables = Exact<{
    treeId: Scalars['ID'];
    nodeId: Scalars['ID'];
    parentTo?: InputMaybe<Scalars['ID']>;
    order?: InputMaybe<Scalars['Int']>;
}>;

export type MoveTreeElementMutation = {treeMoveElement: {id: string}};

export type RemoveTreeElementMutationVariables = Exact<{
    treeId: Scalars['ID'];
    nodeId: Scalars['ID'];
    deleteChildren?: InputMaybe<Scalars['Boolean']>;
}>;

export type RemoveTreeElementMutation = {treeDeleteElement: string};

export type SaveUserDataMutationVariables = Exact<{
    key: Scalars['String'];
    value?: InputMaybe<Scalars['Any']>;
    global: Scalars['Boolean'];
}>;

export type SaveUserDataMutation = {saveUserData: {global: boolean; data?: any | null}};

export type GetApplicationByEndpointQueryVariables = Exact<{
    endpoint: Scalars['String'];
}>;

export type GetApplicationByEndpointQuery = {
    applications?: {
        list: Array<{
            id: string;
            label: any;
            type: ApplicationType;
            description?: any | null;
            endpoint?: string | null;
            url?: string | null;
            color?: string | null;
            module?: string | null;
            settings?: any | null;
            icon?: {
                id: string;
                whoAmI: {
                    id: string;
                    label?: string | null;
                    subLabel?: string | null;
                    color?: string | null;
                    preview?: IPreviewScalar | null;
                    library: {id: string; behavior: LibraryBehavior; label?: any | null};
                };
            } | null;
            permissions: {access_application: boolean; admin_application: boolean};
        }>;
    } | null;
};

export type GetApplicationsQueryVariables = Exact<{[key: string]: never}>;

export type GetApplicationsQuery = {
    applications?: {
        list: Array<{
            id: string;
            label: any;
            description?: any | null;
            endpoint?: string | null;
            url?: string | null;
            color?: string | null;
            icon?: {
                id: string;
                whoAmI: {
                    id: string;
                    label?: string | null;
                    subLabel?: string | null;
                    color?: string | null;
                    preview?: IPreviewScalar | null;
                    library: {id: string; behavior: LibraryBehavior; label?: any | null};
                };
            } | null;
        }>;
    } | null;
};

export type GetActiveLibraryQueryVariables = Exact<{[key: string]: never}>;

export type GetActiveLibraryQuery = {
    activeLib?: {
        id: string;
        name: string;
        behavior: LibraryBehavior;
        attributes: Array<any | null>;
        trees: Array<string | null>;
        permissions: {
            access_library: boolean;
            access_record: boolean;
            create_record: boolean;
            edit_record: boolean;
            delete_record: boolean;
        };
    } | null;
};

export type GetActiveTreeQueryVariables = Exact<{[key: string]: never}>;

export type GetActiveTreeQuery = {
    activeTree?: {
        id: string;
        behavior: TreeBehavior;
        label: string;
        libraries: Array<{id: string; behavior: LibraryBehavior}>;
        permissions: {access_tree: boolean; edit_children: boolean};
    } | null;
};

export type GetLangsQueryVariables = Exact<{[key: string]: never}>;

export type GetLangsQuery = {langs: Array<string | null>};

export type GetGlobalSettingsQueryVariables = Exact<{[key: string]: never}>;

export type GetGlobalSettingsQuery = {
    globalSettings: {
        name: string;
        icon?: {
            id: string;
            whoAmI: {
                id: string;
                label?: string | null;
                subLabel?: string | null;
                color?: string | null;
                preview?: IPreviewScalar | null;
                library: {id: string; behavior: LibraryBehavior; label?: any | null};
            };
        } | null;
    };
};

export type GetLibrariesListQueryVariables = Exact<{
    filters?: InputMaybe<LibrariesFiltersInput>;
}>;

export type GetLibrariesListQuery = {
    libraries?: {
        list: Array<{
            id: string;
            label?: any | null;
            behavior: LibraryBehavior;
            icon?: {
                id: string;
                whoAmI: {
                    id: string;
                    label?: string | null;
                    subLabel?: string | null;
                    color?: string | null;
                    preview?: IPreviewScalar | null;
                    library: {id: string; behavior: LibraryBehavior; label?: any | null};
                };
            } | null;
            previewsSettings?: Array<{
                description?: any | null;
                label: any;
                system: boolean;
                versions: {background: string; density: number; sizes: Array<{name: string; size: number}>};
            }> | null;
            permissions?: {
                access_library: boolean;
                access_record: boolean;
                create_record: boolean;
                edit_record: boolean;
                delete_record: boolean;
            } | null;
        }>;
    } | null;
};

export type GetLibraryPermissionsQueryVariables = Exact<{
    libraryId?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;

export type GetLibraryPermissionsQuery = {
    libraries?: {
        list: Array<{
            permissions?: {
                access_library: boolean;
                access_record: boolean;
                create_record: boolean;
                edit_record: boolean;
                delete_record: boolean;
            } | null;
        }>;
    } | null;
};

export type IsAllowedQueryVariables = Exact<{
    type: PermissionTypes;
    actions: Array<PermissionsActions> | PermissionsActions;
    applyTo?: InputMaybe<Scalars['ID']>;
    target?: InputMaybe<PermissionTarget>;
}>;

export type IsAllowedQuery = {isAllowed?: Array<{name: PermissionsActions; allowed?: boolean | null}> | null};

export type GetTasksQueryVariables = Exact<{
    filters?: InputMaybe<TaskFiltersInput>;
}>;

export type GetTasksQuery = {
    tasks: {
        totalCount: number;
        list: Array<{
            id: string;
            label: any;
            modified_at: number;
            created_at: number;
            startAt: number;
            status: TaskStatus;
            priority: any;
            startedAt?: number | null;
            completedAt?: number | null;
            archive: boolean;
            created_by: {
                id: string;
                whoAmI: {
                    id: string;
                    label?: string | null;
                    subLabel?: string | null;
                    color?: string | null;
                    preview?: IPreviewScalar | null;
                    library: {id: string; behavior: LibraryBehavior; label?: any | null};
                };
            };
            role?: {type: TaskType; detail?: string | null} | null;
            progress?: {percent?: number | null; description?: any | null} | null;
            link?: {name: string; url: string} | null;
            canceledBy?: {
                id: string;
                whoAmI: {
                    id: string;
                    label?: string | null;
                    subLabel?: string | null;
                    color?: string | null;
                    preview?: IPreviewScalar | null;
                    library: {id: string; behavior: LibraryBehavior; label?: any | null};
                };
            } | null;
        }>;
    };
};

export type GetTreeAttributesQueryQueryVariables = Exact<{
    treeId?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;

export type GetTreeAttributesQueryQuery = {
    trees?: {
        list: Array<{
            id: string;
            libraries: Array<{
                library: {
                    id: string;
                    label?: any | null;
                    attributes?: Array<
                        | {
                              id: string;
                              type: AttributeType;
                              format?: AttributeFormat | null;
                              label?: any | null;
                              multiple_values: boolean;
                              linked_library?: {id: string} | null;
                          }
                        | {
                              id: string;
                              type: AttributeType;
                              format?: AttributeFormat | null;
                              label?: any | null;
                              multiple_values: boolean;
                              embedded_fields?: Array<{
                                  id: string;
                                  format?: AttributeFormat | null;
                                  label?: any | null;
                              } | null> | null;
                          }
                        | {
                              id: string;
                              type: AttributeType;
                              format?: AttributeFormat | null;
                              label?: any | null;
                              multiple_values: boolean;
                              linked_tree?: {id: string; label?: any | null} | null;
                          }
                    > | null;
                };
            }>;
        }>;
    } | null;
};

export type GetTreeLibrariesQueryVariables = Exact<{
    treeId?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
    library?: InputMaybe<Scalars['String']>;
}>;

export type GetTreeLibrariesQuery = {
    trees?: {
        totalCount: number;
        list: Array<{
            id: string;
            behavior: TreeBehavior;
            system: boolean;
            libraries: Array<{
                library: {id: string; label?: any | null; behavior: LibraryBehavior; system?: boolean | null};
                settings: {allowMultiplePositions: boolean; allowedChildren: Array<string>; allowedAtRoot: boolean};
            }>;
        }>;
    } | null;
};

export type GetTreesQueryVariables = Exact<{
    filters?: InputMaybe<TreesFiltersInput>;
}>;

export type GetTreesQuery = {
    trees?: {
        list: Array<{
            id: string;
            label?: any | null;
            behavior: TreeBehavior;
            libraries: Array<{library: {id: string; label?: any | null; behavior: LibraryBehavior}}>;
            permissions: {access_tree: boolean; edit_children: boolean};
        }>;
    } | null;
};

export type TreeNodeChildrenQueryVariables = Exact<{
    treeId: Scalars['ID'];
    node?: InputMaybe<Scalars['ID']>;
    pagination?: InputMaybe<Pagination>;
}>;

export type TreeNodeChildrenQuery = {
    treeNodeChildren: {
        totalCount?: number | null;
        list: Array<{
            id: string;
            childrenCount?: number | null;
            record: {
                id: string;
                whoAmI: {
                    id: string;
                    label?: string | null;
                    subLabel?: string | null;
                    color?: string | null;
                    preview?: IPreviewScalar | null;
                    library: {id: string; behavior: LibraryBehavior; label?: any | null};
                };
                active: Array<{value?: any | null}>;
            };
            permissions: {access_tree: boolean; detach: boolean; edit_children: boolean};
        }>;
    };
};

export type GetUserDataQueryVariables = Exact<{
    keys: Array<Scalars['String']> | Scalars['String'];
    global?: InputMaybe<Scalars['Boolean']>;
}>;

export type GetUserDataQuery = {userData: {global: boolean; data?: any | null}};

export type MeQueryVariables = Exact<{[key: string]: never}>;

export type MeQuery = {
    me?: {
        id: string;
        whoAmI: {
            id: string;
            label?: string | null;
            subLabel?: string | null;
            color?: string | null;
            preview?: IPreviewScalar | null;
            library: {id: string; behavior: LibraryBehavior; label?: any | null};
        };
    } | null;
};

export type ApplicationEventsSubscriptionVariables = Exact<{
    filters?: InputMaybe<ApplicationEventFiltersInput>;
}>;

export type ApplicationEventsSubscription = {
    applicationEvent: {
        type: ApplicationEventTypes;
        application: {
            id: string;
            label: any;
            type: ApplicationType;
            description?: any | null;
            endpoint?: string | null;
            url?: string | null;
            color?: string | null;
            module?: string | null;
            settings?: any | null;
            icon?: {
                id: string;
                whoAmI: {
                    id: string;
                    label?: string | null;
                    subLabel?: string | null;
                    color?: string | null;
                    preview?: IPreviewScalar | null;
                    library: {id: string; behavior: LibraryBehavior; label?: any | null};
                };
            } | null;
            permissions: {access_application: boolean; admin_application: boolean};
        };
    };
};

export type SubTasksUpdateSubscriptionVariables = Exact<{
    filters?: InputMaybe<TaskFiltersInput>;
}>;

export type SubTasksUpdateSubscription = {
    task: {
        id: string;
        label: any;
        modified_at: number;
        created_at: number;
        startAt: number;
        status: TaskStatus;
        priority: any;
        startedAt?: number | null;
        completedAt?: number | null;
        archive: boolean;
        created_by: {
            id: string;
            whoAmI: {
                id: string;
                label?: string | null;
                subLabel?: string | null;
                color?: string | null;
                preview?: IPreviewScalar | null;
                library: {id: string; behavior: LibraryBehavior; label?: any | null};
            };
        };
        role?: {type: TaskType; detail?: string | null} | null;
        progress?: {percent?: number | null; description?: any | null} | null;
        link?: {name: string; url: string} | null;
        canceledBy?: {
            id: string;
            whoAmI: {
                id: string;
                label?: string | null;
                subLabel?: string | null;
                color?: string | null;
                preview?: IPreviewScalar | null;
                library: {id: string; behavior: LibraryBehavior; label?: any | null};
            };
        } | null;
    };
};

export type TreeEventsSubscriptionVariables = Exact<{
    filters?: InputMaybe<TreeEventFiltersInput>;
}>;

export type TreeEventsSubscription = {
    treeEvent: {
        type: TreeEventTypes;
        treeId: string;
        element: {
            id: string;
            childrenCount?: number | null;
            record: {
                id: string;
                whoAmI: {
                    id: string;
                    label?: string | null;
                    subLabel?: string | null;
                    color?: string | null;
                    preview?: IPreviewScalar | null;
                    library: {id: string; behavior: LibraryBehavior; label?: any | null};
                };
            };
            permissions: {access_tree: boolean; detach: boolean; edit_children: boolean};
        };
        parentNode?: {id: string} | null;
        parentNodeBefore?: {id: string} | null;
    };
};

export const RecordIdentityFragmentDoc = gql`
    fragment RecordIdentity on Record {
        id
        whoAmI {
            id
            label
            subLabel
            color
            library {
                id
                behavior
                label
            }
            preview
        }
    }
`;
export const ApplicationDetailsFragmentDoc = gql`
    fragment ApplicationDetails on Application {
        id
        label
        type
        description
        endpoint
        url
        color
        icon {
            ...RecordIdentity
        }
        module
        permissions {
            access_application
            admin_application
        }
        settings
    }
    ${RecordIdentityFragmentDoc}
`;
export const CancelTaskDocument = gql`
    mutation CANCEL_TASK($taskId: ID!) {
        cancelTask(taskId: $taskId)
    }
`;
export type CancelTaskMutationFn = Apollo.MutationFunction<CancelTaskMutation, CancelTaskMutationVariables>;

/**
 * __useCancelTaskMutation__
 *
 * To run a mutation, you first call `useCancelTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelTaskMutation, { data, loading, error }] = useCancelTaskMutation({
 *   variables: {
 *      taskId: // value for 'taskId'
 *   },
 * });
 */
export function useCancelTaskMutation(
    baseOptions?: Apollo.MutationHookOptions<CancelTaskMutation, CancelTaskMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<CancelTaskMutation, CancelTaskMutationVariables>(CancelTaskDocument, options);
}
export type CancelTaskMutationHookResult = ReturnType<typeof useCancelTaskMutation>;
export type CancelTaskMutationResult = Apollo.MutationResult<CancelTaskMutation>;
export type CancelTaskMutationOptions = Apollo.BaseMutationOptions<CancelTaskMutation, CancelTaskMutationVariables>;
export const DeleteTasksDocument = gql`
    mutation DELETE_TASKS($tasks: [DeleteTaskInput!]!) {
        deleteTasks(tasks: $tasks)
    }
`;
export type DeleteTasksMutationFn = Apollo.MutationFunction<DeleteTasksMutation, DeleteTasksMutationVariables>;

/**
 * __useDeleteTasksMutation__
 *
 * To run a mutation, you first call `useDeleteTasksMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTasksMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTasksMutation, { data, loading, error }] = useDeleteTasksMutation({
 *   variables: {
 *      tasks: // value for 'tasks'
 *   },
 * });
 */
export function useDeleteTasksMutation(
    baseOptions?: Apollo.MutationHookOptions<DeleteTasksMutation, DeleteTasksMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<DeleteTasksMutation, DeleteTasksMutationVariables>(DeleteTasksDocument, options);
}
export type DeleteTasksMutationHookResult = ReturnType<typeof useDeleteTasksMutation>;
export type DeleteTasksMutationResult = Apollo.MutationResult<DeleteTasksMutation>;
export type DeleteTasksMutationOptions = Apollo.BaseMutationOptions<DeleteTasksMutation, DeleteTasksMutationVariables>;
export const AddTreeElementDocument = gql`
    mutation ADD_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parent: ID, $order: Int) {
        treeAddElement(treeId: $treeId, element: $element, parent: $parent, order: $order) {
            id
        }
    }
`;
export type AddTreeElementMutationFn = Apollo.MutationFunction<AddTreeElementMutation, AddTreeElementMutationVariables>;

/**
 * __useAddTreeElementMutation__
 *
 * To run a mutation, you first call `useAddTreeElementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTreeElementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTreeElementMutation, { data, loading, error }] = useAddTreeElementMutation({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      element: // value for 'element'
 *      parent: // value for 'parent'
 *      order: // value for 'order'
 *   },
 * });
 */
export function useAddTreeElementMutation(
    baseOptions?: Apollo.MutationHookOptions<AddTreeElementMutation, AddTreeElementMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<AddTreeElementMutation, AddTreeElementMutationVariables>(AddTreeElementDocument, options);
}
export type AddTreeElementMutationHookResult = ReturnType<typeof useAddTreeElementMutation>;
export type AddTreeElementMutationResult = Apollo.MutationResult<AddTreeElementMutation>;
export type AddTreeElementMutationOptions = Apollo.BaseMutationOptions<
    AddTreeElementMutation,
    AddTreeElementMutationVariables
>;
export const MoveTreeElementDocument = gql`
    mutation MOVE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $parentTo: ID, $order: Int) {
        treeMoveElement(treeId: $treeId, nodeId: $nodeId, parentTo: $parentTo, order: $order) {
            id
        }
    }
`;
export type MoveTreeElementMutationFn = Apollo.MutationFunction<
    MoveTreeElementMutation,
    MoveTreeElementMutationVariables
>;

/**
 * __useMoveTreeElementMutation__
 *
 * To run a mutation, you first call `useMoveTreeElementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveTreeElementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveTreeElementMutation, { data, loading, error }] = useMoveTreeElementMutation({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      nodeId: // value for 'nodeId'
 *      parentTo: // value for 'parentTo'
 *      order: // value for 'order'
 *   },
 * });
 */
export function useMoveTreeElementMutation(
    baseOptions?: Apollo.MutationHookOptions<MoveTreeElementMutation, MoveTreeElementMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<MoveTreeElementMutation, MoveTreeElementMutationVariables>(
        MoveTreeElementDocument,
        options
    );
}
export type MoveTreeElementMutationHookResult = ReturnType<typeof useMoveTreeElementMutation>;
export type MoveTreeElementMutationResult = Apollo.MutationResult<MoveTreeElementMutation>;
export type MoveTreeElementMutationOptions = Apollo.BaseMutationOptions<
    MoveTreeElementMutation,
    MoveTreeElementMutationVariables
>;
export const RemoveTreeElementDocument = gql`
    mutation REMOVE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $deleteChildren: Boolean) {
        treeDeleteElement(treeId: $treeId, nodeId: $nodeId, deleteChildren: $deleteChildren)
    }
`;
export type RemoveTreeElementMutationFn = Apollo.MutationFunction<
    RemoveTreeElementMutation,
    RemoveTreeElementMutationVariables
>;

/**
 * __useRemoveTreeElementMutation__
 *
 * To run a mutation, you first call `useRemoveTreeElementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveTreeElementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeTreeElementMutation, { data, loading, error }] = useRemoveTreeElementMutation({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      nodeId: // value for 'nodeId'
 *      deleteChildren: // value for 'deleteChildren'
 *   },
 * });
 */
export function useRemoveTreeElementMutation(
    baseOptions?: Apollo.MutationHookOptions<RemoveTreeElementMutation, RemoveTreeElementMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<RemoveTreeElementMutation, RemoveTreeElementMutationVariables>(
        RemoveTreeElementDocument,
        options
    );
}
export type RemoveTreeElementMutationHookResult = ReturnType<typeof useRemoveTreeElementMutation>;
export type RemoveTreeElementMutationResult = Apollo.MutationResult<RemoveTreeElementMutation>;
export type RemoveTreeElementMutationOptions = Apollo.BaseMutationOptions<
    RemoveTreeElementMutation,
    RemoveTreeElementMutationVariables
>;
export const SaveUserDataDocument = gql`
    mutation SAVE_USER_DATA($key: String!, $value: Any, $global: Boolean!) {
        saveUserData(key: $key, value: $value, global: $global) {
            global
            data
        }
    }
`;
export type SaveUserDataMutationFn = Apollo.MutationFunction<SaveUserDataMutation, SaveUserDataMutationVariables>;

/**
 * __useSaveUserDataMutation__
 *
 * To run a mutation, you first call `useSaveUserDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveUserDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveUserDataMutation, { data, loading, error }] = useSaveUserDataMutation({
 *   variables: {
 *      key: // value for 'key'
 *      value: // value for 'value'
 *      global: // value for 'global'
 *   },
 * });
 */
export function useSaveUserDataMutation(
    baseOptions?: Apollo.MutationHookOptions<SaveUserDataMutation, SaveUserDataMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<SaveUserDataMutation, SaveUserDataMutationVariables>(SaveUserDataDocument, options);
}
export type SaveUserDataMutationHookResult = ReturnType<typeof useSaveUserDataMutation>;
export type SaveUserDataMutationResult = Apollo.MutationResult<SaveUserDataMutation>;
export type SaveUserDataMutationOptions = Apollo.BaseMutationOptions<
    SaveUserDataMutation,
    SaveUserDataMutationVariables
>;
export const GetApplicationByEndpointDocument = gql`
    query GET_APPLICATION_BY_ENDPOINT($endpoint: String!) {
        applications(filters: {endpoint: $endpoint}) {
            list {
                ...ApplicationDetails
            }
        }
    }
    ${ApplicationDetailsFragmentDoc}
`;

/**
 * __useGetApplicationByEndpointQuery__
 *
 * To run a query within a React component, call `useGetApplicationByEndpointQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApplicationByEndpointQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApplicationByEndpointQuery({
 *   variables: {
 *      endpoint: // value for 'endpoint'
 *   },
 * });
 */
export function useGetApplicationByEndpointQuery(
    baseOptions: Apollo.QueryHookOptions<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>(
        GetApplicationByEndpointDocument,
        options
    );
}
export function useGetApplicationByEndpointLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>(
        GetApplicationByEndpointDocument,
        options
    );
}
export type GetApplicationByEndpointQueryHookResult = ReturnType<typeof useGetApplicationByEndpointQuery>;
export type GetApplicationByEndpointLazyQueryHookResult = ReturnType<typeof useGetApplicationByEndpointLazyQuery>;
export type GetApplicationByEndpointQueryResult = Apollo.QueryResult<
    GetApplicationByEndpointQuery,
    GetApplicationByEndpointQueryVariables
>;
export const GetApplicationsDocument = gql`
    query GET_APPLICATIONS {
        applications {
            list {
                id
                label
                description
                endpoint
                url
                color
                icon {
                    ...RecordIdentity
                }
            }
        }
    }
    ${RecordIdentityFragmentDoc}
`;

/**
 * __useGetApplicationsQuery__
 *
 * To run a query within a React component, call `useGetApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApplicationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetApplicationsQuery(
    baseOptions?: Apollo.QueryHookOptions<GetApplicationsQuery, GetApplicationsQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetApplicationsQuery, GetApplicationsQueryVariables>(GetApplicationsDocument, options);
}
export function useGetApplicationsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationsQuery, GetApplicationsQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetApplicationsQuery, GetApplicationsQueryVariables>(GetApplicationsDocument, options);
}
export type GetApplicationsQueryHookResult = ReturnType<typeof useGetApplicationsQuery>;
export type GetApplicationsLazyQueryHookResult = ReturnType<typeof useGetApplicationsLazyQuery>;
export type GetApplicationsQueryResult = Apollo.QueryResult<GetApplicationsQuery, GetApplicationsQueryVariables>;
export const GetActiveLibraryDocument = gql`
    query GET_ACTIVE_LIBRARY {
        activeLib @client {
            id @client
            name @client
            behavior @client
            attributes @client
            trees
            permissions @client {
                access_library @client
                access_record @client
                create_record @client
                edit_record @client
                delete_record @client
            }
        }
    }
`;

/**
 * __useGetActiveLibraryQuery__
 *
 * To run a query within a React component, call `useGetActiveLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveLibraryQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveLibraryQuery(
    baseOptions?: Apollo.QueryHookOptions<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>(GetActiveLibraryDocument, options);
}
export function useGetActiveLibraryLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>(
        GetActiveLibraryDocument,
        options
    );
}
export type GetActiveLibraryQueryHookResult = ReturnType<typeof useGetActiveLibraryQuery>;
export type GetActiveLibraryLazyQueryHookResult = ReturnType<typeof useGetActiveLibraryLazyQuery>;
export type GetActiveLibraryQueryResult = Apollo.QueryResult<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>;
export const GetActiveTreeDocument = gql`
    query GET_ACTIVE_TREE {
        activeTree @client {
            id @client
            behavior @client
            libraries @client {
                id @client
                behavior @client
            }
            label @client
            permissions @client {
                access_tree @client
                edit_children @client
            }
        }
    }
`;

/**
 * __useGetActiveTreeQuery__
 *
 * To run a query within a React component, call `useGetActiveTreeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveTreeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveTreeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveTreeQuery(
    baseOptions?: Apollo.QueryHookOptions<GetActiveTreeQuery, GetActiveTreeQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetActiveTreeQuery, GetActiveTreeQueryVariables>(GetActiveTreeDocument, options);
}
export function useGetActiveTreeLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetActiveTreeQuery, GetActiveTreeQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetActiveTreeQuery, GetActiveTreeQueryVariables>(GetActiveTreeDocument, options);
}
export type GetActiveTreeQueryHookResult = ReturnType<typeof useGetActiveTreeQuery>;
export type GetActiveTreeLazyQueryHookResult = ReturnType<typeof useGetActiveTreeLazyQuery>;
export type GetActiveTreeQueryResult = Apollo.QueryResult<GetActiveTreeQuery, GetActiveTreeQueryVariables>;
export const GetLangsDocument = gql`
    query GET_LANGS {
        langs
    }
`;

/**
 * __useGetLangsQuery__
 *
 * To run a query within a React component, call `useGetLangsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLangsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLangsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLangsQuery(baseOptions?: Apollo.QueryHookOptions<GetLangsQuery, GetLangsQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetLangsQuery, GetLangsQueryVariables>(GetLangsDocument, options);
}
export function useGetLangsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLangsQuery, GetLangsQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetLangsQuery, GetLangsQueryVariables>(GetLangsDocument, options);
}
export type GetLangsQueryHookResult = ReturnType<typeof useGetLangsQuery>;
export type GetLangsLazyQueryHookResult = ReturnType<typeof useGetLangsLazyQuery>;
export type GetLangsQueryResult = Apollo.QueryResult<GetLangsQuery, GetLangsQueryVariables>;
export const GetGlobalSettingsDocument = gql`
    query GET_GLOBAL_SETTINGS {
        globalSettings {
            name
            icon {
                id
                ...RecordIdentity
            }
        }
    }
    ${RecordIdentityFragmentDoc}
`;

/**
 * __useGetGlobalSettingsQuery__
 *
 * To run a query within a React component, call `useGetGlobalSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalSettingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGlobalSettingsQuery(
    baseOptions?: Apollo.QueryHookOptions<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>(GetGlobalSettingsDocument, options);
}
export function useGetGlobalSettingsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>(
        GetGlobalSettingsDocument,
        options
    );
}
export type GetGlobalSettingsQueryHookResult = ReturnType<typeof useGetGlobalSettingsQuery>;
export type GetGlobalSettingsLazyQueryHookResult = ReturnType<typeof useGetGlobalSettingsLazyQuery>;
export type GetGlobalSettingsQueryResult = Apollo.QueryResult<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>;
export const GetLibrariesListDocument = gql`
    query GET_LIBRARIES_LIST($filters: LibrariesFiltersInput) {
        libraries(filters: $filters) {
            list {
                id
                label
                behavior
                icon {
                    ...RecordIdentity
                }
                previewsSettings {
                    description
                    label
                    system
                    versions {
                        background
                        density
                        sizes {
                            name
                            size
                        }
                    }
                }
                permissions {
                    access_library
                    access_record
                    create_record
                    edit_record
                    delete_record
                }
            }
        }
    }
    ${RecordIdentityFragmentDoc}
`;

/**
 * __useGetLibrariesListQuery__
 *
 * To run a query within a React component, call `useGetLibrariesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibrariesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibrariesListQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetLibrariesListQuery(
    baseOptions?: Apollo.QueryHookOptions<GetLibrariesListQuery, GetLibrariesListQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetLibrariesListQuery, GetLibrariesListQueryVariables>(GetLibrariesListDocument, options);
}
export function useGetLibrariesListLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetLibrariesListQuery, GetLibrariesListQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetLibrariesListQuery, GetLibrariesListQueryVariables>(
        GetLibrariesListDocument,
        options
    );
}
export type GetLibrariesListQueryHookResult = ReturnType<typeof useGetLibrariesListQuery>;
export type GetLibrariesListLazyQueryHookResult = ReturnType<typeof useGetLibrariesListLazyQuery>;
export type GetLibrariesListQueryResult = Apollo.QueryResult<GetLibrariesListQuery, GetLibrariesListQueryVariables>;
export const GetLibraryPermissionsDocument = gql`
    query GET_LIBRARY_PERMISSIONS($libraryId: [ID!]) {
        libraries(filters: {id: $libraryId}) {
            list {
                permissions {
                    access_library
                    access_record
                    create_record
                    edit_record
                    delete_record
                }
            }
        }
    }
`;

/**
 * __useGetLibraryPermissionsQuery__
 *
 * To run a query within a React component, call `useGetLibraryPermissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibraryPermissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibraryPermissionsQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useGetLibraryPermissionsQuery(
    baseOptions?: Apollo.QueryHookOptions<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>(
        GetLibraryPermissionsDocument,
        options
    );
}
export function useGetLibraryPermissionsLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>(
        GetLibraryPermissionsDocument,
        options
    );
}
export type GetLibraryPermissionsQueryHookResult = ReturnType<typeof useGetLibraryPermissionsQuery>;
export type GetLibraryPermissionsLazyQueryHookResult = ReturnType<typeof useGetLibraryPermissionsLazyQuery>;
export type GetLibraryPermissionsQueryResult = Apollo.QueryResult<
    GetLibraryPermissionsQuery,
    GetLibraryPermissionsQueryVariables
>;
export const IsAllowedDocument = gql`
    query IS_ALLOWED(
        $type: PermissionTypes!
        $actions: [PermissionsActions!]!
        $applyTo: ID
        $target: PermissionTarget
    ) {
        isAllowed(type: $type, actions: $actions, applyTo: $applyTo, target: $target) {
            name
            allowed
        }
    }
`;

/**
 * __useIsAllowedQuery__
 *
 * To run a query within a React component, call `useIsAllowedQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsAllowedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsAllowedQuery({
 *   variables: {
 *      type: // value for 'type'
 *      actions: // value for 'actions'
 *      applyTo: // value for 'applyTo'
 *      target: // value for 'target'
 *   },
 * });
 */
export function useIsAllowedQuery(baseOptions: Apollo.QueryHookOptions<IsAllowedQuery, IsAllowedQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<IsAllowedQuery, IsAllowedQueryVariables>(IsAllowedDocument, options);
}
export function useIsAllowedLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<IsAllowedQuery, IsAllowedQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<IsAllowedQuery, IsAllowedQueryVariables>(IsAllowedDocument, options);
}
export type IsAllowedQueryHookResult = ReturnType<typeof useIsAllowedQuery>;
export type IsAllowedLazyQueryHookResult = ReturnType<typeof useIsAllowedLazyQuery>;
export type IsAllowedQueryResult = Apollo.QueryResult<IsAllowedQuery, IsAllowedQueryVariables>;
export const GetTasksDocument = gql`
    query GET_TASKS($filters: TaskFiltersInput) {
        tasks(filters: $filters) {
            totalCount
            list {
                id
                label
                modified_at
                created_at
                created_by {
                    ...RecordIdentity
                }
                startAt
                status
                priority
                role {
                    type
                    detail
                }
                progress {
                    percent
                    description
                }
                startedAt
                completedAt
                link {
                    name
                    url
                }
                canceledBy {
                    ...RecordIdentity
                }
                archive
            }
        }
    }
    ${RecordIdentityFragmentDoc}
`;

/**
 * __useGetTasksQuery__
 *
 * To run a query within a React component, call `useGetTasksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTasksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTasksQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetTasksQuery(baseOptions?: Apollo.QueryHookOptions<GetTasksQuery, GetTasksQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetTasksQuery, GetTasksQueryVariables>(GetTasksDocument, options);
}
export function useGetTasksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTasksQuery, GetTasksQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetTasksQuery, GetTasksQueryVariables>(GetTasksDocument, options);
}
export type GetTasksQueryHookResult = ReturnType<typeof useGetTasksQuery>;
export type GetTasksLazyQueryHookResult = ReturnType<typeof useGetTasksLazyQuery>;
export type GetTasksQueryResult = Apollo.QueryResult<GetTasksQuery, GetTasksQueryVariables>;
export const GetTreeAttributesQueryDocument = gql`
    query GET_TREE_ATTRIBUTES_QUERY($treeId: [ID!]) {
        trees(filters: {id: $treeId}) {
            list {
                id
                libraries {
                    library {
                        id
                        label
                        attributes {
                            id
                            type
                            format
                            label
                            multiple_values
                            ... on StandardAttribute {
                                embedded_fields {
                                    id
                                    format
                                    label
                                }
                            }
                            ... on LinkAttribute {
                                linked_library {
                                    id
                                }
                            }
                            ... on TreeAttribute {
                                linked_tree {
                                    id
                                    label
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

/**
 * __useGetTreeAttributesQueryQuery__
 *
 * To run a query within a React component, call `useGetTreeAttributesQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTreeAttributesQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTreeAttributesQueryQuery({
 *   variables: {
 *      treeId: // value for 'treeId'
 *   },
 * });
 */
export function useGetTreeAttributesQueryQuery(
    baseOptions?: Apollo.QueryHookOptions<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>(
        GetTreeAttributesQueryDocument,
        options
    );
}
export function useGetTreeAttributesQueryLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>(
        GetTreeAttributesQueryDocument,
        options
    );
}
export type GetTreeAttributesQueryQueryHookResult = ReturnType<typeof useGetTreeAttributesQueryQuery>;
export type GetTreeAttributesQueryLazyQueryHookResult = ReturnType<typeof useGetTreeAttributesQueryLazyQuery>;
export type GetTreeAttributesQueryQueryResult = Apollo.QueryResult<
    GetTreeAttributesQueryQuery,
    GetTreeAttributesQueryQueryVariables
>;
export const GetTreeLibrariesDocument = gql`
    query GET_TREE_LIBRARIES($treeId: [ID!], $library: String) {
        trees(filters: {id: $treeId, library: $library}) {
            totalCount
            list {
                id
                behavior
                system
                libraries {
                    library {
                        id
                        label
                        behavior
                        system
                    }
                    settings {
                        allowMultiplePositions
                        allowedChildren
                        allowedAtRoot
                    }
                }
            }
        }
    }
`;

/**
 * __useGetTreeLibrariesQuery__
 *
 * To run a query within a React component, call `useGetTreeLibrariesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTreeLibrariesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTreeLibrariesQuery({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      library: // value for 'library'
 *   },
 * });
 */
export function useGetTreeLibrariesQuery(
    baseOptions?: Apollo.QueryHookOptions<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>(GetTreeLibrariesDocument, options);
}
export function useGetTreeLibrariesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>(
        GetTreeLibrariesDocument,
        options
    );
}
export type GetTreeLibrariesQueryHookResult = ReturnType<typeof useGetTreeLibrariesQuery>;
export type GetTreeLibrariesLazyQueryHookResult = ReturnType<typeof useGetTreeLibrariesLazyQuery>;
export type GetTreeLibrariesQueryResult = Apollo.QueryResult<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>;
export const GetTreesDocument = gql`
    query GET_TREES($filters: TreesFiltersInput) {
        trees(filters: $filters) {
            list {
                id
                label
                libraries {
                    library {
                        id
                        label
                        behavior
                    }
                }
                behavior
                permissions {
                    access_tree
                    edit_children
                }
            }
        }
    }
`;

/**
 * __useGetTreesQuery__
 *
 * To run a query within a React component, call `useGetTreesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTreesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTreesQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetTreesQuery(baseOptions?: Apollo.QueryHookOptions<GetTreesQuery, GetTreesQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetTreesQuery, GetTreesQueryVariables>(GetTreesDocument, options);
}
export function useGetTreesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTreesQuery, GetTreesQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetTreesQuery, GetTreesQueryVariables>(GetTreesDocument, options);
}
export type GetTreesQueryHookResult = ReturnType<typeof useGetTreesQuery>;
export type GetTreesLazyQueryHookResult = ReturnType<typeof useGetTreesLazyQuery>;
export type GetTreesQueryResult = Apollo.QueryResult<GetTreesQuery, GetTreesQueryVariables>;
export const TreeNodeChildrenDocument = gql`
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination) {
        treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
            totalCount
            list {
                id
                childrenCount
                record {
                    ...RecordIdentity
                    active: property(attribute: "active") {
                        ... on Value {
                            value
                        }
                    }
                }
                permissions {
                    access_tree
                    detach
                    edit_children
                }
            }
        }
    }
    ${RecordIdentityFragmentDoc}
`;

/**
 * __useTreeNodeChildrenQuery__
 *
 * To run a query within a React component, call `useTreeNodeChildrenQuery` and pass it any options that fit your needs.
 * When your component renders, `useTreeNodeChildrenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTreeNodeChildrenQuery({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      node: // value for 'node'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useTreeNodeChildrenQuery(
    baseOptions: Apollo.QueryHookOptions<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>(TreeNodeChildrenDocument, options);
}
export function useTreeNodeChildrenLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>(
        TreeNodeChildrenDocument,
        options
    );
}
export type TreeNodeChildrenQueryHookResult = ReturnType<typeof useTreeNodeChildrenQuery>;
export type TreeNodeChildrenLazyQueryHookResult = ReturnType<typeof useTreeNodeChildrenLazyQuery>;
export type TreeNodeChildrenQueryResult = Apollo.QueryResult<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>;
export const GetUserDataDocument = gql`
    query GET_USER_DATA($keys: [String!]!, $global: Boolean) {
        userData(keys: $keys, global: $global) {
            global
            data
        }
    }
`;

/**
 * __useGetUserDataQuery__
 *
 * To run a query within a React component, call `useGetUserDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDataQuery({
 *   variables: {
 *      keys: // value for 'keys'
 *      global: // value for 'global'
 *   },
 * });
 */
export function useGetUserDataQuery(baseOptions: Apollo.QueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetUserDataQuery, GetUserDataQueryVariables>(GetUserDataDocument, options);
}
export function useGetUserDataLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetUserDataQuery, GetUserDataQueryVariables>(GetUserDataDocument, options);
}
export type GetUserDataQueryHookResult = ReturnType<typeof useGetUserDataQuery>;
export type GetUserDataLazyQueryHookResult = ReturnType<typeof useGetUserDataLazyQuery>;
export type GetUserDataQueryResult = Apollo.QueryResult<GetUserDataQuery, GetUserDataQueryVariables>;
export const MeDocument = gql`
    query ME {
        me {
            ...RecordIdentity
        }
    }
    ${RecordIdentityFragmentDoc}
`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const ApplicationEventsDocument = gql`
    subscription APPLICATION_EVENTS($filters: ApplicationEventFiltersInput) {
        applicationEvent(filters: $filters) {
            type
            application {
                ...ApplicationDetails
            }
        }
    }
    ${ApplicationDetailsFragmentDoc}
`;

/**
 * __useApplicationEventsSubscription__
 *
 * To run a query within a React component, call `useApplicationEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useApplicationEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationEventsSubscription({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useApplicationEventsSubscription(
    baseOptions?: Apollo.SubscriptionHookOptions<ApplicationEventsSubscription, ApplicationEventsSubscriptionVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useSubscription<ApplicationEventsSubscription, ApplicationEventsSubscriptionVariables>(
        ApplicationEventsDocument,
        options
    );
}
export type ApplicationEventsSubscriptionHookResult = ReturnType<typeof useApplicationEventsSubscription>;
export type ApplicationEventsSubscriptionResult = Apollo.SubscriptionResult<ApplicationEventsSubscription>;
export const SubTasksUpdateDocument = gql`
    subscription SUB_TASKS_UPDATE($filters: TaskFiltersInput) {
        task(filters: $filters) {
            id
            label
            modified_at
            created_at
            created_by {
                ...RecordIdentity
            }
            startAt
            status
            priority
            role {
                type
                detail
            }
            progress {
                percent
                description
            }
            startedAt
            completedAt
            link {
                name
                url
            }
            canceledBy {
                ...RecordIdentity
            }
            archive
        }
    }
    ${RecordIdentityFragmentDoc}
`;

/**
 * __useSubTasksUpdateSubscription__
 *
 * To run a query within a React component, call `useSubTasksUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubTasksUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubTasksUpdateSubscription({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useSubTasksUpdateSubscription(
    baseOptions?: Apollo.SubscriptionHookOptions<SubTasksUpdateSubscription, SubTasksUpdateSubscriptionVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useSubscription<SubTasksUpdateSubscription, SubTasksUpdateSubscriptionVariables>(
        SubTasksUpdateDocument,
        options
    );
}
export type SubTasksUpdateSubscriptionHookResult = ReturnType<typeof useSubTasksUpdateSubscription>;
export type SubTasksUpdateSubscriptionResult = Apollo.SubscriptionResult<SubTasksUpdateSubscription>;
export const TreeEventsDocument = gql`
    subscription TREE_EVENTS($filters: TreeEventFiltersInput) {
        treeEvent(filters: $filters) {
            type
            treeId
            element {
                id
                childrenCount
                record {
                    ...RecordIdentity
                }
                permissions {
                    access_tree
                    detach
                    edit_children
                }
            }
            parentNode {
                id
            }
            parentNodeBefore {
                id
            }
        }
    }
    ${RecordIdentityFragmentDoc}
`;

/**
 * __useTreeEventsSubscription__
 *
 * To run a query within a React component, call `useTreeEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTreeEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTreeEventsSubscription({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useTreeEventsSubscription(
    baseOptions?: Apollo.SubscriptionHookOptions<TreeEventsSubscription, TreeEventsSubscriptionVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useSubscription<TreeEventsSubscription, TreeEventsSubscriptionVariables>(TreeEventsDocument, options);
}
export type TreeEventsSubscriptionHookResult = ReturnType<typeof useTreeEventsSubscription>;
export type TreeEventsSubscriptionResult = Apollo.SubscriptionResult<TreeEventsSubscription>;
