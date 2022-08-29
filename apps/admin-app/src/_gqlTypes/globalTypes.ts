// Copyright LEAV Solutions 2017
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

export enum AttributeFormat {
    boolean = 'boolean',
    date = 'date',
    date_range = 'date_range',
    encrypted = 'encrypted',
    extended = 'extended',
    numeric = 'numeric',
    text = 'text'
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
    admin_access_applications = 'admin_access_applications',
    admin_access_attributes = 'admin_access_attributes',
    admin_access_libraries = 'admin_access_libraries',
    admin_access_permissions = 'admin_access_permissions',
    admin_access_trees = 'admin_access_trees',
    admin_application = 'admin_application',
    admin_create_application = 'admin_create_application',
    admin_create_attribute = 'admin_create_attribute',
    admin_create_library = 'admin_create_library',
    admin_create_tree = 'admin_create_tree',
    admin_delete_application = 'admin_delete_application',
    admin_delete_attribute = 'admin_delete_attribute',
    admin_delete_library = 'admin_delete_library',
    admin_delete_tree = 'admin_delete_tree',
    admin_edit_application = 'admin_edit_application',
    admin_edit_attribute = 'admin_edit_attribute',
    admin_edit_library = 'admin_edit_library',
    admin_edit_permission = 'admin_edit_permission',
    admin_edit_tree = 'admin_edit_tree',
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

export enum TreeBehavior {
    files = 'files',
    standard = 'standard'
}

export enum ValueVersionMode {
    simple = 'simple',
    smart = 'smart'
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

export interface ApplicationIconInput {
    libraryId: string;
    recordId: string;
}

export interface ApplicationInput {
    id: string;
    label?: SystemTranslation | null;
    type?: ApplicationType | null;
    description?: SystemTranslation | null;
    libraries?: string[] | null;
    trees?: string[] | null;
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
    description?: SystemTranslation | null;
    linked_library?: string | null;
    linked_tree?: string | null;
    embedded_fields?: (EmbeddedAttributeInput | null)[] | null;
    actions_list?: ActionsListConfigurationInput | null;
    permissions_conf?: Treepermissions_confInput | null;
    multiple_values?: boolean | null;
    versions_conf?: ValuesVersionsConfInput | null;
    metadata_fields?: string[] | null;
    values_list?: ValuesListConfInput | null;
    reverse_link?: string | null;
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
    value: TreeElementInput;
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
}

export interface LibraryInput {
    id: string;
    label?: SystemTranslation | null;
    attributes?: string[] | null;
    fullTextAttributes?: string[] | null;
    behavior?: LibraryBehavior | null;
    permissions_conf?: Treepermissions_confInput | null;
    recordIdentityConf?: RecordIdentityConfInput | null;
    defaultView?: string | null;
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

export interface RecordIdentityConfInput {
    label?: string | null;
    color?: string | null;
    preview?: string | null;
    treeColorPreview?: string | null;
}

export interface SortApplications {
    field: ApplicationSortableFields;
    order?: SortOrder | null;
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
    name: string;
    value: string;
}

export interface ValuesListConfInput {
    enable: boolean;
    allowFreeEntry?: boolean | null;
    values?: string[] | null;
}

export interface ValuesVersionsConfInput {
    versionable: boolean;
    mode?: ValueVersionMode | null;
    trees?: string[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
