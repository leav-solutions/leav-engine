// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as Apollo from '@apollo/client';
import {gql} from '@apollo/client';
import {IPreviewScalar} from '@leav/utils';
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
    Any: any;
    DateTime: any;
    FullTreeContent: any;
    JSON: any;
    JSONObject: any;
    Preview: IPreviewScalar;
    SystemTranslation: any;
    TaskPriority: any;
    Upload: any;
};

export type ActionConfigurationInput = {
    error_message?: InputMaybe<Scalars['SystemTranslation']>;
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
    description?: InputMaybe<Scalars['SystemTranslation']>;
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
    text = 'text'
}

export type AttributeInput = {
    actions_list?: InputMaybe<ActionsListConfigurationInput>;
    description?: InputMaybe<Scalars['SystemTranslation']>;
    embedded_fields?: InputMaybe<Array<InputMaybe<EmbeddedAttributeInput>>>;
    format?: InputMaybe<AttributeFormat>;
    id: Scalars['ID'];
    label?: InputMaybe<Scalars['SystemTranslation']>;
    linked_library?: InputMaybe<Scalars['String']>;
    linked_tree?: InputMaybe<Scalars['String']>;
    metadata_fields?: InputMaybe<Array<Scalars['String']>>;
    multiple_values?: InputMaybe<Scalars['Boolean']>;
    permissions_conf?: InputMaybe<TreepermissionsConfInput>;
    readonly?: InputMaybe<Scalars['Boolean']>;
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
    description?: InputMaybe<Scalars['SystemTranslation']>;
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

export type GlobalSettingsIconInput = {
    library: Scalars['String'];
    recordId: Scalars['String'];
};

export type GlobalSettingsInput = {
    icon?: InputMaybe<GlobalSettingsIconInput>;
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
    description?: InputMaybe<Scalars['SystemTranslation']>;
    label: Scalars['SystemTranslation'];
    versions: PreviewVersionInput;
};

export type Pagination = {
    limit: Scalars['Int'];
    offset: Scalars['Int'];
};

export type PermissionActionInput = {
    allowed?: InputMaybe<Scalars['Boolean']>;
    name: PermissionsActions;
};

/**
 * If users group is not specified, permission will be saved at root level.
 * If saving a tree-based permission (record or attribute) and tree target's id is not specified,
 * permission will be saved at root level for any element of the tree.
 */
export type PermissionInput = {
    actions: Array<PermissionActionInput>;
    applyTo?: InputMaybe<Scalars['ID']>;
    permissionTreeTarget?: InputMaybe<PermissionsTreeTargetInput>;
    type: PermissionTypes;
    usersGroup?: InputMaybe<Scalars['ID']>;
};

/**
 * Element on which we want to retrieve record or attribute permission. Record ID is mandatory,
 * attributeId is only required for attribute permission
 * libraryId and recordId are mandatory for tree node permission
 */
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

/** If id and library are not specified, permission will apply to tree root */
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

/**
 * Records support on both offset and cursor. Cannot use both at the same time.
 * If none is supplied, it will apply an offset 0. Cursors are always returned along the results
 * ⚠️Sorting is disallowed when using cursor pagination
 */
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
    /** Nodes concerned by the event, whether be the source or the target */
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
    value?: InputMaybe<Scalars['String']>;
};

export type ValueInput = {
    id_value?: InputMaybe<Scalars['ID']>;
    metadata?: InputMaybe<Array<InputMaybe<ValueMetadataInput>>>;
    value?: InputMaybe<Scalars['String']>;
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
    enable: Scalars['Boolean'];
    values?: InputMaybe<Array<Scalars['String']>>;
};

export type ValuesVersionsConfInput = {
    mode?: InputMaybe<ValueVersionMode>;
    profile?: InputMaybe<Scalars['String']>;
    versionable: Scalars['Boolean'];
};

