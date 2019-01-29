/* tslint:disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

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

export enum AvailableActionsName {
    encrypt = 'encrypt',
    formatDate = 'formatDate',
    formatNumber = 'formatNumber',
    parseJSON = 'parseJSON',
    toBoolean = 'toBoolean',
    toJSON = 'toJSON',
    toNumber = 'toNumber',
    toString = 'toString',
    validateFormat = 'validateFormat',
    validateRegex = 'validateRegex'
}

export enum AvailableLanguage {
    en = 'en',
    fr = 'fr'
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
    create = 'create',
    create_attribute = 'create_attribute',
    create_library = 'create_library',
    create_tree = 'create_tree',
    create_value = 'create_value',
    delete = 'delete',
    delete_attribute = 'delete_attribute',
    delete_library = 'delete_library',
    delete_tree = 'delete_tree',
    delete_value = 'delete_value',
    edit = 'edit',
    edit_attribute = 'edit_attribute',
    edit_library = 'edit_library',
    edit_permission = 'edit_permission',
    edit_tree = 'edit_tree',
    edit_value = 'edit_value'
}

export enum PermissionsRelation {
    and = 'and',
    or = 'or'
}

export interface ActionConfigurationInput {
    name: AvailableActionsName;
    params?: (ActionConfigurationParamInput | null)[] | null;
}

export interface ActionConfigurationParamInput {
    name: string;
    value: string;
}

export interface ActionsListConfigurationInput {
    saveValue?: (ActionConfigurationInput | null)[] | null;
    getValue?: (ActionConfigurationInput | null)[] | null;
    deleteValue?: (ActionConfigurationInput | null)[] | null;
}

export interface AttributeInput {
    id: string;
    type: AttributeType;
    format?: AttributeFormat | null;
    label?: SystemTranslationInput | null;
    linked_library?: string | null;
    linked_tree?: string | null;
    embedded_fields?: (EmbeddedAttributeInput | null)[] | null;
    actions_list?: ActionsListConfigurationInput | null;
    permissionsConf?: TreePermissionsConfInput | null;
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
    permissionsConf?: TreePermissionsConfInput | null;
    recordIdentityConf?: RecordIdentityConfInput | null;
}

export interface PermissionActionInput {
    name: PermissionsActions;
    allowed?: boolean | null;
}

export interface PermissionInput {
    type: PermissionTypes;
    applyTo?: string | null;
    usersGroup: string;
    actions: PermissionActionInput[];
    permissionTreeTarget?: PermissionsTreeTargetInput | null;
}

export interface PermissionsTreeTargetInput {
    tree: string;
    library: string;
    id: string;
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
    label?: SystemTranslationInput | null;
}

export interface TreePermissionsConfInput {
    permissionTreeAttributes: string[];
    relation: PermissionsRelation;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
