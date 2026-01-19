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
  /** Can be anything */
  Any: { input: any; output: any; }
  /**
   * The DateTime scalar type represents time data,
   *             represented as an ISO-8601 encoded UTC date string.
   */
  DateTime: { input: any; output: any; }
  /**
   * Object representing the full tree structure.
   *                             On each node we will have record data and children
   */
  FullTreeContent: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
  /** Object containing all previews available for a record */
  Preview: { input: IPreviewScalar; output: IPreviewScalar; }
  /** System entities fields translation (label...) */
  SystemTranslation: { input: any; output: any; }
  /** System entities fields translation (label...) */
  SystemTranslationOptional: { input: any; output: any; }
  TaskPriority: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
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

export enum InfoChannel {
  passive = 'passive',
  trigger = 'trigger'
}

export enum InfoPriority {
  high = 'high',
  low = 'low',
  medium = 'medium'
}

export enum InfoType {
  basic = 'basic',
  error = 'error',
  success = 'success',
  warning = 'warning'
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

export type ApplicationDetailsFragment = { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } };

export type RecordIdentityFragment = { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } };

export type CancelTaskMutationVariables = Exact<{
  taskId: Scalars['ID']['input'];
}>;


export type CancelTaskMutation = { cancelTask: boolean };

export type DeleteTasksMutationVariables = Exact<{
  tasks: Array<DeleteTaskInput> | DeleteTaskInput;
}>;


export type DeleteTasksMutation = { deleteTasks: boolean };

export type AddTreeElementMutationVariables = Exact<{
  treeId: Scalars['ID']['input'];
  element: TreeElementInput;
  parent?: InputMaybe<Scalars['ID']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AddTreeElementMutation = { treeAddElement: { id: string } };

export type MoveTreeElementMutationVariables = Exact<{
  treeId: Scalars['ID']['input'];
  nodeId: Scalars['ID']['input'];
  parentTo?: InputMaybe<Scalars['ID']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MoveTreeElementMutation = { treeMoveElement: { id: string } };

export type RemoveTreeElementMutationVariables = Exact<{
  treeId: Scalars['ID']['input'];
  nodeId: Scalars['ID']['input'];
  deleteChildren?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type RemoveTreeElementMutation = { treeDeleteElement: string };

export type SaveUserDataMutationVariables = Exact<{
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Any']['input']>;
  global: Scalars['Boolean']['input'];
}>;


export type SaveUserDataMutation = { saveUserData: { global: boolean, data?: any | null } };

export type GetApplicationByEndpointQueryVariables = Exact<{
  endpoint: Scalars['String']['input'];
}>;


export type GetApplicationByEndpointQuery = { applications?: { list: Array<{ id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } }> } | null };

export type GetApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApplicationsQuery = { applications?: { list: Array<{ id: string, label: any, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null }> } | null };

export type GetActiveLibraryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveLibraryQuery = { activeLib?: { id: string, name: string, behavior: LibraryBehavior, attributes: Array<any | null>, trees: Array<string | null>, permissions: { access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } } | null };

export type GetActiveTreeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveTreeQuery = { activeTree?: { id: string, behavior: TreeBehavior, label: string, libraries: Array<{ id: string, behavior: LibraryBehavior }>, permissions: { access_tree: boolean, edit_children: boolean } } | null };

export type GetLangsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLangsQuery = { langs: Array<string | null> };

export type GetGlobalSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGlobalSettingsQuery = { globalSettings: { name: string, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null } };

export type GetLibrariesListQueryVariables = Exact<{
  filters?: InputMaybe<LibrariesFiltersInput>;
}>;


export type GetLibrariesListQuery = { libraries?: { list: Array<{ id: string, label?: any | null, behavior: LibraryBehavior, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null, previewsSettings?: Array<{ description?: any | null, label: any, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } }> | null, permissions?: { access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null }> } | null };

export type GetLibraryPermissionsQueryVariables = Exact<{
  libraryId?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type GetLibraryPermissionsQuery = { libraries?: { list: Array<{ permissions?: { access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null }> } | null };

export type IsAllowedQueryVariables = Exact<{
  type: PermissionTypes;
  actions: Array<PermissionsActions> | PermissionsActions;
  applyTo?: InputMaybe<Scalars['ID']['input']>;
  target?: InputMaybe<PermissionTarget>;
}>;


export type IsAllowedQuery = { isAllowed?: Array<{ name: PermissionsActions, allowed?: boolean | null }> | null };

export type GetTasksQueryVariables = Exact<{
  filters?: InputMaybe<TaskFiltersInput>;
}>;


export type GetTasksQuery = { tasks: { totalCount: number, list: Array<{ id: string, label: any, modified_at: number, created_at: number, startAt: number, status: TaskStatus, priority: any, startedAt?: number | null, completedAt?: number | null, archive: boolean, created_by: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } }, role?: { type: TaskType, detail?: string | null } | null, progress?: { percent?: number | null, description?: any | null } | null, link?: { name: string, url: string } | null, canceledBy?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null }> } };

export type GetTreeAttributesQueryQueryVariables = Exact<{
  treeId?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type GetTreeAttributesQueryQuery = { trees?: { list: Array<{ id: string, libraries: Array<{ library: { id: string, label?: any | null, attributes?: Array<
            | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, linked_library?: { id: string } | null }
            | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, embedded_fields?: Array<{ id: string, format?: AttributeFormat | null, label?: any | null } | null> | null }
            | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, linked_tree?: { id: string, label?: any | null } | null }
          > | null } }> }> } | null };

