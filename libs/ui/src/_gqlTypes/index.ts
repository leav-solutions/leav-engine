// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPreviewScalar} from '@leav/utils'
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
  SystemTranslationOptional: any;
  TaskPriority: any;
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

export type DetailsApplicationFragment = { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } };

export type RecordIdentityFragment = { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } };

export type AttributeDetailsLinkAttributeFragment = { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, required: boolean, description?: any | null, multiple_values: boolean, linked_library?: { id: string, label?: any | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null };

export type AttributeDetailsStandardAttributeFragment = { unique?: boolean | null, maxLength?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, required: boolean, description?: any | null, multiple_values: boolean, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null };

export type AttributeDetailsTreeAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, required: boolean, description?: any | null, multiple_values: boolean, linked_tree?: { id: string, label?: any | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null };

export type AttributeDetailsFragment = AttributeDetailsLinkAttributeFragment | AttributeDetailsStandardAttributeFragment | AttributeDetailsTreeAttributeFragment;

export type AttributesByLibAttributeLinkAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, linked_library?: { id: string } | null };

export type AttributesByLibAttributeStandardAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, embedded_fields?: Array<{ id: string, format?: AttributeFormat | null, label?: any | null } | null> | null };

export type AttributesByLibAttributeTreeAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, linked_tree?: { id: string, label?: any | null, libraries: Array<{ library: { id: string, label?: any | null } }> } | null };

export type AttributesByLibAttributeFragment = AttributesByLibAttributeLinkAttributeFragment | AttributesByLibAttributeStandardAttributeFragment | AttributesByLibAttributeTreeAttributeFragment;

export type LibraryLightFragment = { id: string, label?: any | null, icon?: { id: string, whoAmI: { id: string, preview?: IPreviewScalar | null, library: { id: string } } } | null };

export type LibraryDetailsFragment = { id: string, label?: any | null, behavior: LibraryBehavior, system?: boolean | null, fullTextAttributes?: Array<{ id: string, label?: any | null }> | null, attributes?: Array<{ id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_library?: { id: string, behavior: LibraryBehavior } | null } | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<{ id: string, label?: any | null } | { id: string, label?: any | null, linked_tree?: { id: string } | null }> } | null, recordIdentityConf?: { label?: string | null, subLabel?: string | null, color?: string | null, preview?: string | null, treeColorPreview?: string | null } | null, permissions?: { admin_library: boolean, access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, previewsSettings?: Array<{ label: any, description?: any | null, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } }> | null };

export type LibraryAttributesLinkAttributeFragment = { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_library?: { id: string, behavior: LibraryBehavior } | null };

export type LibraryAttributesStandardAttributeTreeAttributeFragment = { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null };

export type LibraryAttributesFragment = LibraryAttributesLinkAttributeFragment | LibraryAttributesStandardAttributeTreeAttributeFragment;

export type LibraryLinkAttributeDetailsFragment = { linked_library?: { id: string, behavior: LibraryBehavior } | null };

export type LibraryPreviewsSettingsFragment = { label: any, description?: any | null, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } };

export type RecordFormElementFragment = { id: string, containerId: string, uiElementType: string, type: FormElementTypes, valueError?: string | null, values?: Array<{ id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }> | null, attribute?: { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, linked_library?: { id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null } | null, linkValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, metadata_fields?: Array<{ id: string }> | null }> | null } | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, metadata_fields?: Array<{ id: string }> | null }> | null } | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, linked_tree?: { id: string, label?: any | null } | null, treeValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<{ id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, metadata_fields?: Array<{ id: string }> | null }> | null } | null, settings: Array<{ key: string, value: any }> };

export type ValueDetailsLinkValueFragment = { id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null };

export type ValueDetailsTreeValueFragment = { id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null };

export type ValueDetailsValueFragment = { value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null };

export type ValueDetailsFragment = ValueDetailsLinkValueFragment | ValueDetailsTreeValueFragment | ValueDetailsValueFragment;

export type ValuesVersionDetailsFragment = { treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null };

export type RecordFormAttributeLinkAttributeFragment = { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, linked_library?: { id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null } | null, linkValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, metadata_fields?: Array<{ id: string }> | null }> | null };

export type RecordFormAttributeStandardAttributeFragment = { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, metadata_fields?: Array<{ id: string }> | null }> | null };

export type RecordFormAttributeTreeAttributeFragment = { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, linked_tree?: { id: string, label?: any | null } | null, treeValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<{ id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, metadata_fields?: Array<{ id: string }> | null }> | null };

export type RecordFormAttributeFragment = RecordFormAttributeLinkAttributeFragment | RecordFormAttributeStandardAttributeFragment | RecordFormAttributeTreeAttributeFragment;

export type StandardValuesListFragmentStandardDateRangeValuesListConfFragment = { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null };

export type StandardValuesListFragmentStandardStringValuesListConfFragment = { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null };

export type StandardValuesListFragmentFragment = StandardValuesListFragmentStandardDateRangeValuesListConfFragment | StandardValuesListFragmentStandardStringValuesListConfFragment;

export type TreeDetailsFragment = { id: string, label?: any | null, behavior: TreeBehavior, system: boolean, libraries: Array<{ library: { id: string, label?: any | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }> };

export type TreeLightFragment = { id: string, label?: any | null };

export type TreeNodeChildFragment = { id: string, order?: number | null, childrenCount?: number | null, record: { id: string, active?: Array<{ value?: any | null }> | null, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ id: string, record: { id: string, library: { id: string, label?: any | null }, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null, permissions: { access_tree: boolean, detach: boolean, edit_children: boolean } };

export type ViewDetailsFragment = { id: string, shared: boolean, label: any, description?: any | null, color?: string | null, display: { size: ViewSizes, type: ViewTypes }, created_by: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } }, filters?: Array<{ field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, tree?: { id: string, label?: any | null } | null }> | null, sort?: { field: string, order: SortOrder } | null, valuesVersions?: Array<{ treeId: string, treeNode: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } }> | null, settings?: Array<{ name: string, value?: any | null }> | null };

export type CheckApplicationExistenceQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']>;
  endpoint?: InputMaybe<Scalars['String']>;
}>;


export type CheckApplicationExistenceQuery = { applications?: { totalCount: number } | null };

export type GetApplicationByIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetApplicationByIdQuery = { applications?: { list: Array<{ id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } }> } | null };

export type GetApplicationModulesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApplicationModulesQuery = { applicationsModules: Array<{ id: string, description?: string | null, version?: string | null }> };

export type SaveApplicationMutationVariables = Exact<{
  application: ApplicationInput;
}>;


export type SaveApplicationMutation = { saveApplication: { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } } };

export type CheckAttributeExistenceQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type CheckAttributeExistenceQuery = { attributes?: { totalCount: number } | null };

export type DeleteAttributeMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']>;
}>;


export type DeleteAttributeMutation = { deleteAttribute: { id: string } };

export type GetAttributeByIdQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']>;
}>;


export type GetAttributeByIdQuery = { attributes?: { list: Array<{ reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, required: boolean, description?: any | null, multiple_values: boolean, linked_library?: { id: string, label?: any | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null } | { unique?: boolean | null, maxLength?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, required: boolean, description?: any | null, multiple_values: boolean, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null } | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, required: boolean, description?: any | null, multiple_values: boolean, linked_tree?: { id: string, label?: any | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }> } | null };

export type GetAttributesByLibQueryVariables = Exact<{
  library: Scalars['String'];
}>;


export type GetAttributesByLibQuery = { attributes?: { list: Array<{ id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, linked_library?: { id: string } | null } | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, embedded_fields?: Array<{ id: string, format?: AttributeFormat | null, label?: any | null } | null> | null } | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, linked_tree?: { id: string, label?: any | null, libraries: Array<{ library: { id: string, label?: any | null } }> } | null }> } | null };

export type GetAttributesQueryVariables = Exact<{
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortAttributes>;
  filters?: InputMaybe<AttributesFiltersInput>;
}>;


export type GetAttributesQuery = { attributes?: { totalCount: number, list: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean }> } | null };

export type GetVersionProfilesQueryVariables = Exact<{
  filters?: InputMaybe<VersionProfilesFiltersInput>;
  sort?: InputMaybe<SortVersionProfilesInput>;
}>;


export type GetVersionProfilesQuery = { versionProfiles: { list: Array<{ id: string, label: any }> } };

export type GetVersionableAttributesByLibraryQueryVariables = Exact<{
  libraryId: Scalars['String'];
}>;


export type GetVersionableAttributesByLibraryQuery = { attributes?: { list: Array<{ id: string, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null }> } | null };

export type SaveAttributeMutationVariables = Exact<{
  attribute: AttributeInput;
}>;


export type SaveAttributeMutation = { saveAttribute: { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, required: boolean, description?: any | null, multiple_values: boolean, linked_library?: { id: string, label?: any | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null } | { unique?: boolean | null, maxLength?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, required: boolean, description?: any | null, multiple_values: boolean, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null } | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, required: boolean, description?: any | null, multiple_values: boolean, linked_tree?: { id: string, label?: any | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null } };

export type ExportQueryVariables = Exact<{
  library: Scalars['ID'];
  attributes?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
  filters?: InputMaybe<Array<RecordFilterInput> | RecordFilterInput>;
}>;


export type ExportQuery = { export: string };

export type CreateDirectoryMutationVariables = Exact<{
  library: Scalars['String'];
  nodeId: Scalars['String'];
  name: Scalars['String'];
}>;


export type CreateDirectoryMutation = { createDirectory: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } };

