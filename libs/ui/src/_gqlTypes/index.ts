// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
    Any: any;
    DateTime: any;
    FullTreeContent: any;
    JSON: any;
    JSONObject: any;
    SystemTranslation: any;
    TaskPriority: any;
    Upload: any;
};

export type ActionConfigurationInput = {
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

export enum ApplicationInstallStatus {
    ERROR = 'ERROR',
    NONE = 'NONE',
    RUNNING = 'RUNNING',
    SUCCESS = 'SUCCESS'
}

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
    value: TreeElementInput;
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
    id?: InputMaybe<Scalars['ID']>;
    label?: InputMaybe<Scalars['String']>;
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
    recordIdentityConf?: InputMaybe<RecordIdentityConfInput>;
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
    id?: InputMaybe<Scalars['ID']>;
    label?: InputMaybe<Scalars['String']>;
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
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | {
                      id: string;
                      whoAmI: {
                          id: string;
                          label?: string | null;
                          color?: string | null;
                          library: {id: string; label?: any | null};
                          preview?: {
                              tiny?: string | null;
                              small?: string | null;
                              medium?: string | null;
                              big?: string | null;
                              huge?: string | null;
                          } | null;
                      };
                  }
                | null;
            permissions: {access_application: boolean; admin_application: boolean};
            install?: {status: ApplicationInstallStatus; lastCallResult?: string | null} | null;
        }>;
    } | null;
};

export type GetApplicationModulesQueryVariables = Exact<{[key: string]: never}>;

export type GetApplicationModulesQuery = {
    applicationsModules: Array<{id: string; description?: string | null; version?: string | null}>;
};

export type InstallApplicationMutationVariables = Exact<{
    id: Scalars['ID'];
}>;

export type InstallApplicationMutation = {installApplication: string};

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
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | {
                  id: string;
                  whoAmI: {
                      id: string;
                      label?: string | null;
                      color?: string | null;
                      library: {id: string; label?: any | null};
                      preview?: {
                          tiny?: string | null;
                          small?: string | null;
                          medium?: string | null;
                          big?: string | null;
                          huge?: string | null;
                      } | null;
                  };
              }
            | null;
        permissions: {access_application: boolean; admin_application: boolean};
        install?: {status: ApplicationInstallStatus; lastCallResult?: string | null} | null;
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
            library: {id: string; label?: any | null};
            preview?: {
                tiny?: string | null;
                small?: string | null;
                medium?: string | null;
                big?: string | null;
                huge?: string | null;
            } | null;
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
            preview {
                tiny
                small
                medium
                big
                huge
            }
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
        install {
            status
            lastCallResult
        }
        settings
    }
    ${RecordIdentityFragmentDoc}
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
                ...ApplicationDetails
            }
        }
    }
    ${ApplicationDetailsFragmentDoc}
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
export const InstallApplicationDocument = gql`
    mutation INSTALL_APPLICATION($id: ID!) {
        installApplication(id: $id)
    }
`;
export type InstallApplicationMutationFn = Apollo.MutationFunction<
    InstallApplicationMutation,
    InstallApplicationMutationVariables
>;

/**
 * __useInstallApplicationMutation__
 *
 * To run a mutation, you first call `useInstallApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInstallApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [installApplicationMutation, { data, loading, error }] = useInstallApplicationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useInstallApplicationMutation(
    baseOptions?: Apollo.MutationHookOptions<InstallApplicationMutation, InstallApplicationMutationVariables>
) {
    const options = {...defaultOptions, ...baseOptions};
    return Apollo.useMutation<InstallApplicationMutation, InstallApplicationMutationVariables>(
        InstallApplicationDocument,
        options
    );
}
export type InstallApplicationMutationHookResult = ReturnType<typeof useInstallApplicationMutation>;
export type InstallApplicationMutationResult = Apollo.MutationResult<InstallApplicationMutation>;
export type InstallApplicationMutationOptions = Apollo.BaseMutationOptions<
    InstallApplicationMutation,
    InstallApplicationMutationVariables
>;
export const SaveApplicationDocument = gql`
    mutation SAVE_APPLICATION($application: ApplicationInput!) {
        saveApplication(application: $application) {
            ...ApplicationDetails
        }
    }
    ${ApplicationDetailsFragmentDoc}
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
