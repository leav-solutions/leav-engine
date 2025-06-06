// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ActionIOTypes {
    boolean = 'boolean',
    number = 'number',
    object = 'object',
    string = 'string'
}

export enum ApiKeysSortableFields {
    createdAt = 'createdAt',
    createdBy = 'createdBy',
    expiresAt = 'expiresAt',
    label = 'label',
    modifiedAt = 'modifiedAt',
    modifiedBy = 'modifiedBy'
}

export enum ApplicationEventTypes {
    DELETE = 'DELETE',
    SAVE = 'SAVE'
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

export enum MultiLinkDisplayOption {
    avatar = 'avatar',
    tag = 'tag',
    badge_qty = 'badge_qty'
}

export enum AttributeType {
    advanced = 'advanced',
    advanced_link = 'advanced_link',
    simple = 'simple',
    simple_link = 'simple_link',
    tree = 'tree'
}

export enum AvailableLanguage {
    en = 'en',
    fr = 'fr'
}

export enum FormElementTypes {
    field = 'field',
    layout = 'layout'
}

export enum IOTypes {
    boolean = 'boolean',
    number = 'number',
    object = 'object',
    string = 'string'
}

export enum LibraryBehavior {
    directories = 'directories',
    files = 'files',
    standard = 'standard',
    join = 'join'
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

export enum PermissionsRelation {
    and = 'and',
    or = 'or'
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

export enum ValueVersionMode {
    simple = 'simple',
    smart = 'smart'
}

export enum VersionProfilesSortableFields {
    id = 'id'
}

export interface ActionConfigurationInput {
    id: string;
    params?: ActionConfigurationParamInput[] | null;
}

export interface ActionConfigurationParamInput {
    name: string;
    value: string;
}

export interface ActionsListConfigurationInput {
    saveValue?: ActionConfigurationInput[] | null;
    getValue?: ActionConfigurationInput[] | null;
    deleteValue?: ActionConfigurationInput[] | null;
}

export interface ApiKeyInput {
    id?: string | null;
    label: string;
    expiresAt?: number | null;
    userId: string;
}

export interface ApiKeysFiltersInput {
    label?: string | null;
    user_id?: string | null;
    createdBy?: number | null;
    modifiedBy?: number | null;
}

export interface ApplicationEventFiltersInput {
    ignoreOwnEvents?: boolean | null;
    applicationId?: string | null;
    events?: ApplicationEventTypes[] | null;
}

export interface ApplicationIconInput {
    libraryId: string;
    recordId: string;
}

export interface ApplicationInput {
    id: string;
    label?: SystemTranslation | null;
    type?: ApplicationType | null;
    description?: SystemTranslation | null;
    color?: string | null;
    icon?: ApplicationIconInput | null;
    module?: string | null;
    endpoint?: string | null;
    settings?: JSONObject | null;
}

export interface ApplicationsFiltersInput {
    id?: string | null;
    label?: string | null;
    type?: (ApplicationType | null)[] | null;
    system?: boolean | null;
    endpoint?: string | null;
    module?: string | null;
}

export interface AttributeInput {
    id: string;
    type?: AttributeType | null;
    format?: AttributeFormat | null;
    label?: SystemTranslation | null;
    readonly?: boolean | null;
    required?: boolean | null;
    description?: SystemTranslation | null;
    linked_library?: string | null;
    linked_tree?: string | null;
    embedded_fields?: (EmbeddedAttributeInput | null)[] | null;
    actions_list?: ActionsListConfigurationInput | null;
    permissions_conf?: Treepermissions_confInput | null;
    multiple_values?: boolean | null;
    multi_link_display_option?: MultiLinkDisplayOption | null;
    settings?: JSONObject | null;
    versions_conf?: ValuesVersionsConfInput | null;
    metadata_fields?: string[] | null;
    values_list?: ValuesListConfInput | null;
    reverse_link?: string | null;
    unique?: boolean | null;
    character_limit?: number | null;
    maxLength?: number | null;
}

export interface DeleteTaskInput {
    id: string;
    archive: boolean;
}

export interface EmbeddedAttributeInput {
    id: string;
    format?: AttributeFormat | null;
    label?: SystemTranslation | null;
    description?: SystemTranslation | null;
    validation_regex?: string | null;
    embedded_fields?: (EmbeddedAttributeInput | null)[] | null;
}

export interface FormDependencyValueInput {
    attribute: string;
    value: string;
}

export interface FormElementInput {
    id: string;
    containerId: string;
    order: number;
    uiElementType: string;
    type: FormElementTypes;
    settings: FormElementSettingsInput[];
}

export interface FormElementSettingsInput {
    key: string;
    value: Any;
}


export interface FormSidePanelInput {
    enable: boolean,
    isOpenByDefault: boolean
}


export interface FormElementsByDepsInput {
    dependencyValue?: FormDependencyValueInput | null;
    elements: FormElementInput[];
}

export interface FormInput {
    id: string;
    library: string;
    label?: SystemTranslation | null;
    dependencyAttributes?: string[] | null;
    elements?: FormElementsByDepsInput[] | null;
    sidePanel?: FormSidePanelInput | null;
}

export interface GlobalSettingsFileInput {
    library: string;
    recordId: string;
}

export interface GlobalSettingsInput {
    name?: string | null;
    icon?: GlobalSettingsFileInput | null;
    favicon?: GlobalSettingsFileInput | null;
    settings?: JSONObject | null
}

export interface LibraryIconInput {
    libraryId: string;
    recordId: string;
}

export interface LibraryInput {
    id: string;
    label?: SystemTranslation | null;
    icon?: LibraryIconInput | null;
    attributes?: string[] | null;
    fullTextAttributes?: string[] | null;
    behavior?: LibraryBehavior | null;
    settings?: JSONObject | null;
    permissions_conf?: Treepermissions_confInput | null;
    recordIdentityConf?: RecordIdentityConfInput | null;
    defaultView?: string | null;
    previewsSettings?: LibraryPreviewsSettingsInput[] | null;
}

export interface LibraryPreviewsSettingsInput {
    label: SystemTranslation;
    description?: SystemTranslation | null;
    versions: PreviewVersionInput;
}

export interface Pagination {
    limit: number;
    offset: number;
}

export interface PermissionActionInput {
    name: PermissionsActions;
    allowed?: boolean | null;
}

/**
 * If users group is not specified, permission will be saved at root level.
 * If saving a tree-based permission (record or attribute) and tree target's id is not specified,
 * permission will be saved at root level for any element of the tree.
 */
export interface PermissionInput {
    type: PermissionTypes;
    applyTo?: string | null;
    usersGroup?: string | null;
    actions: PermissionActionInput[];
    permissionTreeTarget?: PermissionsTreeTargetInput | null;
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

/**
 * If id and library are not specified, permission will apply to tree root
 */
export interface PermissionsTreeTargetInput {
    tree: string;
    nodeId?: string | null;
}

export interface PreviewVersionInput {
    background: string;
    density: number;
    sizes: PreviewVersionSizeInput[];
}

export interface PreviewVersionSizeInput {
    name: string;
    size: number;
}

export interface RecordIdentityConfInput {
    label?: string | null;
    color?: string | null;
    preview?: string | null;
    treeColorPreview?: string | null;
    subLabel?: string | null;
}

export interface SortApiKeysInput {
    field: ApiKeysSortableFields;
    order?: SortOrder | null;
}

export interface SortApplications {
    field: ApplicationSortableFields;
    order?: SortOrder | null;
}

export interface SortVersionProfilesInput {
    field: VersionProfilesSortableFields;
    order?: SortOrder | null;
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

export interface TreeInput {
    id: string;
    libraries?: TreeLibraryInput[] | null;
    behavior?: TreeBehavior | null;
    label?: SystemTranslation | null;
    permissions_conf?: TreeNodePermissionsConfInput[] | null;
    settings?: JSONObject | null;
}

export interface TreeLibraryInput {
    library: string;
    settings: TreeLibrarySettingsInput;
}

export interface TreeLibrarySettingsInput {
    allowMultiplePositions: boolean;
    allowedChildren: string[];
    allowedAtRoot: boolean;
}

export interface TreeNodePermissionsConfInput {
    libraryId: string;
    permissionsConf: Treepermissions_confInput;
}

export interface Treepermissions_confInput {
    permissionTreeAttributes: string[];
    relation: PermissionsRelation;
}

export interface TreesFiltersInput {
    id?: string[] | null;
    label?: string[] | null;
    system?: boolean | null;
    behavior?: TreeBehavior | null;
    library?: string | null;
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

export interface ValuesListConfInput {
    enable: boolean;
    allowFreeEntry?: boolean | null;
    allowListUpdate?: boolean | null;
    values?: string[] | null;
}

export interface ValuesVersionsConfInput {
    versionable: boolean;
    mode?: ValueVersionMode | null;
    profile?: string | null;
}

export interface VersionProfileInput {
    id: string;
    label?: SystemTranslation | null;
    description?: SystemTranslation | null;
    trees?: string[] | null;
}

export interface VersionProfilesFiltersInput {
    id?: string | null;
    label?: string | null;
    trees?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