export type ForcePreviewsGenerationMutationVariables = Exact<{
  libraryId: Scalars['ID'];
  filters?: InputMaybe<Array<RecordFilterInput> | RecordFilterInput>;
  recordIds?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
  failedOnly?: InputMaybe<Scalars['Boolean']>;
  previewVersionSizeNames?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type ForcePreviewsGenerationMutation = { forcePreviewsGeneration: boolean };

export type GetDirectoryDataQueryVariables = Exact<{
  library: Scalars['ID'];
  directoryId: Scalars['String'];
}>;


export type GetDirectoryDataQuery = { records: { list: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } }, created_at?: Array<{ value?: any | null }> | null, created_by?: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> | null, modified_at?: Array<{ value?: any | null }> | null, modified_by?: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> | null, file_name?: Array<{ value?: any | null }> | null, file_path?: Array<{ value?: any | null }> | null, library: { behavior: LibraryBehavior } }> } };

export type UploadUpdateSubscriptionVariables = Exact<{
  filters?: InputMaybe<UploadFiltersInput>;
}>;


export type UploadUpdateSubscription = { upload: { userId: string, uid: string, progress: { length?: number | null, transferred?: number | null, speed?: number | null, runtime?: number | null, remaining?: number | null, percentage?: number | null, eta?: number | null, delta?: number | null } } };

export type UploadMutationVariables = Exact<{
  library: Scalars['String'];
  nodeId: Scalars['String'];
  files: Array<FileInput> | FileInput;
}>;


export type UploadMutation = { upload: Array<{ uid: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> };

export type ImportExcelMutationVariables = Exact<{
  file: Scalars['Upload'];
  sheets?: InputMaybe<Array<InputMaybe<SheetInput>> | InputMaybe<SheetInput>>;
  startAt?: InputMaybe<Scalars['Int']>;
}>;


export type ImportExcelMutation = { importExcel: string };

export type CheckLibraryExistenceQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;


export type CheckLibraryExistenceQuery = { libraries?: { totalCount: number } | null };

export type DeleteLibraryMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']>;
}>;


export type DeleteLibraryMutation = { deleteLibrary: { id: string } };

export type GetLibrariesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLibrariesQuery = { libraries?: { list: Array<{ id: string, label?: any | null, icon?: { id: string, whoAmI: { id: string, preview?: IPreviewScalar | null, library: { id: string } } } | null }> } | null };

export type GetLibraryByIdQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;


export type GetLibraryByIdQuery = { libraries?: { list: Array<{ id: string, label?: any | null, behavior: LibraryBehavior, system?: boolean | null, fullTextAttributes?: Array<{ id: string, label?: any | null }> | null, attributes?: Array<{ id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_library?: { id: string, behavior: LibraryBehavior } | null } | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<{ id: string, label?: any | null } | { id: string, label?: any | null, linked_tree?: { id: string } | null }> } | null, recordIdentityConf?: { label?: string | null, subLabel?: string | null, color?: string | null, preview?: string | null, treeColorPreview?: string | null } | null, permissions?: { admin_library: boolean, access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, previewsSettings?: Array<{ label: any, description?: any | null, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } }> | null }> } | null };

export type GetLibraryPermissionsQueryVariables = Exact<{
  libraryId?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;


export type GetLibraryPermissionsQuery = { libraries?: { list: Array<{ permissions?: { access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null }> } | null };

export type GetLibraryPreviewsSettingsQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetLibraryPreviewsSettingsQuery = { libraries?: { list: Array<{ id: string, label?: any | null, behavior: LibraryBehavior, previewsSettings?: Array<{ description?: any | null, label: any, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } }> | null }> } | null };

export type SaveLibraryMutationVariables = Exact<{
  library: LibraryInput;
}>;


export type SaveLibraryMutation = { saveLibrary: { id: string, label?: any | null, behavior: LibraryBehavior, system?: boolean | null, fullTextAttributes?: Array<{ id: string, label?: any | null }> | null, attributes?: Array<{ id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_library?: { id: string, behavior: LibraryBehavior } | null } | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<{ id: string, label?: any | null } | { id: string, label?: any | null, linked_tree?: { id: string } | null }> } | null, recordIdentityConf?: { label?: string | null, subLabel?: string | null, color?: string | null, preview?: string | null, treeColorPreview?: string | null } | null, permissions?: { admin_library: boolean, access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, previewsSettings?: Array<{ label: any, description?: any | null, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } }> | null } };

export type IsAllowedQueryVariables = Exact<{
  type: PermissionTypes;
  actions: Array<PermissionsActions> | PermissionsActions;
  applyTo?: InputMaybe<Scalars['ID']>;
  target?: InputMaybe<PermissionTarget>;
}>;


export type IsAllowedQuery = { isAllowed?: Array<{ name: PermissionsActions, allowed?: boolean | null }> | null };

export type CreateRecordMutationVariables = Exact<{
  library: Scalars['ID'];
  data?: InputMaybe<CreateRecordDataInput>;
}>;


export type CreateRecordMutation = { createRecord: { record?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, valuesErrors?: Array<{ attributeId: string, id_value?: string | null, input?: string | null, message?: string | null, type: string }> | null } };

export type DeactivateRecordsMutationVariables = Exact<{
  libraryId: Scalars['String'];
  recordsIds?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  filters?: InputMaybe<Array<RecordFilterInput> | RecordFilterInput>;
}>;


export type DeactivateRecordsMutation = { deactivateRecords: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> };

export type DoesFileExistAsChildQueryVariables = Exact<{
  parentNode?: InputMaybe<Scalars['ID']>;
  treeId: Scalars['ID'];
  filename: Scalars['String'];
}>;


export type DoesFileExistAsChildQuery = { doesFileExistAsChild?: boolean | null };

export type GetFileDataQueryVariables = Exact<{
  library: Scalars['ID'];
  fileId: Scalars['String'];
  previewsStatusAttribute: Scalars['ID'];
}>;


export type GetFileDataQuery = { records: { list: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } }, created_at?: Array<{ value?: any | null }> | null, created_by?: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> | null, modified_at?: Array<{ value?: any | null }> | null, modified_by?: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> | null, file_name?: Array<{ value?: any | null }> | null, file_path?: Array<{ value?: any | null }> | null, previews_status?: Array<{ value?: any | null }> | null, library: { behavior: LibraryBehavior } }> } };

export type RecordFormQueryVariables = Exact<{
  libraryId: Scalars['String'];
  formId: Scalars['String'];
  recordId?: InputMaybe<Scalars['String']>;
  version?: InputMaybe<Array<ValueVersionInput> | ValueVersionInput>;
}>;


export type RecordFormQuery = { recordForm?: { id: string, recordId?: string | null, library: { id: string }, dependencyAttributes?: Array<{ id: string }> | null, elements: Array<{ id: string, containerId: string, uiElementType: string, type: FormElementTypes, valueError?: string | null, values?: Array<{ id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }> | null, attribute?: { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, linked_library?: { id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null } | null, linkValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, metadata_fields?: Array<{ id: string }> | null }> | null } | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, metadata_fields?: Array<{ id: string }> | null }> | null } | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, linked_tree?: { id: string, label?: any | null } | null, treeValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<{ id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null } | { enable: boolean, allowFreeEntry?: boolean | null, values?: Array<string> | null } | null, metadata_fields?: Array<{ id: string }> | null }> | null } | null, settings: Array<{ key: string, value: any }> }> } | null };

export type RecordUpdateSubscriptionVariables = Exact<{
  filters?: InputMaybe<RecordUpdateFilterInput>;
}>;


export type RecordUpdateSubscription = { recordUpdate: { record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } }, modified_by?: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> | null }, updatedValues: Array<{ attribute: string, value: { id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } }> } };

export type IndexRecordsMutationVariables = Exact<{
  libraryId: Scalars['String'];
  records?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type IndexRecordsMutation = { indexRecords: boolean };

export type CancelTaskMutationVariables = Exact<{
  taskId: Scalars['ID'];
}>;


export type CancelTaskMutation = { cancelTask: boolean };

export type CheckTreeExistenceQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;


export type CheckTreeExistenceQuery = { trees?: { totalCount: number } | null };

export type DeleteTreeMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteTreeMutation = { deleteTree: { id: string } };

export type GetTreeByIdQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
}>;