export type GetTreeLibrariesQueryVariables = Exact<{
  treeId?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  library?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetTreeLibrariesQuery = { trees?: { totalCount: number, list: Array<{ id: string, behavior: TreeBehavior, system: boolean, libraries: Array<{ library: { id: string, label?: any | null, behavior: LibraryBehavior, system?: boolean | null }, settings: { allowMultiplePositions: boolean, allowedChildren: Array<string>, allowedAtRoot: boolean } }> }> } | null };

export type GetTreesQueryVariables = Exact<{
  filters?: InputMaybe<TreesFiltersInput>;
}>;


export type GetTreesQuery = { trees?: { list: Array<{ id: string, label?: any | null, behavior: TreeBehavior, libraries: Array<{ library: { id: string, behavior: LibraryBehavior, label?: any | null } }>, permissions: { access_tree: boolean, edit_children: boolean } }> } | null };

export type TreeNodeChildrenQueryVariables = Exact<{
  treeId: Scalars['ID']['input'];
  node?: InputMaybe<Scalars['ID']['input']>;
  pagination?: InputMaybe<Pagination>;
}>;


export type TreeNodeChildrenQuery = { treeNodeChildren: { totalCount?: number | null, list: Array<{ id: string, childrenCount?: number | null, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } }, active: Array<{ value?: any | null }> }, permissions: { access_tree: boolean, detach: boolean, edit_children: boolean } }> } };

export type GetUserDataQueryVariables = Exact<{
  keys: Array<Scalars['String']['input']> | Scalars['String']['input'];
  global?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetUserDataQuery = { userData: { global: boolean, data?: any | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null };

export type ApplicationEventsSubscriptionVariables = Exact<{
  filters?: InputMaybe<ApplicationEventFiltersInput>;
}>;


export type ApplicationEventsSubscription = { applicationEvent: { type: ApplicationEventTypes, application: { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } } } };

export type SubTasksUpdateSubscriptionVariables = Exact<{
  filters?: InputMaybe<TaskFiltersInput>;
}>;


export type SubTasksUpdateSubscription = { task: { id: string, label: any, modified_at: number, created_at: number, startAt: number, status: TaskStatus, priority: any, startedAt?: number | null, completedAt?: number | null, archive: boolean, created_by: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } }, role?: { type: TaskType, detail?: string | null } | null, progress?: { percent?: number | null, description?: any | null } | null, link?: { name: string, url: string } | null, canceledBy?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } } | null } };

export type TreeEventsSubscriptionVariables = Exact<{
  filters?: InputMaybe<TreeEventFiltersInput>;
}>;