export type VersionProfileInput = {
    description?: InputMaybe<Scalars['SystemTranslation']>;
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
    description?: InputMaybe<Scalars['SystemTranslation']>;
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

export type DetailsApplicationFragment = {
    id: string;
    label: any;
    type: ApplicationType;
    description?: any | null;
    endpoint?: string | null;
    url?: string | null;
    color?: string | null;
    module?: string | null;
    settings?: any | null;
    icon?:
        | {
              id: string;
              whoAmI: {
                  id: string;
                  label?: string | null;
                  color?: string | null;
                  preview?: IPreviewScalar | null;
                  library: {id: string; label?: any | null};
              };
          }
        | {
              id: string;
              whoAmI: {
                  id: string;
                  label?: string | null;
                  color?: string | null;
                  preview?: IPreviewScalar | null;
                  library: {id: string; label?: any | null};
              };
          }
        | {
              id: string;
              whoAmI: {
                  id: string;
                  label?: string | null;
                  color?: string | null;
                  preview?: IPreviewScalar | null;
                  library: {id: string; label?: any | null};
              };
          }
        | null;
    permissions: {access_application: boolean; admin_application: boolean};
};

export type RecordIdentityCjX1ctHtayKw3UvL3SxXwpZmvJocudQk0mb3YeupLuFragment = {
    id: string;
    whoAmI: {
        id: string;
        label?: string | null;
        color?: string | null;
        preview?: IPreviewScalar | null;
        library: {id: string; label?: any | null};
    };
};

export type RecordIdentityNoK32r5S4GHrWvJrDbbZyQxNwU9KsPBsGItOGtQz4Fragment = {
    id: string;
    whoAmI: {
        id: string;
        label?: string | null;
        color?: string | null;
        preview?: IPreviewScalar | null;
        library: {id: string; label?: any | null};
    };
};

export type RecordIdentityGdlFf7fowe20o0yE7yTvP85fHnPz4Ad88WmUdVAuYwFragment = {
    id: string;
    whoAmI: {
        id: string;
        label?: string | null;
        color?: string | null;
        preview?: IPreviewScalar | null;
        library: {id: string; label?: any | null};
    };
};

export type RecordIdentityFragment =
    | RecordIdentityCjX1ctHtayKw3UvL3SxXwpZmvJocudQk0mb3YeupLuFragment
    | RecordIdentityNoK32r5S4GHrWvJrDbbZyQxNwU9KsPBsGItOGtQz4Fragment
    | RecordIdentityGdlFf7fowe20o0yE7yTvP85fHnPz4Ad88WmUdVAuYwFragment;

export type AttributeDetailsLinkAttributeFragment = {
    reverse_link?: string | null;
    id: string;
    type: AttributeType;
    format?: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    label?: any | null;
    description?: any | null;
    multiple_values: boolean;
    linked_library?: {id: string; label?: any | null} | null;
    metadata_fields?: Array<{
        id: string;
        label?: any | null;
        type: AttributeType;
        format?: AttributeFormat | null;
    }> | null;
    versions_conf?: {
        versionable: boolean;
        mode?: ValueVersionMode | null;
        profile?: {id: string; label: any; trees: Array<{id: string; label?: any | null}>} | null;
    } | null;
    libraries?: Array<{id: string; label?: any | null}> | null;
};

export type AttributeDetailsStandardAttributeFragment = {
    unique?: boolean | null;
    id: string;
    type: AttributeType;
    format?: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    label?: any | null;
    description?: any | null;
    multiple_values: boolean;
    metadata_fields?: Array<{
        id: string;
        label?: any | null;
        type: AttributeType;
        format?: AttributeFormat | null;
    }> | null;
    versions_conf?: {
        versionable: boolean;
        mode?: ValueVersionMode | null;
        profile?: {id: string; label: any; trees: Array<{id: string; label?: any | null}>} | null;
    } | null;
    libraries?: Array<{id: string; label?: any | null}> | null;
};

export type AttributeDetailsTreeAttributeFragment = {
    id: string;
    type: AttributeType;
    format?: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    label?: any | null;
    description?: any | null;
    multiple_values: boolean;
    linked_tree?: {id: string; label?: any | null} | null;
    metadata_fields?: Array<{
        id: string;
        label?: any | null;
        type: AttributeType;
        format?: AttributeFormat | null;
    }> | null;
    versions_conf?: {
        versionable: boolean;
        mode?: ValueVersionMode | null;
        profile?: {id: string; label: any; trees: Array<{id: string; label?: any | null}>} | null;
    } | null;
    libraries?: Array<{id: string; label?: any | null}> | null;
};

export type AttributeDetailsFragment =
    | AttributeDetailsLinkAttributeFragment
    | AttributeDetailsStandardAttributeFragment
    | AttributeDetailsTreeAttributeFragment;

export type LibraryLightFragment = {
    id: string;
    label?: any | null;
    icon?:
        | {id: string; whoAmI: {id: string; preview?: IPreviewScalar | null; library: {id: string}}}
        | {id: string; whoAmI: {id: string; preview?: IPreviewScalar | null; library: {id: string}}}
        | {id: string; whoAmI: {id: string; preview?: IPreviewScalar | null; library: {id: string}}}
        | null;
};

export type LibraryDetailsFragment = {
    id: string;
    label?: any | null;
    behavior: LibraryBehavior;
    system?: boolean | null;
    fullTextAttributes?: Array<{id: string; label?: any | null}> | null;
    attributes?: Array<
        | {
              id: string;
              label?: any | null;
              system: boolean;
              type: AttributeType;
              format?: AttributeFormat | null;
              linked_library?: {id: string; behavior: LibraryBehavior} | null;
          }
        | {id: string; label?: any | null; system: boolean; type: AttributeType; format?: AttributeFormat | null}
    > | null;
    permissions_conf?: {
        relation: PermissionsRelation;
        permissionTreeAttributes: Array<
            {id: string; label?: any | null} | {id: string; label?: any | null; linked_tree?: {id: string} | null}
        >;
    } | null;
    recordIdentityConf?: {
        label?: string | null;
        subLabel?: string | null;
        color?: string | null;
        preview?: string | null;
        treeColorPreview?: string | null;
    } | null;
    permissions?: {
        admin_library: boolean;
        access_library: boolean;
        access_record: boolean;
        create_record: boolean;
        edit_record: boolean;
        delete_record: boolean;
    } | null;
    icon?:
        | {
              id: string;
              whoAmI: {
                  id: string;
                  label?: string | null;
                  color?: string | null;
                  preview?: IPreviewScalar | null;
                  library: {id: string; label?: any | null};
              };
          }
        | {
              id: string;
              whoAmI: {
                  id: string;
                  label?: string | null;
                  color?: string | null;
                  preview?: IPreviewScalar | null;
                  library: {id: string; label?: any | null};
              };
          }
        | {
              id: string;
              whoAmI: {
                  id: string;
                  label?: string | null;
                  color?: string | null;
                  preview?: IPreviewScalar | null;
                  library: {id: string; label?: any | null};
              };
          }
        | null;
    previewsSettings?: Array<{
        label: any;
        description?: any | null;
        system: boolean;
        versions: {background: string; density: number; sizes: Array<{name: string; size: number}>};
    }> | null;
};

export type LibraryAttributesLinkAttributeFragment = {
    id: string;
    label?: any | null;
    system: boolean;
    type: AttributeType;
    format?: AttributeFormat | null;
    linked_library?: {id: string; behavior: LibraryBehavior} | null;
};

export type LibraryAttributesStandardAttributeTreeAttributeFragment = {
    id: string;
    label?: any | null;
    system: boolean;
    type: AttributeType;
    format?: AttributeFormat | null;
};

export type LibraryAttributesFragment =
    | LibraryAttributesLinkAttributeFragment
    | LibraryAttributesStandardAttributeTreeAttributeFragment;

export type LibraryLinkAttributeDetailsFragment = {linked_library?: {id: string; behavior: LibraryBehavior} | null};

export type LibraryPreviewsSettingsFragment = {
    label: any;
    description?: any | null;
    system: boolean;
    versions: {background: string; density: number; sizes: Array<{name: string; size: number}>};
};

export type TreeDetailsFragment = {
    id: string;
    label?: any | null;
    behavior: TreeBehavior;
    system: boolean;
    libraries: Array<{
        library: {id: string; label?: any | null};
        settings: {allowMultiplePositions: boolean; allowedAtRoot: boolean; allowedChildren: Array<string>};
    }>;
};

export type TreeLightFragment = {id: string; label?: any | null};

export type CheckApplicationExistenceQueryVariables = Exact<{
    id?: InputMaybe<Scalars['ID']>;
    endpoint?: InputMaybe<Scalars['String']>;
}>;

export type CheckApplicationExistenceQuery = {applications?: {totalCount: number} | null};

export type GetApplicationByIdQueryVariables = Exact<{
    id: Scalars['ID'];
}>;

export type GetApplicationByIdQuery = {
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
            icon?:
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          preview?: IPreviewScalar | null;
                          library: {id: string; label?: any | null};
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          preview?: IPreviewScalar | null;
                          library: {id: string; label?: any | null};
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          preview?: IPreviewScalar | null;
                          library: {id: string; label?: any | null};
                      };
                  }
                | null;
            permissions: {access_application: boolean; admin_application: boolean};
        }>;
    } | null;
};

export type GetApplicationModulesQueryVariables = Exact<{[key: string]: never}>;

export type GetApplicationModulesQuery = {
    applicationsModules: Array<{id: string; description?: string | null; version?: string | null}>;
};

export type SaveApplicationMutationVariables = Exact<{
    application: ApplicationInput;
}>;

