/* tslint:disable */
/* eslint-disable */
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

export enum AttributeFormat {
    boolean = 'boolean',
    date = 'date',
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

export enum IOTypes {
    boolean = 'boolean',
    number = 'number',
    object = 'object',
    string = 'string'
}

export enum LibraryBehavior {
    files = 'files',
    standard = 'standard'
}

export enum PermissionTypes {
    admin = 'admin',
    attribute = 'attribute',
    library = 'library',
    record = 'record'
}

export enum PermissionsActions {
    access = 'access',
    access_attribute = 'access_attribute',
    admin_access_attributes = 'admin_access_attributes',
    admin_access_libraries = 'admin_access_libraries',
    admin_access_navigator = 'admin_access_navigator',
    admin_access_permissions = 'admin_access_permissions',
    admin_access_trees = 'admin_access_trees',
    admin_create_attribute = 'admin_create_attribute',
    admin_create_library = 'admin_create_library',
    admin_create_tree = 'admin_create_tree',
    admin_delete_attribute = 'admin_delete_attribute',
    admin_delete_library = 'admin_delete_library',
    admin_delete_tree = 'admin_delete_tree',
    admin_edit_attribute = 'admin_edit_attribute',
    admin_edit_library = 'admin_edit_library',
    admin_edit_permission = 'admin_edit_permission',
    admin_edit_tree = 'admin_edit_tree',
    create = 'create',
    create_value = 'create_value',
    delete = 'delete',
    delete_value = 'delete_value',
    edit = 'edit',
    edit_value = 'edit_value'
}

export enum PermissionsRelation {
    and = 'and',
    or = 'or'
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

export interface AttributeInput {
    id: string;
    type?: AttributeType | null;
    format?: AttributeFormat | null;
    label?: SystemTranslationInput | null;
    linked_library?: string | null;
    linked_tree?: string | null;
    embedded_fields?: (EmbeddedAttributeInput | null)[] | null;
    actions_list?: ActionsListConfigurationInput | null;
    permissions_conf?: Treepermissions_confInput | null;
    multiple_values?: boolean | null;
    versions_conf?: ValuesVersionsConfInput | null;
    metadata_fields?: string[] | null;
    values_list?: ValuesListConfInput | null;
}

export interface EmbeddedAttributeInput {
    id: string;
    format?: AttributeFormat | null;
    label?: SystemTranslationInput | null;
    validation_regex?: string | null;
    embedded_fields?: (EmbeddedAttributeInput | null)[] | null;
}

export interface LibraryInput {
    id: string;
    label?: SystemTranslationInput | null;
    attributes?: string[] | null;
    behavior?: LibraryBehavior | null;
    permissions_conf?: Treepermissions_confInput | null;
    recordIdentityConf?: RecordIdentityConfInput | null;
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
 */
export interface PermissionTarget {
    attributeId?: string | null;
    recordId: string;
}

/**
 * If id and library are not specified, permission will apply to tree root
 */
export interface PermissionsTreeTargetInput {
    tree: string;
    library?: string | null;
    id?: string | null;
}

export interface RecordIdentityConfInput {
    label?: string | null;
    color?: string | null;
    preview?: string | null;
}

export interface SystemTranslationInput {
    fr: string;
    en?: string | null;
}

export interface TreeElementInput {
    id: string;
    library: string;
}

export interface TreeInput {
    id: string;
    libraries?: string[] | null;
    behavior?: TreeBehavior | null;
    label?: SystemTranslationInput | null;
}

export interface Treepermissions_confInput {
    permissionTreeAttributes: string[];
    relation: PermissionsRelation;
}

export interface ValueBatchInput {
    attribute?: string | null;
    id_value?: string | null;
    value?: string | null;
    metadata?: any | null;
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
    value: TreeElementInput;
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