export type GetTreeByIdQuery = { trees?: { list: Array<{ id: string, label?: any | null, behavior: TreeBehavior, system: boolean, libraries: Array<{ library: { id: string, label?: any | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }> }> } | null };

export type GetTreeLibrariesQueryVariables = Exact<{
  treeId?: InputMaybe<Array<Scalars['ID']> | Scalars['ID']>;
  library?: InputMaybe<Scalars['String']>;
}>;


export type GetTreeLibrariesQuery = { trees?: { totalCount: number, list: Array<{ id: string, behavior: TreeBehavior, system: boolean, libraries: Array<{ library: { id: string, label?: any | null, behavior: LibraryBehavior, system?: boolean | null }, settings: { allowMultiplePositions: boolean, allowedChildren: Array<string>, allowedAtRoot: boolean } }> }> } | null };

export type GetTreesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTreesQuery = { trees?: { list: Array<{ id: string, label?: any | null }> } | null };

export type SaveTreeMutationVariables = Exact<{
  tree: TreeInput;
}>;


export type SaveTreeMutation = { saveTree: { id: string, label?: any | null, behavior: TreeBehavior, system: boolean, libraries: Array<{ library: { id: string, label?: any | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }> } };

export type TreeNodeChildrenQueryVariables = Exact<{
  treeId: Scalars['ID'];
  node?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
}>;


export type TreeNodeChildrenQuery = { treeNodeChildren: { totalCount?: number | null, list: Array<{ id: string, order?: number | null, childrenCount?: number | null, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } }, active?: Array<{ value?: any | null }> | null }, ancestors?: Array<{ id: string, record: { id: string, library: { id: string, label?: any | null }, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null, permissions: { access_tree: boolean, detach: boolean, edit_children: boolean } }> } };

export type GetUserDataQueryVariables = Exact<{
  keys: Array<Scalars['String']> | Scalars['String'];
  global?: InputMaybe<Scalars['Boolean']>;
}>;


export type GetUserDataQuery = { userData: { global: boolean, data?: any | null } };

export type SaveUserDataMutationVariables = Exact<{
  key: Scalars['String'];
  value?: InputMaybe<Scalars['Any']>;
  global: Scalars['Boolean'];
}>;


export type SaveUserDataMutation = { saveUserData: { global: boolean, data?: any | null } };

export type DeleteValueMutationVariables = Exact<{
  library: Scalars['ID'];
  recordId: Scalars['ID'];
  attribute: Scalars['ID'];
  value?: InputMaybe<ValueInput>;
}>;


export type DeleteValueMutation = { deleteValue: Array<{ id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }> };

export type SaveValueBatchMutationVariables = Exact<{
  library: Scalars['ID'];
  recordId: Scalars['ID'];
  version?: InputMaybe<Array<ValueVersionInput> | ValueVersionInput>;
  values: Array<ValueBatchInput> | ValueBatchInput;
  deleteEmpty?: InputMaybe<Scalars['Boolean']>;
}>;


export type SaveValueBatchMutation = { saveValueBatch: { values?: Array<{ id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null } | { value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute?: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean } | null, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, value?: any | null, raw_value?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }> | null, errors?: Array<{ type: string, attribute: string, input?: string | null, message: string }> | null } };

export type DeleteViewMutationVariables = Exact<{
  viewId: Scalars['String'];
}>;


export type DeleteViewMutation = { deleteView: { id: string, library: string } };

export type GetViewQueryVariables = Exact<{
  viewId: Scalars['String'];
}>;


export type GetViewQuery = { view: { id: string, shared: boolean, label: any, description?: any | null, color?: string | null, display: { size: ViewSizes, type: ViewTypes }, created_by: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } }, filters?: Array<{ field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, tree?: { id: string, label?: any | null } | null }> | null, sort?: { field: string, order: SortOrder } | null, valuesVersions?: Array<{ treeId: string, treeNode: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } }> | null, settings?: Array<{ name: string, value?: any | null }> | null } };

export type GetViewsListQueryVariables = Exact<{
  libraryId: Scalars['String'];
}>;


export type GetViewsListQuery = { views: { totalCount: number, list: Array<{ id: string, shared: boolean, label: any, description?: any | null, color?: string | null, display: { size: ViewSizes, type: ViewTypes }, created_by: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } }, filters?: Array<{ field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, tree?: { id: string, label?: any | null } | null }> | null, sort?: { field: string, order: SortOrder } | null, valuesVersions?: Array<{ treeId: string, treeNode: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } }> | null, settings?: Array<{ name: string, value?: any | null }> | null }> } };

export type AddViewMutationVariables = Exact<{
  view: ViewInput;
}>;