export type SaveApplicationMutation = {
    saveApplication: {
        id: string;
        label: any;
        type: ApplicationType;
        description?: any | null;
        endpoint?: string | null;
        url?: string | null;
        color?: string | null;
        module?: string | null;
        settings?: any | null;
        icon?:
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      preview?: IPreviewScalar | null;
                      library: {id: string; label?: any | null};
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      preview?: IPreviewScalar | null;
                      library: {id: string; label?: any | null};
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      preview?: IPreviewScalar | null;
                      library: {id: string; label?: any | null};
                  };
              }
            | null;
        permissions: {access_application: boolean; admin_application: boolean};
    };
};

export type CheckAttributeExistenceQueryVariables = Exact<{
    id: Scalars['ID'];
}>;

export type CheckAttributeExistenceQuery = {attributes?: {totalCount: number} | null};

export type DeleteAttributeMutationVariables = Exact<{
    id?: InputMaybe<Scalars['ID']>;
}>;

export type DeleteAttributeMutation = {deleteAttribute: {id: string}};

export type GetAttributeByIdQueryVariables = Exact<{
    id?: InputMaybe<Scalars['ID']>;
}>;

export type GetAttributeByIdQuery = {
    attributes?: {
        list: Array<
            | {
                  reverse_link?: string | null;
                  id: string;
                  type: AttributeType;
                  format?: AttributeFormat | null;
                  system: boolean;
                  readonly: boolean;
                  label?: any | null;
                  description?: any | null;
                  multiple_values: boolean;
                  linked_library?: {id: string; label?: any | null} | null;
                  metadata_fields?: Array<{
                      id: string;
                      label?: any | null;
                      type: AttributeType;
                      format?: AttributeFormat | null;
                  }> | null;
                  versions_conf?: {
                      versionable: boolean;
                      mode?: ValueVersionMode | null;
                      profile?: {id: string; label: any; trees: Array<{id: string; label?: any | null}>} | null;
                  } | null;
                  libraries?: Array<{id: string; label?: any | null}> | null;
              }
            | {
                  unique?: boolean | null;
                  id: string;
                  type: AttributeType;
                  format?: AttributeFormat | null;
                  system: boolean;
                  readonly: boolean;
                  label?: any | null;
                  description?: any | null;
                  multiple_values: boolean;
                  metadata_fields?: Array<{
                      id: string;
                      label?: any | null;
                      type: AttributeType;
                      format?: AttributeFormat | null;
                  }> | null;
                  versions_conf?: {
                      versionable: boolean;
                      mode?: ValueVersionMode | null;
                      profile?: {id: string; label: any; trees: Array<{id: string; label?: any | null}>} | null;
                  } | null;
                  libraries?: Array<{id: string; label?: any | null}> | null;
              }
            | {
                  id: string;
                  type: AttributeType;
                  format?: AttributeFormat | null;
                  system: boolean;
                  readonly: boolean;
                  label?: any | null;
                  description?: any | null;
                  multiple_values: boolean;
                  linked_tree?: {id: string; label?: any | null} | null;
                  metadata_fields?: Array<{
                      id: string;
                      label?: any | null;
                      type: AttributeType;
                      format?: AttributeFormat | null;
                  }> | null;
                  versions_conf?: {
                      versionable: boolean;
                      mode?: ValueVersionMode | null;
                      profile?: {id: string; label: any; trees: Array<{id: string; label?: any | null}>} | null;
                  } | null;
                  libraries?: Array<{id: string; label?: any | null}> | null;
              }
        >;
    } | null;
};

export type GetAttributesQueryVariables = Exact<{[key: string]: never}>;

export type GetAttributesQuery = {
    attributes?: {
        list: Array<{
            id: string;
            label?: any | null;
            type: AttributeType;
            format?: AttributeFormat | null;
            system: boolean;
        }>;
    } | null;
};

export type GetVersionProfilesQueryVariables = Exact<{
    filters?: InputMaybe<VersionProfilesFiltersInput>;
    sort?: InputMaybe<SortVersionProfilesInput>;
}>;

export type GetVersionProfilesQuery = {versionProfiles: {list: Array<{id: string; label: any}>}};

export type SaveAttributeMutationVariables = Exact<{
    attribute: AttributeInput;
}>;

export type SaveAttributeMutation = {
    saveAttribute:
        | {
              reverse_link?: string | null;
              id: string;
              type: AttributeType;
              format?: AttributeFormat | null;
              system: boolean;
              readonly: boolean;
              label?: any | null;
              description?: any | null;
              multiple_values: boolean;
              linked_library?: {id: string; label?: any | null} | null;
              metadata_fields?: Array<{
                  id: string;
                  label?: any | null;
                  type: AttributeType;
                  format?: AttributeFormat | null;
              }> | null;
              versions_conf?: {
                  versionable: boolean;
                  mode?: ValueVersionMode | null;
                  profile?: {id: string; label: any; trees: Array<{id: string; label?: any | null}>} | null;
              } | null;
              libraries?: Array<{id: string; label?: any | null}> | null;
          }
        | {
              unique?: boolean | null;
              id: string;
              type: AttributeType;
              format?: AttributeFormat | null;
              system: boolean;
              readonly: boolean;
              label?: any | null;
              description?: any | null;
              multiple_values: boolean;
              metadata_fields?: Array<{
                  id: string;
                  label?: any | null;
                  type: AttributeType;
                  format?: AttributeFormat | null;
              }> | null;
              versions_conf?: {
                  versionable: boolean;
                  mode?: ValueVersionMode | null;
                  profile?: {id: string; label: any; trees: Array<{id: string; label?: any | null}>} | null;
              } | null;
              libraries?: Array<{id: string; label?: any | null}> | null;
          }
        | {
              id: string;
              type: AttributeType;
              format?: AttributeFormat | null;
              system: boolean;
              readonly: boolean;
              label?: any | null;
              description?: any | null;
              multiple_values: boolean;
              linked_tree?: {id: string; label?: any | null} | null;
              metadata_fields?: Array<{
                  id: string;
                  label?: any | null;
                  type: AttributeType;
                  format?: AttributeFormat | null;
              }> | null;
              versions_conf?: {
                  versionable: boolean;
                  mode?: ValueVersionMode | null;
                  profile?: {id: string; label: any; trees: Array<{id: string; label?: any | null}>} | null;
              } | null;
              libraries?: Array<{id: string; label?: any | null}> | null;
          };
};

