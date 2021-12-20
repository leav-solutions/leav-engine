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
    files = 'files',
    standard = 'standard'
}

export enum PermissionTypes {
    app = 'app',
    attribute = 'attribute',
    library = 'library',
    record = 'record',
    record_attribute = 'record_attribute',
    tree = 'tree',
    tree_library = 'tree_library',
    tree_node = 'tree_node'
}

export enum PermissionsActions {
    access_attribute = 'access_attribute',
    access_record = 'access_record',
    access_tree = 'access_tree',
    app_access_attributes = 'app_access_attributes',
    app_access_forms = 'app_access_forms',
    app_access_libraries = 'app_access_libraries',
    app_access_navigator = 'app_access_navigator',
    app_access_permissions = 'app_access_permissions',
    app_access_trees = 'app_access_trees',
    app_create_attribute = 'app_create_attribute',
    app_create_form = 'app_create_form',
    app_create_library = 'app_create_library',
    app_create_tree = 'app_create_tree',
    app_delete_attribute = 'app_delete_attribute',
    app_delete_form = 'app_delete_form',
    app_delete_library = 'app_delete_library',
    app_delete_tree = 'app_delete_tree',
    app_edit_attribute = 'app_edit_attribute',
    app_edit_form = 'app_edit_form',
    app_edit_library = 'app_edit_library',
    app_edit_permission = 'app_edit_permission',
    app_edit_tree = 'app_edit_tree',
    app_manage_global_preferences = 'app_manage_global_preferences',
    create_record = 'create_record',
    create_value = 'create_value',
    delete_record = 'delete_record',
    delete_value = 'delete_value',
    edit_children = 'edit_children',
    edit_record = 'edit_record',
    edit_tree = 'edit_tree',
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
    recordId: string;
    libraryId?: string | null;
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
    metadata?: ValueMetadata | null;
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