export type TreeEventsSubscription = { treeEvent: { type: TreeEventTypes, treeId: string, element: { id: string, childrenCount?: number | null, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, behavior: LibraryBehavior, label?: any | null } } }, permissions: { access_tree: boolean, detach: boolean, edit_children: boolean } }, parentNode?: { id: string } | null, parentNodeBefore?: { id: string } | null } };

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
  module
  permissions {
    access_application
    admin_application
  }
  settings
}
    ${RecordIdentityFragmentDoc}`;
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
export const AddTreeElementDocument = gql`
    mutation ADD_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parent: ID, $order: Int) {
  treeAddElement(
    treeId: $treeId
    element: $element
    parent: $parent
    order: $order
  ) {
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
 *      order: // value for 'order'
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
export const RemoveTreeElementDocument = gql`
    mutation REMOVE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $deleteChildren: Boolean) {
  treeDeleteElement(
    treeId: $treeId
    nodeId: $nodeId
    deleteChildren: $deleteChildren
  )
}
    `;
export type RemoveTreeElementMutationFn = Apollo.MutationFunction<RemoveTreeElementMutation, RemoveTreeElementMutationVariables>;

/**
 * __useRemoveTreeElementMutation__
 *
 * To run a mutation, you first call `useRemoveTreeElementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveTreeElementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeTreeElementMutation, { data, loading, error }] = useRemoveTreeElementMutation({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      nodeId: // value for 'nodeId'
 *      deleteChildren: // value for 'deleteChildren'
 *   },
 * });
 */
export function useRemoveTreeElementMutation(baseOptions?: Apollo.MutationHookOptions<RemoveTreeElementMutation, RemoveTreeElementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveTreeElementMutation, RemoveTreeElementMutationVariables>(RemoveTreeElementDocument, options);
      }
export type RemoveTreeElementMutationHookResult = ReturnType<typeof useRemoveTreeElementMutation>;
export type RemoveTreeElementMutationResult = Apollo.MutationResult<RemoveTreeElementMutation>;
export type RemoveTreeElementMutationOptions = Apollo.BaseMutationOptions<RemoveTreeElementMutation, RemoveTreeElementMutationVariables>;
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
export const GetApplicationsDocument = gql`
    query GET_APPLICATIONS {
  applications {
    list {
      id
      label
      description
      endpoint
      url
      color
      icon {
        ...RecordIdentity
      }
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
export const GetActiveLibraryDocument = gql`
    query GET_ACTIVE_LIBRARY {
  activeLib @client {
    id @client
    name @client
    behavior @client
    attributes @client
    trees
    permissions @client {
      access_library @client
      access_record @client
      create_record @client
      edit_record @client
      delete_record @client
    }
  }
}
    `;

/**
 * __useGetActiveLibraryQuery__
 *
 * To run a query within a React component, call `useGetActiveLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveLibraryQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveLibraryQuery(baseOptions?: Apollo.QueryHookOptions<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>(GetActiveLibraryDocument, options);
      }
export function useGetActiveLibraryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>(GetActiveLibraryDocument, options);
        }
// @ts-ignore
export function useGetActiveLibrarySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>): Apollo.UseSuspenseQueryResult<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>;
export function useGetActiveLibrarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>): Apollo.UseSuspenseQueryResult<GetActiveLibraryQuery | undefined, GetActiveLibraryQueryVariables>;
export function useGetActiveLibrarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>(GetActiveLibraryDocument, options);
        }
export type GetActiveLibraryQueryHookResult = ReturnType<typeof useGetActiveLibraryQuery>;
export type GetActiveLibraryLazyQueryHookResult = ReturnType<typeof useGetActiveLibraryLazyQuery>;
export type GetActiveLibrarySuspenseQueryHookResult = ReturnType<typeof useGetActiveLibrarySuspenseQuery>;
export type GetActiveLibraryQueryResult = Apollo.QueryResult<GetActiveLibraryQuery, GetActiveLibraryQueryVariables>;
export const GetActiveTreeDocument = gql`
    query GET_ACTIVE_TREE {
  activeTree @client {
    id @client
    behavior @client
    libraries @client {
      id @client
      behavior @client
    }
    label @client
    permissions @client {
      access_tree @client
      edit_children @client
    }
  }
}
    `;