export type CheckLibraryExistenceQueryVariables = Exact<{
    id?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;

export type CheckLibraryExistenceQuery = {libraries?: {totalCount: number} | null};

export type DeleteLibraryMutationVariables = Exact<{
    id?: InputMaybe<Scalars['ID']>;
}>;

export type DeleteLibraryMutation = {deleteLibrary: {id: string}};

export type GetLibrariesQueryVariables = Exact<{[key: string]: never}>;

export type GetLibrariesQuery = {
    libraries?: {
        list: Array<{
            id: string;
            label?: any | null;
            icon?:
                | {id: string; whoAmI: {id: string; preview?: IPreviewScalar | null; library: {id: string}}}
                | {id: string; whoAmI: {id: string; preview?: IPreviewScalar | null; library: {id: string}}}
                | {id: string; whoAmI: {id: string; preview?: IPreviewScalar | null; library: {id: string}}}
                | null;
        }>;
    } | null;
};

export type GetLibraryByIdQueryVariables = Exact<{
    id?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;

export type GetLibraryByIdQuery = {
    libraries?: {
        list: Array<{
            id: string;
            label?: any | null;
            behavior: LibraryBehavior;
            system?: boolean | null;
            fullTextAttributes?: Array<{id: string; label?: any | null}> | null;
            attributes?: Array<
                | {
                      id: string;
                      label?: any | null;
                      system: boolean;
                      type: AttributeType;
                      format?: AttributeFormat | null;
                      linked_library?: {id: string; behavior: LibraryBehavior} | null;
                  }
                | {
                      id: string;
                      label?: any | null;
                      system: boolean;
                      type: AttributeType;
                      format?: AttributeFormat | null;
                  }
            > | null;
            permissions_conf?: {
                relation: PermissionsRelation;
                permissionTreeAttributes: Array<
                    | {id: string; label?: any | null}
                    | {id: string; label?: any | null; linked_tree?: {id: string} | null}
                >;
            } | null;
            recordIdentityConf?: {
                label?: string | null;
                subLabel?: string | null;
                color?: string | null;
                preview?: string | null;
                treeColorPreview?: string | null;
            } | null;
            permissions?: {
                admin_library: boolean;
                access_library: boolean;
                access_record: boolean;
                create_record: boolean;
                edit_record: boolean;
                delete_record: boolean;
            } | null;
            icon?:
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          preview?: IPreviewScalar | null;
                          library: {id: string; label?: any | null};
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          preview?: IPreviewScalar | null;
                          library: {id: string; label?: any | null};
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          preview?: IPreviewScalar | null;
                          library: {id: string; label?: any | null};
                      };
                  }
                | null;
            previewsSettings?: Array<{
                label: any;
                description?: any | null;
                system: boolean;
                versions: {background: string; density: number; sizes: Array<{name: string; size: number}>};
            }> | null;
        }>;
    } | null;
};

export type SaveLibraryMutationVariables = Exact<{
    library: LibraryInput;
}>;

export type SaveLibraryMutation = {
    saveLibrary: {
        id: string;
        label?: any | null;
        behavior: LibraryBehavior;
        system?: boolean | null;
        fullTextAttributes?: Array<{id: string; label?: any | null}> | null;
        attributes?: Array<
            | {
                  id: string;
                  label?: any | null;
                  system: boolean;
                  type: AttributeType;
                  format?: AttributeFormat | null;
                  linked_library?: {id: string; behavior: LibraryBehavior} | null;
              }
            | {id: string; label?: any | null; system: boolean; type: AttributeType; format?: AttributeFormat | null}
        > | null;
        permissions_conf?: {
            relation: PermissionsRelation;
            permissionTreeAttributes: Array<
                {id: string; label?: any | null} | {id: string; label?: any | null; linked_tree?: {id: string} | null}
            >;
        } | null;
        recordIdentityConf?: {
            label?: string | null;
            subLabel?: string | null;
            color?: string | null;
            preview?: string | null;
            treeColorPreview?: string | null;
        } | null;
        permissions?: {
            admin_library: boolean;
            access_library: boolean;
            access_record: boolean;
            create_record: boolean;
            edit_record: boolean;
            delete_record: boolean;
        } | null;
        icon?:
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      preview?: IPreviewScalar | null;
                      library: {id: string; label?: any | null};
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      preview?: IPreviewScalar | null;
                      library: {id: string; label?: any | null};
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      preview?: IPreviewScalar | null;
                      library: {id: string; label?: any | null};
                  };
              }
            | null;
        previewsSettings?: Array<{
            label: any;
            description?: any | null;
            system: boolean;
            versions: {background: string; density: number; sizes: Array<{name: string; size: number}>};
        }> | null;
    };
};

export type IsAllowedQueryVariables = Exact<{
    type: PermissionTypes;
    actions: Array<PermissionsActions> | PermissionsActions;
    applyTo?: InputMaybe<Scalars['ID']>;
    target?: InputMaybe<PermissionTarget>;
}>;

export type IsAllowedQuery = {isAllowed?: Array<{name: PermissionsActions; allowed?: boolean | null}> | null};

