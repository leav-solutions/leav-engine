import {IPreviewScalar} from '@leav/utils'
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  FullTreeContent: { input: any; output: any; }
  JSON: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
  Preview: { input: IPreviewScalar; output: IPreviewScalar; }
  SystemTranslation: { input: any; output: any; }
  SystemTranslationOptional: { input: any; output: any; }
  TaskPriority: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type AccessRecordByDefaultPermissionInput = {
  attributeId: Scalars['ID']['input'];
  libraryId: Scalars['ID']['input'];
};

export type ActionConfigurationInput = {
  error_message?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  id: Scalars['ID']['input'];
  params?: InputMaybe<Array<ActionConfigurationParamInput>>;
};

export type ActionConfigurationParamInput = {
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
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
  postDeleteValue?: InputMaybe<Array<ActionConfigurationInput>>;
  postSaveValue?: InputMaybe<Array<ActionConfigurationInput>>;
  saveValue?: InputMaybe<Array<ActionConfigurationInput>>;
};

export type ApiKeyInput = {
  expiresAt?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type ApiKeysFiltersInput = {
  createdBy?: InputMaybe<Scalars['Int']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  modifiedBy?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
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
  applicationId?: InputMaybe<Scalars['ID']['input']>;
  events?: InputMaybe<Array<ApplicationEventTypes>>;
  ignoreOwnEvents?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum ApplicationEventTypes {
  DELETE = 'DELETE',
  SAVE = 'SAVE'
}

export type ApplicationIconInput = {
  libraryId: Scalars['String']['input'];
  recordId: Scalars['String']['input'];
};

export type ApplicationInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  endpoint?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<ApplicationIconInput>;
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  module?: InputMaybe<Scalars['String']['input']>;
  settings?: InputMaybe<Scalars['JSONObject']['input']>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
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
  endpoint?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  module?: InputMaybe<Scalars['String']['input']>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
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
  character_limit?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  embedded_fields?: InputMaybe<Array<InputMaybe<EmbeddedAttributeInput>>>;
  format?: InputMaybe<AttributeFormat>;
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  linked_library?: InputMaybe<Scalars['String']['input']>;
  linked_tree?: InputMaybe<Scalars['String']['input']>;
  metadata_fields?: InputMaybe<Array<Scalars['String']['input']>>;
  multi_link_display_option?: InputMaybe<MultiDisplayOption>;
  multi_tree_display_option?: InputMaybe<MultiDisplayOption>;
  multiple_values?: InputMaybe<Scalars['Boolean']['input']>;
  permissions_conf?: InputMaybe<TreepermissionsConfInput>;
  permissions_conf_dependent_values?: InputMaybe<TreePermissionsDependentValuesConfInput>;
  readonly?: InputMaybe<Scalars['Boolean']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  reverse_link?: InputMaybe<Scalars['String']['input']>;
  settings?: InputMaybe<Scalars['JSONObject']['input']>;
  /**  only for link attribute  */
  smart_filter?: InputMaybe<SmartFilterConfInput>;
  type?: InputMaybe<AttributeType>;
  unique?: InputMaybe<Scalars['Boolean']['input']>;
  values_list?: InputMaybe<ValuesListConfInput>;
  versions_conf?: InputMaybe<ValuesVersionsConfInput>;
};

export type AttributePermissionsRecord = {
  id?: InputMaybe<Scalars['String']['input']>;
  library: Scalars['String']['input'];
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
  id?: InputMaybe<Scalars['ID']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  label?: InputMaybe<Scalars['String']['input']>;
  libraries?: InputMaybe<Array<Scalars['String']['input']>>;
  librariesExcluded?: InputMaybe<Array<Scalars['String']['input']>>;
  multiple_values?: InputMaybe<Scalars['Boolean']['input']>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<Array<AttributeType>>;
  versionable?: InputMaybe<Scalars['Boolean']['input']>;
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

export type CampaignToRenew = {
  endDate: Scalars['String']['input'];
  id: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};

export type CampaignToUpdateDates = {
  endDate: Scalars['String']['input'];
  id: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};

export type ChildrenAsRecordValuePermissionFilterInput = {
  action: RecordPermissionsActions;
  attributeId: Scalars['ID']['input'];
  libraryId: Scalars['ID']['input'];
};

export type CreateRecordDataInput = {
  values?: InputMaybe<Array<ValueBatchInput>>;
  version?: InputMaybe<Array<ValueVersionInput>>;
};

export type DeleteTaskInput = {
  archive: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};

export type DependentValuesPermissionFilterInput = {
  attributeId: Scalars['ID']['input'];
  libraryId: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
};

export type DiscussionCommentInput = {
  mentions?: InputMaybe<DiscussionMentionsInput>;
  message: Scalars['String']['input'];
  targetRecord: DiscussionTargetRecordInput;
  threadId?: InputMaybe<Scalars['String']['input']>;
};

export type DiscussionMentionsInput = {
  url: Scalars['String']['input'];
  users?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type DiscussionTargetRecordInput = {
  id: Scalars['String']['input'];
  libraryId: Scalars['String']['input'];
};

export type EmbeddedAttributeInput = {
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  embedded_fields?: InputMaybe<Array<InputMaybe<EmbeddedAttributeInput>>>;
  format?: InputMaybe<AttributeFormat>;
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  validation_regex?: InputMaybe<Scalars['String']['input']>;
};

export type FileInput = {
  data: Scalars['Upload']['input'];
  replace?: InputMaybe<Scalars['Boolean']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  uid: Scalars['String']['input'];
};

export enum FileType {
  audio = 'audio',
  document = 'document',
  image = 'image',
  other = 'other',
  video = 'video'
}

export type FormDependencyValueInput = {
  attribute: Scalars['ID']['input'];
  value: Scalars['ID']['input'];
};

export type FormElementInput = {
  containerId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  order: Scalars['Int']['input'];
  settings: Array<FormElementSettingsInput>;
  type: FormElementTypes;
  uiElementType: Scalars['String']['input'];
};

export type FormElementSettingsInput = {
  key: Scalars['String']['input'];
  value: Scalars['Any']['input'];
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
  id?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  library: Scalars['ID']['input'];
  system?: InputMaybe<Scalars['Boolean']['input']>;
};

export type FormInput = {
  dependencyAttributes?: InputMaybe<Array<Scalars['ID']['input']>>;
  elements?: InputMaybe<Array<FormElementsByDepsInput>>;
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  library: Scalars['ID']['input'];
  sidePanel?: InputMaybe<FormSidePanelInput>;
};

export type FormSidePanelInput = {
  enable: Scalars['Boolean']['input'];
  isOpenByDefault: Scalars['Boolean']['input'];
};

export enum FormsSortableFields {
  id = 'id',
  library = 'library',
  system = 'system'
}

export type GlobalSettingsFileInput = {
  library: Scalars['String']['input'];
  recordId: Scalars['String']['input'];
};

export type GlobalSettingsInput = {
  defaultApp?: InputMaybe<Scalars['String']['input']>;
  favicon?: InputMaybe<GlobalSettingsFileInput>;
  icon?: InputMaybe<GlobalSettingsFileInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  settings?: InputMaybe<Scalars['JSONObject']['input']>;
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
  id?: InputMaybe<Array<Scalars['ID']['input']>>;
  label?: InputMaybe<Array<Scalars['String']['input']>>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
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
  libraryId: Scalars['String']['input'];
  recordId: Scalars['String']['input'];
};

export type LibraryInput = {
  attributes?: InputMaybe<Array<Scalars['ID']['input']>>;
  behavior?: InputMaybe<LibraryBehavior>;
  defaultView?: InputMaybe<Scalars['ID']['input']>;
  fullTextAttributes?: InputMaybe<Array<Scalars['ID']['input']>>;
  icon?: InputMaybe<LibraryIconInput>;
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  mandatoryAttribute?: InputMaybe<Scalars['ID']['input']>;
  permissions_conf?: InputMaybe<TreepermissionsConfInput>;
  previewsSettings?: InputMaybe<Array<LibraryPreviewsSettingsInput>>;
  recordIdentityConf?: InputMaybe<RecordIdentityConfInput>;
  settings?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type LibraryPreviewsSettingsInput = {
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  label: Scalars['SystemTranslation']['input'];
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
  instanceId?: InputMaybe<Scalars['String']['input']>;
  queryId?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<LogFilterTimeInput>;
  topic?: InputMaybe<LogTopicFilterInput>;
  trigger?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type LogFilterTimeInput = {
  from?: InputMaybe<Scalars['Int']['input']>;
  to?: InputMaybe<Scalars['Int']['input']>;
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
  apiKey?: InputMaybe<Scalars['String']['input']>;
  attribute?: InputMaybe<Scalars['String']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  library?: InputMaybe<Scalars['String']['input']>;
  permission?: InputMaybe<LogTopicPermissionFilterInput>;
  profile?: InputMaybe<Scalars['String']['input']>;
  record?: InputMaybe<LogTopicRecordFilterInput>;
  tree?: InputMaybe<Scalars['String']['input']>;
};

export type LogTopicPermissionFilterInput = {
  applyTo?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type LogTopicRecordFilterInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  libraryId?: InputMaybe<Scalars['String']['input']>;
};

export type MapValueInput = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
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
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
};

export type PermissionActionInput = {
  allowed?: InputMaybe<Scalars['Boolean']['input']>;
  name: PermissionsActions;
};

export type PermissionInput = {
  actions: Array<PermissionActionInput>;
  applyTo?: InputMaybe<Scalars['ID']['input']>;
  dependenciesTreeTargets?: InputMaybe<Array<PermissionsDependenciesTreeTargetInput>>;
  permissionTreeTarget?: InputMaybe<PermissionsTreeTargetInput>;
  type: PermissionTypes;
  usersGroup?: InputMaybe<Scalars['ID']['input']>;
};

export type PermissionTarget = {
  attributeId?: InputMaybe<Scalars['ID']['input']>;
  libraryId?: InputMaybe<Scalars['ID']['input']>;
  nodeId?: InputMaybe<Scalars['ID']['input']>;
  recordId?: InputMaybe<Scalars['ID']['input']>;
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
  admin_list_plugins = 'admin_list_plugins',
  admin_manage_global_preferences = 'admin_manage_global_preferences',
  create_record = 'create_record',
  delete_record = 'delete_record',
  detach = 'detach',
  edit_children = 'edit_children',
  edit_record = 'edit_record',
  edit_value = 'edit_value',
  set_value = 'set_value'
}

export type PermissionsDependenciesTreeTargetInput = {
  attributeId: Scalars['ID']['input'];
  nodeId?: InputMaybe<Scalars['ID']['input']>;
  tree: Scalars['ID']['input'];
};

export enum PermissionsRelation {
  and = 'and',
  or = 'or'
}

export type PermissionsTreeTargetInput = {
  nodeId?: InputMaybe<Scalars['ID']['input']>;
  tree: Scalars['ID']['input'];
};

export type PreviewVersionInput = {
  background: Scalars['String']['input'];
  density: Scalars['Int']['input'];
  sizes: Array<PreviewVersionSizeInput>;
};

export type PreviewVersionSizeInput = {
  name: Scalars['String']['input'];
  size: Scalars['Int']['input'];
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
  field?: InputMaybe<Scalars['String']['input']>;
  operator?: InputMaybe<RecordFilterOperator>;
  treeId?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
  withEmptyValues?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum RecordFilterOperator {
  AND = 'AND',
  CLOSE_BRACKET = 'CLOSE_BRACKET',
  OPEN_BRACKET = 'OPEN_BRACKET',
  OR = 'OR'
}

export type RecordIdentityConfInput = {
  color?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['ID']['input']>;
  parentContext?: InputMaybe<Scalars['ID']['input']>;
  preview?: InputMaybe<Scalars['ID']['input']>;
  subLabel?: InputMaybe<Scalars['ID']['input']>;
  treeColorPreview?: InputMaybe<Scalars['ID']['input']>;
};

export type RecordInput = {
  id: Scalars['ID']['input'];
  library: Scalars['String']['input'];
};

export enum RecordPermissionsActions {
  access_record = 'access_record',
  access_record_by_default = 'access_record_by_default',
  create_record = 'create_record',
  delete_record = 'delete_record',
  edit_record = 'edit_record'
}

export type RecordSortInput = {
  field: Scalars['String']['input'];
  order: SortOrder;
};

export type RecordUpdateFilterInput = {
  ignoreOwnEvents?: InputMaybe<Scalars['Boolean']['input']>;
  libraries?: InputMaybe<Array<Scalars['ID']['input']>>;
  records?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type RecordsPagination = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type ReportFramingAttributeFilterItemInput = {
  attributeId: Scalars['String']['input'];
  values: Array<ReportFramingAttributeFilterValueItemInput>;
  withEmptyValues?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ReportFramingAttributeFilterValueItemInput = {
  formattedValue?: InputMaybe<Scalars['String']['input']>;
  rawValue: Scalars['String']['input'];
};

export type ReportFramingContentInput = {
  filters?: InputMaybe<ReportFramingFiltersInput>;
};

export type ReportFramingFiltersInput = {
  /**  only for excel header filter display  */
  attributes?: InputMaybe<Array<ReportFramingAttributeFilterItemInput>>;
  campaigns?: InputMaybe<Array<RecordFilterInput>>;
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type SheetInput = {
  keyIndex?: InputMaybe<Scalars['Int']['input']>;
  keyToIndex?: InputMaybe<Scalars['Int']['input']>;
  library: Scalars['String']['input'];
  linkAttribute?: InputMaybe<Scalars['String']['input']>;
  mapping?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  mode: ImportMode;
  treeLinkLibrary?: InputMaybe<Scalars['String']['input']>;
  type: ImportType;
};

export type SmartFilterConfInput = {
  enable: Scalars['Boolean']['input'];
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
  archive?: InputMaybe<Scalars['Boolean']['input']>;
  created_by?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
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
  FRAMING_REPORT = 'FRAMING_REPORT',
  IMPORT_CONFIG = 'IMPORT_CONFIG',
  IMPORT_DATA = 'IMPORT_DATA',
  INDEXATION = 'INDEXATION',
  PURGE_MULTIPLE_VALUES = 'PURGE_MULTIPLE_VALUES',
  RENEW_CAMPAIGNS = 'RENEW_CAMPAIGNS',
  SAVE_VALUE_BULK = 'SAVE_VALUE_BULK'
}

export type ThematicToRenew = {
  campaignId: Scalars['String']['input'];
  thematicId: Scalars['String']['input'];
};

export enum TreeBehavior {
  files = 'files',
  standard = 'standard'
}

export type TreeElementInput = {
  id: Scalars['ID']['input'];
  library: Scalars['String']['input'];
};

export type TreeEventFiltersInput = {
  events?: InputMaybe<Array<TreeEventTypes>>;
  ignoreOwnEvents?: InputMaybe<Scalars['Boolean']['input']>;
  nodes?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  treeId: Scalars['ID']['input'];
};

export enum TreeEventTypes {
  add = 'add',
  move = 'move',
  remove = 'remove'
}

export type TreeInput = {
  behavior?: InputMaybe<TreeBehavior>;
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  libraries?: InputMaybe<Array<TreeLibraryInput>>;
  permissions_conf?: InputMaybe<Array<TreeNodePermissionsConfInput>>;
  settings?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type TreeLibraryInput = {
  library: Scalars['ID']['input'];
  settings: TreeLibrarySettingsInput;
};

export type TreeLibrarySettingsInput = {
  allowMultiplePositions: Scalars['Boolean']['input'];
  allowedAtRoot: Scalars['Boolean']['input'];
  allowedChildren: Array<Scalars['String']['input']>;
};

export type TreeNodePermissionsConfInput = {
  libraryId: Scalars['ID']['input'];
  permissionsConf: TreepermissionsConfInput;
};

export type TreePermissionsDependentValuesConfInput = {
  allowByDefault: Scalars['Boolean']['input'];
  dependenciesTreeAttributes: Array<Scalars['ID']['input']>;
};

export type TreepermissionsConfInput = {
  permissionTreeAttributes: Array<Scalars['ID']['input']>;
  relation: PermissionsRelation;
};

export type TreesFiltersInput = {
  behavior?: InputMaybe<TreeBehavior>;
  id?: InputMaybe<Array<Scalars['ID']['input']>>;
  label?: InputMaybe<Array<Scalars['String']['input']>>;
  library?: InputMaybe<Scalars['String']['input']>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum TreesSortableFields {
  behavior = 'behavior',
  id = 'id',
  system = 'system'
}

export type UploadFiltersInput = {
  uid?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export enum UserCoreDataKeys {
  applications_consultation = 'applications_consultation'
}

export type ValueBatchInput = {
  attribute?: InputMaybe<Scalars['ID']['input']>;
  id_value?: InputMaybe<Scalars['ID']['input']>;
  metadata?: InputMaybe<Array<InputMaybe<ValueMetadataInput>>>;
  /**  Use "\__empty_value__" to set an empty value  */
  payload?: InputMaybe<Scalars['String']['input']>;
};

export type ValueInput = {
  id_value?: InputMaybe<Scalars['ID']['input']>;
  metadata?: InputMaybe<Array<InputMaybe<ValueMetadataInput>>>;
  /**  Use "\__empty_value__" to set an empty value  */
  payload?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Array<InputMaybe<ValueVersionInput>>>;
};

export type ValueMetadataInput = {
  name: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type ValueVersionInput = {
  treeId: Scalars['String']['input'];
  treeNodeId: Scalars['String']['input'];
};

export enum ValueVersionMode {
  simple = 'simple',
  smart = 'smart'
}

export type ValuesListConfInput = {
  allowFreeEntry?: InputMaybe<Scalars['Boolean']['input']>;
  allowListUpdate?: InputMaybe<Scalars['Boolean']['input']>;
  enable: Scalars['Boolean']['input'];
  values?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ValuesVersionsConfInput = {
  mode?: InputMaybe<ValueVersionMode>;
  profile?: InputMaybe<Scalars['String']['input']>;
  versionable: Scalars['Boolean']['input'];
};

export type VersionProfileInput = {
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  id: Scalars['String']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  trees?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type VersionProfilesFiltersInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  trees?: InputMaybe<Scalars['String']['input']>;
};

export enum VersionProfilesSortableFields {
  id = 'id'
}

export type ViewDisplayInput = {
  size?: InputMaybe<ViewSizes>;
  type: ViewTypes;
};

export type ViewInput = {
  attributes?: InputMaybe<Array<Scalars['String']['input']>>;
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  display: ViewDisplayInput;
  filters?: InputMaybe<Array<RecordFilterInput>>;
  id?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  library: Scalars['String']['input'];
  shared: Scalars['Boolean']['input'];
  sort?: InputMaybe<Array<RecordSortInput>>;
  valuesVersions?: InputMaybe<Array<ViewValuesVersionInput>>;
};

export type ViewInputPartial = {
  attributes?: InputMaybe<Array<Scalars['String']['input']>>;
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  display?: InputMaybe<ViewDisplayInput>;
  filters?: InputMaybe<Array<RecordFilterInput>>;
  id: Scalars['String']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  library?: InputMaybe<Scalars['String']['input']>;
  shared?: InputMaybe<Scalars['Boolean']['input']>;
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
  treeId: Scalars['String']['input'];
  treeNode: Scalars['String']['input'];
};

export type RecordIdentityFragment = { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } };

export type ApplicationDetailsFragment = { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } };

export type AttributeDetailsLinkAttributeFragment = { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
      | { id: string, label?: any | null }
      | { id: string, label?: any | null, linked_tree?: { id: string } | null }
    > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null };

export type AttributeDetailsStandardAttributeFragment = { unique?: boolean | null, character_limit?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
      | { id: string, label?: any | null }
      | { id: string, label?: any | null, linked_tree?: { id: string } | null }
    > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null };

export type AttributeDetailsTreeAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_tree?: { id: string } | null, permissions_conf_dependent_values?: { allowByDefault: boolean, dependenciesTreeAttributes: Array<
      | { id: string, label?: any | null }
      | { id: string, label?: any | null, linked_tree?: { id: string } | null }
    > } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
      | { id: string, label?: any | null }
      | { id: string, label?: any | null, linked_tree?: { id: string } | null }
    > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null };

export type AttributeDetailsFragment =
  | AttributeDetailsLinkAttributeFragment
  | AttributeDetailsStandardAttributeFragment
  | AttributeDetailsTreeAttributeFragment
;

export type AttributeValuesListDetailsLinkAttributeFragment = { values_list?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, linkValues?: Array<{ whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null };

export type AttributeValuesListDetailsStandardAttributeFragment = { unique?: boolean | null, values_list?:
    | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
    | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
   | null };

export type AttributeValuesListDetailsTreeAttributeFragment = { values_list?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, treeValues?: Array<{ id: string, record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null };

export type AttributeValuesListDetailsFragment =
  | AttributeValuesListDetailsLinkAttributeFragment
  | AttributeValuesListDetailsStandardAttributeFragment
  | AttributeValuesListDetailsTreeAttributeFragment
;

export type FormDetailsFragment = { id: string, label?: any | null, system: boolean, elements: Array<{ dependencyValue?: { attribute: string, value: string } | null, elements: Array<{ id: string, containerId: string, order: number, type: FormElementTypes, uiElementType: string, settings: Array<{ key: string, value: any }> }> }>, dependencyAttributes?: Array<
    | { id: string, label?: any | null }
    | { id: string, label?: any | null, linked_tree?: { id: string } | null }
  > | null, sidePanel?: { enable: boolean, isOpenByDefault?: boolean | null } | null };

export type FormElementsByDepsFragment = { dependencyValue?: { attribute: string, value: string } | null, elements: Array<{ id: string, containerId: string, order: number, type: FormElementTypes, uiElementType: string, settings: Array<{ key: string, value: any }> }> };

export type LibraryDetailsFragment = { id: string, system?: boolean | null, label?: any | null, behavior: LibraryBehavior, settings?: any | null, mandatoryAttribute?: { id: string, label?: any | null } | null, attributes?: Array<
    | { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    | { unique?: boolean | null, character_limit?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_tree?: { id: string } | null, permissions_conf_dependent_values?: { allowByDefault: boolean, dependenciesTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
  > | null, fullTextAttributes?: Array<{ id: string, label?: any | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
      | { id: string, label?: any | null }
      | { id: string, label?: any | null, linked_tree?: { id: string } | null }
    > } | null, recordIdentityConf?: { label?: string | null, subLabel?: string | null, color?: string | null, preview?: string | null, treeColorPreview?: string | null, parentContext?: string | null } | null, defaultView?: { id: string } | null, permissions?: { admin_library: boolean, access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { records: { list: Array<{ id: string, email: Array<{ payload?: any | null }> }> } };

export type GetHistoryDataQueryVariables = Exact<{
  filters?: InputMaybe<LogFilterInput>;
  sort?: InputMaybe<LogSortInput>;
  pagination?: InputMaybe<Pagination>;
}>;


export type GetHistoryDataQuery = { logs?: { total: number, logs: Array<{ time: number, trigger?: string | null, metadata?: any | null, action?: LogAction | null, queryId: string, user:
        | { id: string, label?: any | null }
        | { id: string, email: Array<{ payload?: any | null }> }
      , topic?: { apiKey?: string | null, filename?: string | null, attribute?: { id: string, label?: any | null } | null, library?: { id: string, label?: any | null } | null, permission?: { type: string, applyTo?: any | null } | null, profile?: { id: string } | null, record?:
          | { id: string, label?: any | null }
          | { id: string, whoAmI: { label?: string | null } }
         | null, tree?: { id: string, label?: any | null } | null, application?: { id: string, label: any } | null } | null, after?: { asString?: string | null, raw?: any | null } | null, before?: { asString?: string | null, raw?: any | null } | null }> } | null };

export type DeleteApiKeyMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteApiKeyMutation = { deleteApiKey: { id: string } };

export type GetApiKeysQueryVariables = Exact<{
  filters?: InputMaybe<ApiKeysFiltersInput>;
  sort?: InputMaybe<SortApiKeysInput>;
}>;


export type GetApiKeysQuery = { apiKeys: { list: Array<{ id: string, label?: string | null, key?: string | null, expiresAt?: number | null, createdAt: number, modifiedAt: number, createdBy: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, modifiedBy: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, user: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> } };

export type SaveApiKeyMutationVariables = Exact<{
  apiKey: ApiKeyInput;
}>;


export type SaveApiKeyMutation = { saveApiKey: { id: string, label?: string | null, key?: string | null, expiresAt?: number | null, createdAt: number, modifiedAt: number, createdBy: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, modifiedBy: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, user: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } };

export type DeleteApplicationMutationVariables = Exact<{
  appId: Scalars['ID']['input'];
}>;


export type DeleteApplicationMutation = { deleteApplication: { id: string } };

export type GetApplicationByEndpointQueryVariables = Exact<{
  endpoint: Scalars['String']['input'];
}>;


export type GetApplicationByEndpointQuery = { applications?: { list: Array<{ id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } }> } | null };

export type GetApplicationByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetApplicationByIdQuery = { applications?: { list: Array<{ id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } }> } | null };

export type ApplicationEventsSubscriptionVariables = Exact<{
  filters?: InputMaybe<ApplicationEventFiltersInput>;
}>;


export type ApplicationEventsSubscription = { applicationEvent: { type: ApplicationEventTypes, application: { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } } } };

export type GetApplicationModulesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApplicationModulesQuery = { applicationsModules: Array<{ id: string, description?: string | null, version?: string | null }> };

export type GetApplicationsQueryVariables = Exact<{
  filters?: InputMaybe<ApplicationsFiltersInput>;
  sort?: InputMaybe<SortApplications>;
}>;


export type GetApplicationsQuery = { applications?: { list: Array<{ id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, color?: string | null, url?: string | null, system: boolean, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> } | null };

export type SaveApplicationMutationVariables = Exact<{
  application: ApplicationInput;
}>;


export type SaveApplicationMutation = { saveApplication: { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } } };

export type DeleteAttributeMutationVariables = Exact<{
  attrId: Scalars['ID']['input'];
}>;


export type DeleteAttributeMutation = { deleteAttribute: { id: string } };

export type GetActionsListQueryQueryVariables = Exact<{
  attId: Scalars['ID']['input'];
}>;


export type GetActionsListQueryQuery = { attributes?: { list: Array<{ id: string, format?: AttributeFormat | null, input_types: { saveValue: Array<IoTypes>, postSaveValue: Array<IoTypes>, getValue: Array<IoTypes>, deleteValue: Array<IoTypes>, postDeleteValue: Array<IoTypes> }, output_types: { saveValue: Array<IoTypes>, postSaveValue: Array<IoTypes>, getValue: Array<IoTypes>, deleteValue: Array<IoTypes>, postDeleteValue: Array<IoTypes> }, actions_list?: { saveValue?: Array<{ id: string, is_system: boolean, error_message?: any | null, params?: Array<{ name: string, value: string }> | null }> | null, postSaveValue?: Array<{ id: string, is_system: boolean, error_message?: any | null, params?: Array<{ name: string, value: string }> | null }> | null, getValue?: Array<{ id: string, is_system: boolean, params?: Array<{ name: string, value: string }> | null }> | null, deleteValue?: Array<{ id: string, is_system: boolean, params?: Array<{ name: string, value: string }> | null }> | null, postDeleteValue?: Array<{ id: string, is_system: boolean, params?: Array<{ name: string, value: string }> | null }> | null } | null }> } | null };

export type GetAttributeByIdQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetAttributeByIdQuery = { attributes?: { totalCount: number, list: Array<
      | { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
      | { unique?: boolean | null, character_limit?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_tree?: { id: string } | null, permissions_conf_dependent_values?: { allowByDefault: boolean, dependenciesTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    > } | null };

export type GetAttributesValuesListQueryVariables = Exact<{
  attrId: Scalars['ID']['input'];
}>;


export type GetAttributesValuesListQuery = { attributes?: { list: Array<
      | { reverse_link?: string | null, id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, linkValues?: Array<{ whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, linked_library?: { id: string } | null }
      | { unique?: boolean | null, id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, values_list?:
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
         | null }
      | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, treeValues?: Array<{ id: string, record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, linked_tree?: { id: string } | null }
    > } | null };

export type GetAttributesQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Array<AttributeType> | AttributeType>;
  format?: InputMaybe<Array<AttributeFormat> | AttributeFormat>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
  multiple_values?: InputMaybe<Scalars['Boolean']['input']>;
  versionable?: InputMaybe<Scalars['Boolean']['input']>;
  libraries?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type GetAttributesQuery = { attributes?: { totalCount: number, list: Array<
      | { reverse_link?: string | null, id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, multiple_values: boolean, linked_library?: { id: string } | null }
      | { unique?: boolean | null, id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, multiple_values: boolean }
      | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, multiple_values: boolean, linked_tree?: { id: string } | null }
    > } | null };

export type GetAvailableActionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableActionsQuery = { availableActions?: Array<{ id: string, name: string, description?: string | null, input_types: Array<ActionIoTypes>, output_types: Array<ActionIoTypes>, params?: Array<{ name: string, type: string, description?: string | null, required?: boolean | null, helper_value?: string | null }> | null }> | null };

export type SaveAttributeActionListMutationVariables = Exact<{
  att: AttributeInput;
}>;


export type SaveAttributeActionListMutation = { saveAttribute: { id: string, actions_list?: { saveValue?: Array<{ id: string, error_message?: any | null, params?: Array<{ name: string, value: string }> | null }> | null, postSaveValue?: Array<{ id: string, error_message?: any | null, params?: Array<{ name: string, value: string }> | null }> | null, getValue?: Array<{ id: string, params?: Array<{ name: string, value: string }> | null }> | null, deleteValue?: Array<{ id: string, params?: Array<{ name: string, value: string }> | null }> | null, postDeleteValue?: Array<{ id: string, params?: Array<{ name: string, value: string }> | null }> | null } | null } };

export type SaveAttributeMutationVariables = Exact<{
  attrData: AttributeInput;
}>;


export type SaveAttributeMutation = { saveAttribute:
    | { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean } | null, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, linkValues?: Array<{ whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    | { unique?: boolean | null, character_limit?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, values_list?:
        | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
        | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
       | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_tree?: { id: string } | null, permissions_conf_dependent_values?: { allowByDefault: boolean, dependenciesTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, values_list?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, treeValues?: Array<{ id: string, record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
   };

export type SaveAttributeEmbeddedFieldsMutationVariables = Exact<{
  attribute?: InputMaybe<AttributeInput>;
}>;


export type SaveAttributeEmbeddedFieldsMutation = { saveAttribute: { id: string, label?: any | null, format?: AttributeFormat | null } };

export type GetLangsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLangsQuery = { langs: Array<string | null> };

export type DeleteFormMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  formId: Scalars['ID']['input'];
}>;


export type DeleteFormMutation = { deleteForm?: { id: string, library: { id: string } } | null };

export type GetFormQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
}>;


export type GetFormQuery = { forms?: { totalCount: number, list: Array<{ id: string, label?: any | null, system: boolean, elements: Array<{ dependencyValue?: { attribute: string, value: string } | null, elements: Array<{ id: string, containerId: string, order: number, type: FormElementTypes, uiElementType: string, settings: Array<{ key: string, value: any }> }> }>, dependencyAttributes?: Array<
        | { id: string, label?: any | null }
        | { id: string, label?: any | null, linked_tree?: { id: string } | null }
      > | null, sidePanel?: { enable: boolean, isOpenByDefault?: boolean | null } | null }> } | null };

export type GetFormsListQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetFormsListQuery = { forms?: { totalCount: number, list: Array<{ id: string, label?: any | null, system: boolean }> } | null };

export type SaveFormMutationVariables = Exact<{
  formData: FormInput;
}>;


export type SaveFormMutation = { saveForm?: { id: string, label?: any | null, system: boolean, elements: Array<{ dependencyValue?: { attribute: string, value: string } | null, elements: Array<{ id: string, containerId: string, order: number, type: FormElementTypes, uiElementType: string, settings: Array<{ key: string, value: any }> }> }>, dependencyAttributes?: Array<
      | { id: string, label?: any | null }
      | { id: string, label?: any | null, linked_tree?: { id: string } | null }
    > | null, sidePanel?: { enable: boolean, isOpenByDefault?: boolean | null } | null } | null };

export type GetGlobalSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGlobalSettingsQuery = { globalSettings: { defaultApp: string, name: string, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, favicon?: { id: string, whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null } };

export type SaveGlobalSettingsMutationVariables = Exact<{
  settings: GlobalSettingsInput;
}>;


export type SaveGlobalSettingsMutation = { saveGlobalSettings: { defaultApp: string, name: string, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, favicon?: { id: string, whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null } };

export type DeleteLibraryMutationVariables = Exact<{
  libID: Scalars['ID']['input'];
}>;


export type DeleteLibraryMutation = { deleteLibrary: { id: string } };

export type GetLibrariesQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  label?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
  behavior?: InputMaybe<Array<LibraryBehavior> | LibraryBehavior>;
}>;


export type GetLibrariesQuery = { libraries?: { totalCount: number, list: Array<{ id: string, system?: boolean | null, label?: any | null, behavior: LibraryBehavior, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> } | null };

export type GetLibrariesWithAttributesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLibrariesWithAttributesQuery = { libraries?: { totalCount: number, list: Array<{ id: string, label?: any | null, attributes?: Array<{ id: string, label?: any | null }> | null }> } | null };

export type GetLibByIdQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  lang?: InputMaybe<Array<AvailableLanguage> | AvailableLanguage>;
}>;


export type GetLibByIdQuery = { libraries?: { list: Array<{ id: string, system?: boolean | null, label?: any | null, behavior: LibraryBehavior, settings?: any | null, mandatoryAttribute?: { id: string, label?: any | null } | null, attributes?: Array<
        | { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
              | { id: string, label?: any | null }
              | { id: string, label?: any | null, linked_tree?: { id: string } | null }
            > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
        | { unique?: boolean | null, character_limit?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
              | { id: string, label?: any | null }
              | { id: string, label?: any | null, linked_tree?: { id: string } | null }
            > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
        | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_tree?: { id: string } | null, permissions_conf_dependent_values?: { allowByDefault: boolean, dependenciesTreeAttributes: Array<
              | { id: string, label?: any | null }
              | { id: string, label?: any | null, linked_tree?: { id: string } | null }
            > } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
              | { id: string, label?: any | null }
              | { id: string, label?: any | null, linked_tree?: { id: string } | null }
            > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
      > | null, fullTextAttributes?: Array<{ id: string, label?: any | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, recordIdentityConf?: { label?: string | null, subLabel?: string | null, color?: string | null, preview?: string | null, treeColorPreview?: string | null, parentContext?: string | null } | null, defaultView?: { id: string } | null, permissions?: { admin_library: boolean, access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> } | null };

export type QueryLibraryConfigQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  lang?: InputMaybe<Array<AvailableLanguage> | AvailableLanguage>;
}>;


export type QueryLibraryConfigQuery = { libraries?: { list: Array<{ id: string, label?: any | null, attributes?: Array<{ id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null }> | null }> } | null };

export type SaveLibraryAttributesMutationVariables = Exact<{
  libId: Scalars['ID']['input'];
  attributes: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type SaveLibraryAttributesMutation = { saveLibrary: { id: string, attributes?: Array<
      | { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
      | { unique?: boolean | null, character_limit?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_tree?: { id: string } | null, permissions_conf_dependent_values?: { allowByDefault: boolean, dependenciesTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    > | null } };

export type SaveLibraryMutationVariables = Exact<{
  libData: LibraryInput;
  lang?: InputMaybe<Array<AvailableLanguage> | AvailableLanguage>;
}>;


export type SaveLibraryMutation = { saveLibrary: { id: string, system?: boolean | null, label?: any | null, behavior: LibraryBehavior, settings?: any | null, mandatoryAttribute?: { id: string, label?: any | null } | null, attributes?: Array<
      | { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
      | { unique?: boolean | null, character_limit?: number | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, label?: any | null, description?: any | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, settings?: any | null, linked_tree?: { id: string } | null, permissions_conf_dependent_values?: { allowByDefault: boolean, dependenciesTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    > | null, fullTextAttributes?: Array<{ id: string, label?: any | null }> | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
        | { id: string, label?: any | null }
        | { id: string, label?: any | null, linked_tree?: { id: string } | null }
      > } | null, recordIdentityConf?: { label?: string | null, subLabel?: string | null, color?: string | null, preview?: string | null, treeColorPreview?: string | null, parentContext?: string | null } | null, defaultView?: { id: string } | null, permissions?: { admin_library: boolean, access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null, icon?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null } };

export type GetPermissionsActionsQueryVariables = Exact<{
  type: PermissionTypes;
  applyOn?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPermissionsActionsQuery = { permissionsActionsByType: Array<{ name: PermissionsActions, label?: any | null }> };

export type GetPermissionsQueryVariables = Exact<{
  type: PermissionTypes;
  applyTo?: InputMaybe<Scalars['ID']['input']>;
  actions: Array<PermissionsActions> | PermissionsActions;
  usersGroup?: InputMaybe<Scalars['ID']['input']>;
  permissionTreeTarget?: InputMaybe<PermissionsTreeTargetInput>;
  dependenciesTreeTargets?: InputMaybe<Array<PermissionsDependenciesTreeTargetInput> | PermissionsDependenciesTreeTargetInput>;
}>;


export type GetPermissionsQuery = { perm?: Array<{ name: PermissionsActions, allowed?: boolean | null }> | null, inheritPerm?: Array<{ name: PermissionsActions, allowed: boolean }> | null };

export type IsAllowedQueryVariables = Exact<{
  type: PermissionTypes;
  applyTo?: InputMaybe<Scalars['ID']['input']>;
  actions: Array<PermissionsActions> | PermissionsActions;
  target?: InputMaybe<PermissionTarget>;
}>;


export type IsAllowedQuery = { isAllowed?: Array<{ name: PermissionsActions, allowed?: boolean | null }> | null };

export type SavePermissionMutationVariables = Exact<{
  permData: PermissionInput;
}>;


export type SavePermissionMutation = { savePermission: { type: PermissionTypes, applyTo?: string | null, usersGroup?: string | null, actions: Array<{ name: PermissionsActions, allowed?: boolean | null }>, permissionTreeTarget?: { nodeId?: string | null, tree: string } | null, dependenciesTreeTargets?: Array<{ attributeId: string, nodeId?: string | null, tree: string }> | null } };

export type GetAllPluginsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllPluginsQuery = { plugins: Array<{ name: string, description?: string | null, version?: string | null, author?: string | null }> };

export type CreateRecordMutationVariables = Exact<{
  library: Scalars['ID']['input'];
}>;


export type CreateRecordMutation = { createRecord: { record?: { id: string, whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null } };

export type IndexRecordsMutationVariables = Exact<{
  libraryId: Scalars['String']['input'];
  records?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type IndexRecordsMutation = { indexRecords: boolean };

export type PurgeRecordsMutationVariables = Exact<{
  libraryId: Scalars['String']['input'];
}>;


export type PurgeRecordsMutation = { purgeInactiveRecords: Array<{ id: string }> };

export type RecordsListQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
  pagination?: InputMaybe<RecordsPagination>;
}>;


export type RecordsListQuery = { records: { totalCount?: number | null, list: Array<{ whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> } };

export type GetStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStatsQuery = { libraries?: { totalCount: number } | null, attributes?: { totalCount: number } | null, trees?: { totalCount: number } | null, applications?: { totalCount: number } | null };

export type CancelTaskMutationVariables = Exact<{
  taskId: Scalars['ID']['input'];
}>;


export type CancelTaskMutation = { cancelTask: boolean };

export type DeleteTasksMutationVariables = Exact<{
  tasks: Array<DeleteTaskInput> | DeleteTaskInput;
}>;


export type DeleteTasksMutation = { deleteTasks: boolean };

export type GetTasksQueryVariables = Exact<{
  filters?: InputMaybe<TaskFiltersInput>;
}>;


export type GetTasksQuery = { tasks: { totalCount: number, list: Array<{ id: string, label: any, modified_at: number, created_at: number, startAt: number, status: TaskStatus, priority: any, startedAt?: number | null, completedAt?: number | null, archive: boolean, created_by: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, progress?: { percent?: number | null, description?: any | null } | null, link?: { name: string, url: string } | null, canceledBy?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> } };

export type SubTasksUpdateSubscriptionVariables = Exact<{
  filters?: InputMaybe<TaskFiltersInput>;
}>;


export type SubTasksUpdateSubscription = { task: { id: string, label: any, modified_at: number, created_at: number, startAt: number, status: TaskStatus, priority: any, startedAt?: number | null, completedAt?: number | null, archive: boolean, created_by: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, progress?: { percent?: number | null, description?: any | null } | null, link?: { name: string, url: string } | null, canceledBy?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null } };

export type DeleteTreeMutationVariables = Exact<{
  treeId: Scalars['ID']['input'];
}>;


export type DeleteTreeMutation = { deleteTree: { id: string } };

export type GetTreeByIdQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type GetTreeByIdQuery = { trees?: { totalCount: number, list: Array<{ id: string, label?: any | null, system: boolean, behavior: TreeBehavior, settings?: any | null, permissions_conf?: Array<{ libraryId: string, permissionsConf: { relation: PermissionsRelation, permissionTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { id: string } | null }
          > } }> | null, libraries: Array<{ library: { id: string, label?: any | null, attributes?: Array<{ id: string, label?: any | null, type: AttributeType }> | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }> }> } | null };

export type GetTreesQueryVariables = Exact<{
  filters?: InputMaybe<TreesFiltersInput>;
}>;


export type GetTreesQuery = { trees?: { totalCount: number, list: Array<{ id: string, label?: any | null, system: boolean, behavior: TreeBehavior, libraries: Array<{ library: { id: string, label?: any | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }> }> } | null };

export type SaveTreeMutationVariables = Exact<{
  treeData: TreeInput;
}>;


export type SaveTreeMutation = { saveTree: { id: string, system: boolean, label?: any | null, behavior: TreeBehavior, settings?: any | null, libraries: Array<{ library: { id: string, label?: any | null, attributes?: Array<
          | { id: string, label?: any | null, type: AttributeType }
          | { id: string, label?: any | null, type: AttributeType, linked_tree?: { id: string } | null }
        > | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }>, permissions_conf?: Array<{ libraryId: string, permissionsConf: { relation: PermissionsRelation, permissionTreeAttributes: Array<{ id: string, label?: any | null }> } }> | null } };

export type AddTreeElementMutationVariables = Exact<{
  treeId: Scalars['ID']['input'];
  element: TreeElementInput;
  parent?: InputMaybe<Scalars['ID']['input']>;
}>;


export type AddTreeElementMutation = { treeAddElement: { id: string } };

export type DeleteTreeElementMutationVariables = Exact<{
  treeId: Scalars['ID']['input'];
  nodeId: Scalars['ID']['input'];
  deleteChildren?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DeleteTreeElementMutation = { treeDeleteElement: string };

export type MoveTreeElementMutationVariables = Exact<{
  treeId: Scalars['ID']['input'];
  nodeId: Scalars['ID']['input'];
  parentTo?: InputMaybe<Scalars['ID']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MoveTreeElementMutation = { treeMoveElement: { id: string } };

export type TreeNodeChildrenQueryVariables = Exact<{
  treeId: Scalars['ID']['input'];
  node?: InputMaybe<Scalars['ID']['input']>;
  pagination?: InputMaybe<Pagination>;
}>;


export type TreeNodeChildrenQuery = { treeNodeChildren: { list: Array<{ id: string, order?: number | null, childrenCount?: number | null, record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ id: string, record: { id: string, library: { id: string, label?: any | null }, whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null };

export type DeleteValueMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
  attribute: Scalars['ID']['input'];
  valueId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type DeleteValueMutation = { deleteValue: Array<{ id_value?: string | null, attribute: { id: string } }> };

export type PurgeMultipleValuesMutationVariables = Exact<{
  attributeId: Scalars['ID']['input'];
}>;


export type PurgeMultipleValuesMutation = { purgeMultipleValues: string };

export type SaveValueBatchMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
  version?: InputMaybe<Array<ValueVersionInput> | ValueVersionInput>;
  values: Array<ValueBatchInput> | ValueBatchInput;
}>;


export type SaveValueBatchMutation = { saveValueBatch: { values?: Array<
      | { id_value?: string | null, modified_at?: number | null, created_at?: number | null, linkValue?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string } }
      | { id_value?: string | null, modified_at?: number | null, created_at?: number | null, treeValue?: { record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string } }
      | { value?: any | null, raw_value?: any | null, id_value?: string | null, modified_at?: number | null, created_at?: number | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string } }
    > | null, errors?: Array<{ type: string, attribute: string, input?: string | null, message: string }> | null } };

export type SaveValueMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
  attribute: Scalars['ID']['input'];
  value: ValueInput;
}>;


export type SaveValueMutation = { saveValue: Array<
    | { id_value?: string | null, linkValue?: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, attribute: { id: string } }
    | { id_value?: string | null, treeValue?: { record: { whoAmI: { id: string, label?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } | null, attribute: { id: string } }
    | { value?: any | null, raw_value?: any | null, id_value?: string | null, attribute: { id: string } }
  > };

export type GetVersionQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVersionQuery = { version: string };

export type DeleteVersionProfileMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteVersionProfileMutation = { deleteVersionProfile: { id: string } };

export type GetVersionProfileByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetVersionProfileByIdQuery = { versionProfiles: { list: Array<{ id: string, label: any, description?: any | null, trees: Array<{ id: string, label?: any | null }>, linkedAttributes: Array<{ id: string, label?: any | null }> }> } };

export type GetVersionProfilesQueryVariables = Exact<{
  filters?: InputMaybe<VersionProfilesFiltersInput>;
  sort?: InputMaybe<SortVersionProfilesInput>;
}>;


export type GetVersionProfilesQuery = { versionProfiles: { list: Array<{ id: string, label: any }> } };

export type SaveVersionProfileMutationVariables = Exact<{
  versionProfile: VersionProfileInput;
}>;


export type SaveVersionProfileMutation = { saveVersionProfile: { id: string, label: any, description?: any | null, trees: Array<{ id: string, label?: any | null }> } };

export type GetViewsQueryVariables = Exact<{
  library: Scalars['String']['input'];
}>;


export type GetViewsQuery = { views: { list: Array<{ id: string, label: any }> } };

export const RecordIdentityFragmentDoc = gql`
    fragment RecordIdentity on Record {
  whoAmI {
    id
    library {
      id
      label
    }
    label
    color
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
    ${RecordIdentityFragmentDoc}`;
export const AttributeValuesListDetailsFragmentDoc = gql`
    fragment AttributeValuesListDetails on Attribute {
  ... on StandardAttribute {
    unique
    values_list {
      ... on StandardStringValuesListConf {
        enable
        allowFreeEntry
        allowListUpdate
        values
      }
      ... on StandardDateRangeValuesListConf {
        enable
        allowFreeEntry
        allowListUpdate
        dateRangeValues: values {
          from
          to
        }
      }
    }
  }
  ... on LinkAttribute {
    values_list {
      enable
      allowFreeEntry
      allowListUpdate
      linkValues: values {
        ...RecordIdentity
      }
    }
  }
  ... on TreeAttribute {
    values_list {
      enable
      allowFreeEntry
      allowListUpdate
      treeValues: values {
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
    ${RecordIdentityFragmentDoc}`;
export const FormElementsByDepsFragmentDoc = gql`
    fragment FormElementsByDeps on FormElementsByDeps {
  dependencyValue {
    attribute
    value
  }
  elements {
    id
    containerId
    order
    type
    uiElementType
    settings {
      key
      value
    }
  }
}
    `;
export const FormDetailsFragmentDoc = gql`
    fragment FormDetails on Form {
  id
  label
  system
  elements {
    ...FormElementsByDeps
  }
  dependencyAttributes {
    id
    label
    ... on TreeAttribute {
      linked_tree {
        id
      }
    }
  }
  sidePanel {
    enable
    isOpenByDefault
  }
}
    ${FormElementsByDepsFragmentDoc}`;
export const AttributeDetailsFragmentDoc = gql`
    fragment AttributeDetails on Attribute {
  id
  type
  format
  system
  readonly
  required
  label
  description
  multiple_values
  multi_link_display_option
  multi_tree_display_option
  metadata_fields {
    id
    label
    type
    format
  }
  settings
  permissions_conf {
    permissionTreeAttributes {
      id
      label
      ... on TreeAttribute {
        linked_tree {
          id
        }
      }
    }
    relation
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
    character_limit
  }
  ... on LinkAttribute {
    linked_library {
      id
    }
    reverse_link
    smart_filter {
      enable
    }
  }
  ... on TreeAttribute {
    linked_tree {
      id
    }
    permissions_conf_dependent_values {
      dependenciesTreeAttributes {
        id
        label
        ... on TreeAttribute {
          linked_tree {
            id
          }
        }
      }
      allowByDefault
    }
  }
}
    `;
export const LibraryDetailsFragmentDoc = gql`
    fragment LibraryDetails on Library {
  id
  system
  label
  behavior
  mandatoryAttribute {
    id
    label
  }
  attributes {
    ...AttributeDetails
  }
  fullTextAttributes {
    id
    label
  }
  settings
  permissions_conf {
    permissionTreeAttributes {
      id
      ... on TreeAttribute {
        linked_tree {
          id
        }
      }
      label(lang: $lang)
    }
    relation
  }
  recordIdentityConf {
    label
    subLabel
    color
    preview
    treeColorPreview
    parentContext
  }
  defaultView {
    id
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
}
    ${AttributeDetailsFragmentDoc}
${RecordIdentityFragmentDoc}`;
export const ValueDetailsFragmentDoc = gql`
    fragment ValueDetails on GenericValue {
  id_value
  created_at
  modified_at
  version {
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
  metadata {
    name
    value {
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
    ${RecordIdentityFragmentDoc}`;
export const ValueDetailsExtendedFragmentDoc = gql`
    fragment ValueDetailsExtended on GenericValue {
  id_value
  created_at
  modified_at
  version {
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
  metadata {
    name
    value {
      value
      raw_value
    }
  }
  ... on Value {
    id_value
  }
  ... on LinkValue {
    linkValue: value {
      ...RecordIdentity
    }
  }
  ... on TreeValue {
    treeValue: value {
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
    ${RecordIdentityFragmentDoc}`;
export const GetUsersDocument = gql`
    query GetUsers {
  records(library: "users") {
    list {
      id
      email: property(attribute: "email") {
        ... on Value {
          payload
        }
      }
    }
  }
}
    `;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
// @ts-ignore
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>): Apollo.UseSuspenseQueryResult<GetUsersQuery, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>): Apollo.UseSuspenseQueryResult<GetUsersQuery | undefined, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export const GetHistoryDataDocument = gql`
    query GetHistoryData($filters: LogFilterInput, $sort: LogSortInput, $pagination: Pagination) {
  logs(filters: $filters, sort: $sort, pagination: $pagination) {
    total
    logs {
      time
      user {
        ... on Record {
          id
          email: property(attribute: "email") {
            ... on Value {
              payload
            }
          }
        }
        ... on LogUnknownEntity {
          id
          label
        }
      }
      trigger
      metadata
      action
      topic {
        apiKey
        attribute {
          ... on StandardAttribute {
            id
            label
          }
          ... on LinkAttribute {
            id
            label
          }
          ... on TreeAttribute {
            id
            label
          }
          ... on LogUnknownEntity {
            id
            label
          }
        }
        filename
        library {
          ... on Library {
            id
            label
          }
          ... on LogUnknownEntity {
            id
            label
          }
        }
        permission {
          type
          applyTo
        }
        profile {
          ... on VersionProfile {
            id
          }
          ... on LogUnknownStringEntity {
            id
          }
        }
        record {
          ... on Record {
            id
            whoAmI {
              label
            }
          }
          ... on LogUnknownEntity {
            id
            label
          }
        }
        tree {
          ... on Tree {
            id
            label
          }
          ... on LogUnknownEntity {
            id
            label
          }
        }
        application {
          ... on Application {
            id
            label
          }
          ... on LogUnknownApplicationEntity {
            id
            label
          }
        }
      }
      after {
        asString
        raw
      }
      before {
        asString
        raw
      }
      queryId
    }
  }
}
    `;

/**
 * __useGetHistoryDataQuery__
 *
 * To run a query within a React component, call `useGetHistoryDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHistoryDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHistoryDataQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      sort: // value for 'sort'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetHistoryDataQuery(baseOptions?: Apollo.QueryHookOptions<GetHistoryDataQuery, GetHistoryDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHistoryDataQuery, GetHistoryDataQueryVariables>(GetHistoryDataDocument, options);
      }
export function useGetHistoryDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHistoryDataQuery, GetHistoryDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHistoryDataQuery, GetHistoryDataQueryVariables>(GetHistoryDataDocument, options);
        }
// @ts-ignore
export function useGetHistoryDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetHistoryDataQuery, GetHistoryDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetHistoryDataQuery, GetHistoryDataQueryVariables>;
export function useGetHistoryDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHistoryDataQuery, GetHistoryDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetHistoryDataQuery | undefined, GetHistoryDataQueryVariables>;
export function useGetHistoryDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHistoryDataQuery, GetHistoryDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHistoryDataQuery, GetHistoryDataQueryVariables>(GetHistoryDataDocument, options);
        }
export type GetHistoryDataQueryHookResult = ReturnType<typeof useGetHistoryDataQuery>;
export type GetHistoryDataLazyQueryHookResult = ReturnType<typeof useGetHistoryDataLazyQuery>;
export type GetHistoryDataSuspenseQueryHookResult = ReturnType<typeof useGetHistoryDataSuspenseQuery>;
export type GetHistoryDataQueryResult = Apollo.QueryResult<GetHistoryDataQuery, GetHistoryDataQueryVariables>;
export const DeleteApiKeyDocument = gql`
    mutation DELETE_API_KEY($id: String!) {
  deleteApiKey(id: $id) {
    id
  }
}
    `;
export type DeleteApiKeyMutationFn = Apollo.MutationFunction<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>;

/**
 * __useDeleteApiKeyMutation__
 *
 * To run a mutation, you first call `useDeleteApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApiKeyMutation, { data, loading, error }] = useDeleteApiKeyMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>(DeleteApiKeyDocument, options);
      }
export type DeleteApiKeyMutationHookResult = ReturnType<typeof useDeleteApiKeyMutation>;
export type DeleteApiKeyMutationResult = Apollo.MutationResult<DeleteApiKeyMutation>;
export type DeleteApiKeyMutationOptions = Apollo.BaseMutationOptions<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>;
export const GetApiKeysDocument = gql`
    query GET_API_KEYS($filters: ApiKeysFiltersInput, $sort: SortApiKeysInput) {
  apiKeys(filters: $filters, sort: $sort) {
    list {
      id
      label
      key
      expiresAt
      createdBy {
        ...RecordIdentity
      }
      createdAt
      modifiedBy {
        ...RecordIdentity
      }
      modifiedAt
      user {
        ...RecordIdentity
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}`;

/**
 * __useGetApiKeysQuery__
 *
 * To run a query within a React component, call `useGetApiKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApiKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApiKeysQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useGetApiKeysQuery(baseOptions?: Apollo.QueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApiKeysQuery, GetApiKeysQueryVariables>(GetApiKeysDocument, options);
      }
export function useGetApiKeysLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApiKeysQuery, GetApiKeysQueryVariables>(GetApiKeysDocument, options);
        }
// @ts-ignore
export function useGetApiKeysSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables>): Apollo.UseSuspenseQueryResult<GetApiKeysQuery, GetApiKeysQueryVariables>;
export function useGetApiKeysSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables>): Apollo.UseSuspenseQueryResult<GetApiKeysQuery | undefined, GetApiKeysQueryVariables>;
export function useGetApiKeysSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApiKeysQuery, GetApiKeysQueryVariables>(GetApiKeysDocument, options);
        }
export type GetApiKeysQueryHookResult = ReturnType<typeof useGetApiKeysQuery>;
export type GetApiKeysLazyQueryHookResult = ReturnType<typeof useGetApiKeysLazyQuery>;
export type GetApiKeysSuspenseQueryHookResult = ReturnType<typeof useGetApiKeysSuspenseQuery>;
export type GetApiKeysQueryResult = Apollo.QueryResult<GetApiKeysQuery, GetApiKeysQueryVariables>;
export const SaveApiKeyDocument = gql`
    mutation SAVE_API_KEY($apiKey: ApiKeyInput!) {
  saveApiKey(apiKey: $apiKey) {
    id
    label
    key
    expiresAt
    createdBy {
      ...RecordIdentity
    }
    createdAt
    modifiedBy {
      ...RecordIdentity
    }
    modifiedAt
    user {
      ...RecordIdentity
    }
  }
}
    ${RecordIdentityFragmentDoc}`;
export type SaveApiKeyMutationFn = Apollo.MutationFunction<SaveApiKeyMutation, SaveApiKeyMutationVariables>;

/**
 * __useSaveApiKeyMutation__
 *
 * To run a mutation, you first call `useSaveApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveApiKeyMutation, { data, loading, error }] = useSaveApiKeyMutation({
 *   variables: {
 *      apiKey: // value for 'apiKey'
 *   },
 * });
 */
export function useSaveApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<SaveApiKeyMutation, SaveApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveApiKeyMutation, SaveApiKeyMutationVariables>(SaveApiKeyDocument, options);
      }
export type SaveApiKeyMutationHookResult = ReturnType<typeof useSaveApiKeyMutation>;
export type SaveApiKeyMutationResult = Apollo.MutationResult<SaveApiKeyMutation>;
export type SaveApiKeyMutationOptions = Apollo.BaseMutationOptions<SaveApiKeyMutation, SaveApiKeyMutationVariables>;
export const DeleteApplicationDocument = gql`
    mutation DELETE_APPLICATION($appId: ID!) {
  deleteApplication(id: $appId) {
    id
  }
}
    `;
export type DeleteApplicationMutationFn = Apollo.MutationFunction<DeleteApplicationMutation, DeleteApplicationMutationVariables>;

/**
 * __useDeleteApplicationMutation__
 *
 * To run a mutation, you first call `useDeleteApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApplicationMutation, { data, loading, error }] = useDeleteApplicationMutation({
 *   variables: {
 *      appId: // value for 'appId'
 *   },
 * });
 */
export function useDeleteApplicationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteApplicationMutation, DeleteApplicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteApplicationMutation, DeleteApplicationMutationVariables>(DeleteApplicationDocument, options);
      }
export type DeleteApplicationMutationHookResult = ReturnType<typeof useDeleteApplicationMutation>;
export type DeleteApplicationMutationResult = Apollo.MutationResult<DeleteApplicationMutation>;
export type DeleteApplicationMutationOptions = Apollo.BaseMutationOptions<DeleteApplicationMutation, DeleteApplicationMutationVariables>;
export const GetApplicationByEndpointDocument = gql`
    query GET_APPLICATION_BY_ENDPOINT($endpoint: String!) {
  applications(filters: {endpoint: $endpoint}) {
    list {
      ...ApplicationDetails
    }
  }
}
    ${ApplicationDetailsFragmentDoc}`;

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
export function useGetApplicationByEndpointQuery(baseOptions: Apollo.QueryHookOptions<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables> & ({ variables: GetApplicationByEndpointQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>(GetApplicationByEndpointDocument, options);
      }
export function useGetApplicationByEndpointLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>(GetApplicationByEndpointDocument, options);
        }
// @ts-ignore
export function useGetApplicationByEndpointSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>;
export function useGetApplicationByEndpointSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationByEndpointQuery | undefined, GetApplicationByEndpointQueryVariables>;
export function useGetApplicationByEndpointSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>(GetApplicationByEndpointDocument, options);
        }
export type GetApplicationByEndpointQueryHookResult = ReturnType<typeof useGetApplicationByEndpointQuery>;
export type GetApplicationByEndpointLazyQueryHookResult = ReturnType<typeof useGetApplicationByEndpointLazyQuery>;
export type GetApplicationByEndpointSuspenseQueryHookResult = ReturnType<typeof useGetApplicationByEndpointSuspenseQuery>;
export type GetApplicationByEndpointQueryResult = Apollo.QueryResult<GetApplicationByEndpointQuery, GetApplicationByEndpointQueryVariables>;
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
export function useGetApplicationByIdQuery(baseOptions: Apollo.QueryHookOptions<GetApplicationByIdQuery, GetApplicationByIdQueryVariables> & ({ variables: GetApplicationByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>(GetApplicationByIdDocument, options);
      }
export function useGetApplicationByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>(GetApplicationByIdDocument, options);
        }
// @ts-ignore
export function useGetApplicationByIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>;
export function useGetApplicationByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationByIdQuery | undefined, GetApplicationByIdQueryVariables>;
export function useGetApplicationByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApplicationByIdQuery, GetApplicationByIdQueryVariables>(GetApplicationByIdDocument, options);
        }
export type GetApplicationByIdQueryHookResult = ReturnType<typeof useGetApplicationByIdQuery>;
export type GetApplicationByIdLazyQueryHookResult = ReturnType<typeof useGetApplicationByIdLazyQuery>;
export type GetApplicationByIdSuspenseQueryHookResult = ReturnType<typeof useGetApplicationByIdSuspenseQuery>;
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
// @ts-ignore
export function useGetApplicationModulesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>;
export function useGetApplicationModulesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationModulesQuery | undefined, GetApplicationModulesQueryVariables>;
export function useGetApplicationModulesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>(GetApplicationModulesDocument, options);
        }
export type GetApplicationModulesQueryHookResult = ReturnType<typeof useGetApplicationModulesQuery>;
export type GetApplicationModulesLazyQueryHookResult = ReturnType<typeof useGetApplicationModulesLazyQuery>;
export type GetApplicationModulesSuspenseQueryHookResult = ReturnType<typeof useGetApplicationModulesSuspenseQuery>;
export type GetApplicationModulesQueryResult = Apollo.QueryResult<GetApplicationModulesQuery, GetApplicationModulesQueryVariables>;
export const GetApplicationsDocument = gql`
    query GET_APPLICATIONS($filters: ApplicationsFiltersInput, $sort: SortApplications) {
  applications(filters: $filters, sort: $sort) {
    list {
      id
      label
      type
      description
      endpoint
      color
      icon {
        ...RecordIdentity
      }
      url
      system
    }
  }
}
    ${RecordIdentityFragmentDoc}`;

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
 *      sort: // value for 'sort'
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
// @ts-ignore
export function useGetApplicationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetApplicationsQuery, GetApplicationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationsQuery, GetApplicationsQueryVariables>;
export function useGetApplicationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationsQuery, GetApplicationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationsQuery | undefined, GetApplicationsQueryVariables>;
export function useGetApplicationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationsQuery, GetApplicationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApplicationsQuery, GetApplicationsQueryVariables>(GetApplicationsDocument, options);
        }
export type GetApplicationsQueryHookResult = ReturnType<typeof useGetApplicationsQuery>;
export type GetApplicationsLazyQueryHookResult = ReturnType<typeof useGetApplicationsLazyQuery>;
export type GetApplicationsSuspenseQueryHookResult = ReturnType<typeof useGetApplicationsSuspenseQuery>;
export type GetApplicationsQueryResult = Apollo.QueryResult<GetApplicationsQuery, GetApplicationsQueryVariables>;
export const SaveApplicationDocument = gql`
    mutation SAVE_APPLICATION($application: ApplicationInput!) {
  saveApplication(application: $application) {
    ...ApplicationDetails
  }
}
    ${ApplicationDetailsFragmentDoc}`;
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
export const DeleteAttributeDocument = gql`
    mutation DELETE_ATTRIBUTE($attrId: ID!) {
  deleteAttribute(id: $attrId) {
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
 *      attrId: // value for 'attrId'
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
export const GetActionsListQueryDocument = gql`
    query GET_ACTIONS_LIST_QUERY($attId: ID!) {
  attributes(filters: {id: $attId}) {
    list {
      id
      format
      input_types {
        saveValue
        postSaveValue
        getValue
        deleteValue
        postDeleteValue
      }
      output_types {
        saveValue
        postSaveValue
        getValue
        deleteValue
        postDeleteValue
      }
      actions_list {
        saveValue {
          id
          is_system
          params {
            name
            value
          }
          error_message
        }
        postSaveValue {
          id
          is_system
          params {
            name
            value
          }
          error_message
        }
        getValue {
          id
          is_system
          params {
            name
            value
          }
        }
        deleteValue {
          id
          is_system
          params {
            name
            value
          }
        }
        postDeleteValue {
          id
          is_system
          params {
            name
            value
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetActionsListQueryQuery__
 *
 * To run a query within a React component, call `useGetActionsListQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActionsListQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActionsListQueryQuery({
 *   variables: {
 *      attId: // value for 'attId'
 *   },
 * });
 */
export function useGetActionsListQueryQuery(baseOptions: Apollo.QueryHookOptions<GetActionsListQueryQuery, GetActionsListQueryQueryVariables> & ({ variables: GetActionsListQueryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActionsListQueryQuery, GetActionsListQueryQueryVariables>(GetActionsListQueryDocument, options);
      }
export function useGetActionsListQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActionsListQueryQuery, GetActionsListQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActionsListQueryQuery, GetActionsListQueryQueryVariables>(GetActionsListQueryDocument, options);
        }
// @ts-ignore
export function useGetActionsListQuerySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetActionsListQueryQuery, GetActionsListQueryQueryVariables>): Apollo.UseSuspenseQueryResult<GetActionsListQueryQuery, GetActionsListQueryQueryVariables>;
export function useGetActionsListQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActionsListQueryQuery, GetActionsListQueryQueryVariables>): Apollo.UseSuspenseQueryResult<GetActionsListQueryQuery | undefined, GetActionsListQueryQueryVariables>;
export function useGetActionsListQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActionsListQueryQuery, GetActionsListQueryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActionsListQueryQuery, GetActionsListQueryQueryVariables>(GetActionsListQueryDocument, options);
        }
export type GetActionsListQueryQueryHookResult = ReturnType<typeof useGetActionsListQueryQuery>;
export type GetActionsListQueryLazyQueryHookResult = ReturnType<typeof useGetActionsListQueryLazyQuery>;
export type GetActionsListQuerySuspenseQueryHookResult = ReturnType<typeof useGetActionsListQuerySuspenseQuery>;
export type GetActionsListQueryQueryResult = Apollo.QueryResult<GetActionsListQueryQuery, GetActionsListQueryQueryVariables>;
export const GetAttributeByIdDocument = gql`
    query GET_ATTRIBUTE_BY_ID($id: ID) {
  attributes(filters: {id: $id}) {
    totalCount
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
// @ts-ignore
export function useGetAttributeByIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>;
export function useGetAttributeByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributeByIdQuery | undefined, GetAttributeByIdQueryVariables>;
export function useGetAttributeByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>(GetAttributeByIdDocument, options);
        }
export type GetAttributeByIdQueryHookResult = ReturnType<typeof useGetAttributeByIdQuery>;
export type GetAttributeByIdLazyQueryHookResult = ReturnType<typeof useGetAttributeByIdLazyQuery>;
export type GetAttributeByIdSuspenseQueryHookResult = ReturnType<typeof useGetAttributeByIdSuspenseQuery>;
export type GetAttributeByIdQueryResult = Apollo.QueryResult<GetAttributeByIdQuery, GetAttributeByIdQueryVariables>;
export const GetAttributesValuesListDocument = gql`
    query GET_ATTRIBUTES_VALUES_LIST($attrId: ID!) {
  attributes(filters: {id: $attrId}) {
    list {
      id
      label
      type
      format
      ...AttributeValuesListDetails
      ... on LinkAttribute {
        linked_library {
          id
        }
        reverse_link
      }
      ... on TreeAttribute {
        linked_tree {
          id
        }
      }
    }
  }
}
    ${AttributeValuesListDetailsFragmentDoc}`;

/**
 * __useGetAttributesValuesListQuery__
 *
 * To run a query within a React component, call `useGetAttributesValuesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAttributesValuesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAttributesValuesListQuery({
 *   variables: {
 *      attrId: // value for 'attrId'
 *   },
 * });
 */
export function useGetAttributesValuesListQuery(baseOptions: Apollo.QueryHookOptions<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables> & ({ variables: GetAttributesValuesListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables>(GetAttributesValuesListDocument, options);
      }
export function useGetAttributesValuesListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables>(GetAttributesValuesListDocument, options);
        }
// @ts-ignore
export function useGetAttributesValuesListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables>;
export function useGetAttributesValuesListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributesValuesListQuery | undefined, GetAttributesValuesListQueryVariables>;
export function useGetAttributesValuesListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables>(GetAttributesValuesListDocument, options);
        }
export type GetAttributesValuesListQueryHookResult = ReturnType<typeof useGetAttributesValuesListQuery>;
export type GetAttributesValuesListLazyQueryHookResult = ReturnType<typeof useGetAttributesValuesListLazyQuery>;
export type GetAttributesValuesListSuspenseQueryHookResult = ReturnType<typeof useGetAttributesValuesListSuspenseQuery>;
export type GetAttributesValuesListQueryResult = Apollo.QueryResult<GetAttributesValuesListQuery, GetAttributesValuesListQueryVariables>;
export const GetAttributesDocument = gql`
    query GET_ATTRIBUTES($id: ID, $label: String, $type: [AttributeType!], $format: [AttributeFormat!], $system: Boolean, $multiple_values: Boolean, $versionable: Boolean, $libraries: [String!]) {
  attributes(
    filters: {id: $id, label: $label, type: $type, format: $format, system: $system, multiple_values: $multiple_values, versionable: $versionable, libraries: $libraries}
  ) {
    totalCount
    list {
      id
      label
      type
      format
      system
      multiple_values
      ... on StandardAttribute {
        unique
      }
      ... on LinkAttribute {
        linked_library {
          id
        }
        reverse_link
      }
      ... on TreeAttribute {
        linked_tree {
          id
        }
      }
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
 *      id: // value for 'id'
 *      label: // value for 'label'
 *      type: // value for 'type'
 *      format: // value for 'format'
 *      system: // value for 'system'
 *      multiple_values: // value for 'multiple_values'
 *      versionable: // value for 'versionable'
 *      libraries: // value for 'libraries'
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
// @ts-ignore
export function useGetAttributesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAttributesQuery, GetAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributesQuery, GetAttributesQueryVariables>;
export function useGetAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributesQuery, GetAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributesQuery | undefined, GetAttributesQueryVariables>;
export function useGetAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributesQuery, GetAttributesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAttributesQuery, GetAttributesQueryVariables>(GetAttributesDocument, options);
        }
export type GetAttributesQueryHookResult = ReturnType<typeof useGetAttributesQuery>;
export type GetAttributesLazyQueryHookResult = ReturnType<typeof useGetAttributesLazyQuery>;
export type GetAttributesSuspenseQueryHookResult = ReturnType<typeof useGetAttributesSuspenseQuery>;
export type GetAttributesQueryResult = Apollo.QueryResult<GetAttributesQuery, GetAttributesQueryVariables>;
export const GetAvailableActionsDocument = gql`
    query GET_AVAILABLE_ACTIONS {
  availableActions {
    id
    name
    description
    input_types
    output_types
    params {
      name
      type
      description
      required
      helper_value
    }
  }
}
    `;

/**
 * __useGetAvailableActionsQuery__
 *
 * To run a query within a React component, call `useGetAvailableActionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableActionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableActionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAvailableActionsQuery(baseOptions?: Apollo.QueryHookOptions<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>(GetAvailableActionsDocument, options);
      }
export function useGetAvailableActionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>(GetAvailableActionsDocument, options);
        }
// @ts-ignore
export function useGetAvailableActionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>;
export function useGetAvailableActionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAvailableActionsQuery | undefined, GetAvailableActionsQueryVariables>;
export function useGetAvailableActionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>(GetAvailableActionsDocument, options);
        }
export type GetAvailableActionsQueryHookResult = ReturnType<typeof useGetAvailableActionsQuery>;
export type GetAvailableActionsLazyQueryHookResult = ReturnType<typeof useGetAvailableActionsLazyQuery>;
export type GetAvailableActionsSuspenseQueryHookResult = ReturnType<typeof useGetAvailableActionsSuspenseQuery>;
export type GetAvailableActionsQueryResult = Apollo.QueryResult<GetAvailableActionsQuery, GetAvailableActionsQueryVariables>;
export const SaveAttributeActionListDocument = gql`
    mutation SAVE_ATTRIBUTE_ACTION_LIST($att: AttributeInput!) {
  saveAttribute(attribute: $att) {
    id
    actions_list {
      saveValue {
        id
        params {
          name
          value
        }
        error_message
      }
      postSaveValue {
        id
        params {
          name
          value
        }
        error_message
      }
      getValue {
        id
        params {
          name
          value
        }
      }
      deleteValue {
        id
        params {
          name
          value
        }
      }
      postDeleteValue {
        id
        params {
          name
          value
        }
      }
    }
  }
}
    `;
export type SaveAttributeActionListMutationFn = Apollo.MutationFunction<SaveAttributeActionListMutation, SaveAttributeActionListMutationVariables>;

/**
 * __useSaveAttributeActionListMutation__
 *
 * To run a mutation, you first call `useSaveAttributeActionListMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveAttributeActionListMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveAttributeActionListMutation, { data, loading, error }] = useSaveAttributeActionListMutation({
 *   variables: {
 *      att: // value for 'att'
 *   },
 * });
 */
export function useSaveAttributeActionListMutation(baseOptions?: Apollo.MutationHookOptions<SaveAttributeActionListMutation, SaveAttributeActionListMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveAttributeActionListMutation, SaveAttributeActionListMutationVariables>(SaveAttributeActionListDocument, options);
      }
export type SaveAttributeActionListMutationHookResult = ReturnType<typeof useSaveAttributeActionListMutation>;
export type SaveAttributeActionListMutationResult = Apollo.MutationResult<SaveAttributeActionListMutation>;
export type SaveAttributeActionListMutationOptions = Apollo.BaseMutationOptions<SaveAttributeActionListMutation, SaveAttributeActionListMutationVariables>;
export const SaveAttributeDocument = gql`
    mutation SAVE_ATTRIBUTE($attrData: AttributeInput!) {
  saveAttribute(attribute: $attrData) {
    ...AttributeDetails
    ...AttributeValuesListDetails
    ... on LinkAttribute {
      linked_library {
        id
      }
      reverse_link
    }
    ... on TreeAttribute {
      linked_tree {
        id
      }
    }
  }
}
    ${AttributeDetailsFragmentDoc}
${AttributeValuesListDetailsFragmentDoc}`;
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
 *      attrData: // value for 'attrData'
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
export const SaveAttributeEmbeddedFieldsDocument = gql`
    mutation SAVE_ATTRIBUTE_EMBEDDED_FIELDS($attribute: AttributeInput) {
  saveAttribute(attribute: $attribute) {
    id
    label
    format
  }
}
    `;
export type SaveAttributeEmbeddedFieldsMutationFn = Apollo.MutationFunction<SaveAttributeEmbeddedFieldsMutation, SaveAttributeEmbeddedFieldsMutationVariables>;

/**
 * __useSaveAttributeEmbeddedFieldsMutation__
 *
 * To run a mutation, you first call `useSaveAttributeEmbeddedFieldsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveAttributeEmbeddedFieldsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveAttributeEmbeddedFieldsMutation, { data, loading, error }] = useSaveAttributeEmbeddedFieldsMutation({
 *   variables: {
 *      attribute: // value for 'attribute'
 *   },
 * });
 */
export function useSaveAttributeEmbeddedFieldsMutation(baseOptions?: Apollo.MutationHookOptions<SaveAttributeEmbeddedFieldsMutation, SaveAttributeEmbeddedFieldsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveAttributeEmbeddedFieldsMutation, SaveAttributeEmbeddedFieldsMutationVariables>(SaveAttributeEmbeddedFieldsDocument, options);
      }
export type SaveAttributeEmbeddedFieldsMutationHookResult = ReturnType<typeof useSaveAttributeEmbeddedFieldsMutation>;
export type SaveAttributeEmbeddedFieldsMutationResult = Apollo.MutationResult<SaveAttributeEmbeddedFieldsMutation>;
export type SaveAttributeEmbeddedFieldsMutationOptions = Apollo.BaseMutationOptions<SaveAttributeEmbeddedFieldsMutation, SaveAttributeEmbeddedFieldsMutationVariables>;
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
// @ts-ignore
export function useGetLangsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLangsQuery, GetLangsQueryVariables>): Apollo.UseSuspenseQueryResult<GetLangsQuery, GetLangsQueryVariables>;
export function useGetLangsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLangsQuery, GetLangsQueryVariables>): Apollo.UseSuspenseQueryResult<GetLangsQuery | undefined, GetLangsQueryVariables>;
export function useGetLangsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLangsQuery, GetLangsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLangsQuery, GetLangsQueryVariables>(GetLangsDocument, options);
        }
export type GetLangsQueryHookResult = ReturnType<typeof useGetLangsQuery>;
export type GetLangsLazyQueryHookResult = ReturnType<typeof useGetLangsLazyQuery>;
export type GetLangsSuspenseQueryHookResult = ReturnType<typeof useGetLangsSuspenseQuery>;
export type GetLangsQueryResult = Apollo.QueryResult<GetLangsQuery, GetLangsQueryVariables>;
export const DeleteFormDocument = gql`
    mutation DELETE_FORM($library: ID!, $formId: ID!) {
  deleteForm(library: $library, id: $formId) {
    library {
      id
    }
    id
  }
}
    `;
export type DeleteFormMutationFn = Apollo.MutationFunction<DeleteFormMutation, DeleteFormMutationVariables>;

/**
 * __useDeleteFormMutation__
 *
 * To run a mutation, you first call `useDeleteFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFormMutation, { data, loading, error }] = useDeleteFormMutation({
 *   variables: {
 *      library: // value for 'library'
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useDeleteFormMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFormMutation, DeleteFormMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFormMutation, DeleteFormMutationVariables>(DeleteFormDocument, options);
      }
export type DeleteFormMutationHookResult = ReturnType<typeof useDeleteFormMutation>;
export type DeleteFormMutationResult = Apollo.MutationResult<DeleteFormMutation>;
export type DeleteFormMutationOptions = Apollo.BaseMutationOptions<DeleteFormMutation, DeleteFormMutationVariables>;
export const GetFormDocument = gql`
    query GET_FORM($library: ID!, $id: ID!) {
  forms(filters: {library: $library, id: $id}) {
    totalCount
    list {
      ...FormDetails
    }
  }
}
    ${FormDetailsFragmentDoc}`;

/**
 * __useGetFormQuery__
 *
 * To run a query within a React component, call `useGetFormQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormQuery({
 *   variables: {
 *      library: // value for 'library'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetFormQuery(baseOptions: Apollo.QueryHookOptions<GetFormQuery, GetFormQueryVariables> & ({ variables: GetFormQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFormQuery, GetFormQueryVariables>(GetFormDocument, options);
      }
export function useGetFormLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFormQuery, GetFormQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFormQuery, GetFormQueryVariables>(GetFormDocument, options);
        }
// @ts-ignore
export function useGetFormSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFormQuery, GetFormQueryVariables>): Apollo.UseSuspenseQueryResult<GetFormQuery, GetFormQueryVariables>;
export function useGetFormSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFormQuery, GetFormQueryVariables>): Apollo.UseSuspenseQueryResult<GetFormQuery | undefined, GetFormQueryVariables>;
export function useGetFormSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFormQuery, GetFormQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFormQuery, GetFormQueryVariables>(GetFormDocument, options);
        }
export type GetFormQueryHookResult = ReturnType<typeof useGetFormQuery>;
export type GetFormLazyQueryHookResult = ReturnType<typeof useGetFormLazyQuery>;
export type GetFormSuspenseQueryHookResult = ReturnType<typeof useGetFormSuspenseQuery>;
export type GetFormQueryResult = Apollo.QueryResult<GetFormQuery, GetFormQueryVariables>;
export const GetFormsListDocument = gql`
    query GET_FORMS_LIST($library: ID!, $id: ID, $label: String, $system: Boolean) {
  forms(filters: {library: $library, id: $id, label: $label, system: $system}) {
    totalCount
    list {
      id
      label
      system
    }
  }
}
    `;

/**
 * __useGetFormsListQuery__
 *
 * To run a query within a React component, call `useGetFormsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormsListQuery({
 *   variables: {
 *      library: // value for 'library'
 *      id: // value for 'id'
 *      label: // value for 'label'
 *      system: // value for 'system'
 *   },
 * });
 */
export function useGetFormsListQuery(baseOptions: Apollo.QueryHookOptions<GetFormsListQuery, GetFormsListQueryVariables> & ({ variables: GetFormsListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFormsListQuery, GetFormsListQueryVariables>(GetFormsListDocument, options);
      }
export function useGetFormsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFormsListQuery, GetFormsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFormsListQuery, GetFormsListQueryVariables>(GetFormsListDocument, options);
        }
// @ts-ignore
export function useGetFormsListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFormsListQuery, GetFormsListQueryVariables>): Apollo.UseSuspenseQueryResult<GetFormsListQuery, GetFormsListQueryVariables>;
export function useGetFormsListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFormsListQuery, GetFormsListQueryVariables>): Apollo.UseSuspenseQueryResult<GetFormsListQuery | undefined, GetFormsListQueryVariables>;
export function useGetFormsListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFormsListQuery, GetFormsListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFormsListQuery, GetFormsListQueryVariables>(GetFormsListDocument, options);
        }
export type GetFormsListQueryHookResult = ReturnType<typeof useGetFormsListQuery>;
export type GetFormsListLazyQueryHookResult = ReturnType<typeof useGetFormsListLazyQuery>;
export type GetFormsListSuspenseQueryHookResult = ReturnType<typeof useGetFormsListSuspenseQuery>;
export type GetFormsListQueryResult = Apollo.QueryResult<GetFormsListQuery, GetFormsListQueryVariables>;
export const SaveFormDocument = gql`
    mutation SAVE_FORM($formData: FormInput!) {
  saveForm(form: $formData) {
    ...FormDetails
  }
}
    ${FormDetailsFragmentDoc}`;
export type SaveFormMutationFn = Apollo.MutationFunction<SaveFormMutation, SaveFormMutationVariables>;

/**
 * __useSaveFormMutation__
 *
 * To run a mutation, you first call `useSaveFormMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveFormMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveFormMutation, { data, loading, error }] = useSaveFormMutation({
 *   variables: {
 *      formData: // value for 'formData'
 *   },
 * });
 */
export function useSaveFormMutation(baseOptions?: Apollo.MutationHookOptions<SaveFormMutation, SaveFormMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveFormMutation, SaveFormMutationVariables>(SaveFormDocument, options);
      }
export type SaveFormMutationHookResult = ReturnType<typeof useSaveFormMutation>;
export type SaveFormMutationResult = Apollo.MutationResult<SaveFormMutation>;
export type SaveFormMutationOptions = Apollo.BaseMutationOptions<SaveFormMutation, SaveFormMutationVariables>;
export const GetGlobalSettingsDocument = gql`
    query GET_GLOBAL_SETTINGS {
  globalSettings {
    defaultApp
    name
    icon {
      id
      ...RecordIdentity
    }
    favicon {
      id
      ...RecordIdentity
    }
    settings
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
// @ts-ignore
export function useGetGlobalSettingsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>): Apollo.UseSuspenseQueryResult<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>;
export function useGetGlobalSettingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>): Apollo.UseSuspenseQueryResult<GetGlobalSettingsQuery | undefined, GetGlobalSettingsQueryVariables>;
export function useGetGlobalSettingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>(GetGlobalSettingsDocument, options);
        }
export type GetGlobalSettingsQueryHookResult = ReturnType<typeof useGetGlobalSettingsQuery>;
export type GetGlobalSettingsLazyQueryHookResult = ReturnType<typeof useGetGlobalSettingsLazyQuery>;
export type GetGlobalSettingsSuspenseQueryHookResult = ReturnType<typeof useGetGlobalSettingsSuspenseQuery>;
export type GetGlobalSettingsQueryResult = Apollo.QueryResult<GetGlobalSettingsQuery, GetGlobalSettingsQueryVariables>;
export const SaveGlobalSettingsDocument = gql`
    mutation SAVE_GLOBAL_SETTINGS($settings: GlobalSettingsInput!) {
  saveGlobalSettings(settings: $settings) {
    defaultApp
    name
    icon {
      id
      ...RecordIdentity
    }
    favicon {
      id
      ...RecordIdentity
    }
    settings
  }
}
    ${RecordIdentityFragmentDoc}`;
export type SaveGlobalSettingsMutationFn = Apollo.MutationFunction<SaveGlobalSettingsMutation, SaveGlobalSettingsMutationVariables>;

/**
 * __useSaveGlobalSettingsMutation__
 *
 * To run a mutation, you first call `useSaveGlobalSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveGlobalSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveGlobalSettingsMutation, { data, loading, error }] = useSaveGlobalSettingsMutation({
 *   variables: {
 *      settings: // value for 'settings'
 *   },
 * });
 */
export function useSaveGlobalSettingsMutation(baseOptions?: Apollo.MutationHookOptions<SaveGlobalSettingsMutation, SaveGlobalSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveGlobalSettingsMutation, SaveGlobalSettingsMutationVariables>(SaveGlobalSettingsDocument, options);
      }
export type SaveGlobalSettingsMutationHookResult = ReturnType<typeof useSaveGlobalSettingsMutation>;
export type SaveGlobalSettingsMutationResult = Apollo.MutationResult<SaveGlobalSettingsMutation>;
export type SaveGlobalSettingsMutationOptions = Apollo.BaseMutationOptions<SaveGlobalSettingsMutation, SaveGlobalSettingsMutationVariables>;
export const DeleteLibraryDocument = gql`
    mutation DELETE_LIBRARY($libID: ID!) {
  deleteLibrary(id: $libID) {
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
 *      libID: // value for 'libID'
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
    query GET_LIBRARIES($id: [ID!], $label: [String!], $system: Boolean, $behavior: [LibraryBehavior!]) {
  libraries(
    filters: {id: $id, label: $label, system: $system, behavior: $behavior}
  ) {
    totalCount
    list {
      id
      system
      label
      behavior
      icon {
        ...RecordIdentity
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}`;

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
 *      id: // value for 'id'
 *      label: // value for 'label'
 *      system: // value for 'system'
 *      behavior: // value for 'behavior'
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
// @ts-ignore
export function useGetLibrariesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLibrariesQuery, GetLibrariesQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibrariesQuery, GetLibrariesQueryVariables>;
export function useGetLibrariesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibrariesQuery, GetLibrariesQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibrariesQuery | undefined, GetLibrariesQueryVariables>;
export function useGetLibrariesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibrariesQuery, GetLibrariesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLibrariesQuery, GetLibrariesQueryVariables>(GetLibrariesDocument, options);
        }
export type GetLibrariesQueryHookResult = ReturnType<typeof useGetLibrariesQuery>;
export type GetLibrariesLazyQueryHookResult = ReturnType<typeof useGetLibrariesLazyQuery>;
export type GetLibrariesSuspenseQueryHookResult = ReturnType<typeof useGetLibrariesSuspenseQuery>;
export type GetLibrariesQueryResult = Apollo.QueryResult<GetLibrariesQuery, GetLibrariesQueryVariables>;
export const GetLibrariesWithAttributesDocument = gql`
    query GET_LIBRARIES_WITH_ATTRIBUTES {
  libraries {
    totalCount
    list {
      id
      label
      attributes {
        id
        label
      }
    }
  }
}
    `;

/**
 * __useGetLibrariesWithAttributesQuery__
 *
 * To run a query within a React component, call `useGetLibrariesWithAttributesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibrariesWithAttributesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibrariesWithAttributesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLibrariesWithAttributesQuery(baseOptions?: Apollo.QueryHookOptions<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>(GetLibrariesWithAttributesDocument, options);
      }
export function useGetLibrariesWithAttributesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>(GetLibrariesWithAttributesDocument, options);
        }
// @ts-ignore
export function useGetLibrariesWithAttributesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>;
export function useGetLibrariesWithAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibrariesWithAttributesQuery | undefined, GetLibrariesWithAttributesQueryVariables>;
export function useGetLibrariesWithAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>(GetLibrariesWithAttributesDocument, options);
        }
export type GetLibrariesWithAttributesQueryHookResult = ReturnType<typeof useGetLibrariesWithAttributesQuery>;
export type GetLibrariesWithAttributesLazyQueryHookResult = ReturnType<typeof useGetLibrariesWithAttributesLazyQuery>;
export type GetLibrariesWithAttributesSuspenseQueryHookResult = ReturnType<typeof useGetLibrariesWithAttributesSuspenseQuery>;
export type GetLibrariesWithAttributesQueryResult = Apollo.QueryResult<GetLibrariesWithAttributesQuery, GetLibrariesWithAttributesQueryVariables>;
export const GetLibByIdDocument = gql`
    query GET_LIB_BY_ID($id: [ID!], $lang: [AvailableLanguage!]) {
  libraries(filters: {id: $id}) {
    list {
      ...LibraryDetails
    }
  }
}
    ${LibraryDetailsFragmentDoc}`;

/**
 * __useGetLibByIdQuery__
 *
 * To run a query within a React component, call `useGetLibByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *      lang: // value for 'lang'
 *   },
 * });
 */
export function useGetLibByIdQuery(baseOptions?: Apollo.QueryHookOptions<GetLibByIdQuery, GetLibByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibByIdQuery, GetLibByIdQueryVariables>(GetLibByIdDocument, options);
      }
export function useGetLibByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibByIdQuery, GetLibByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLibByIdQuery, GetLibByIdQueryVariables>(GetLibByIdDocument, options);
        }
// @ts-ignore
export function useGetLibByIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLibByIdQuery, GetLibByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibByIdQuery, GetLibByIdQueryVariables>;
export function useGetLibByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibByIdQuery, GetLibByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibByIdQuery | undefined, GetLibByIdQueryVariables>;
export function useGetLibByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibByIdQuery, GetLibByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLibByIdQuery, GetLibByIdQueryVariables>(GetLibByIdDocument, options);
        }
export type GetLibByIdQueryHookResult = ReturnType<typeof useGetLibByIdQuery>;
export type GetLibByIdLazyQueryHookResult = ReturnType<typeof useGetLibByIdLazyQuery>;
export type GetLibByIdSuspenseQueryHookResult = ReturnType<typeof useGetLibByIdSuspenseQuery>;
export type GetLibByIdQueryResult = Apollo.QueryResult<GetLibByIdQuery, GetLibByIdQueryVariables>;
export const QueryLibraryConfigDocument = gql`
    query QUERY_LIBRARY_CONFIG($id: [ID!], $lang: [AvailableLanguage!]) {
  libraries(filters: {id: $id}) {
    list {
      id
      label(lang: $lang)
      attributes {
        id
        type
        format
        label(lang: $lang)
      }
    }
  }
}
    `;

/**
 * __useQueryLibraryConfigQuery__
 *
 * To run a query within a React component, call `useQueryLibraryConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useQueryLibraryConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQueryLibraryConfigQuery({
 *   variables: {
 *      id: // value for 'id'
 *      lang: // value for 'lang'
 *   },
 * });
 */
export function useQueryLibraryConfigQuery(baseOptions?: Apollo.QueryHookOptions<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>(QueryLibraryConfigDocument, options);
      }
export function useQueryLibraryConfigLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>(QueryLibraryConfigDocument, options);
        }
// @ts-ignore
export function useQueryLibraryConfigSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>): Apollo.UseSuspenseQueryResult<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>;
export function useQueryLibraryConfigSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>): Apollo.UseSuspenseQueryResult<QueryLibraryConfigQuery | undefined, QueryLibraryConfigQueryVariables>;
export function useQueryLibraryConfigSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>(QueryLibraryConfigDocument, options);
        }
export type QueryLibraryConfigQueryHookResult = ReturnType<typeof useQueryLibraryConfigQuery>;
export type QueryLibraryConfigLazyQueryHookResult = ReturnType<typeof useQueryLibraryConfigLazyQuery>;
export type QueryLibraryConfigSuspenseQueryHookResult = ReturnType<typeof useQueryLibraryConfigSuspenseQuery>;
export type QueryLibraryConfigQueryResult = Apollo.QueryResult<QueryLibraryConfigQuery, QueryLibraryConfigQueryVariables>;
export const SaveLibraryAttributesDocument = gql`
    mutation SAVE_LIBRARY_ATTRIBUTES($libId: ID!, $attributes: [ID!]!) {
  saveLibrary(library: {id: $libId, attributes: $attributes}) {
    id
    attributes {
      ...AttributeDetails
    }
  }
}
    ${AttributeDetailsFragmentDoc}`;
export type SaveLibraryAttributesMutationFn = Apollo.MutationFunction<SaveLibraryAttributesMutation, SaveLibraryAttributesMutationVariables>;

/**
 * __useSaveLibraryAttributesMutation__
 *
 * To run a mutation, you first call `useSaveLibraryAttributesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveLibraryAttributesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveLibraryAttributesMutation, { data, loading, error }] = useSaveLibraryAttributesMutation({
 *   variables: {
 *      libId: // value for 'libId'
 *      attributes: // value for 'attributes'
 *   },
 * });
 */
export function useSaveLibraryAttributesMutation(baseOptions?: Apollo.MutationHookOptions<SaveLibraryAttributesMutation, SaveLibraryAttributesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveLibraryAttributesMutation, SaveLibraryAttributesMutationVariables>(SaveLibraryAttributesDocument, options);
      }
export type SaveLibraryAttributesMutationHookResult = ReturnType<typeof useSaveLibraryAttributesMutation>;
export type SaveLibraryAttributesMutationResult = Apollo.MutationResult<SaveLibraryAttributesMutation>;
export type SaveLibraryAttributesMutationOptions = Apollo.BaseMutationOptions<SaveLibraryAttributesMutation, SaveLibraryAttributesMutationVariables>;
export const SaveLibraryDocument = gql`
    mutation SAVE_LIBRARY($libData: LibraryInput!, $lang: [AvailableLanguage!]) {
  saveLibrary(library: $libData) {
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
 *      libData: // value for 'libData'
 *      lang: // value for 'lang'
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
export const GetPermissionsActionsDocument = gql`
    query GET_PERMISSIONS_ACTIONS($type: PermissionTypes!, $applyOn: String) {
  permissionsActionsByType(type: $type, applyOn: $applyOn) {
    name
    label
  }
}
    `;

/**
 * __useGetPermissionsActionsQuery__
 *
 * To run a query within a React component, call `useGetPermissionsActionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPermissionsActionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPermissionsActionsQuery({
 *   variables: {
 *      type: // value for 'type'
 *      applyOn: // value for 'applyOn'
 *   },
 * });
 */
export function useGetPermissionsActionsQuery(baseOptions: Apollo.QueryHookOptions<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables> & ({ variables: GetPermissionsActionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables>(GetPermissionsActionsDocument, options);
      }
export function useGetPermissionsActionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables>(GetPermissionsActionsDocument, options);
        }
// @ts-ignore
export function useGetPermissionsActionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables>;
export function useGetPermissionsActionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPermissionsActionsQuery | undefined, GetPermissionsActionsQueryVariables>;
export function useGetPermissionsActionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables>(GetPermissionsActionsDocument, options);
        }
export type GetPermissionsActionsQueryHookResult = ReturnType<typeof useGetPermissionsActionsQuery>;
export type GetPermissionsActionsLazyQueryHookResult = ReturnType<typeof useGetPermissionsActionsLazyQuery>;
export type GetPermissionsActionsSuspenseQueryHookResult = ReturnType<typeof useGetPermissionsActionsSuspenseQuery>;
export type GetPermissionsActionsQueryResult = Apollo.QueryResult<GetPermissionsActionsQuery, GetPermissionsActionsQueryVariables>;
export const GetPermissionsDocument = gql`
    query GET_PERMISSIONS($type: PermissionTypes!, $applyTo: ID, $actions: [PermissionsActions!]!, $usersGroup: ID, $permissionTreeTarget: PermissionsTreeTargetInput, $dependenciesTreeTargets: [PermissionsDependenciesTreeTargetInput!]) {
  perm: permissions(
    type: $type
    applyTo: $applyTo
    actions: $actions
    usersGroup: $usersGroup
    permissionTreeTarget: $permissionTreeTarget
    dependenciesTreeTargets: $dependenciesTreeTargets
  ) {
    name
    allowed
  }
  inheritPerm: inheritedPermissions(
    type: $type
    applyTo: $applyTo
    actions: $actions
    userGroupNodeId: $usersGroup
    permissionTreeTarget: $permissionTreeTarget
    dependenciesTreeTargets: $dependenciesTreeTargets
  ) {
    name
    allowed
  }
}
    `;

/**
 * __useGetPermissionsQuery__
 *
 * To run a query within a React component, call `useGetPermissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPermissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPermissionsQuery({
 *   variables: {
 *      type: // value for 'type'
 *      applyTo: // value for 'applyTo'
 *      actions: // value for 'actions'
 *      usersGroup: // value for 'usersGroup'
 *      permissionTreeTarget: // value for 'permissionTreeTarget'
 *      dependenciesTreeTargets: // value for 'dependenciesTreeTargets'
 *   },
 * });
 */
export function useGetPermissionsQuery(baseOptions: Apollo.QueryHookOptions<GetPermissionsQuery, GetPermissionsQueryVariables> & ({ variables: GetPermissionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPermissionsQuery, GetPermissionsQueryVariables>(GetPermissionsDocument, options);
      }
export function useGetPermissionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPermissionsQuery, GetPermissionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPermissionsQuery, GetPermissionsQueryVariables>(GetPermissionsDocument, options);
        }
// @ts-ignore
export function useGetPermissionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPermissionsQuery, GetPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPermissionsQuery, GetPermissionsQueryVariables>;
export function useGetPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPermissionsQuery, GetPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPermissionsQuery | undefined, GetPermissionsQueryVariables>;
export function useGetPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPermissionsQuery, GetPermissionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPermissionsQuery, GetPermissionsQueryVariables>(GetPermissionsDocument, options);
        }
export type GetPermissionsQueryHookResult = ReturnType<typeof useGetPermissionsQuery>;
export type GetPermissionsLazyQueryHookResult = ReturnType<typeof useGetPermissionsLazyQuery>;
export type GetPermissionsSuspenseQueryHookResult = ReturnType<typeof useGetPermissionsSuspenseQuery>;
export type GetPermissionsQueryResult = Apollo.QueryResult<GetPermissionsQuery, GetPermissionsQueryVariables>;
export const IsAllowedDocument = gql`
    query IS_ALLOWED($type: PermissionTypes!, $applyTo: ID, $actions: [PermissionsActions!]!, $target: PermissionTarget) {
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
 *      applyTo: // value for 'applyTo'
 *      actions: // value for 'actions'
 *      target: // value for 'target'
 *   },
 * });
 */
export function useIsAllowedQuery(baseOptions: Apollo.QueryHookOptions<IsAllowedQuery, IsAllowedQueryVariables> & ({ variables: IsAllowedQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<IsAllowedQuery, IsAllowedQueryVariables>(IsAllowedDocument, options);
      }
export function useIsAllowedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<IsAllowedQuery, IsAllowedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<IsAllowedQuery, IsAllowedQueryVariables>(IsAllowedDocument, options);
        }
// @ts-ignore
export function useIsAllowedSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<IsAllowedQuery, IsAllowedQueryVariables>): Apollo.UseSuspenseQueryResult<IsAllowedQuery, IsAllowedQueryVariables>;
export function useIsAllowedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<IsAllowedQuery, IsAllowedQueryVariables>): Apollo.UseSuspenseQueryResult<IsAllowedQuery | undefined, IsAllowedQueryVariables>;
export function useIsAllowedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<IsAllowedQuery, IsAllowedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<IsAllowedQuery, IsAllowedQueryVariables>(IsAllowedDocument, options);
        }
export type IsAllowedQueryHookResult = ReturnType<typeof useIsAllowedQuery>;
export type IsAllowedLazyQueryHookResult = ReturnType<typeof useIsAllowedLazyQuery>;
export type IsAllowedSuspenseQueryHookResult = ReturnType<typeof useIsAllowedSuspenseQuery>;
export type IsAllowedQueryResult = Apollo.QueryResult<IsAllowedQuery, IsAllowedQueryVariables>;
export const SavePermissionDocument = gql`
    mutation SAVE_PERMISSION($permData: PermissionInput!) {
  savePermission(permission: $permData) {
    type
    applyTo
    usersGroup
    actions {
      name
      allowed
    }
    permissionTreeTarget {
      nodeId
      tree
    }
    dependenciesTreeTargets {
      attributeId
      nodeId
      tree
    }
  }
}
    `;
export type SavePermissionMutationFn = Apollo.MutationFunction<SavePermissionMutation, SavePermissionMutationVariables>;

/**
 * __useSavePermissionMutation__
 *
 * To run a mutation, you first call `useSavePermissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSavePermissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [savePermissionMutation, { data, loading, error }] = useSavePermissionMutation({
 *   variables: {
 *      permData: // value for 'permData'
 *   },
 * });
 */
export function useSavePermissionMutation(baseOptions?: Apollo.MutationHookOptions<SavePermissionMutation, SavePermissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SavePermissionMutation, SavePermissionMutationVariables>(SavePermissionDocument, options);
      }
export type SavePermissionMutationHookResult = ReturnType<typeof useSavePermissionMutation>;
export type SavePermissionMutationResult = Apollo.MutationResult<SavePermissionMutation>;
export type SavePermissionMutationOptions = Apollo.BaseMutationOptions<SavePermissionMutation, SavePermissionMutationVariables>;
export const GetAllPluginsDocument = gql`
    query GET_ALL_PLUGINS {
  plugins {
    name
    description
    version
    author
  }
}
    `;

/**
 * __useGetAllPluginsQuery__
 *
 * To run a query within a React component, call `useGetAllPluginsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllPluginsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllPluginsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllPluginsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllPluginsQuery, GetAllPluginsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllPluginsQuery, GetAllPluginsQueryVariables>(GetAllPluginsDocument, options);
      }
export function useGetAllPluginsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllPluginsQuery, GetAllPluginsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllPluginsQuery, GetAllPluginsQueryVariables>(GetAllPluginsDocument, options);
        }
// @ts-ignore
export function useGetAllPluginsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAllPluginsQuery, GetAllPluginsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllPluginsQuery, GetAllPluginsQueryVariables>;
export function useGetAllPluginsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllPluginsQuery, GetAllPluginsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllPluginsQuery | undefined, GetAllPluginsQueryVariables>;
export function useGetAllPluginsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllPluginsQuery, GetAllPluginsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllPluginsQuery, GetAllPluginsQueryVariables>(GetAllPluginsDocument, options);
        }
export type GetAllPluginsQueryHookResult = ReturnType<typeof useGetAllPluginsQuery>;
export type GetAllPluginsLazyQueryHookResult = ReturnType<typeof useGetAllPluginsLazyQuery>;
export type GetAllPluginsSuspenseQueryHookResult = ReturnType<typeof useGetAllPluginsSuspenseQuery>;
export type GetAllPluginsQueryResult = Apollo.QueryResult<GetAllPluginsQuery, GetAllPluginsQueryVariables>;
export const CreateRecordDocument = gql`
    mutation CREATE_RECORD($library: ID!) {
  createRecord(library: $library) {
    record {
      id
      ...RecordIdentity
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
export const PurgeRecordsDocument = gql`
    mutation PURGE_RECORDS($libraryId: String!) {
  purgeInactiveRecords(libraryId: $libraryId) {
    id
  }
}
    `;
export type PurgeRecordsMutationFn = Apollo.MutationFunction<PurgeRecordsMutation, PurgeRecordsMutationVariables>;

/**
 * __usePurgeRecordsMutation__
 *
 * To run a mutation, you first call `usePurgeRecordsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePurgeRecordsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [purgeRecordsMutation, { data, loading, error }] = usePurgeRecordsMutation({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function usePurgeRecordsMutation(baseOptions?: Apollo.MutationHookOptions<PurgeRecordsMutation, PurgeRecordsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PurgeRecordsMutation, PurgeRecordsMutationVariables>(PurgeRecordsDocument, options);
      }
export type PurgeRecordsMutationHookResult = ReturnType<typeof usePurgeRecordsMutation>;
export type PurgeRecordsMutationResult = Apollo.MutationResult<PurgeRecordsMutation>;
export type PurgeRecordsMutationOptions = Apollo.BaseMutationOptions<PurgeRecordsMutation, PurgeRecordsMutationVariables>;
export const RecordsListDocument = gql`
    query RECORDS_LIST($library: ID!, $filters: [RecordFilterInput], $pagination: RecordsPagination) {
  records(library: $library, filters: $filters, pagination: $pagination) {
    totalCount
    list {
      whoAmI {
        id
        label
        color
        preview
        library {
          id
          label
        }
      }
    }
  }
}
    `;

/**
 * __useRecordsListQuery__
 *
 * To run a query within a React component, call `useRecordsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecordsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecordsListQuery({
 *   variables: {
 *      library: // value for 'library'
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useRecordsListQuery(baseOptions: Apollo.QueryHookOptions<RecordsListQuery, RecordsListQueryVariables> & ({ variables: RecordsListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecordsListQuery, RecordsListQueryVariables>(RecordsListDocument, options);
      }
export function useRecordsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecordsListQuery, RecordsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecordsListQuery, RecordsListQueryVariables>(RecordsListDocument, options);
        }
// @ts-ignore
export function useRecordsListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<RecordsListQuery, RecordsListQueryVariables>): Apollo.UseSuspenseQueryResult<RecordsListQuery, RecordsListQueryVariables>;
export function useRecordsListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RecordsListQuery, RecordsListQueryVariables>): Apollo.UseSuspenseQueryResult<RecordsListQuery | undefined, RecordsListQueryVariables>;
export function useRecordsListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RecordsListQuery, RecordsListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RecordsListQuery, RecordsListQueryVariables>(RecordsListDocument, options);
        }
export type RecordsListQueryHookResult = ReturnType<typeof useRecordsListQuery>;
export type RecordsListLazyQueryHookResult = ReturnType<typeof useRecordsListLazyQuery>;
export type RecordsListSuspenseQueryHookResult = ReturnType<typeof useRecordsListSuspenseQuery>;
export type RecordsListQueryResult = Apollo.QueryResult<RecordsListQuery, RecordsListQueryVariables>;
export const GetStatsDocument = gql`
    query GET_STATS {
  libraries(pagination: {offset: 0, limit: 1}) {
    totalCount
  }
  attributes(pagination: {offset: 0, limit: 1}) {
    totalCount
  }
  trees(pagination: {offset: 0, limit: 1}) {
    totalCount
  }
  applications(pagination: {offset: 0, limit: 1}) {
    totalCount
  }
}
    `;

/**
 * __useGetStatsQuery__
 *
 * To run a query within a React component, call `useGetStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetStatsQuery(baseOptions?: Apollo.QueryHookOptions<GetStatsQuery, GetStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStatsQuery, GetStatsQueryVariables>(GetStatsDocument, options);
      }
export function useGetStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStatsQuery, GetStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStatsQuery, GetStatsQueryVariables>(GetStatsDocument, options);
        }
// @ts-ignore
export function useGetStatsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetStatsQuery, GetStatsQueryVariables>): Apollo.UseSuspenseQueryResult<GetStatsQuery, GetStatsQueryVariables>;
export function useGetStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStatsQuery, GetStatsQueryVariables>): Apollo.UseSuspenseQueryResult<GetStatsQuery | undefined, GetStatsQueryVariables>;
export function useGetStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStatsQuery, GetStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetStatsQuery, GetStatsQueryVariables>(GetStatsDocument, options);
        }
export type GetStatsQueryHookResult = ReturnType<typeof useGetStatsQuery>;
export type GetStatsLazyQueryHookResult = ReturnType<typeof useGetStatsLazyQuery>;
export type GetStatsSuspenseQueryHookResult = ReturnType<typeof useGetStatsSuspenseQuery>;
export type GetStatsQueryResult = Apollo.QueryResult<GetStatsQuery, GetStatsQueryVariables>;
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
export function useDeleteTasksMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTasksMutation, DeleteTasksMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTasksMutation, DeleteTasksMutationVariables>(DeleteTasksDocument, options);
      }
export type DeleteTasksMutationHookResult = ReturnType<typeof useDeleteTasksMutation>;
export type DeleteTasksMutationResult = Apollo.MutationResult<DeleteTasksMutation>;
export type DeleteTasksMutationOptions = Apollo.BaseMutationOptions<DeleteTasksMutation, DeleteTasksMutationVariables>;
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
    ${RecordIdentityFragmentDoc}`;

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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTasksQuery, GetTasksQueryVariables>(GetTasksDocument, options);
      }
export function useGetTasksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTasksQuery, GetTasksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTasksQuery, GetTasksQueryVariables>(GetTasksDocument, options);
        }
// @ts-ignore
export function useGetTasksSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTasksQuery, GetTasksQueryVariables>): Apollo.UseSuspenseQueryResult<GetTasksQuery, GetTasksQueryVariables>;
export function useGetTasksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTasksQuery, GetTasksQueryVariables>): Apollo.UseSuspenseQueryResult<GetTasksQuery | undefined, GetTasksQueryVariables>;
export function useGetTasksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTasksQuery, GetTasksQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTasksQuery, GetTasksQueryVariables>(GetTasksDocument, options);
        }
export type GetTasksQueryHookResult = ReturnType<typeof useGetTasksQuery>;
export type GetTasksLazyQueryHookResult = ReturnType<typeof useGetTasksLazyQuery>;
export type GetTasksSuspenseQueryHookResult = ReturnType<typeof useGetTasksSuspenseQuery>;
export type GetTasksQueryResult = Apollo.QueryResult<GetTasksQuery, GetTasksQueryVariables>;
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
    ${RecordIdentityFragmentDoc}`;

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
export function useSubTasksUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<SubTasksUpdateSubscription, SubTasksUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubTasksUpdateSubscription, SubTasksUpdateSubscriptionVariables>(SubTasksUpdateDocument, options);
      }
export type SubTasksUpdateSubscriptionHookResult = ReturnType<typeof useSubTasksUpdateSubscription>;
export type SubTasksUpdateSubscriptionResult = Apollo.SubscriptionResult<SubTasksUpdateSubscription>;
export const DeleteTreeDocument = gql`
    mutation DELETE_TREE($treeId: ID!) {
  deleteTree(id: $treeId) {
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
 *      treeId: // value for 'treeId'
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
    totalCount
    list {
      id
      label
      system
      behavior
      settings
      permissions_conf {
        libraryId
        permissionsConf {
          permissionTreeAttributes {
            id
            label
            ... on TreeAttribute {
              linked_tree {
                id
              }
            }
          }
          relation
        }
      }
      libraries {
        library {
          id
          label
          attributes {
            id
            label
            type
          }
        }
        settings {
          allowMultiplePositions
          allowedAtRoot
          allowedChildren
        }
      }
    }
  }
}
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
export function useGetTreeByIdQuery(baseOptions?: Apollo.QueryHookOptions<GetTreeByIdQuery, GetTreeByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTreeByIdQuery, GetTreeByIdQueryVariables>(GetTreeByIdDocument, options);
      }
export function useGetTreeByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTreeByIdQuery, GetTreeByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTreeByIdQuery, GetTreeByIdQueryVariables>(GetTreeByIdDocument, options);
        }
// @ts-ignore
export function useGetTreeByIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTreeByIdQuery, GetTreeByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreeByIdQuery, GetTreeByIdQueryVariables>;
export function useGetTreeByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreeByIdQuery, GetTreeByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreeByIdQuery | undefined, GetTreeByIdQueryVariables>;
export function useGetTreeByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreeByIdQuery, GetTreeByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTreeByIdQuery, GetTreeByIdQueryVariables>(GetTreeByIdDocument, options);
        }
export type GetTreeByIdQueryHookResult = ReturnType<typeof useGetTreeByIdQuery>;
export type GetTreeByIdLazyQueryHookResult = ReturnType<typeof useGetTreeByIdLazyQuery>;
export type GetTreeByIdSuspenseQueryHookResult = ReturnType<typeof useGetTreeByIdSuspenseQuery>;
export type GetTreeByIdQueryResult = Apollo.QueryResult<GetTreeByIdQuery, GetTreeByIdQueryVariables>;
export const GetTreesDocument = gql`
    query GET_TREES($filters: TreesFiltersInput) {
  trees(filters: $filters) {
    totalCount
    list {
      id
      label
      system
      behavior
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTreesQuery, GetTreesQueryVariables>(GetTreesDocument, options);
      }
export function useGetTreesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTreesQuery, GetTreesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTreesQuery, GetTreesQueryVariables>(GetTreesDocument, options);
        }
// @ts-ignore
export function useGetTreesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTreesQuery, GetTreesQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreesQuery, GetTreesQueryVariables>;
export function useGetTreesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreesQuery, GetTreesQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreesQuery | undefined, GetTreesQueryVariables>;
export function useGetTreesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreesQuery, GetTreesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTreesQuery, GetTreesQueryVariables>(GetTreesDocument, options);
        }
export type GetTreesQueryHookResult = ReturnType<typeof useGetTreesQuery>;
export type GetTreesLazyQueryHookResult = ReturnType<typeof useGetTreesLazyQuery>;
export type GetTreesSuspenseQueryHookResult = ReturnType<typeof useGetTreesSuspenseQuery>;
export type GetTreesQueryResult = Apollo.QueryResult<GetTreesQuery, GetTreesQueryVariables>;
export const SaveTreeDocument = gql`
    mutation SAVE_TREE($treeData: TreeInput!) {
  saveTree(tree: $treeData) {
    id
    system
    label
    behavior
    libraries {
      library {
        id
        label
        attributes {
          id
          label
          type
          ... on TreeAttribute {
            linked_tree {
              id
            }
          }
        }
      }
      settings {
        allowMultiplePositions
        allowedAtRoot
        allowedChildren
      }
    }
    settings
    permissions_conf {
      libraryId
      permissionsConf {
        permissionTreeAttributes {
          id
          label
        }
        relation
      }
    }
  }
}
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
 *      treeData: // value for 'treeData'
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
export const AddTreeElementDocument = gql`
    mutation ADD_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parent: ID) {
  treeAddElement(treeId: $treeId, element: $element, parent: $parent, order: 0) {
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
 *   },
 * });
 */
export function useAddTreeElementMutation(baseOptions?: Apollo.MutationHookOptions<AddTreeElementMutation, AddTreeElementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTreeElementMutation, AddTreeElementMutationVariables>(AddTreeElementDocument, options);
      }
export type AddTreeElementMutationHookResult = ReturnType<typeof useAddTreeElementMutation>;
export type AddTreeElementMutationResult = Apollo.MutationResult<AddTreeElementMutation>;
export type AddTreeElementMutationOptions = Apollo.BaseMutationOptions<AddTreeElementMutation, AddTreeElementMutationVariables>;
export const DeleteTreeElementDocument = gql`
    mutation DELETE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $deleteChildren: Boolean) {
  treeDeleteElement(
    treeId: $treeId
    nodeId: $nodeId
    deleteChildren: $deleteChildren
  )
}
    `;
export type DeleteTreeElementMutationFn = Apollo.MutationFunction<DeleteTreeElementMutation, DeleteTreeElementMutationVariables>;

/**
 * __useDeleteTreeElementMutation__
 *
 * To run a mutation, you first call `useDeleteTreeElementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTreeElementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTreeElementMutation, { data, loading, error }] = useDeleteTreeElementMutation({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      nodeId: // value for 'nodeId'
 *      deleteChildren: // value for 'deleteChildren'
 *   },
 * });
 */
export function useDeleteTreeElementMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTreeElementMutation, DeleteTreeElementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTreeElementMutation, DeleteTreeElementMutationVariables>(DeleteTreeElementDocument, options);
      }
export type DeleteTreeElementMutationHookResult = ReturnType<typeof useDeleteTreeElementMutation>;
export type DeleteTreeElementMutationResult = Apollo.MutationResult<DeleteTreeElementMutation>;
export type DeleteTreeElementMutationOptions = Apollo.BaseMutationOptions<DeleteTreeElementMutation, DeleteTreeElementMutationVariables>;
export const MoveTreeElementDocument = gql`
    mutation MOVE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $parentTo: ID, $order: Int) {
  treeMoveElement(
    treeId: $treeId
    nodeId: $nodeId
    parentTo: $parentTo
    order: $order
  ) {
    id
  }
}
    `;
export type MoveTreeElementMutationFn = Apollo.MutationFunction<MoveTreeElementMutation, MoveTreeElementMutationVariables>;

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
export function useMoveTreeElementMutation(baseOptions?: Apollo.MutationHookOptions<MoveTreeElementMutation, MoveTreeElementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveTreeElementMutation, MoveTreeElementMutationVariables>(MoveTreeElementDocument, options);
      }
export type MoveTreeElementMutationHookResult = ReturnType<typeof useMoveTreeElementMutation>;
export type MoveTreeElementMutationResult = Apollo.MutationResult<MoveTreeElementMutation>;
export type MoveTreeElementMutationOptions = Apollo.BaseMutationOptions<MoveTreeElementMutation, MoveTreeElementMutationVariables>;
export const TreeNodeChildrenDocument = gql`
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination) {
  treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
    list {
      id
      order
      childrenCount
      record {
        ...RecordIdentity
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
    }
  }
}
    ${RecordIdentityFragmentDoc}`;

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
export function useTreeNodeChildrenQuery(baseOptions: Apollo.QueryHookOptions<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables> & ({ variables: TreeNodeChildrenQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>(TreeNodeChildrenDocument, options);
      }
export function useTreeNodeChildrenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>(TreeNodeChildrenDocument, options);
        }
// @ts-ignore
export function useTreeNodeChildrenSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>): Apollo.UseSuspenseQueryResult<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>;
export function useTreeNodeChildrenSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>): Apollo.UseSuspenseQueryResult<TreeNodeChildrenQuery | undefined, TreeNodeChildrenQueryVariables>;
export function useTreeNodeChildrenSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>(TreeNodeChildrenDocument, options);
        }
export type TreeNodeChildrenQueryHookResult = ReturnType<typeof useTreeNodeChildrenQuery>;
export type TreeNodeChildrenLazyQueryHookResult = ReturnType<typeof useTreeNodeChildrenLazyQuery>;
export type TreeNodeChildrenSuspenseQueryHookResult = ReturnType<typeof useTreeNodeChildrenSuspenseQuery>;
export type TreeNodeChildrenQueryResult = Apollo.QueryResult<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>;
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
// @ts-ignore
export function useMeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const DeleteValueDocument = gql`
    mutation DELETE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $valueId: ID) {
  deleteValue(
    library: $library
    recordId: $recordId
    attribute: $attribute
    value: {id_value: $valueId}
  ) {
    attribute {
      id
    }
    id_value
  }
}
    `;
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
 *      valueId: // value for 'valueId'
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
export const PurgeMultipleValuesDocument = gql`
    mutation PURGE_MULTIPLE_VALUES($attributeId: ID!) {
  purgeMultipleValues(attributeId: $attributeId)
}
    `;
export type PurgeMultipleValuesMutationFn = Apollo.MutationFunction<PurgeMultipleValuesMutation, PurgeMultipleValuesMutationVariables>;

/**
 * __usePurgeMultipleValuesMutation__
 *
 * To run a mutation, you first call `usePurgeMultipleValuesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePurgeMultipleValuesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [purgeMultipleValuesMutation, { data, loading, error }] = usePurgeMultipleValuesMutation({
 *   variables: {
 *      attributeId: // value for 'attributeId'
 *   },
 * });
 */
export function usePurgeMultipleValuesMutation(baseOptions?: Apollo.MutationHookOptions<PurgeMultipleValuesMutation, PurgeMultipleValuesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PurgeMultipleValuesMutation, PurgeMultipleValuesMutationVariables>(PurgeMultipleValuesDocument, options);
      }
export type PurgeMultipleValuesMutationHookResult = ReturnType<typeof usePurgeMultipleValuesMutation>;
export type PurgeMultipleValuesMutationResult = Apollo.MutationResult<PurgeMultipleValuesMutation>;
export type PurgeMultipleValuesMutationOptions = Apollo.BaseMutationOptions<PurgeMultipleValuesMutation, PurgeMultipleValuesMutationVariables>;
export const SaveValueBatchDocument = gql`
    mutation SAVE_VALUE_BATCH($library: ID!, $recordId: ID!, $version: [ValueVersionInput!], $values: [ValueBatchInput!]!) {
  saveValueBatch(
    library: $library
    recordId: $recordId
    version: $version
    values: $values
  ) {
    values {
      id_value
      modified_at
      created_at
      version {
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
      attribute {
        id
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
    errors {
      type
      attribute
      input
      message
    }
  }
}
    ${RecordIdentityFragmentDoc}`;
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
export const SaveValueDocument = gql`
    mutation SAVE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput!) {
  saveValue(
    library: $library
    recordId: $recordId
    attribute: $attribute
    value: $value
  ) {
    id_value
    attribute {
      id
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
        record {
          ...RecordIdentity
        }
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}`;
export type SaveValueMutationFn = Apollo.MutationFunction<SaveValueMutation, SaveValueMutationVariables>;

/**
 * __useSaveValueMutation__
 *
 * To run a mutation, you first call `useSaveValueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveValueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveValueMutation, { data, loading, error }] = useSaveValueMutation({
 *   variables: {
 *      library: // value for 'library'
 *      recordId: // value for 'recordId'
 *      attribute: // value for 'attribute'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useSaveValueMutation(baseOptions?: Apollo.MutationHookOptions<SaveValueMutation, SaveValueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveValueMutation, SaveValueMutationVariables>(SaveValueDocument, options);
      }
export type SaveValueMutationHookResult = ReturnType<typeof useSaveValueMutation>;
export type SaveValueMutationResult = Apollo.MutationResult<SaveValueMutation>;
export type SaveValueMutationOptions = Apollo.BaseMutationOptions<SaveValueMutation, SaveValueMutationVariables>;
export const GetVersionDocument = gql`
    query GET_VERSION {
  version
}
    `;

/**
 * __useGetVersionQuery__
 *
 * To run a query within a React component, call `useGetVersionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVersionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVersionQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetVersionQuery(baseOptions?: Apollo.QueryHookOptions<GetVersionQuery, GetVersionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVersionQuery, GetVersionQueryVariables>(GetVersionDocument, options);
      }
export function useGetVersionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVersionQuery, GetVersionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVersionQuery, GetVersionQueryVariables>(GetVersionDocument, options);
        }
// @ts-ignore
export function useGetVersionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetVersionQuery, GetVersionQueryVariables>): Apollo.UseSuspenseQueryResult<GetVersionQuery, GetVersionQueryVariables>;
export function useGetVersionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVersionQuery, GetVersionQueryVariables>): Apollo.UseSuspenseQueryResult<GetVersionQuery | undefined, GetVersionQueryVariables>;
export function useGetVersionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVersionQuery, GetVersionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetVersionQuery, GetVersionQueryVariables>(GetVersionDocument, options);
        }
export type GetVersionQueryHookResult = ReturnType<typeof useGetVersionQuery>;
export type GetVersionLazyQueryHookResult = ReturnType<typeof useGetVersionLazyQuery>;
export type GetVersionSuspenseQueryHookResult = ReturnType<typeof useGetVersionSuspenseQuery>;
export type GetVersionQueryResult = Apollo.QueryResult<GetVersionQuery, GetVersionQueryVariables>;
export const DeleteVersionProfileDocument = gql`
    mutation DELETE_VERSION_PROFILE($id: String!) {
  deleteVersionProfile(id: $id) {
    id
  }
}
    `;
export type DeleteVersionProfileMutationFn = Apollo.MutationFunction<DeleteVersionProfileMutation, DeleteVersionProfileMutationVariables>;

/**
 * __useDeleteVersionProfileMutation__
 *
 * To run a mutation, you first call `useDeleteVersionProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteVersionProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteVersionProfileMutation, { data, loading, error }] = useDeleteVersionProfileMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteVersionProfileMutation(baseOptions?: Apollo.MutationHookOptions<DeleteVersionProfileMutation, DeleteVersionProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteVersionProfileMutation, DeleteVersionProfileMutationVariables>(DeleteVersionProfileDocument, options);
      }
export type DeleteVersionProfileMutationHookResult = ReturnType<typeof useDeleteVersionProfileMutation>;
export type DeleteVersionProfileMutationResult = Apollo.MutationResult<DeleteVersionProfileMutation>;
export type DeleteVersionProfileMutationOptions = Apollo.BaseMutationOptions<DeleteVersionProfileMutation, DeleteVersionProfileMutationVariables>;
export const GetVersionProfileByIdDocument = gql`
    query GET_VERSION_PROFILE_BY_ID($id: ID!) {
  versionProfiles(filters: {id: $id}) {
    list {
      id
      label
      description
      trees {
        id
        label
      }
      linkedAttributes {
        id
        label
      }
    }
  }
}
    `;

/**
 * __useGetVersionProfileByIdQuery__
 *
 * To run a query within a React component, call `useGetVersionProfileByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVersionProfileByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVersionProfileByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetVersionProfileByIdQuery(baseOptions: Apollo.QueryHookOptions<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables> & ({ variables: GetVersionProfileByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables>(GetVersionProfileByIdDocument, options);
      }
export function useGetVersionProfileByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables>(GetVersionProfileByIdDocument, options);
        }
// @ts-ignore
export function useGetVersionProfileByIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables>;
export function useGetVersionProfileByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetVersionProfileByIdQuery | undefined, GetVersionProfileByIdQueryVariables>;
export function useGetVersionProfileByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables>(GetVersionProfileByIdDocument, options);
        }
export type GetVersionProfileByIdQueryHookResult = ReturnType<typeof useGetVersionProfileByIdQuery>;
export type GetVersionProfileByIdLazyQueryHookResult = ReturnType<typeof useGetVersionProfileByIdLazyQuery>;
export type GetVersionProfileByIdSuspenseQueryHookResult = ReturnType<typeof useGetVersionProfileByIdSuspenseQuery>;
export type GetVersionProfileByIdQueryResult = Apollo.QueryResult<GetVersionProfileByIdQuery, GetVersionProfileByIdQueryVariables>;
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
// @ts-ignore
export function useGetVersionProfilesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>): Apollo.UseSuspenseQueryResult<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>;
export function useGetVersionProfilesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>): Apollo.UseSuspenseQueryResult<GetVersionProfilesQuery | undefined, GetVersionProfilesQueryVariables>;
export function useGetVersionProfilesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>(GetVersionProfilesDocument, options);
        }
export type GetVersionProfilesQueryHookResult = ReturnType<typeof useGetVersionProfilesQuery>;
export type GetVersionProfilesLazyQueryHookResult = ReturnType<typeof useGetVersionProfilesLazyQuery>;
export type GetVersionProfilesSuspenseQueryHookResult = ReturnType<typeof useGetVersionProfilesSuspenseQuery>;
export type GetVersionProfilesQueryResult = Apollo.QueryResult<GetVersionProfilesQuery, GetVersionProfilesQueryVariables>;
export const SaveVersionProfileDocument = gql`
    mutation SAVE_VERSION_PROFILE($versionProfile: VersionProfileInput!) {
  saveVersionProfile(versionProfile: $versionProfile) {
    id
    label
    description
    trees {
      id
      label
    }
  }
}
    `;
export type SaveVersionProfileMutationFn = Apollo.MutationFunction<SaveVersionProfileMutation, SaveVersionProfileMutationVariables>;

/**
 * __useSaveVersionProfileMutation__
 *
 * To run a mutation, you first call `useSaveVersionProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveVersionProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveVersionProfileMutation, { data, loading, error }] = useSaveVersionProfileMutation({
 *   variables: {
 *      versionProfile: // value for 'versionProfile'
 *   },
 * });
 */
export function useSaveVersionProfileMutation(baseOptions?: Apollo.MutationHookOptions<SaveVersionProfileMutation, SaveVersionProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveVersionProfileMutation, SaveVersionProfileMutationVariables>(SaveVersionProfileDocument, options);
      }
export type SaveVersionProfileMutationHookResult = ReturnType<typeof useSaveVersionProfileMutation>;
export type SaveVersionProfileMutationResult = Apollo.MutationResult<SaveVersionProfileMutation>;
export type SaveVersionProfileMutationOptions = Apollo.BaseMutationOptions<SaveVersionProfileMutation, SaveVersionProfileMutationVariables>;
export const GetViewsDocument = gql`
    query GET_VIEWS($library: String!) {
  views(library: $library) {
    list {
      id
      label
    }
  }
}
    `;

/**
 * __useGetViewsQuery__
 *
 * To run a query within a React component, call `useGetViewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewsQuery({
 *   variables: {
 *      library: // value for 'library'
 *   },
 * });
 */
export function useGetViewsQuery(baseOptions: Apollo.QueryHookOptions<GetViewsQuery, GetViewsQueryVariables> & ({ variables: GetViewsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewsQuery, GetViewsQueryVariables>(GetViewsDocument, options);
      }
export function useGetViewsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewsQuery, GetViewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewsQuery, GetViewsQueryVariables>(GetViewsDocument, options);
        }
// @ts-ignore
export function useGetViewsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetViewsQuery, GetViewsQueryVariables>): Apollo.UseSuspenseQueryResult<GetViewsQuery, GetViewsQueryVariables>;
export function useGetViewsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewsQuery, GetViewsQueryVariables>): Apollo.UseSuspenseQueryResult<GetViewsQuery | undefined, GetViewsQueryVariables>;
export function useGetViewsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewsQuery, GetViewsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetViewsQuery, GetViewsQueryVariables>(GetViewsDocument, options);
        }
export type GetViewsQueryHookResult = ReturnType<typeof useGetViewsQuery>;
export type GetViewsLazyQueryHookResult = ReturnType<typeof useGetViewsLazyQuery>;
export type GetViewsSuspenseQueryHookResult = ReturnType<typeof useGetViewsSuspenseQuery>;
export type GetViewsQueryResult = Apollo.QueryResult<GetViewsQuery, GetViewsQueryVariables>;