/**
 * __useGetActiveTreeQuery__
 *
 * To run a query within a React component, call `useGetActiveTreeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveTreeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveTreeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveTreeQuery(baseOptions?: Apollo.QueryHookOptions<GetActiveTreeQuery, GetActiveTreeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActiveTreeQuery, GetActiveTreeQueryVariables>(GetActiveTreeDocument, options);
      }
export function useGetActiveTreeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActiveTreeQuery, GetActiveTreeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActiveTreeQuery, GetActiveTreeQueryVariables>(GetActiveTreeDocument, options);
        }
// @ts-ignore
export function useGetActiveTreeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetActiveTreeQuery, GetActiveTreeQueryVariables>): Apollo.UseSuspenseQueryResult<GetActiveTreeQuery, GetActiveTreeQueryVariables>;
export function useGetActiveTreeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveTreeQuery, GetActiveTreeQueryVariables>): Apollo.UseSuspenseQueryResult<GetActiveTreeQuery | undefined, GetActiveTreeQueryVariables>;
export function useGetActiveTreeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveTreeQuery, GetActiveTreeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActiveTreeQuery, GetActiveTreeQueryVariables>(GetActiveTreeDocument, options);
        }
export type GetActiveTreeQueryHookResult = ReturnType<typeof useGetActiveTreeQuery>;
export type GetActiveTreeLazyQueryHookResult = ReturnType<typeof useGetActiveTreeLazyQuery>;
export type GetActiveTreeSuspenseQueryHookResult = ReturnType<typeof useGetActiveTreeSuspenseQuery>;
export type GetActiveTreeQueryResult = Apollo.QueryResult<GetActiveTreeQuery, GetActiveTreeQueryVariables>;
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
export const GetLibrariesListDocument = gql`
    query GET_LIBRARIES_LIST($filters: LibrariesFiltersInput) {
  libraries(filters: $filters) {
    list {
      id
      label
      behavior
      icon {
        ...RecordIdentity
      }
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
    ${RecordIdentityFragmentDoc}`;

/**
 * __useGetLibrariesListQuery__
 *
 * To run a query within a React component, call `useGetLibrariesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibrariesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibrariesListQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetLibrariesListQuery(baseOptions?: Apollo.QueryHookOptions<GetLibrariesListQuery, GetLibrariesListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibrariesListQuery, GetLibrariesListQueryVariables>(GetLibrariesListDocument, options);
      }
export function useGetLibrariesListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibrariesListQuery, GetLibrariesListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLibrariesListQuery, GetLibrariesListQueryVariables>(GetLibrariesListDocument, options);
        }
// @ts-ignore
export function useGetLibrariesListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLibrariesListQuery, GetLibrariesListQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibrariesListQuery, GetLibrariesListQueryVariables>;
export function useGetLibrariesListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibrariesListQuery, GetLibrariesListQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibrariesListQuery | undefined, GetLibrariesListQueryVariables>;
export function useGetLibrariesListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibrariesListQuery, GetLibrariesListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLibrariesListQuery, GetLibrariesListQueryVariables>(GetLibrariesListDocument, options);
        }
export type GetLibrariesListQueryHookResult = ReturnType<typeof useGetLibrariesListQuery>;
export type GetLibrariesListLazyQueryHookResult = ReturnType<typeof useGetLibrariesListLazyQuery>;
export type GetLibrariesListSuspenseQueryHookResult = ReturnType<typeof useGetLibrariesListSuspenseQuery>;
export type GetLibrariesListQueryResult = Apollo.QueryResult<GetLibrariesListQuery, GetLibrariesListQueryVariables>;
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
// @ts-ignore
export function useGetLibraryPermissionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>;
export function useGetLibraryPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryPermissionsQuery | undefined, GetLibraryPermissionsQueryVariables>;
export function useGetLibraryPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>(GetLibraryPermissionsDocument, options);
        }
export type GetLibraryPermissionsQueryHookResult = ReturnType<typeof useGetLibraryPermissionsQuery>;
export type GetLibraryPermissionsLazyQueryHookResult = ReturnType<typeof useGetLibraryPermissionsLazyQuery>;
export type GetLibraryPermissionsSuspenseQueryHookResult = ReturnType<typeof useGetLibraryPermissionsSuspenseQuery>;
export type GetLibraryPermissionsQueryResult = Apollo.QueryResult<GetLibraryPermissionsQuery, GetLibraryPermissionsQueryVariables>;
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
      role {
        type
        detail
      }
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
export const GetTreeAttributesQueryDocument = gql`
    query GET_TREE_ATTRIBUTES_QUERY($treeId: [ID!]) {
  trees(filters: {id: $treeId}) {
    list {
      id
      libraries {
        library {
          id
          label
          attributes {
            id
            type
            format
            label
            multiple_values
            ... on StandardAttribute {
              embedded_fields {
                id
                format
                label
              }
            }
            ... on LinkAttribute {
              linked_library {
                id
              }
            }
            ... on TreeAttribute {
              linked_tree {
                id
                label
              }
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetTreeAttributesQueryQuery__
 *
 * To run a query within a React component, call `useGetTreeAttributesQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTreeAttributesQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTreeAttributesQueryQuery({
 *   variables: {
 *      treeId: // value for 'treeId'
 *   },
 * });
 */
export function useGetTreeAttributesQueryQuery(baseOptions?: Apollo.QueryHookOptions<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>(GetTreeAttributesQueryDocument, options);
      }
export function useGetTreeAttributesQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>(GetTreeAttributesQueryDocument, options);
        }