export type IndexRecordsMutationVariables = Exact<{
    libraryId: Scalars['String'];
    records?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;

export type IndexRecordsMutation = {indexRecords: boolean};

export type CancelTaskMutationVariables = Exact<{
    taskId: Scalars['ID'];
}>;

export type CancelTaskMutation = {cancelTask: boolean};

export type CheckTreeExistenceQueryVariables = Exact<{
    id?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;

export type CheckTreeExistenceQuery = {trees?: {totalCount: number} | null};

export type DeleteTreeMutationVariables = Exact<{
    id: Scalars['ID'];
}>;

export type DeleteTreeMutation = {deleteTree: {id: string}};

export type GetTreeByIdQueryVariables = Exact<{
    id?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;

export type GetTreeByIdQuery = {
    trees?: {
        list: Array<{
            id: string;
            label?: any | null;
            behavior: TreeBehavior;
            system: boolean;
            libraries: Array<{
                library: {id: string; label?: any | null};
                settings: {allowMultiplePositions: boolean; allowedAtRoot: boolean; allowedChildren: Array<string>};
            }>;
        }>;
    } | null;
};

export type GetTreesQueryVariables = Exact<{[key: string]: never}>;

export type GetTreesQuery = {trees?: {list: Array<{id: string; label?: any | null}>} | null};

export type SaveTreeMutationVariables = Exact<{
    tree: TreeInput;
}>;

export type SaveTreeMutation = {
    saveTree: {
        id: string;
        label?: any | null;
        behavior: TreeBehavior;
        system: boolean;
        libraries: Array<{
            library: {id: string; label?: any | null};
            settings: {allowMultiplePositions: boolean; allowedAtRoot: boolean; allowedChildren: Array<string>};
        }>;
    };
};

export type UserInfoQueryVariables = Exact<{
    type: PermissionTypes;
    actions: Array<PermissionsActions> | PermissionsActions;
}>;

export type UserInfoQuery = {
    me?: {
        id: string;
        login?: string | null;
        whoAmI: {
            id: string;
            label?: string | null;
            color?: string | null;
            preview?: IPreviewScalar | null;
            library: {id: string; label?: any | null};
        };
    } | null;
    permissions?: Array<{name: PermissionsActions; allowed?: boolean | null}> | null;
};

export const RecordIdentityFragmentDoc = gql`
    fragment RecordIdentity on Record {
        id
        whoAmI {
            id
            label
            color
            library {
                id
                label
            }
            preview
        }
    }
`;
export const DetailsApplicationFragmentDoc = gql`
    fragment DetailsApplication on Application {
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
export const AttributeDetailsFragmentDoc = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        readonly
        label
        description
        multiple_values
        metadata_fields {
            id
            label
            type
            format
        }
        versions_conf {
            versionable
            mode
            profile {
                id
                label
                trees {
                    id
                    label
                }
            }
        }
        libraries {
            id
            label
        }
        ... on StandardAttribute {
            unique
        }
        ... on LinkAttribute {
            linked_library {
                id
                label
            }
            reverse_link
        }
        ... on TreeAttribute {
            linked_tree {
                id
                label
            }
        }
    }
`;
export const LibraryLightFragmentDoc = gql`
    fragment LibraryLight on Library {
        id
        label
        icon {
            id
            whoAmI {
                id
                library {
                    id
                }
                preview
            }
        }
    }
`;
export const LibraryLinkAttributeDetailsFragmentDoc = gql`
    fragment LibraryLinkAttributeDetails on LinkAttribute {
        linked_library {
            id
            behavior
        }
    }
`;
export const LibraryAttributesFragmentDoc = gql`
    fragment LibraryAttributes on Attribute {
        id
        label
        system
        type
        format
        ...LibraryLinkAttributeDetails
    }
    ${LibraryLinkAttributeDetailsFragmentDoc}
`;
export const LibraryPreviewsSettingsFragmentDoc = gql`
    fragment LibraryPreviewsSettings on LibraryPreviewsSettings {
        label
        description
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
`;
export const LibraryDetailsFragmentDoc = gql`
    fragment LibraryDetails on Library {
        id
        label
        behavior
        system
        label
        fullTextAttributes {
            id
            label
        }
        attributes {
            ...LibraryAttributes
        }
        permissions_conf {
            permissionTreeAttributes {
                id
                ... on TreeAttribute {
                    linked_tree {
                        id
                    }
                }
                label
            }
            relation
        }
        recordIdentityConf {
            label
            subLabel
            color
            preview
            treeColorPreview
        }
        permissions {
            admin_library
            access_library
            access_record
            create_record
            edit_record
            delete_record
        }
        icon {
            ...RecordIdentity
        }
        previewsSettings {
            ...LibraryPreviewsSettings
        }
    }
    ${LibraryAttributesFragmentDoc}
    ${RecordIdentityFragmentDoc}
    ${LibraryPreviewsSettingsFragmentDoc}
`;
export const TreeLightFragmentDoc = gql`
    fragment TreeLight on Tree {
        id
        label
    }
`;
export const TreeDetailsFragmentDoc = gql`
    fragment TreeDetails on Tree {
        id
        label
        behavior
        system
        libraries {
            library {
                id
                label
            }
            settings {
                allowMultiplePositions
                allowedAtRoot
                allowedChildren
            }
        }
    }
`;
export const CheckApplicationExistenceDocument = gql`
    query CHECK_APPLICATION_EXISTENCE($id: ID, $endpoint: String) {
        applications(filters: {id: $id, endpoint: $endpoint}) {
            totalCount
        }
    }
`;

/**
 * __useCheckApplicationExistenceQuery__
 *
 * To run a query within a React component, call `useCheckApplicationExistenceQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckApplicationExistenceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckApplicationExistenceQuery({
 *   variables: {
 *      id: // value for 'id'
 *      endpoint: // value for 'endpoint'
 *   },
 * });
 */
export function useCheckApplicationExistenceQuery(
    baseOptions?: Apollo.QueryHookOptions<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>(
        CheckApplicationExistenceDocument,
        options
    );
}
export function useCheckApplicationExistenceLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>(
        CheckApplicationExistenceDocument,
        options
    );
}
export type CheckApplicationExistenceQueryHookResult = ReturnType<typeof useCheckApplicationExistenceQuery>;
export type CheckApplicationExistenceLazyQueryHookResult = ReturnType<typeof useCheckApplicationExistenceLazyQuery>;
export type CheckApplicationExistenceQueryResult = Apollo.QueryResult<
    CheckApplicationExistenceQuery,
    CheckApplicationExistenceQueryVariables
>;
export const GetApplicationByIdDocument = gql`
    query GET_APPLICATION_BY_ID($id: ID!) {
        applications(filters: {id: $id}) {
            list {
                ...DetailsApplication
            }
        }
    }
    ${DetailsApplicationFragmentDoc}
`;

/**
 * __useGetApplicationByIdQuery__
 *
 * To run a query within a React component, call `useGetApplicationByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApplicationByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApplicationByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetApplicationByIdQuery(
    baseOptions: Apollo.QueryHookOptions<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>(
        GetApplicationByIdDocument,
        options
    );
}
export function useGetApplicationByIdLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>(
        GetApplicationByIdDocument,
        options
    );
}
export type GetApplicationByIdQueryHookResult = ReturnType<typeof useGetApplicationByIdQuery>;
export type GetApplicationByIdLazyQueryHookResult = ReturnType<typeof useGetApplicationByIdLazyQuery>;
export type GetApplicationByIdQueryResult = Apollo.QueryResult<
    GetApplicationByIdQuery,
    GetApplicationByIdQueryVariables
>;
export const GetApplicationModulesDocument = gql`
    query GET_APPLICATION_MODULES {
        applicationsModules {
            id
            description
            version
        }
    }
`;

/**
 * __useGetApplicationModulesQuery__
 *
 * To run a query within a React component, call `useGetApplicationModulesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApplicationModulesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApplicationModulesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetApplicationModulesQuery(
    baseOptions?: Apollo.QueryHookOptions<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>(
        GetApplicationModulesDocument,
        options
    );
}
export function useGetApplicationModulesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>(
        GetApplicationModulesDocument,
        options
    );
}
export type GetApplicationModulesQueryHookResult = ReturnType<typeof useGetApplicationModulesQuery>;
export type GetApplicationModulesLazyQueryHookResult = ReturnType<typeof useGetApplicationModulesLazyQuery>;
export type GetApplicationModulesQueryResult = Apollo.QueryResult<
    GetApplicationModulesQuery,
    GetApplicationModulesQueryVariables
>;
export const SaveApplicationDocument = gql`
    mutation SAVE_APPLICATION($application: ApplicationInput!) {
        saveApplication(application: $application) {
            ...DetailsApplication
        }
    }
    ${DetailsApplicationFragmentDoc}
`;
export type SaveApplicationMutationFn = Apollo.MutationFunction<
    SaveApplicationMutation,
    SaveApplicationMutationVariables
>;

/**
 * __useSaveApplicationMutation__
 *
 * To run a mutation, you first call `useSaveApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveApplicationMutation, { data, loading, error }] = useSaveApplicationMutation({
 *   variables: {
 *      application: // value for 'application'
 *   },
 * });
 */
export function useSaveApplicationMutation(
    baseOptions?: Apollo.MutationHookOptions<SaveApplicationMutation, SaveApplicationMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<SaveApplicationMutation, SaveApplicationMutationVariables>(
        SaveApplicationDocument,
        options
    );
}
export type SaveApplicationMutationHookResult = ReturnType<typeof useSaveApplicationMutation>;
export type SaveApplicationMutationResult = Apollo.MutationResult<SaveApplicationMutation>;
export type SaveApplicationMutationOptions = Apollo.BaseMutationOptions<
    SaveApplicationMutation,
    SaveApplicationMutationVariables
>;
export const CheckAttributeExistenceDocument = gql`
    query CHECK_ATTRIBUTE_EXISTENCE($id: ID!) {
        attributes(filters: {id: $id}) {
            totalCount
        }
    }
`;

/**
 * __useCheckAttributeExistenceQuery__
 *
 * To run a query within a React component, call `useCheckAttributeExistenceQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckAttributeExistenceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckAttributeExistenceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCheckAttributeExistenceQuery(
    baseOptions: Apollo.QueryHookOptions<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>(
        CheckAttributeExistenceDocument,
        options
    );
}
export function useCheckAttributeExistenceLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>(
        CheckAttributeExistenceDocument,
        options
    );
}
export type CheckAttributeExistenceQueryHookResult = ReturnType<typeof useCheckAttributeExistenceQuery>;
export type CheckAttributeExistenceLazyQueryHookResult = ReturnType<typeof useCheckAttributeExistenceLazyQuery>;
export type CheckAttributeExistenceQueryResult = Apollo.QueryResult<
    CheckAttributeExistenceQuery,
    CheckAttributeExistenceQueryVariables
>;
export const DeleteAttributeDocument = gql`
    mutation DELETE_ATTRIBUTE($id: ID) {
        deleteAttribute(id: $id) {
            id
        }
    }
`;
export type DeleteAttributeMutationFn = Apollo.MutationFunction<
    DeleteAttributeMutation,
    DeleteAttributeMutationVariables
>;

/**
 * __useDeleteAttributeMutation__
 *
 * To run a mutation, you first call `useDeleteAttributeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAttributeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAttributeMutation, { data, loading, error }] = useDeleteAttributeMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteAttributeMutation(
    baseOptions?: Apollo.MutationHookOptions<DeleteAttributeMutation, DeleteAttributeMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<DeleteAttributeMutation, DeleteAttributeMutationVariables>(
        DeleteAttributeDocument,
        options
    );
}
export type DeleteAttributeMutationHookResult = ReturnType<typeof useDeleteAttributeMutation>;
export type DeleteAttributeMutationResult = Apollo.MutationResult<DeleteAttributeMutation>;
export type DeleteAttributeMutationOptions = Apollo.BaseMutationOptions<
    DeleteAttributeMutation,
    DeleteAttributeMutationVariables
>;
export const GetAttributeByIdDocument = gql`
    query GET_ATTRIBUTE_BY_ID($id: ID) {
        attributes(filters: {id: $id}) {
            list {
                ...AttributeDetails
            }
        }
    }
    ${AttributeDetailsFragmentDoc}
`;

/**
 * __useGetAttributeByIdQuery__
 *
 * To run a query within a React component, call `useGetAttributeByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAttributeByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAttributeByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetAttributeByIdQuery(
    baseOptions?: Apollo.QueryHookOptions<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>(GetAttributeByIdDocument, options);
}
export function useGetAttributeByIdLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>(
        GetAttributeByIdDocument,
        options
    );
}
export type GetAttributeByIdQueryHookResult = ReturnType<typeof useGetAttributeByIdQuery>;
export type GetAttributeByIdLazyQueryHookResult = ReturnType<typeof useGetAttributeByIdLazyQuery>;
export type GetAttributeByIdQueryResult = Apollo.QueryResult<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>;
export const GetAttributesDocument = gql`
    query GET_ATTRIBUTES {
        attributes {
            list {
                id
                label
                type
                format
                system
            }
        }
    }
`;

/**
 * __useGetAttributesQuery__
 *
 * To run a query within a React component, call `useGetAttributesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAttributesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAttributesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAttributesQuery(
    baseOptions?: Apollo.QueryHookOptions<GetAttributesQuery, GetAttributesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetAttributesQuery, GetAttributesQueryVariables>(GetAttributesDocument, options);
}
export function useGetAttributesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetAttributesQuery, GetAttributesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetAttributesQuery, GetAttributesQueryVariables>(GetAttributesDocument, options);
}
export type GetAttributesQueryHookResult = ReturnType<typeof useGetAttributesQuery>;
export type GetAttributesLazyQueryHookResult = ReturnType<typeof useGetAttributesLazyQuery>;
export type GetAttributesQueryResult = Apollo.QueryResult<GetAttributesQuery, GetAttributesQueryVariables>;
export const GetVersionProfilesDocument = gql`
    query GET_VERSION_PROFILES($filters: VersionProfilesFiltersInput, $sort: SortVersionProfilesInput) {
        versionProfiles(filters: $filters, sort: $sort) {
            list {
                id
                label
            }
        }
    }
`;

/**
 * __useGetVersionProfilesQuery__
 *
 * To run a query within a React component, call `useGetVersionProfilesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVersionProfilesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVersionProfilesQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useGetVersionProfilesQuery(
    baseOptions?: Apollo.QueryHookOptions<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>(
        GetVersionProfilesDocument,
        options
    );
}
export function useGetVersionProfilesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>(
        GetVersionProfilesDocument,
        options
    );
}
export type GetVersionProfilesQueryHookResult = ReturnType<typeof useGetVersionProfilesQuery>;
export type GetVersionProfilesLazyQueryHookResult = ReturnType<typeof useGetVersionProfilesLazyQuery>;
export type GetVersionProfilesQueryResult = Apollo.QueryResult<
    GetVersionProfilesQuery,
    GetVersionProfilesQueryVariables
>;
export const SaveAttributeDocument = gql`
    mutation SAVE_ATTRIBUTE($attribute: AttributeInput!) {
        saveAttribute(attribute: $attribute) {
            ...AttributeDetails
        }
    }
    ${AttributeDetailsFragmentDoc}
`;
export type SaveAttributeMutationFn = Apollo.MutationFunction<SaveAttributeMutation, SaveAttributeMutationVariables>;

/**
 * __useSaveAttributeMutation__
 *
 * To run a mutation, you first call `useSaveAttributeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveAttributeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveAttributeMutation, { data, loading, error }] = useSaveAttributeMutation({
 *   variables: {
 *      attribute: // value for 'attribute'
 *   },
 * });
 */
export function useSaveAttributeMutation(
    baseOptions?: Apollo.MutationHookOptions<SaveAttributeMutation, SaveAttributeMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<SaveAttributeMutation, SaveAttributeMutationVariables>(SaveAttributeDocument, options);
}
export type SaveAttributeMutationHookResult = ReturnType<typeof useSaveAttributeMutation>;
export type SaveAttributeMutationResult = Apollo.MutationResult<SaveAttributeMutation>;
export type SaveAttributeMutationOptions = Apollo.BaseMutationOptions<
    SaveAttributeMutation,
    SaveAttributeMutationVariables
>;
export const CheckLibraryExistenceDocument = gql`
    query CHECK_LIBRARY_EXISTENCE($id: [ID!]) {
        libraries(filters: {id: $id}) {
            totalCount
        }
    }
`;

/**
 * __useCheckLibraryExistenceQuery__
 *
 * To run a query within a React component, call `useCheckLibraryExistenceQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckLibraryExistenceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckLibraryExistenceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCheckLibraryExistenceQuery(
    baseOptions?: Apollo.QueryHookOptions<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>(
        CheckLibraryExistenceDocument,
        options
    );
}
export function useCheckLibraryExistenceLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>(
        CheckLibraryExistenceDocument,
        options
    );
}
export type CheckLibraryExistenceQueryHookResult = ReturnType<typeof useCheckLibraryExistenceQuery>;
export type CheckLibraryExistenceLazyQueryHookResult = ReturnType<typeof useCheckLibraryExistenceLazyQuery>;
export type CheckLibraryExistenceQueryResult = Apollo.QueryResult<
    CheckLibraryExistenceQuery,
    CheckLibraryExistenceQueryVariables
>;
export const DeleteLibraryDocument = gql`
    mutation DELETE_LIBRARY($id: ID) {
        deleteLibrary(id: $id) {
            id
        }
    }
`;
export type DeleteLibraryMutationFn = Apollo.MutationFunction<DeleteLibraryMutation, DeleteLibraryMutationVariables>;

/**
 * __useDeleteLibraryMutation__
 *
 * To run a mutation, you first call `useDeleteLibraryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteLibraryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteLibraryMutation, { data, loading, error }] = useDeleteLibraryMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteLibraryMutation(
    baseOptions?: Apollo.MutationHookOptions<DeleteLibraryMutation, DeleteLibraryMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<DeleteLibraryMutation, DeleteLibraryMutationVariables>(DeleteLibraryDocument, options);
}
export type DeleteLibraryMutationHookResult = ReturnType<typeof useDeleteLibraryMutation>;
export type DeleteLibraryMutationResult = Apollo.MutationResult<DeleteLibraryMutation>;
export type DeleteLibraryMutationOptions = Apollo.BaseMutationOptions<
    DeleteLibraryMutation,
    DeleteLibraryMutationVariables
>;
export const GetLibrariesDocument = gql`
    query GET_LIBRARIES {
        libraries {
            list {
                ...LibraryLight
            }
        }
    }
    ${LibraryLightFragmentDoc}
`;

/**
 * __useGetLibrariesQuery__
 *
 * To run a query within a React component, call `useGetLibrariesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibrariesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibrariesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLibrariesQuery(
    baseOptions?: Apollo.QueryHookOptions<GetLibrariesQuery, GetLibrariesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetLibrariesQuery, GetLibrariesQueryVariables>(GetLibrariesDocument, options);
}
export function useGetLibrariesLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetLibrariesQuery, GetLibrariesQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetLibrariesQuery, GetLibrariesQueryVariables>(GetLibrariesDocument, options);
}
export type GetLibrariesQueryHookResult = ReturnType<typeof useGetLibrariesQuery>;
export type GetLibrariesLazyQueryHookResult = ReturnType<typeof useGetLibrariesLazyQuery>;
export type GetLibrariesQueryResult = Apollo.QueryResult<GetLibrariesQuery, GetLibrariesQueryVariables>;
export const GetLibraryByIdDocument = gql`
    query GET_LIBRARY_BY_ID($id: [ID!]) {
        libraries(filters: {id: $id}) {
            list {
                ...LibraryDetails
            }
        }
    }
    ${LibraryDetailsFragmentDoc}
`;

/**
 * __useGetLibraryByIdQuery__
 *
 * To run a query within a React component, call `useGetLibraryByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibraryByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibraryByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLibraryByIdQuery(
    baseOptions?: Apollo.QueryHookOptions<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>(GetLibraryByIdDocument, options);
}
export function useGetLibraryByIdLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>(GetLibraryByIdDocument, options);
}
export type GetLibraryByIdQueryHookResult = ReturnType<typeof useGetLibraryByIdQuery>;
export type GetLibraryByIdLazyQueryHookResult = ReturnType<typeof useGetLibraryByIdLazyQuery>;
export type GetLibraryByIdQueryResult = Apollo.QueryResult<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>;
export const SaveLibraryDocument = gql`
    mutation saveLibrary($library: LibraryInput!) {
        saveLibrary(library: $library) {
            ...LibraryDetails
        }
    }
    ${LibraryDetailsFragmentDoc}
`;
export type SaveLibraryMutationFn = Apollo.MutationFunction<SaveLibraryMutation, SaveLibraryMutationVariables>;

/**
 * __useSaveLibraryMutation__
 *
 * To run a mutation, you first call `useSaveLibraryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveLibraryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveLibraryMutation, { data, loading, error }] = useSaveLibraryMutation({
 *   variables: {
 *      library: // value for 'library'
 *   },
 * });
 */
export function useSaveLibraryMutation(
    baseOptions?: Apollo.MutationHookOptions<SaveLibraryMutation, SaveLibraryMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<SaveLibraryMutation, SaveLibraryMutationVariables>(SaveLibraryDocument, options);
}
export type SaveLibraryMutationHookResult = ReturnType<typeof useSaveLibraryMutation>;
export type SaveLibraryMutationResult = Apollo.MutationResult<SaveLibraryMutation>;
export type SaveLibraryMutationOptions = Apollo.BaseMutationOptions<SaveLibraryMutation, SaveLibraryMutationVariables>;
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
export const IndexRecordsDocument = gql`
    mutation INDEX_RECORDS($libraryId: String!, $records: [String!]) {
        indexRecords(libraryId: $libraryId, records: $records)
    }
`;
export type IndexRecordsMutationFn = Apollo.MutationFunction<IndexRecordsMutation, IndexRecordsMutationVariables>;

/**
 * __useIndexRecordsMutation__
 *
 * To run a mutation, you first call `useIndexRecordsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useIndexRecordsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [indexRecordsMutation, { data, loading, error }] = useIndexRecordsMutation({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      records: // value for 'records'
 *   },
 * });
 */
export function useIndexRecordsMutation(
    baseOptions?: Apollo.MutationHookOptions<IndexRecordsMutation, IndexRecordsMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<IndexRecordsMutation, IndexRecordsMutationVariables>(IndexRecordsDocument, options);
}
export type IndexRecordsMutationHookResult = ReturnType<typeof useIndexRecordsMutation>;
export type IndexRecordsMutationResult = Apollo.MutationResult<IndexRecordsMutation>;
export type IndexRecordsMutationOptions = Apollo.BaseMutationOptions<
    IndexRecordsMutation,
    IndexRecordsMutationVariables
>;
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
export const CheckTreeExistenceDocument = gql`
    query CHECK_TREE_EXISTENCE($id: [ID!]) {
        trees(filters: {id: $id}) {
            totalCount
        }
    }
`;

/**
 * __useCheckTreeExistenceQuery__
 *
 * To run a query within a React component, call `useCheckTreeExistenceQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckTreeExistenceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckTreeExistenceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCheckTreeExistenceQuery(
    baseOptions?: Apollo.QueryHookOptions<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>(
        CheckTreeExistenceDocument,
        options
    );
}
export function useCheckTreeExistenceLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>(
        CheckTreeExistenceDocument,
        options
    );
}
export type CheckTreeExistenceQueryHookResult = ReturnType<typeof useCheckTreeExistenceQuery>;
export type CheckTreeExistenceLazyQueryHookResult = ReturnType<typeof useCheckTreeExistenceLazyQuery>;
export type CheckTreeExistenceQueryResult = Apollo.QueryResult<
    CheckTreeExistenceQuery,
    CheckTreeExistenceQueryVariables
>;
export const DeleteTreeDocument = gql`
    mutation DELETE_TREE($id: ID!) {
        deleteTree(id: $id) {
            id
        }
    }
`;
export type DeleteTreeMutationFn = Apollo.MutationFunction<DeleteTreeMutation, DeleteTreeMutationVariables>;

/**
 * __useDeleteTreeMutation__
 *
 * To run a mutation, you first call `useDeleteTreeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTreeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTreeMutation, { data, loading, error }] = useDeleteTreeMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTreeMutation(
    baseOptions?: Apollo.MutationHookOptions<DeleteTreeMutation, DeleteTreeMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<DeleteTreeMutation, DeleteTreeMutationVariables>(DeleteTreeDocument, options);
}
export type DeleteTreeMutationHookResult = ReturnType<typeof useDeleteTreeMutation>;
export type DeleteTreeMutationResult = Apollo.MutationResult<DeleteTreeMutation>;
export type DeleteTreeMutationOptions = Apollo.BaseMutationOptions<DeleteTreeMutation, DeleteTreeMutationVariables>;
export const GetTreeByIdDocument = gql`
    query GET_TREE_BY_ID($id: [ID!]) {
        trees(filters: {id: $id}) {
            list {
                ...TreeDetails
            }
        }
    }
    ${TreeDetailsFragmentDoc}
`;

/**
 * __useGetTreeByIdQuery__
 *
 * To run a query within a React component, call `useGetTreeByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTreeByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTreeByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTreeByIdQuery(
    baseOptions?: Apollo.QueryHookOptions<GetTreeByIdQuery, GetTreeByIdQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<GetTreeByIdQuery, GetTreeByIdQueryVariables>(GetTreeByIdDocument, options);
}
export function useGetTreeByIdLazyQuery(
    baseOptions?: Apollo.LazyQueryHookOptions<GetTreeByIdQuery, GetTreeByIdQueryVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<GetTreeByIdQuery, GetTreeByIdQueryVariables>(GetTreeByIdDocument, options);
}
export type GetTreeByIdQueryHookResult = ReturnType<typeof useGetTreeByIdQuery>;
export type GetTreeByIdLazyQueryHookResult = ReturnType<typeof useGetTreeByIdLazyQuery>;
export type GetTreeByIdQueryResult = Apollo.QueryResult<GetTreeByIdQuery, GetTreeByIdQueryVariables>;
export const GetTreesDocument = gql`
    query GET_TREES {
        trees {
            list {
                ...TreeLight
            }
        }
    }
    ${TreeLightFragmentDoc}
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
export const SaveTreeDocument = gql`
    mutation SAVE_TREE($tree: TreeInput!) {
        saveTree(tree: $tree) {
            ...TreeDetails
        }
    }
    ${TreeDetailsFragmentDoc}
`;
export type SaveTreeMutationFn = Apollo.MutationFunction<SaveTreeMutation, SaveTreeMutationVariables>;

/**
 * __useSaveTreeMutation__
 *
 * To run a mutation, you first call `useSaveTreeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveTreeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveTreeMutation, { data, loading, error }] = useSaveTreeMutation({
 *   variables: {
 *      tree: // value for 'tree'
 *   },
 * });
 */
export function useSaveTreeMutation(
    baseOptions?: Apollo.MutationHookOptions<SaveTreeMutation, SaveTreeMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<SaveTreeMutation, SaveTreeMutationVariables>(SaveTreeDocument, options);
}
export type SaveTreeMutationHookResult = ReturnType<typeof useSaveTreeMutation>;
export type SaveTreeMutationResult = Apollo.MutationResult<SaveTreeMutation>;
export type SaveTreeMutationOptions = Apollo.BaseMutationOptions<SaveTreeMutation, SaveTreeMutationVariables>;
export const UserInfoDocument = gql`
    query USER_INFO($type: PermissionTypes!, $actions: [PermissionsActions!]!) {
        me {
            login
            ...RecordIdentity
        }
        permissions: isAllowed(type: $type, actions: $actions) {
            name
            allowed
        }
    }
    ${RecordIdentityFragmentDoc}
`;

/**
 * __useUserInfoQuery__
 *
 * To run a query within a React component, call `useUserInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserInfoQuery({
 *   variables: {
 *      type: // value for 'type'
 *      actions: // value for 'actions'
 *   },
 * });
 */
export function useUserInfoQuery(baseOptions: Apollo.QueryHookOptions<UserInfoQuery, UserInfoQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useQuery<UserInfoQuery, UserInfoQueryVariables>(UserInfoDocument, options);
}
export function useUserInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserInfoQuery, UserInfoQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useLazyQuery<UserInfoQuery, UserInfoQueryVariables>(UserInfoDocument, options);
}
export type UserInfoQueryHookResult = ReturnType<typeof useUserInfoQuery>;
export type UserInfoLazyQueryHookResult = ReturnType<typeof useUserInfoLazyQuery>;
export type UserInfoQueryResult = Apollo.QueryResult<UserInfoQuery, UserInfoQueryVariables>;