export type AddViewMutation = { saveView: { id: string, shared: boolean, label: any, description?: any | null, color?: string | null, display: { size: ViewSizes, type: ViewTypes }, created_by: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } }, filters?: Array<{ field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, tree?: { id: string, label?: any | null } | null }> | null, sort?: { field: string, order: SortOrder } | null, valuesVersions?: Array<{ treeId: string, treeNode: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } }> | null, settings?: Array<{ name: string, value?: any | null }> | null } };

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
    ${RecordIdentityFragmentDoc}`;
export const AttributeDetailsFragmentDoc = gql`
    fragment AttributeDetails on Attribute {
  id
  type
  format
  system
  readonly
  label
  required
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
    maxLength
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
export const AttributesByLibAttributeFragmentDoc = gql`
    fragment AttributesByLibAttribute on Attribute {
  id
  type
  format
  label
  multiple_values
  system
  readonly
  ... on LinkAttribute {
    linked_library {
      id
    }
  }
  ... on TreeAttribute {
    linked_tree {
      id
      label
      libraries {
        library {
          id
          label
        }
      }
    }
  }
  ... on StandardAttribute {
    embedded_fields {
      id
      format
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
    ${LibraryLinkAttributeDetailsFragmentDoc}`;
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
${LibraryPreviewsSettingsFragmentDoc}`;
export const ValuesVersionDetailsFragmentDoc = gql`
    fragment ValuesVersionDetails on ValueVersion {
  treeId
  treeNode {
    id
    record {
      id
      whoAmI {
        id
        label
        library {
          id
        }
      }
    }
  }
}
    `;
export const ValueDetailsFragmentDoc = gql`
    fragment ValueDetails on GenericValue {
  id_value
  isInherited
  modified_at
  modified_by {
    ...RecordIdentity
  }
  created_at
  created_by {
    ...RecordIdentity
  }
  version {
    ...ValuesVersionDetails
  }
  attribute {
    id
    format
    type
    system
  }
  metadata {
    name
    value {
      id_value
      modified_at
      modified_by {
        ...RecordIdentity
      }
      created_at
      created_by {
        ...RecordIdentity
      }
      version {
        ...ValuesVersionDetails
      }
      value
      raw_value
    }
  }
  ... on Value {
    value
    raw_value
  }
  ... on LinkValue {
    linkValue: value {
      ...RecordIdentity
    }
  }
  ... on TreeValue {
    treeValue: value {
      id
      record {
        ...RecordIdentity
      }
      ancestors {
        record {
          ...RecordIdentity
        }
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}
${ValuesVersionDetailsFragmentDoc}`;
export const StandardValuesListFragmentFragmentDoc = gql`
    fragment StandardValuesListFragment on StandardValuesListConf {
  ... on StandardStringValuesListConf {
    enable
    allowFreeEntry
    values
  }
  ... on StandardDateRangeValuesListConf {
    enable
    allowFreeEntry
    dateRangeValues: values {
      from
      to
    }
  }
}
    `;
export const RecordFormAttributeFragmentDoc = gql`
    fragment RecordFormAttribute on Attribute {
  id
  label
  description
  type
  format
  system
  readonly
  multiple_values
  permissions(record: {id: $recordId, library: $libraryId}) {
    access_attribute
    edit_value
  }
  versions_conf {
    versionable
    profile {
      id
      trees {
        id
        label
      }
    }
  }
  metadata_fields {
    id
    label
    description
    type
    format
    system
    readonly
    multiple_values
    permissions(record: {id: $recordId, library: $libraryId}) {
      access_attribute
      edit_value
    }
    values_list {
      ...StandardValuesListFragment
    }
    metadata_fields {
      id
    }
  }
  ... on StandardAttribute {
    values_list {
      ...StandardValuesListFragment
    }
  }
  ... on LinkAttribute {
    linked_library {
      id
      label
      behavior
      permissions {
        create_record
      }
    }
    linkValuesList: values_list {
      enable
      allowFreeEntry
      values {
        ...RecordIdentity
      }
    }
  }
  ... on TreeAttribute {
    linked_tree {
      id
      label
    }
    treeValuesList: values_list {
      enable
      allowFreeEntry
      values {
        id
        record {
          ...RecordIdentity
        }
        ancestors {
          record {
            ...RecordIdentity
          }
        }
      }
    }
  }
}
    ${StandardValuesListFragmentFragmentDoc}
${RecordIdentityFragmentDoc}`;
export const RecordFormElementFragmentDoc = gql`
    fragment RecordFormElement on FormElementWithValues {
  id
  containerId
  uiElementType
  type
  valueError
  values {
    ...ValueDetails
  }
  attribute {
    ...RecordFormAttribute
  }
  settings {
    key
    value
  }
}
    ${ValueDetailsFragmentDoc}
${RecordFormAttributeFragmentDoc}`;
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
export const TreeNodeChildFragmentDoc = gql`
    fragment TreeNodeChild on TreeNodeLight {
  id
  order
  childrenCount
  record {
    ...RecordIdentity
    active: property(attribute: "active") {
      ... on Value {
        value
      }
    }
  }
  ancestors {
    id
    record {
      id
      library {
        id
        label
      }
      ...RecordIdentity
    }
  }
  permissions {
    access_tree
    detach
    edit_children
  }
}
    ${RecordIdentityFragmentDoc}`;
export const ViewDetailsFragmentDoc = gql`
    fragment ViewDetails on View {
  id
  display {
    size
    type
  }
  shared
  created_by {
    id
    whoAmI {
      id
      label
      library {
        id
      }
    }
  }
  label
  description
  color
  filters {
    field
    value
    tree {
      id
      label
    }
    condition
    operator
  }
  sort {
    field
    order
  }
  valuesVersions {
    treeId
    treeNode {
      id
      record {
        ...RecordIdentity
      }
    }
  }
  settings {
    name
    value
  }
}
    ${RecordIdentityFragmentDoc}`;
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
export function useCheckApplicationExistenceQuery(baseOptions?: Apollo.QueryHookOptions<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>(CheckApplicationExistenceDocument, options);
      }
export function useCheckApplicationExistenceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>(CheckApplicationExistenceDocument, options);
        }
export type CheckApplicationExistenceQueryHookResult = ReturnType<typeof useCheckApplicationExistenceQuery>;
export type CheckApplicationExistenceLazyQueryHookResult = ReturnType<typeof useCheckApplicationExistenceLazyQuery>;
export type CheckApplicationExistenceQueryResult = Apollo.QueryResult<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>;
export const GetApplicationByIdDocument = gql`
    query GET_APPLICATION_BY_ID($id: ID!) {
  applications(filters: {id: $id}) {
    list {
      ...DetailsApplication
    }
  }
}
    ${DetailsApplicationFragmentDoc}`;

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
export function useGetApplicationByIdQuery(baseOptions: Apollo.QueryHookOptions<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>(GetApplicationByIdDocument, options);
      }
export function useGetApplicationByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>(GetApplicationByIdDocument, options);
        }
export type GetApplicationByIdQueryHookResult = ReturnType<typeof useGetApplicationByIdQuery>;
export type GetApplicationByIdLazyQueryHookResult = ReturnType<typeof useGetApplicationByIdLazyQuery>;
export type GetApplicationByIdQueryResult = Apollo.QueryResult<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>;
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
export function useGetApplicationModulesQuery(baseOptions?: Apollo.QueryHookOptions<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>(GetApplicationModulesDocument, options);
      }
export function useGetApplicationModulesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>(GetApplicationModulesDocument, options);
        }
export type GetApplicationModulesQueryHookResult = ReturnType<typeof useGetApplicationModulesQuery>;
export type GetApplicationModulesLazyQueryHookResult = ReturnType<typeof useGetApplicationModulesLazyQuery>;
export type GetApplicationModulesQueryResult = Apollo.QueryResult<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>;
export const SaveApplicationDocument = gql`
    mutation SAVE_APPLICATION($application: ApplicationInput!) {
  saveApplication(application: $application) {
    ...DetailsApplication
  }
}
    ${DetailsApplicationFragmentDoc}`;
export type SaveApplicationMutationFn = Apollo.MutationFunction<SaveApplicationMutation, SaveApplicationMutationVariables>;

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
export function useSaveApplicationMutation(baseOptions?: Apollo.MutationHookOptions<SaveApplicationMutation, SaveApplicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveApplicationMutation, SaveApplicationMutationVariables>(SaveApplicationDocument, options);
      }
export type SaveApplicationMutationHookResult = ReturnType<typeof useSaveApplicationMutation>;
export type SaveApplicationMutationResult = Apollo.MutationResult<SaveApplicationMutation>;
export type SaveApplicationMutationOptions = Apollo.BaseMutationOptions<SaveApplicationMutation, SaveApplicationMutationVariables>;
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
export function useCheckAttributeExistenceQuery(baseOptions: Apollo.QueryHookOptions<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>(CheckAttributeExistenceDocument, options);
      }
export function useCheckAttributeExistenceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>(CheckAttributeExistenceDocument, options);
        }
export type CheckAttributeExistenceQueryHookResult = ReturnType<typeof useCheckAttributeExistenceQuery>;
export type CheckAttributeExistenceLazyQueryHookResult = ReturnType<typeof useCheckAttributeExistenceLazyQuery>;
export type CheckAttributeExistenceQueryResult = Apollo.QueryResult<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>;
export const DeleteAttributeDocument = gql`
    mutation DELETE_ATTRIBUTE($id: ID) {
  deleteAttribute(id: $id) {
    id
  }
}
    `;
export type DeleteAttributeMutationFn = Apollo.MutationFunction<DeleteAttributeMutation, DeleteAttributeMutationVariables>;

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
export function useDeleteAttributeMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAttributeMutation, DeleteAttributeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAttributeMutation, DeleteAttributeMutationVariables>(DeleteAttributeDocument, options);
      }
export type DeleteAttributeMutationHookResult = ReturnType<typeof useDeleteAttributeMutation>;
export type DeleteAttributeMutationResult = Apollo.MutationResult<DeleteAttributeMutation>;
export type DeleteAttributeMutationOptions = Apollo.BaseMutationOptions<DeleteAttributeMutation, DeleteAttributeMutationVariables>;
export const GetAttributeByIdDocument = gql`
    query GET_ATTRIBUTE_BY_ID($id: ID) {
  attributes(filters: {id: $id}) {
    list {
      ...AttributeDetails
    }
  }
}
    ${AttributeDetailsFragmentDoc}`;

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
export function useGetAttributeByIdQuery(baseOptions?: Apollo.QueryHookOptions<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>(GetAttributeByIdDocument, options);
      }
export function useGetAttributeByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>(GetAttributeByIdDocument, options);
        }
export type GetAttributeByIdQueryHookResult = ReturnType<typeof useGetAttributeByIdQuery>;
export type GetAttributeByIdLazyQueryHookResult = ReturnType<typeof useGetAttributeByIdLazyQuery>;
export type GetAttributeByIdQueryResult = Apollo.QueryResult<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>;
export const GetAttributesByLibDocument = gql`
    query GET_ATTRIBUTES_BY_LIB($library: String!) {
  attributes(filters: {libraries: [$library]}) {
    list {
      ...AttributesByLibAttribute
    }
  }
}
    ${AttributesByLibAttributeFragmentDoc}`;

/**
 * __useGetAttributesByLibQuery__
 *
 * To run a query within a React component, call `useGetAttributesByLibQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAttributesByLibQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAttributesByLibQuery({
 *   variables: {
 *      library: // value for 'library'
 *   },
 * });
 */
export function useGetAttributesByLibQuery(baseOptions: Apollo.QueryHookOptions<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>(GetAttributesByLibDocument, options);
      }
export function useGetAttributesByLibLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>(GetAttributesByLibDocument, options);
        }
export type GetAttributesByLibQueryHookResult = ReturnType<typeof useGetAttributesByLibQuery>;
export type GetAttributesByLibLazyQueryHookResult = ReturnType<typeof useGetAttributesByLibLazyQuery>;
export type GetAttributesByLibQueryResult = Apollo.QueryResult<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>;
export const GetAttributesDocument = gql`
    query GET_ATTRIBUTES($pagination: Pagination, $sort: SortAttributes, $filters: AttributesFiltersInput) {
  attributes(pagination: $pagination, sort: $sort, filters: $filters) {
    totalCount
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
 *      pagination: // value for 'pagination'
 *      sort: // value for 'sort'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetAttributesQuery(baseOptions?: Apollo.QueryHookOptions<GetAttributesQuery, GetAttributesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAttributesQuery, GetAttributesQueryVariables>(GetAttributesDocument, options);
      }
export function useGetAttributesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAttributesQuery, GetAttributesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
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
export function useGetVersionProfilesQuery(baseOptions?: Apollo.QueryHookOptions<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>(GetVersionProfilesDocument, options);
      }
export function useGetVersionProfilesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>(GetVersionProfilesDocument, options);
        }
export type GetVersionProfilesQueryHookResult = ReturnType<typeof useGetVersionProfilesQuery>;
export type GetVersionProfilesLazyQueryHookResult = ReturnType<typeof useGetVersionProfilesLazyQuery>;
export type GetVersionProfilesQueryResult = Apollo.QueryResult<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>;
export const GetVersionableAttributesByLibraryDocument = gql`
    query GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY($libraryId: String!) {
  attributes(filters: {libraries: [$libraryId], versionable: true}) {
    list {
      id
      versions_conf {
        versionable
        profile {
          id
          trees {
            id
            label
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetVersionableAttributesByLibraryQuery__
 *
 * To run a query within a React component, call `useGetVersionableAttributesByLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVersionableAttributesByLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVersionableAttributesByLibraryQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useGetVersionableAttributesByLibraryQuery(baseOptions: Apollo.QueryHookOptions<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>(GetVersionableAttributesByLibraryDocument, options);
      }
export function useGetVersionableAttributesByLibraryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>(GetVersionableAttributesByLibraryDocument, options);
        }
export type GetVersionableAttributesByLibraryQueryHookResult = ReturnType<typeof useGetVersionableAttributesByLibraryQuery>;
export type GetVersionableAttributesByLibraryLazyQueryHookResult = ReturnType<typeof useGetVersionableAttributesByLibraryLazyQuery>;
export type GetVersionableAttributesByLibraryQueryResult = Apollo.QueryResult<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>;
export const SaveAttributeDocument = gql`
    mutation SAVE_ATTRIBUTE($attribute: AttributeInput!) {
  saveAttribute(attribute: $attribute) {
    ...AttributeDetails
  }
}
    ${AttributeDetailsFragmentDoc}`;
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
export function useSaveAttributeMutation(baseOptions?: Apollo.MutationHookOptions<SaveAttributeMutation, SaveAttributeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveAttributeMutation, SaveAttributeMutationVariables>(SaveAttributeDocument, options);
      }
export type SaveAttributeMutationHookResult = ReturnType<typeof useSaveAttributeMutation>;
export type SaveAttributeMutationResult = Apollo.MutationResult<SaveAttributeMutation>;
export type SaveAttributeMutationOptions = Apollo.BaseMutationOptions<SaveAttributeMutation, SaveAttributeMutationVariables>;
export const ExportDocument = gql`
    query EXPORT($library: ID!, $attributes: [ID!], $filters: [RecordFilterInput!]) {
  export(library: $library, attributes: $attributes, filters: $filters)
}
    `;

/**
 * __useExportQuery__
 *
 * To run a query within a React component, call `useExportQuery` and pass it any options that fit your needs.
 * When your component renders, `useExportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExportQuery({
 *   variables: {
 *      library: // value for 'library'
 *      attributes: // value for 'attributes'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useExportQuery(baseOptions: Apollo.QueryHookOptions<ExportQuery, ExportQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExportQuery, ExportQueryVariables>(ExportDocument, options);
      }
export function useExportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExportQuery, ExportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExportQuery, ExportQueryVariables>(ExportDocument, options);
        }
export type ExportQueryHookResult = ReturnType<typeof useExportQuery>;
export type ExportLazyQueryHookResult = ReturnType<typeof useExportLazyQuery>;
export type ExportQueryResult = Apollo.QueryResult<ExportQuery, ExportQueryVariables>;
export const CreateDirectoryDocument = gql`
    mutation CREATE_DIRECTORY($library: String!, $nodeId: String!, $name: String!) {
  createDirectory(library: $library, nodeId: $nodeId, name: $name) {
    ...RecordIdentity
  }
}
    ${RecordIdentityFragmentDoc}`;
export type CreateDirectoryMutationFn = Apollo.MutationFunction<CreateDirectoryMutation, CreateDirectoryMutationVariables>;

/**
 * __useCreateDirectoryMutation__
 *
 * To run a mutation, you first call `useCreateDirectoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDirectoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDirectoryMutation, { data, loading, error }] = useCreateDirectoryMutation({
 *   variables: {
 *      library: // value for 'library'
 *      nodeId: // value for 'nodeId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateDirectoryMutation(baseOptions?: Apollo.MutationHookOptions<CreateDirectoryMutation, CreateDirectoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDirectoryMutation, CreateDirectoryMutationVariables>(CreateDirectoryDocument, options);
      }
export type CreateDirectoryMutationHookResult = ReturnType<typeof useCreateDirectoryMutation>;
export type CreateDirectoryMutationResult = Apollo.MutationResult<CreateDirectoryMutation>;
export type CreateDirectoryMutationOptions = Apollo.BaseMutationOptions<CreateDirectoryMutation, CreateDirectoryMutationVariables>;
export const ForcePreviewsGenerationDocument = gql`
    mutation FORCE_PREVIEWS_GENERATION($libraryId: ID!, $filters: [RecordFilterInput!], $recordIds: [ID!], $failedOnly: Boolean, $previewVersionSizeNames: [String!]) {
  forcePreviewsGeneration(
    libraryId: $libraryId
    filters: $filters
    recordIds: $recordIds
    failedOnly: $failedOnly
    previewVersionSizeNames: $previewVersionSizeNames
  )
}
    `;
export type ForcePreviewsGenerationMutationFn = Apollo.MutationFunction<ForcePreviewsGenerationMutation, ForcePreviewsGenerationMutationVariables>;

/**
 * __useForcePreviewsGenerationMutation__
 *
 * To run a mutation, you first call `useForcePreviewsGenerationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForcePreviewsGenerationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forcePreviewsGenerationMutation, { data, loading, error }] = useForcePreviewsGenerationMutation({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      filters: // value for 'filters'
 *      recordIds: // value for 'recordIds'
 *      failedOnly: // value for 'failedOnly'
 *      previewVersionSizeNames: // value for 'previewVersionSizeNames'
 *   },
 * });
 */
export function useForcePreviewsGenerationMutation(baseOptions?: Apollo.MutationHookOptions<ForcePreviewsGenerationMutation, ForcePreviewsGenerationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ForcePreviewsGenerationMutation, ForcePreviewsGenerationMutationVariables>(ForcePreviewsGenerationDocument, options);
      }
export type ForcePreviewsGenerationMutationHookResult = ReturnType<typeof useForcePreviewsGenerationMutation>;
export type ForcePreviewsGenerationMutationResult = Apollo.MutationResult<ForcePreviewsGenerationMutation>;
export type ForcePreviewsGenerationMutationOptions = Apollo.BaseMutationOptions<ForcePreviewsGenerationMutation, ForcePreviewsGenerationMutationVariables>;
export const GetDirectoryDataDocument = gql`
    query GET_DIRECTORY_DATA($library: ID!, $directoryId: String!) {
  records(
    library: $library
    filters: [{field: "id", value: $directoryId, condition: EQUAL}]
  ) {
    list {
      ...RecordIdentity
      created_at: property(attribute: "created_at") {
        ... on Value {
          value
        }
      }
      created_by: property(attribute: "created_by") {
        ... on LinkValue {
          value {
            ...RecordIdentity
          }
        }
      }
      modified_at: property(attribute: "modified_at") {
        ... on Value {
          value
        }
      }
      modified_by: property(attribute: "modified_by") {
        ... on LinkValue {
          value {
            ...RecordIdentity
          }
        }
      }
      file_name: property(attribute: "file_name") {
        ... on Value {
          value
        }
      }
      file_path: property(attribute: "file_path") {
        ... on Value {
          value
        }
      }
      library {
        behavior
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}`;

/**
 * __useGetDirectoryDataQuery__
 *
 * To run a query within a React component, call `useGetDirectoryDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDirectoryDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDirectoryDataQuery({
 *   variables: {
 *      library: // value for 'library'
 *      directoryId: // value for 'directoryId'
 *   },
 * });
 */
export function useGetDirectoryDataQuery(baseOptions: Apollo.QueryHookOptions<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>(GetDirectoryDataDocument, options);
      }
export function useGetDirectoryDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>(GetDirectoryDataDocument, options);
        }
export type GetDirectoryDataQueryHookResult = ReturnType<typeof useGetDirectoryDataQuery>;
export type GetDirectoryDataLazyQueryHookResult = ReturnType<typeof useGetDirectoryDataLazyQuery>;
export type GetDirectoryDataQueryResult = Apollo.QueryResult<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>;
export const UploadUpdateDocument = gql`
    subscription UPLOAD_UPDATE($filters: UploadFiltersInput) {
  upload(filters: $filters) {
    userId
    progress {
      length
      transferred
      speed
      runtime
      remaining
      percentage
      eta
      delta
    }
    uid
  }
}
    `;

/**
 * __useUploadUpdateSubscription__
 *
 * To run a query within a React component, call `useUploadUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useUploadUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUploadUpdateSubscription({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useUploadUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<UploadUpdateSubscription, UploadUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<UploadUpdateSubscription, UploadUpdateSubscriptionVariables>(UploadUpdateDocument, options);
      }
export type UploadUpdateSubscriptionHookResult = ReturnType<typeof useUploadUpdateSubscription>;
export type UploadUpdateSubscriptionResult = Apollo.SubscriptionResult<UploadUpdateSubscription>;
export const UploadDocument = gql`
    mutation UPLOAD($library: String!, $nodeId: String!, $files: [FileInput!]!) {
  upload(library: $library, nodeId: $nodeId, files: $files) {
    uid
    record {
      ...RecordIdentity
    }
  }
}
    ${RecordIdentityFragmentDoc}`;
export type UploadMutationFn = Apollo.MutationFunction<UploadMutation, UploadMutationVariables>;

/**
 * __useUploadMutation__
 *
 * To run a mutation, you first call `useUploadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadMutation, { data, loading, error }] = useUploadMutation({
 *   variables: {
 *      library: // value for 'library'
 *      nodeId: // value for 'nodeId'
 *      files: // value for 'files'
 *   },
 * });
 */
export function useUploadMutation(baseOptions?: Apollo.MutationHookOptions<UploadMutation, UploadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadMutation, UploadMutationVariables>(UploadDocument, options);
      }
export type UploadMutationHookResult = ReturnType<typeof useUploadMutation>;
export type UploadMutationResult = Apollo.MutationResult<UploadMutation>;
export type UploadMutationOptions = Apollo.BaseMutationOptions<UploadMutation, UploadMutationVariables>;
export const ImportExcelDocument = gql`
    mutation IMPORT_EXCEL($file: Upload!, $sheets: [SheetInput], $startAt: Int) {
  importExcel(file: $file, sheets: $sheets, startAt: $startAt)
}
    `;
export type ImportExcelMutationFn = Apollo.MutationFunction<ImportExcelMutation, ImportExcelMutationVariables>;

/**
 * __useImportExcelMutation__
 *
 * To run a mutation, you first call `useImportExcelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportExcelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importExcelMutation, { data, loading, error }] = useImportExcelMutation({
 *   variables: {
 *      file: // value for 'file'
 *      sheets: // value for 'sheets'
 *      startAt: // value for 'startAt'
 *   },
 * });
 */
export function useImportExcelMutation(baseOptions?: Apollo.MutationHookOptions<ImportExcelMutation, ImportExcelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ImportExcelMutation, ImportExcelMutationVariables>(ImportExcelDocument, options);
      }
export type ImportExcelMutationHookResult = ReturnType<typeof useImportExcelMutation>;
export type ImportExcelMutationResult = Apollo.MutationResult<ImportExcelMutation>;
export type ImportExcelMutationOptions = Apollo.BaseMutationOptions<ImportExcelMutation, ImportExcelMutationVariables>;
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
export function useCheckLibraryExistenceQuery(baseOptions?: Apollo.QueryHookOptions<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>(CheckLibraryExistenceDocument, options);
      }
export function useCheckLibraryExistenceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>(CheckLibraryExistenceDocument, options);
        }
export type CheckLibraryExistenceQueryHookResult = ReturnType<typeof useCheckLibraryExistenceQuery>;
export type CheckLibraryExistenceLazyQueryHookResult = ReturnType<typeof useCheckLibraryExistenceLazyQuery>;
export type CheckLibraryExistenceQueryResult = Apollo.QueryResult<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>;
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
export function useDeleteLibraryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteLibraryMutation, DeleteLibraryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteLibraryMutation, DeleteLibraryMutationVariables>(DeleteLibraryDocument, options);
      }
export type DeleteLibraryMutationHookResult = ReturnType<typeof useDeleteLibraryMutation>;
export type DeleteLibraryMutationResult = Apollo.MutationResult<DeleteLibraryMutation>;
export type DeleteLibraryMutationOptions = Apollo.BaseMutationOptions<DeleteLibraryMutation, DeleteLibraryMutationVariables>;
export const GetLibrariesDocument = gql`
    query GET_LIBRARIES {
  libraries {
    list {
      ...LibraryLight
    }
  }
}
    ${LibraryLightFragmentDoc}`;

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
export function useGetLibrariesQuery(baseOptions?: Apollo.QueryHookOptions<GetLibrariesQuery, GetLibrariesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibrariesQuery, GetLibrariesQueryVariables>(GetLibrariesDocument, options);
      }
export function useGetLibrariesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibrariesQuery, GetLibrariesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
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
    ${LibraryDetailsFragmentDoc}`;

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
export function useGetLibraryByIdQuery(baseOptions?: Apollo.QueryHookOptions<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>(GetLibraryByIdDocument, options);
      }
export function useGetLibraryByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>(GetLibraryByIdDocument, options);
        }
export type GetLibraryByIdQueryHookResult = ReturnType<typeof useGetLibraryByIdQuery>;
export type GetLibraryByIdLazyQueryHookResult = ReturnType<typeof useGetLibraryByIdLazyQuery>;
export type GetLibraryByIdQueryResult = Apollo.QueryResult<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>;
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
export function useGetLibraryPermissionsQuery(baseOptions?: Apollo.QueryHookOptions<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>(GetLibraryPermissionsDocument, options);
      }
export function useGetLibraryPermissionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>(GetLibraryPermissionsDocument, options);
        }
export type GetLibraryPermissionsQueryHookResult = ReturnType<typeof useGetLibraryPermissionsQuery>;
export type GetLibraryPermissionsLazyQueryHookResult = ReturnType<typeof useGetLibraryPermissionsLazyQuery>;
export type GetLibraryPermissionsQueryResult = Apollo.QueryResult<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>;
export const GetLibraryPreviewsSettingsDocument = gql`
    query GET_LIBRARY_PREVIEWS_SETTINGS($id: ID!) {
  libraries(filters: {id: [$id]}) {
    list {
      id
      label
      behavior
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
    }
  }
}
    `;

/**
 * __useGetLibraryPreviewsSettingsQuery__
 *
 * To run a query within a React component, call `useGetLibraryPreviewsSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibraryPreviewsSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibraryPreviewsSettingsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLibraryPreviewsSettingsQuery(baseOptions: Apollo.QueryHookOptions<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>(GetLibraryPreviewsSettingsDocument, options);
      }
export function useGetLibraryPreviewsSettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>(GetLibraryPreviewsSettingsDocument, options);
        }
export type GetLibraryPreviewsSettingsQueryHookResult = ReturnType<typeof useGetLibraryPreviewsSettingsQuery>;
export type GetLibraryPreviewsSettingsLazyQueryHookResult = ReturnType<typeof useGetLibraryPreviewsSettingsLazyQuery>;
export type GetLibraryPreviewsSettingsQueryResult = Apollo.QueryResult<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>;
export const SaveLibraryDocument = gql`
    mutation saveLibrary($library: LibraryInput!) {
  saveLibrary(library: $library) {
    ...LibraryDetails
  }
}
    ${LibraryDetailsFragmentDoc}`;
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
export function useSaveLibraryMutation(baseOptions?: Apollo.MutationHookOptions<SaveLibraryMutation, SaveLibraryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveLibraryMutation, SaveLibraryMutationVariables>(SaveLibraryDocument, options);
      }
export type SaveLibraryMutationHookResult = ReturnType<typeof useSaveLibraryMutation>;
export type SaveLibraryMutationResult = Apollo.MutationResult<SaveLibraryMutation>;
export type SaveLibraryMutationOptions = Apollo.BaseMutationOptions<SaveLibraryMutation, SaveLibraryMutationVariables>;
export const IsAllowedDocument = gql`
    query IS_ALLOWED($type: PermissionTypes!, $actions: [PermissionsActions!]!, $applyTo: ID, $target: PermissionTarget) {
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<IsAllowedQuery, IsAllowedQueryVariables>(IsAllowedDocument, options);
      }
export function useIsAllowedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<IsAllowedQuery, IsAllowedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<IsAllowedQuery, IsAllowedQueryVariables>(IsAllowedDocument, options);
        }
export type IsAllowedQueryHookResult = ReturnType<typeof useIsAllowedQuery>;
export type IsAllowedLazyQueryHookResult = ReturnType<typeof useIsAllowedLazyQuery>;
export type IsAllowedQueryResult = Apollo.QueryResult<IsAllowedQuery, IsAllowedQueryVariables>;
export const CreateRecordDocument = gql`
    mutation CREATE_RECORD($library: ID!, $data: CreateRecordDataInput) {
  createRecord(library: $library, data: $data) {
    record {
      ...RecordIdentity
    }
    valuesErrors {
      attributeId
      id_value
      input
      message
      type
    }
  }
}
    ${RecordIdentityFragmentDoc}`;
export type CreateRecordMutationFn = Apollo.MutationFunction<CreateRecordMutation, CreateRecordMutationVariables>;

/**
 * __useCreateRecordMutation__
 *
 * To run a mutation, you first call `useCreateRecordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRecordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRecordMutation, { data, loading, error }] = useCreateRecordMutation({
 *   variables: {
 *      library: // value for 'library'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateRecordMutation(baseOptions?: Apollo.MutationHookOptions<CreateRecordMutation, CreateRecordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRecordMutation, CreateRecordMutationVariables>(CreateRecordDocument, options);
      }
export type CreateRecordMutationHookResult = ReturnType<typeof useCreateRecordMutation>;
export type CreateRecordMutationResult = Apollo.MutationResult<CreateRecordMutation>;
export type CreateRecordMutationOptions = Apollo.BaseMutationOptions<CreateRecordMutation, CreateRecordMutationVariables>;
export const DeactivateRecordsDocument = gql`
    mutation DEACTIVATE_RECORDS($libraryId: String!, $recordsIds: [String!], $filters: [RecordFilterInput!]) {
  deactivateRecords(
    recordsIds: $recordsIds
    filters: $filters
    libraryId: $libraryId
  ) {
    id
    ...RecordIdentity
  }
}
    ${RecordIdentityFragmentDoc}`;
export type DeactivateRecordsMutationFn = Apollo.MutationFunction<DeactivateRecordsMutation, DeactivateRecordsMutationVariables>;

/**
 * __useDeactivateRecordsMutation__
 *
 * To run a mutation, you first call `useDeactivateRecordsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeactivateRecordsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deactivateRecordsMutation, { data, loading, error }] = useDeactivateRecordsMutation({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      recordsIds: // value for 'recordsIds'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useDeactivateRecordsMutation(baseOptions?: Apollo.MutationHookOptions<DeactivateRecordsMutation, DeactivateRecordsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeactivateRecordsMutation, DeactivateRecordsMutationVariables>(DeactivateRecordsDocument, options);
      }
export type DeactivateRecordsMutationHookResult = ReturnType<typeof useDeactivateRecordsMutation>;
export type DeactivateRecordsMutationResult = Apollo.MutationResult<DeactivateRecordsMutation>;
export type DeactivateRecordsMutationOptions = Apollo.BaseMutationOptions<DeactivateRecordsMutation, DeactivateRecordsMutationVariables>;
export const DoesFileExistAsChildDocument = gql`
    query DOES_FILE_EXIST_AS_CHILD($parentNode: ID, $treeId: ID!, $filename: String!) {
  doesFileExistAsChild(
    parentNode: $parentNode
    treeId: $treeId
    filename: $filename
  )
}
    `;

/**
 * __useDoesFileExistAsChildQuery__
 *
 * To run a query within a React component, call `useDoesFileExistAsChildQuery` and pass it any options that fit your needs.
 * When your component renders, `useDoesFileExistAsChildQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDoesFileExistAsChildQuery({
 *   variables: {
 *      parentNode: // value for 'parentNode'
 *      treeId: // value for 'treeId'
 *      filename: // value for 'filename'
 *   },
 * });
 */
export function useDoesFileExistAsChildQuery(baseOptions: Apollo.QueryHookOptions<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>(DoesFileExistAsChildDocument, options);
      }
export function useDoesFileExistAsChildLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>(DoesFileExistAsChildDocument, options);
        }
export type DoesFileExistAsChildQueryHookResult = ReturnType<typeof useDoesFileExistAsChildQuery>;
export type DoesFileExistAsChildLazyQueryHookResult = ReturnType<typeof useDoesFileExistAsChildLazyQuery>;
export type DoesFileExistAsChildQueryResult = Apollo.QueryResult<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>;
export const GetFileDataDocument = gql`
    query GET_FILE_DATA($library: ID!, $fileId: String!, $previewsStatusAttribute: ID!) {
  records(
    library: $library
    filters: [{field: "id", value: $fileId, condition: EQUAL}]
  ) {
    list {
      ...RecordIdentity
      created_at: property(attribute: "created_at") {
        ... on Value {
          value
        }
      }
      created_by: property(attribute: "created_by") {
        ... on LinkValue {
          value {
            ...RecordIdentity
          }
        }
      }
      modified_at: property(attribute: "modified_at") {
        ... on Value {
          value
        }
      }
      modified_by: property(attribute: "modified_by") {
        ... on LinkValue {
          value {
            ...RecordIdentity
          }
        }
      }
      file_name: property(attribute: "file_name") {
        ... on Value {
          value
        }
      }
      file_path: property(attribute: "file_path") {
        ... on Value {
          value
        }
      }
      previews_status: property(attribute: $previewsStatusAttribute) {
        ... on Value {
          value
        }
      }
      library {
        behavior
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}`;

/**
 * __useGetFileDataQuery__
 *
 * To run a query within a React component, call `useGetFileDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFileDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFileDataQuery({
 *   variables: {
 *      library: // value for 'library'
 *      fileId: // value for 'fileId'
 *      previewsStatusAttribute: // value for 'previewsStatusAttribute'
 *   },
 * });
 */
export function useGetFileDataQuery(baseOptions: Apollo.QueryHookOptions<GetFileDataQuery, GetFileDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFileDataQuery, GetFileDataQueryVariables>(GetFileDataDocument, options);
      }
export function useGetFileDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFileDataQuery, GetFileDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFileDataQuery, GetFileDataQueryVariables>(GetFileDataDocument, options);
        }
export type GetFileDataQueryHookResult = ReturnType<typeof useGetFileDataQuery>;
export type GetFileDataLazyQueryHookResult = ReturnType<typeof useGetFileDataLazyQuery>;
export type GetFileDataQueryResult = Apollo.QueryResult<GetFileDataQuery, GetFileDataQueryVariables>;
export const RecordFormDocument = gql`
    query RECORD_FORM($libraryId: String!, $formId: String!, $recordId: String, $version: [ValueVersionInput!]) {
  recordForm(
    recordId: $recordId
    libraryId: $libraryId
    formId: $formId
    version: $version
  ) {
    id
    recordId
    library {
      id
    }
    dependencyAttributes {
      id
    }
    elements {
      ...RecordFormElement
    }
  }
}
    ${RecordFormElementFragmentDoc}`;

/**
 * __useRecordFormQuery__
 *
 * To run a query within a React component, call `useRecordFormQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecordFormQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecordFormQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      formId: // value for 'formId'
 *      recordId: // value for 'recordId'
 *      version: // value for 'version'
 *   },
 * });
 */
export function useRecordFormQuery(baseOptions: Apollo.QueryHookOptions<RecordFormQuery, RecordFormQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecordFormQuery, RecordFormQueryVariables>(RecordFormDocument, options);
      }
export function useRecordFormLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecordFormQuery, RecordFormQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecordFormQuery, RecordFormQueryVariables>(RecordFormDocument, options);
        }
export type RecordFormQueryHookResult = ReturnType<typeof useRecordFormQuery>;
export type RecordFormLazyQueryHookResult = ReturnType<typeof useRecordFormLazyQuery>;
export type RecordFormQueryResult = Apollo.QueryResult<RecordFormQuery, RecordFormQueryVariables>;
export const RecordUpdateDocument = gql`
    subscription RECORD_UPDATE($filters: RecordUpdateFilterInput) {
  recordUpdate(filters: $filters) {
    record {
      ...RecordIdentity
      modified_by: property(attribute: "modified_by") {
        ... on LinkValue {
          value {
            ...RecordIdentity
          }
        }
      }
    }
    updatedValues {
      attribute
      value {
        ...ValueDetails
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}
${ValueDetailsFragmentDoc}`;

/**
 * __useRecordUpdateSubscription__
 *
 * To run a query within a React component, call `useRecordUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useRecordUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecordUpdateSubscription({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useRecordUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<RecordUpdateSubscription, RecordUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<RecordUpdateSubscription, RecordUpdateSubscriptionVariables>(RecordUpdateDocument, options);
      }
export type RecordUpdateSubscriptionHookResult = ReturnType<typeof useRecordUpdateSubscription>;
export type RecordUpdateSubscriptionResult = Apollo.SubscriptionResult<RecordUpdateSubscription>;
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
export function useIndexRecordsMutation(baseOptions?: Apollo.MutationHookOptions<IndexRecordsMutation, IndexRecordsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<IndexRecordsMutation, IndexRecordsMutationVariables>(IndexRecordsDocument, options);
      }
export type IndexRecordsMutationHookResult = ReturnType<typeof useIndexRecordsMutation>;
export type IndexRecordsMutationResult = Apollo.MutationResult<IndexRecordsMutation>;
export type IndexRecordsMutationOptions = Apollo.BaseMutationOptions<IndexRecordsMutation, IndexRecordsMutationVariables>;
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
export function useCancelTaskMutation(baseOptions?: Apollo.MutationHookOptions<CancelTaskMutation, CancelTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
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
export function useCheckTreeExistenceQuery(baseOptions?: Apollo.QueryHookOptions<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>(CheckTreeExistenceDocument, options);
      }
export function useCheckTreeExistenceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>(CheckTreeExistenceDocument, options);
        }
export type CheckTreeExistenceQueryHookResult = ReturnType<typeof useCheckTreeExistenceQuery>;
export type CheckTreeExistenceLazyQueryHookResult = ReturnType<typeof useCheckTreeExistenceLazyQuery>;
export type CheckTreeExistenceQueryResult = Apollo.QueryResult<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>;
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
export function useDeleteTreeMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTreeMutation, DeleteTreeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
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
    ${TreeDetailsFragmentDoc}`;

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
export function useGetTreeByIdQuery(baseOptions?: Apollo.QueryHookOptions<GetTreeByIdQuery, GetTreeByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTreeByIdQuery, GetTreeByIdQueryVariables>(GetTreeByIdDocument, options);
      }
export function useGetTreeByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTreeByIdQuery, GetTreeByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTreeByIdQuery, GetTreeByIdQueryVariables>(GetTreeByIdDocument, options);
        }
export type GetTreeByIdQueryHookResult = ReturnType<typeof useGetTreeByIdQuery>;
export type GetTreeByIdLazyQueryHookResult = ReturnType<typeof useGetTreeByIdLazyQuery>;
export type GetTreeByIdQueryResult = Apollo.QueryResult<GetTreeByIdQuery, GetTreeByIdQueryVariables>;
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
export function useGetTreeLibrariesQuery(baseOptions?: Apollo.QueryHookOptions<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>(GetTreeLibrariesDocument, options);
      }
export function useGetTreeLibrariesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>(GetTreeLibrariesDocument, options);
        }
export type GetTreeLibrariesQueryHookResult = ReturnType<typeof useGetTreeLibrariesQuery>;
export type GetTreeLibrariesLazyQueryHookResult = ReturnType<typeof useGetTreeLibrariesLazyQuery>;
export type GetTreeLibrariesQueryResult = Apollo.QueryResult<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>;
export const GetTreesDocument = gql`
    query GET_TREES {
  trees {
    list {
      ...TreeLight
    }
  }
}
    ${TreeLightFragmentDoc}`;

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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTreesQuery, GetTreesQueryVariables>(GetTreesDocument, options);
      }
export function useGetTreesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTreesQuery, GetTreesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
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
    ${TreeDetailsFragmentDoc}`;
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
export function useSaveTreeMutation(baseOptions?: Apollo.MutationHookOptions<SaveTreeMutation, SaveTreeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveTreeMutation, SaveTreeMutationVariables>(SaveTreeDocument, options);
      }
export type SaveTreeMutationHookResult = ReturnType<typeof useSaveTreeMutation>;
export type SaveTreeMutationResult = Apollo.MutationResult<SaveTreeMutation>;
export type SaveTreeMutationOptions = Apollo.BaseMutationOptions<SaveTreeMutation, SaveTreeMutationVariables>;
export const TreeNodeChildrenDocument = gql`
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination) {
  treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
    totalCount
    list {
      ...TreeNodeChild
    }
  }
}
    ${TreeNodeChildFragmentDoc}`;

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
export function useTreeNodeChildrenQuery(baseOptions: Apollo.QueryHookOptions<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>(TreeNodeChildrenDocument, options);
      }
export function useTreeNodeChildrenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>(TreeNodeChildrenDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserDataQuery, GetUserDataQueryVariables>(GetUserDataDocument, options);
      }
export function useGetUserDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserDataQuery, GetUserDataQueryVariables>(GetUserDataDocument, options);
        }
export type GetUserDataQueryHookResult = ReturnType<typeof useGetUserDataQuery>;
export type GetUserDataLazyQueryHookResult = ReturnType<typeof useGetUserDataLazyQuery>;
export type GetUserDataQueryResult = Apollo.QueryResult<GetUserDataQuery, GetUserDataQueryVariables>;
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
export function useSaveUserDataMutation(baseOptions?: Apollo.MutationHookOptions<SaveUserDataMutation, SaveUserDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveUserDataMutation, SaveUserDataMutationVariables>(SaveUserDataDocument, options);
      }
export type SaveUserDataMutationHookResult = ReturnType<typeof useSaveUserDataMutation>;
export type SaveUserDataMutationResult = Apollo.MutationResult<SaveUserDataMutation>;
export type SaveUserDataMutationOptions = Apollo.BaseMutationOptions<SaveUserDataMutation, SaveUserDataMutationVariables>;
export const DeleteValueDocument = gql`
    mutation DELETE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput) {
  deleteValue(
    library: $library
    recordId: $recordId
    attribute: $attribute
    value: $value
  ) {
    ...ValueDetails
  }
}
    ${ValueDetailsFragmentDoc}`;
export type DeleteValueMutationFn = Apollo.MutationFunction<DeleteValueMutation, DeleteValueMutationVariables>;

/**
 * __useDeleteValueMutation__
 *
 * To run a mutation, you first call `useDeleteValueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteValueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteValueMutation, { data, loading, error }] = useDeleteValueMutation({
 *   variables: {
 *      library: // value for 'library'
 *      recordId: // value for 'recordId'
 *      attribute: // value for 'attribute'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useDeleteValueMutation(baseOptions?: Apollo.MutationHookOptions<DeleteValueMutation, DeleteValueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteValueMutation, DeleteValueMutationVariables>(DeleteValueDocument, options);
      }
export type DeleteValueMutationHookResult = ReturnType<typeof useDeleteValueMutation>;
export type DeleteValueMutationResult = Apollo.MutationResult<DeleteValueMutation>;
export type DeleteValueMutationOptions = Apollo.BaseMutationOptions<DeleteValueMutation, DeleteValueMutationVariables>;
export const SaveValueBatchDocument = gql`
    mutation SAVE_VALUE_BATCH($library: ID!, $recordId: ID!, $version: [ValueVersionInput!], $values: [ValueBatchInput!]!, $deleteEmpty: Boolean) {
  saveValueBatch(
    library: $library
    recordId: $recordId
    version: $version
    values: $values
    deleteEmpty: $deleteEmpty
  ) {
    values {
      ...ValueDetails
    }
    errors {
      type
      attribute
      input
      message
    }
  }
}
    ${ValueDetailsFragmentDoc}`;
export type SaveValueBatchMutationFn = Apollo.MutationFunction<SaveValueBatchMutation, SaveValueBatchMutationVariables>;

/**
 * __useSaveValueBatchMutation__
 *
 * To run a mutation, you first call `useSaveValueBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveValueBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveValueBatchMutation, { data, loading, error }] = useSaveValueBatchMutation({
 *   variables: {
 *      library: // value for 'library'
 *      recordId: // value for 'recordId'
 *      version: // value for 'version'
 *      values: // value for 'values'
 *      deleteEmpty: // value for 'deleteEmpty'
 *   },
 * });
 */
export function useSaveValueBatchMutation(baseOptions?: Apollo.MutationHookOptions<SaveValueBatchMutation, SaveValueBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveValueBatchMutation, SaveValueBatchMutationVariables>(SaveValueBatchDocument, options);
      }
export type SaveValueBatchMutationHookResult = ReturnType<typeof useSaveValueBatchMutation>;
export type SaveValueBatchMutationResult = Apollo.MutationResult<SaveValueBatchMutation>;
export type SaveValueBatchMutationOptions = Apollo.BaseMutationOptions<SaveValueBatchMutation, SaveValueBatchMutationVariables>;
export const DeleteViewDocument = gql`
    mutation DELETE_VIEW($viewId: String!) {
  deleteView(viewId: $viewId) {
    id
    library
  }
}
    `;
export type DeleteViewMutationFn = Apollo.MutationFunction<DeleteViewMutation, DeleteViewMutationVariables>;

/**
 * __useDeleteViewMutation__
 *
 * To run a mutation, you first call `useDeleteViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteViewMutation, { data, loading, error }] = useDeleteViewMutation({
 *   variables: {
 *      viewId: // value for 'viewId'
 *   },
 * });
 */
export function useDeleteViewMutation(baseOptions?: Apollo.MutationHookOptions<DeleteViewMutation, DeleteViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteViewMutation, DeleteViewMutationVariables>(DeleteViewDocument, options);
      }
export type DeleteViewMutationHookResult = ReturnType<typeof useDeleteViewMutation>;
export type DeleteViewMutationResult = Apollo.MutationResult<DeleteViewMutation>;
export type DeleteViewMutationOptions = Apollo.BaseMutationOptions<DeleteViewMutation, DeleteViewMutationVariables>;
export const GetViewDocument = gql`
    query GET_VIEW($viewId: String!) {
  view(viewId: $viewId) {
    ...ViewDetails
  }
}
    ${ViewDetailsFragmentDoc}`;

/**
 * __useGetViewQuery__
 *
 * To run a query within a React component, call `useGetViewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewQuery({
 *   variables: {
 *      viewId: // value for 'viewId'
 *   },
 * });
 */
export function useGetViewQuery(baseOptions: Apollo.QueryHookOptions<GetViewQuery, GetViewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewQuery, GetViewQueryVariables>(GetViewDocument, options);
      }
export function useGetViewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewQuery, GetViewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewQuery, GetViewQueryVariables>(GetViewDocument, options);
        }
export type GetViewQueryHookResult = ReturnType<typeof useGetViewQuery>;
export type GetViewLazyQueryHookResult = ReturnType<typeof useGetViewLazyQuery>;
export type GetViewQueryResult = Apollo.QueryResult<GetViewQuery, GetViewQueryVariables>;
export const GetViewsListDocument = gql`
    query GET_VIEWS_LIST($libraryId: String!) {
  views(library: $libraryId) {
    totalCount
    list {
      ...ViewDetails
    }
  }
}
    ${ViewDetailsFragmentDoc}`;

/**
 * __useGetViewsListQuery__
 *
 * To run a query within a React component, call `useGetViewsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewsListQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useGetViewsListQuery(baseOptions: Apollo.QueryHookOptions<GetViewsListQuery, GetViewsListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewsListQuery, GetViewsListQueryVariables>(GetViewsListDocument, options);
      }
export function useGetViewsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewsListQuery, GetViewsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewsListQuery, GetViewsListQueryVariables>(GetViewsListDocument, options);
        }
export type GetViewsListQueryHookResult = ReturnType<typeof useGetViewsListQuery>;
export type GetViewsListLazyQueryHookResult = ReturnType<typeof useGetViewsListLazyQuery>;
export type GetViewsListQueryResult = Apollo.QueryResult<GetViewsListQuery, GetViewsListQueryVariables>;
export const AddViewDocument = gql`
    mutation ADD_VIEW($view: ViewInput!) {
  saveView(view: $view) {
    ...ViewDetails
  }
}
    ${ViewDetailsFragmentDoc}`;
export type AddViewMutationFn = Apollo.MutationFunction<AddViewMutation, AddViewMutationVariables>;

/**
 * __useAddViewMutation__
 *
 * To run a mutation, you first call `useAddViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addViewMutation, { data, loading, error }] = useAddViewMutation({
 *   variables: {
 *      view: // value for 'view'
 *   },
 * });
 */
export function useAddViewMutation(baseOptions?: Apollo.MutationHookOptions<AddViewMutation, AddViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddViewMutation, AddViewMutationVariables>(AddViewDocument, options);
      }
export type AddViewMutationHookResult = ReturnType<typeof useAddViewMutation>;
export type AddViewMutationResult = Apollo.MutationResult<AddViewMutation>;
export type AddViewMutationOptions = Apollo.BaseMutationOptions<AddViewMutation, AddViewMutationVariables>;