// @ts-ignore
export function useGetTreeAttributesQuerySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>;
export function useGetTreeAttributesQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreeAttributesQueryQuery | undefined, GetTreeAttributesQueryQueryVariables>;
export function useGetTreeAttributesQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>(GetTreeAttributesQueryDocument, options);
        }
export type GetTreeAttributesQueryQueryHookResult = ReturnType<typeof useGetTreeAttributesQueryQuery>;
export type GetTreeAttributesQueryLazyQueryHookResult = ReturnType<typeof useGetTreeAttributesQueryLazyQuery>;
export type GetTreeAttributesQuerySuspenseQueryHookResult = ReturnType<typeof useGetTreeAttributesQuerySuspenseQuery>;
export type GetTreeAttributesQueryQueryResult = Apollo.QueryResult<GetTreeAttributesQueryQuery, GetTreeAttributesQueryQueryVariables>;
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
// @ts-ignore
export function useGetTreeLibrariesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>;
export function useGetTreeLibrariesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreeLibrariesQuery | undefined, GetTreeLibrariesQueryVariables>;
export function useGetTreeLibrariesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>(GetTreeLibrariesDocument, options);
        }
export type GetTreeLibrariesQueryHookResult = ReturnType<typeof useGetTreeLibrariesQuery>;
export type GetTreeLibrariesLazyQueryHookResult = ReturnType<typeof useGetTreeLibrariesLazyQuery>;
export type GetTreeLibrariesSuspenseQueryHookResult = ReturnType<typeof useGetTreeLibrariesSuspenseQuery>;
export type GetTreeLibrariesQueryResult = Apollo.QueryResult<GetTreeLibrariesQuery, GetTreeLibrariesQueryVariables>;
export const GetTreesDocument = gql`
    query GET_TREES($filters: TreesFiltersInput) {
  trees(filters: $filters) {
    list {
      id
      label
      libraries {
        library {
          id
          label
          behavior
        }
      }
      behavior
      permissions {
        access_tree
        edit_children
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
export const TreeNodeChildrenDocument = gql`
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination) {
  treeNodeChildren(treeId: $treeId, node: $node, pagination: $pagination) {
    totalCount
    list {
      id
      childrenCount
      record {
        ...RecordIdentity
        active: property(attribute: "active") {
          ... on Value {
            value
          }
        }
      }
      permissions {
        access_tree
        detach
        edit_children
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
export function useGetUserDataQuery(baseOptions: Apollo.QueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables> & ({ variables: GetUserDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserDataQuery, GetUserDataQueryVariables>(GetUserDataDocument, options);
      }
export function useGetUserDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserDataQuery, GetUserDataQueryVariables>(GetUserDataDocument, options);
        }
// @ts-ignore
export function useGetUserDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserDataQuery, GetUserDataQueryVariables>;
export function useGetUserDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserDataQuery | undefined, GetUserDataQueryVariables>;
export function useGetUserDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserDataQuery, GetUserDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserDataQuery, GetUserDataQueryVariables>(GetUserDataDocument, options);
        }
export type GetUserDataQueryHookResult = ReturnType<typeof useGetUserDataQuery>;
export type GetUserDataLazyQueryHookResult = ReturnType<typeof useGetUserDataLazyQuery>;
export type GetUserDataSuspenseQueryHookResult = ReturnType<typeof useGetUserDataSuspenseQuery>;
export type GetUserDataQueryResult = Apollo.QueryResult<GetUserDataQuery, GetUserDataQueryVariables>;
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
    role {
      type
      detail
    }
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
export const TreeEventsDocument = gql`
    subscription TREE_EVENTS($filters: TreeEventFiltersInput) {
  treeEvent(filters: $filters) {
    type
    treeId
    element {
      id
      childrenCount
      record {
        ...RecordIdentity
      }
      permissions {
        access_tree
        detach
        edit_children
      }
    }
    parentNode {
      id
    }
    parentNodeBefore {
      id
    }
  }
}
    ${RecordIdentityFragmentDoc}`;

/**
 * __useTreeEventsSubscription__
 *
 * To run a query within a React component, call `useTreeEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTreeEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTreeEventsSubscription({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useTreeEventsSubscription(baseOptions?: Apollo.SubscriptionHookOptions<TreeEventsSubscription, TreeEventsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<TreeEventsSubscription, TreeEventsSubscriptionVariables>(TreeEventsDocument, options);
      }
export type TreeEventsSubscriptionHookResult = ReturnType<typeof useTreeEventsSubscription>;
export type TreeEventsSubscriptionResult = Apollo.SubscriptionResult<TreeEventsSubscription>;