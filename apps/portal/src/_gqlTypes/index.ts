// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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

export type AccessRecordByDefaultPermissionInput = {
  attributeId: Scalars['ID'];
  libraryId: Scalars['ID'];
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
  character_limit?: InputMaybe<Scalars['Int']>;
  description?: InputMaybe<Scalars['SystemTranslationOptional']>;
  embedded_fields?: InputMaybe<Array<InputMaybe<EmbeddedAttributeInput>>>;
  format?: InputMaybe<AttributeFormat>;
  id: Scalars['ID'];
  label?: InputMaybe<Scalars['SystemTranslation']>;
  linked_library?: InputMaybe<Scalars['String']>;
  linked_tree?: InputMaybe<Scalars['String']>;
  metadata_fields?: InputMaybe<Array<Scalars['String']>>;
  multi_link_display_option?: InputMaybe<MultiDisplayOption>;
  multi_tree_display_option?: InputMaybe<MultiDisplayOption>;
  multiple_values?: InputMaybe<Scalars['Boolean']>;
  permissions_conf?: InputMaybe<TreepermissionsConfInput>;
  permissions_conf_dependent_values?: InputMaybe<TreePermissionsDependentValuesConfInput>;
  readonly?: InputMaybe<Scalars['Boolean']>;
  required?: InputMaybe<Scalars['Boolean']>;
  reverse_link?: InputMaybe<Scalars['String']>;
  settings?: InputMaybe<Scalars['JSONObject']>;
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
  format?: InputMaybe<Array<AttributeFormat>>;
  id?: InputMaybe<Scalars['ID']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  label?: InputMaybe<Scalars['String']>;
  libraries?: InputMaybe<Array<Scalars['String']>>;
  librariesExcluded?: InputMaybe<Array<Scalars['String']>>;
  multiple_values?: InputMaybe<Scalars['Boolean']>;
  system?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<Array<AttributeType>>;
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

export type ChildrenAsRecordValuePermissionFilterInput = {
  action: RecordPermissionsActions;
  attributeId: Scalars['ID'];
  libraryId: Scalars['ID'];
};

export type CreateRecordDataInput = {
  values?: InputMaybe<Array<ValueBatchInput>>;
  version?: InputMaybe<Array<ValueVersionInput>>;
};

export type DeleteTaskInput = {
  archive: Scalars['Boolean'];
  id: Scalars['ID'];
};

export type DiscussionCommentInput = {
  mentions?: InputMaybe<DiscussionMentionsInput>;
  message: Scalars['String'];
  targetRecord: DiscussionTargetRecordInput;
  threadId?: InputMaybe<Scalars['String']>;
};

export type DiscussionMentionsInput = {
  url: Scalars['String'];
  users?: InputMaybe<Array<Scalars['String']>>;
};

export type DiscussionTargetRecordInput = {
  id: Scalars['String'];
  libraryId: Scalars['String'];
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
  sidePanel?: InputMaybe<FormSidePanelInput>;
};

export type FormSidePanelInput = {
  enable: Scalars['Boolean'];
  isOpenByDefault: Scalars['Boolean'];
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
  defaultApp?: InputMaybe<Scalars['String']>;
  favicon?: InputMaybe<GlobalSettingsFileInput>;
  icon?: InputMaybe<GlobalSettingsFileInput>;
  name?: InputMaybe<Scalars['String']>;
  settings?: InputMaybe<Scalars['JSONObject']>;
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
  join = 'join',
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
  mandatoryAttribute?: InputMaybe<Scalars['ID']>;
  permissions_conf?: InputMaybe<TreepermissionsConfInput>;
  previewsSettings?: InputMaybe<Array<LibraryPreviewsSettingsInput>>;
  recordIdentityConf?: InputMaybe<RecordIdentityConfInput>;
  settings?: InputMaybe<Scalars['JSONObject']>;
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

export type MapValueInput = {
  after?: InputMaybe<Scalars['ID']>;
  before?: InputMaybe<Scalars['ID']>;
};

export enum MultiDisplayOption {
  avatar = 'avatar',
  badge_qty = 'badge_qty',
  tag = 'tag'
}

export enum NotificationLevel {
  error = 'error',
  info = 'info',
  success = 'success',
  warning = 'warning'
}

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
  dependentTreeTargets?: InputMaybe<Array<PermissionsDependTreeTargetInput>>;
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
  attribute_dependent_values = 'attribute_dependent_values',
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
  access_record_by_default = 'access_record_by_default',
  access_tree = 'access_tree',
  admin_access_api_keys = 'admin_access_api_keys',
  admin_access_applications = 'admin_access_applications',
  admin_access_attributes = 'admin_access_attributes',
  admin_access_libraries = 'admin_access_libraries',
  admin_access_logs = 'admin_access_logs',
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
  admin_import_config_clear_database = 'admin_import_config_clear_database',
  admin_library = 'admin_library',
  admin_manage_global_preferences = 'admin_manage_global_preferences',
  create_record = 'create_record',
  delete_record = 'delete_record',
  detach = 'detach',
  edit_children = 'edit_children',
  edit_record = 'edit_record',
  edit_value = 'edit_value',
  set_value = 'set_value'
}

export type PermissionsDependTreeTargetInput = {
  attributeId: Scalars['ID'];
  nodeId?: InputMaybe<Scalars['ID']>;
  tree: Scalars['ID'];
};

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

export enum RecordPermissionsActions {
  access_record = 'access_record',
  access_record_by_default = 'access_record_by_default',
  create_record = 'create_record',
  delete_record = 'delete_record',
  edit_record = 'edit_record'
}

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
  INDEXATION = 'INDEXATION',
  SAVE_VALUE_BULK = 'SAVE_VALUE_BULK'
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
  settings?: InputMaybe<Scalars['JSONObject']>;
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

export type TreePermissionsDependentValuesConfInput = {
  dependentValuesTreeAttributes: Array<Scalars['ID']>;
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
  /**  Use "\__empty_value__" to set an empty value  */
  payload?: InputMaybe<Scalars['String']>;
};

export type ValueInput = {
  id_value?: InputMaybe<Scalars['ID']>;
  metadata?: InputMaybe<Array<InputMaybe<ValueMetadataInput>>>;
  /**  Use "\__empty_value__" to set an empty value  */
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
  size?: InputMaybe<ViewSizes>;
  type: ViewTypes;
};

export type ViewInput = {
  attributes?: InputMaybe<Array<Scalars['String']>>;
  color?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['SystemTranslationOptional']>;
  display: ViewDisplayInput;
  filters?: InputMaybe<Array<RecordFilterInput>>;
  id?: InputMaybe<Scalars['String']>;
  label?: InputMaybe<Scalars['SystemTranslation']>;
  library: Scalars['String'];
  shared: Scalars['Boolean'];
  sort?: InputMaybe<Array<RecordSortInput>>;
  valuesVersions?: InputMaybe<Array<ViewValuesVersionInput>>;
};

export type ViewInputPartial = {
  attributes?: InputMaybe<Array<Scalars['String']>>;
  color?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['SystemTranslationOptional']>;
  display?: InputMaybe<ViewDisplayInput>;
  filters?: InputMaybe<Array<RecordFilterInput>>;
  id: Scalars['String'];
  label?: InputMaybe<Scalars['SystemTranslation']>;
  library?: InputMaybe<Scalars['String']>;
  shared?: InputMaybe<Scalars['Boolean']>;
  sort?: InputMaybe<Array<RecordSortInput>>;
  valuesVersions?: InputMaybe<Array<ViewValuesVersionInput>>;
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

export type ApplicationDetailsFragment = { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } };

export type RecordIdentityFragment = { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } };

export type GetApplicationByIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetApplicationByIdQuery = { applications?: { list: Array<{ id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } }> } | null };

export type ApplicationEventsSubscriptionVariables = Exact<{
  filters?: InputMaybe<ApplicationEventFiltersInput>;
}>;


export type ApplicationEventsSubscription = { applicationEvent: { type: ApplicationEventTypes, application: { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } } } };

export type GetApplicationsQueryVariables = Exact<{
  filters?: InputMaybe<ApplicationsFiltersInput>;
}>;


export type GetApplicationsQuery = { applications?: { list: Array<{ id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } }> } | null };

export type GetLangsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLangsQuery = { langs: Array<string | null> };

export type GetGlobalSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGlobalSettingsQuery = { globalSettings: { name: string, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null };

export type IsAllowedQueryVariables = Exact<{
  type: PermissionTypes;
  actions: Array<PermissionsActions> | PermissionsActions;
  applyTo?: InputMaybe<Scalars['ID']>;
  target?: InputMaybe<PermissionTarget>;
}>;


export type IsAllowedQuery = { isAllowed?: Array<{ name: PermissionsActions, allowed?: boolean | null }> | null };

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
  permissions {
    access_application
    admin_application
  }
}
    ${RecordIdentityFragmentDoc}`;
export const GetApplicationByIdDocument = gql`
    query GET_APPLICATION_BY_ID($id: ID!) {
  applications(filters: {id: $id}) {
    list {
      ...ApplicationDetails
    }
  }
}
    ${ApplicationDetailsFragmentDoc}`;

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
export const ApplicationEventsDocument = gql`
    subscription APPLICATION_EVENTS($filters: ApplicationEventFiltersInput) {
  applicationEvent(filters: $filters) {
    type
    application {
      ...ApplicationDetails
    }
  }
}
    ${ApplicationDetailsFragmentDoc}`;

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
export function useApplicationEventsSubscription(baseOptions?: Apollo.SubscriptionHookOptions<ApplicationEventsSubscription, ApplicationEventsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ApplicationEventsSubscription, ApplicationEventsSubscriptionVariables>(ApplicationEventsDocument, options);
      }
export type ApplicationEventsSubscriptionHookResult = ReturnType<typeof useApplicationEventsSubscription>;
export type ApplicationEventsSubscriptionResult = Apollo.SubscriptionResult<ApplicationEventsSubscription>;
export const GetApplicationsDocument = gql`
    query GET_APPLICATIONS($filters: ApplicationsFiltersInput) {
  applications(filters: $filters) {
    list {
      ...ApplicationDetails
    }
  }
}
    ${ApplicationDetailsFragmentDoc}`;

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
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetApplicationsQuery(baseOptions?: Apollo.QueryHookOptions<GetApplicationsQuery, GetApplicationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApplicationsQuery, GetApplicationsQueryVariables>(GetApplicationsDocument, options);
      }
export function useGetApplicationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationsQuery, GetApplicationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApplicationsQuery, GetApplicationsQueryVariables>(GetApplicationsDocument, options);
        }
export type GetApplicationsQueryHookResult = ReturnType<typeof useGetApplicationsQuery>;
export type GetApplicationsLazyQueryHookResult = ReturnType<typeof useGetApplicationsLazyQuery>;
export type GetApplicationsQueryResult = Apollo.QueryResult<GetApplicationsQuery, GetApplicationsQueryVariables>;
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLangsQuery, GetLangsQueryVariables>(GetLangsDocument, options);
      }
export function useGetLangsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLangsQuery, GetLangsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
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
    ${RecordIdentityFragmentDoc}`;

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
export function useGetGlobalSettingsQuery(baseOptions?: Apollo.QueryHookOptions<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>(GetGlobalSettingsDocument, options);
      }
export function useGetGlobalSettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>(GetGlobalSettingsDocument, options);
        }
export type GetGlobalSettingsQueryHookResult = ReturnType<typeof useGetGlobalSettingsQuery>;
export type GetGlobalSettingsLazyQueryHookResult = ReturnType<typeof useGetGlobalSettingsLazyQuery>;
export type GetGlobalSettingsQueryResult = Apollo.QueryResult<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>;
export const MeDocument = gql`
    query ME {
  me {
    ...RecordIdentity
  }
}
    ${RecordIdentityFragmentDoc}`;

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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
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