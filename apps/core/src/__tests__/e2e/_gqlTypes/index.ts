import {IPreviewScalar} from '@leav/utils'
import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
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

export type AttributeDependentValueInput = {
  attributeId: Scalars['ID']['input'];
  nodeId?: InputMaybe<Scalars['ID']['input']>;
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
  /**  only for link or standard attribute  */
  smart_filter?: InputMaybe<SmartFilterConfInput>;
  /**  only for tree attribute  */
  tree_selection_conf?: InputMaybe<TreeSelectionConfInput>;
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

export enum AutomationRuleActions {
  condition = 'condition',
  jexlExpression = 'jexlExpression',
  modifyAttribute = 'modifyAttribute',
  notification = 'notification'
}

export enum AutomationRuleEventAction {
  RECORD_INIT = 'RECORD_INIT',
  VALUE_DELETE = 'VALUE_DELETE',
  VALUE_SAVE = 'VALUE_SAVE'
}

export enum AutomationRuleJsonSchemaFormType {
  creation = 'creation',
  edition = 'edition'
}

export type AutomationRulePipelineInput = {
  steps: Array<AutomationRulePipelineStepInput>;
};

export type AutomationRulePipelineStepInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  params: Scalars['JSON']['input'];
  type: AutomationRuleActions;
};

export enum AutomationRuleSortableFields {
  active = 'active',
  id = 'id'
}

export type AutomationRuleTriggerInput = {
  eventAction: AutomationRuleEventAction;
  eventTopic?: InputMaybe<EventTopicInput>;
  synchronous: Scalars['Boolean']['input'];
};

export type AutomationRulesFiltersInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  trigger?: InputMaybe<PartialAutomationRuleTriggerInput>;
  version?: InputMaybe<Scalars['String']['input']>;
};

export type AutomationRulesSortInput = {
  field: AutomationRuleSortableFields;
  order?: InputMaybe<SortOrder>;
};

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

export type CreateAutomationRuleInput = {
  active: Scalars['Boolean']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  pipeline: AutomationRulePipelineInput;
  trigger: AutomationRuleTriggerInput;
  version?: InputMaybe<Scalars['String']['input']>;
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

export enum EventAction {
  API_KEY_DELETE = 'API_KEY_DELETE',
  API_KEY_SAVE = 'API_KEY_SAVE',
  APP_DELETE = 'APP_DELETE',
  APP_SAVE = 'APP_SAVE',
  ATTRIBUTE_DELETE = 'ATTRIBUTE_DELETE',
  ATTRIBUTE_SAVE = 'ATTRIBUTE_SAVE',
  AUTOMATION_CHAIN_DEPTH_EXCEEDED = 'AUTOMATION_CHAIN_DEPTH_EXCEEDED',
  AUTOMATION_PIPELINE_FAILURE = 'AUTOMATION_PIPELINE_FAILURE',
  AUTOMATION_PIPELINE_SUCCESS = 'AUTOMATION_PIPELINE_SUCCESS',
  AUTOMATION_RULE_CREATE = 'AUTOMATION_RULE_CREATE',
  AUTOMATION_RULE_DELETE = 'AUTOMATION_RULE_DELETE',
  AUTOMATION_RULE_UPDATE = 'AUTOMATION_RULE_UPDATE',
  CONFIG_IMPORT_END = 'CONFIG_IMPORT_END',
  CONFIG_IMPORT_START = 'CONFIG_IMPORT_START',
  DATA_IMPORT_END = 'DATA_IMPORT_END',
  DATA_IMPORT_START = 'DATA_IMPORT_START',
  DTO_IMPORT_ERROR = 'DTO_IMPORT_ERROR',
  DTO_IMPORT_SUCCESS = 'DTO_IMPORT_SUCCESS',
  EXPORT_END = 'EXPORT_END',
  EXPORT_START = 'EXPORT_START',
  GLOBAL_SETTINGS_SAVE = 'GLOBAL_SETTINGS_SAVE',
  LIBRARY_DELETE = 'LIBRARY_DELETE',
  LIBRARY_PURGE = 'LIBRARY_PURGE',
  LIBRARY_SAVE = 'LIBRARY_SAVE',
  PERMISSION_SAVE = 'PERMISSION_SAVE',
  PLANNING_RECONDUCTION_END = 'PLANNING_RECONDUCTION_END',
  PLANNING_RECONDUCTION_START = 'PLANNING_RECONDUCTION_START',
  RECORD_DELETE = 'RECORD_DELETE',
  RECORD_INIT = 'RECORD_INIT',
  RECORD_SAVE = 'RECORD_SAVE',
  SDO_EXPORT_ERROR = 'SDO_EXPORT_ERROR',
  SDO_EXPORT_SUCCESS = 'SDO_EXPORT_SUCCESS',
  SDO_IMPORT_ERROR = 'SDO_IMPORT_ERROR',
  SDO_IMPORT_SUCCESS = 'SDO_IMPORT_SUCCESS',
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

export type EventTopicInput = {
  apiKey?: InputMaybe<Scalars['String']['input']>;
  application?: InputMaybe<Scalars['String']['input']>;
  attribute?: InputMaybe<Scalars['String']['input']>;
  automationRule?: InputMaybe<Scalars['String']['input']>;
  filename?: InputMaybe<Scalars['String']['input']>;
  library?: InputMaybe<Scalars['String']['input']>;
  permission?: InputMaybe<EventTopicPermissionInput>;
  profile?: InputMaybe<Scalars['String']['input']>;
  record?: InputMaybe<EventTopicRecordInput>;
  tree?: InputMaybe<Scalars['String']['input']>;
};

export type EventTopicPermissionInput = {
  applyTo?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};

export type EventTopicRecordInput = {
  id: Scalars['String']['input'];
  libraryId: Scalars['String']['input'];
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
  AUTOMATION_CHAIN_DEPTH_EXCEEDED = 'AUTOMATION_CHAIN_DEPTH_EXCEEDED',
  AUTOMATION_PIPELINE_FAILURE = 'AUTOMATION_PIPELINE_FAILURE',
  AUTOMATION_PIPELINE_SUCCESS = 'AUTOMATION_PIPELINE_SUCCESS',
  AUTOMATION_RULE_CREATE = 'AUTOMATION_RULE_CREATE',
  AUTOMATION_RULE_DELETE = 'AUTOMATION_RULE_DELETE',
  AUTOMATION_RULE_UPDATE = 'AUTOMATION_RULE_UPDATE',
  CONFIG_IMPORT_END = 'CONFIG_IMPORT_END',
  CONFIG_IMPORT_START = 'CONFIG_IMPORT_START',
  DATA_IMPORT_END = 'DATA_IMPORT_END',
  DATA_IMPORT_START = 'DATA_IMPORT_START',
  DTO_IMPORT_ERROR = 'DTO_IMPORT_ERROR',
  DTO_IMPORT_SUCCESS = 'DTO_IMPORT_SUCCESS',
  DTO_LOG_ERROR = 'DTO_LOG_ERROR',
  DTO_LOG_IMPORT_RECORD = 'DTO_LOG_IMPORT_RECORD',
  EXPORT_END = 'EXPORT_END',
  EXPORT_START = 'EXPORT_START',
  GLOBAL_SETTINGS_SAVE = 'GLOBAL_SETTINGS_SAVE',
  LIBRARY_DELETE = 'LIBRARY_DELETE',
  LIBRARY_PURGE = 'LIBRARY_PURGE',
  LIBRARY_SAVE = 'LIBRARY_SAVE',
  PERMISSION_SAVE = 'PERMISSION_SAVE',
  PLANNING_RECONDUCTION_END = 'PLANNING_RECONDUCTION_END',
  PLANNING_RECONDUCTION_START = 'PLANNING_RECONDUCTION_START',
  RECORD_DELETE = 'RECORD_DELETE',
  RECORD_INIT = 'RECORD_INIT',
  RECORD_SAVE = 'RECORD_SAVE',
  SDO_EXPORT_ERROR = 'SDO_EXPORT_ERROR',
  SDO_EXPORT_SUCCESS = 'SDO_EXPORT_SUCCESS',
  SDO_IMPORT_ERROR = 'SDO_IMPORT_ERROR',
  SDO_IMPORT_SUCCESS = 'SDO_IMPORT_SUCCESS',
  SDO_LOG_ERROR = 'SDO_LOG_ERROR',
  SDO_LOG_EXPORT_RECORD = 'SDO_LOG_EXPORT_RECORD',
  SDO_LOG_IMPORT_RECORD = 'SDO_LOG_IMPORT_RECORD',
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
  automationRule?: InputMaybe<Scalars['String']['input']>;
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

export type PartialAutomationRuleTriggerInput = {
  eventAction?: InputMaybe<AutomationRuleEventAction>;
  eventTopic?: InputMaybe<EventTopicInput>;
  synchronous?: InputMaybe<Scalars['Boolean']['input']>;
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
  admin_manage_automation = 'admin_manage_automation',
  admin_manage_global_preferences = 'admin_manage_global_preferences',
  create_record = 'create_record',
  delete_record = 'delete_record',
  detach = 'detach',
  edit_children = 'edit_children',
  edit_record = 'edit_record',
  edit_value = 'edit_value',
  manage_views = 'manage_views',
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

export type RecordNewCommentFilterInput = {
  ignoreOwnEvents?: InputMaybe<Scalars['Boolean']['input']>;
  libraries?: InputMaybe<Array<Scalars['ID']['input']>>;
  records?: InputMaybe<Array<Scalars['ID']['input']>>;
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

export type SaveValueBulkMappingInput = {
  dependenciesFilters?: InputMaybe<Array<InputMaybe<RecordFilterInput>>>;
  values: Array<SaveValueBulkMappingValueInput>;
};

export type SaveValueBulkMappingValueInput = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
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

export enum TreeSelectableNodes {
  all_nodes = 'all_nodes',
  leaves_only = 'leaves_only'
}

export type TreeSelectionConfInput = {
  defaultExpanded?: InputMaybe<Scalars['Boolean']['input']>;
  displayRootNode?: InputMaybe<Scalars['ID']['input']>;
  maxDepth?: InputMaybe<Scalars['Int']['input']>;
  selectableNodes?: InputMaybe<TreeSelectableNodes>;
  showSelectChildrenButton?: InputMaybe<Scalars['Boolean']['input']>;
  showSelectDescendantsButton?: InputMaybe<Scalars['Boolean']['input']>;
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

export type UpdateAutomationRuleInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  pipeline?: InputMaybe<AutomationRulePipelineInput>;
  trigger?: InputMaybe<AutomationRuleTriggerInput>;
  version?: InputMaybe<Scalars['String']['input']>;
};

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
  /**  The whoAmI column should never be included in attributes because is already hard-coded to be present */
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
  /**  The whoAmI column should never be included in attributes because is already hard-coded to be present */
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

export type ViewV2CreateInput = {
  display: ViewV2DisplayInput;
  filters?: InputMaybe<Array<ViewV2FilterInput>>;
  label: Scalars['SystemTranslation']['input'];
  library: Scalars['ID']['input'];
  origin?: InputMaybe<Scalars['String']['input']>;
  shared: Scalars['Boolean']['input'];
  shortcuts?: InputMaybe<Array<ViewV2Shortcut>>;
  sorts?: InputMaybe<Array<ViewV2SortInput>>;
  valuesVersions?: InputMaybe<Array<ViewV2ValuesVersionInput>>;
};

export type ViewV2DisplayAttributeInput = {
  attributeId: Scalars['ID']['input'];
  isGroupBy?: InputMaybe<Scalars['Boolean']['input']>;
  visible: Scalars['Boolean']['input'];
};

export type ViewV2DisplayInput = {
  /**  The whoAmI column should never be included in attributes because is already hard-coded to be present */
  attributes?: InputMaybe<Array<ViewV2DisplayAttributeInput>>;
  settings?: InputMaybe<Scalars['JSONObject']['input']>;
  type: ViewV2Types;
};

export type ViewV2FilterInput = {
  attributes: Array<Scalars['ID']['input']>;
  condition: RecordFilterCondition;
  pinned: Scalars['Boolean']['input'];
  values: Array<InputMaybe<Scalars['String']['input']>>;
  withEmptyValues?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum ViewV2Shortcut {
  catalog = 'catalog',
  display = 'display',
  filters = 'filters',
  sorts = 'sorts'
}

export type ViewV2SortInput = {
  activated: Scalars['Boolean']['input'];
  attributes: Array<Scalars['ID']['input']>;
  order: SortOrder;
};

export enum ViewV2Types {
  cards = 'cards',
  kanban = 'kanban',
  list = 'list',
  timeline = 'timeline'
}

export type ViewV2UpdateInput = {
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  display?: InputMaybe<ViewV2DisplayInput>;
  filters?: InputMaybe<Array<ViewV2FilterInput>>;
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  library?: InputMaybe<Scalars['ID']['input']>;
  origin?: InputMaybe<Scalars['String']['input']>;
  shared?: InputMaybe<Scalars['Boolean']['input']>;
  shortcuts?: InputMaybe<Array<ViewV2Shortcut>>;
  sorts?: InputMaybe<Array<ViewV2SortInput>>;
  valuesVersions?: InputMaybe<Array<ViewV2ValuesVersionInput>>;
};

export type ViewV2ValuesVersionInput = {
  treeId: Scalars['ID']['input'];
  treeNode: Scalars['ID']['input'];
};

export type ViewValuesVersionInput = {
  treeId: Scalars['String']['input'];
  treeNode: Scalars['String']['input'];
};

export type SaveValuePayloadFragment = { id_value?: string | null, payload?: any | null };

export type SaveLinkValuePayloadFragment = { id_value?: string | null, linkPayload?: { id: string } | null };

export type SaveTreeValuePayloadFragment = { id_value?: string | null, treePayload?: { id: string } | null };

export type SaveApiKeyMutationVariables = Exact<{
  apiKey: ApiKeyInput;
}>;


export type SaveApiKeyMutation = { saveApiKey: { id: string, label?: string | null, key?: string | null, expiresAt?: number | null, user?: { id: string } | null, createdBy?: { id: string } | null, modifiedBy?: { id: string } | null } };

export type GetApiKeysQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApiKeysQuery = { apiKeys: { list: Array<{ id: string, label?: string | null, key?: string | null, expiresAt?: number | null, user?: { id: string } | null }> } };

export type DeleteApiKeyMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteApiKeyMutation = { deleteApiKey: { id: string } };

export type SaveAttributeMutationVariables = Exact<{
  attribute?: InputMaybe<AttributeInput>;
}>;


export type SaveAttributeMutation = { saveAttribute: { id: string } };

export type DeleteAttributeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteAttributeMutation = { deleteAttribute: { id: string } };

export type GetLinkAttributeSmartFilterQueryVariables = Exact<{
  filters?: InputMaybe<AttributesFiltersInput>;
}>;


export type GetLinkAttributeSmartFilterQuery = { attributes?: { list: Array<{ smart_filter?: { enable: boolean, through?: { id: string } | null } | null }> } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me?: { id: string } | null };

export type GetAutomationRulesQueryVariables = Exact<{
  filters?: InputMaybe<AutomationRulesFiltersInput>;
}>;


export type GetAutomationRulesQuery = { automationRules: { list: Array<{ id: string, label: string, description?: string | null, version?: string | null, active: boolean, createdAt: number, createdBy: string, modifiedAt: number, modifiedBy?: { id: string } | null, trigger: { synchronous: boolean, eventAction: AutomationRuleEventAction, eventTopic?: { library?: string | null } | null }, pipeline: { steps: Array<{ type: AutomationRuleActions, name?: string | null, params: any }> } }> } };

export type CreateAutomationRuleMutationVariables = Exact<{
  rule: CreateAutomationRuleInput;
}>;


export type CreateAutomationRuleMutation = { createAutomationRule: { id: string, label: string, modifiedAt: number, active: boolean, trigger: { synchronous: boolean, eventAction: AutomationRuleEventAction, eventTopic?: { library?: string | null } | null }, pipeline: { steps: Array<{ type: AutomationRuleActions, name?: string | null, params: any }> } } };

export type UpdateAutomationRuleMutationVariables = Exact<{
  rule: UpdateAutomationRuleInput;
}>;


export type UpdateAutomationRuleMutation = { updateAutomationRule: { id: string, label: string, description?: string | null, active: boolean, modifiedAt: number, trigger: { synchronous: boolean, eventAction: AutomationRuleEventAction, eventTopic?: { library?: string | null } | null }, pipeline: { steps: Array<{ type: AutomationRuleActions, name?: string | null, params: any }> } } };

export type DuplicateAutomationRuleMutationVariables = Exact<{
  ruleId: Scalars['ID']['input'];
  label: Scalars['String']['input'];
}>;


export type DuplicateAutomationRuleMutation = { duplicateAutomationRule: { id: string, label: string, description?: string | null, version?: string | null, active: boolean, trigger: { synchronous: boolean, eventAction: AutomationRuleEventAction, eventTopic?: { library?: string | null } | null }, pipeline: { steps: Array<{ type: AutomationRuleActions, name?: string | null, params: any }> } } };

export type DeleteAutomationRuleMutationVariables = Exact<{
  ruleId: Scalars['ID']['input'];
}>;


export type DeleteAutomationRuleMutation = { deleteAutomationRule: { id: string } };

export type SetAutomationRulesActiveMutationVariables = Exact<{
  ruleIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  active: Scalars['Boolean']['input'];
}>;


export type SetAutomationRulesActiveMutation = { setAutomationRulesActive: Array<{ id: string, active: boolean }> };

export type DeleteAutomationRulesMutationVariables = Exact<{
  ruleIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type DeleteAutomationRulesMutation = { deleteAutomationRules: Array<{ id: string }> };

export type GetAutomationRuleFormQueryVariables = Exact<{
  formType: AutomationRuleJsonSchemaFormType;
}>;


export type GetAutomationRuleFormQuery = { automationRuleForm: { jsonSchema: any, uiSchema: any } };

export type PostDiscussionCommentMutationVariables = Exact<{
  comment?: InputMaybe<DiscussionCommentInput>;
}>;


export type PostDiscussionCommentMutation = { postDiscussionComment: { id: string } };

export type ExportQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  profile?: InputMaybe<Scalars['String']['input']>;
}>;


export type ExportQuery = { export: string };

export type SaveGlobalSettingsMutationVariables = Exact<{
  settings: GlobalSettingsInput;
}>;


export type SaveGlobalSettingsMutation = { saveGlobalSettings: { settings?: any | null } };

export type GetRecordsLinkValuesPropertyQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
  retrieveInactive?: InputMaybe<Scalars['Boolean']['input']>;
  attribute: Scalars['ID']['input'];
}>;


export type GetRecordsLinkValuesPropertyQuery = { records: { list: Array<{ id: string, active: boolean, whoAmI: { library: { id: string } }, property: Array<
        | { id_value?: string | null, linkPayload?: { id: string } | null }
        | { id_value?: string | null }
      > }> } };

export type SaveLibraryMutationVariables = Exact<{
  library?: InputMaybe<LibraryInput>;
}>;


export type SaveLibraryMutation = { saveLibrary: { id: string } };

export type DeleteLibraryMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
}>;


export type DeleteLibraryMutation = { deleteLibrary: { id: string } };

export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


export type NotificationsQuery = { notifications: { totalCount: number, list: Array<{ id: string, date: number, level: NotificationLevel, title: string, message: string, taskId?: string | null, relatedEntities?: Array<{ url: string, label: string }> | null, attachments?: Array<{ url: string, label: string }> | null }> } };

export type SavePermissionMutationVariables = Exact<{
  permission: PermissionInput;
}>;


export type SavePermissionMutation = { savePermission: { type: PermissionTypes } };

export type GetRecordQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordId: Scalars['String']['input'];
}>;


export type GetRecordQuery = { records: { list: Array<{ id: string, modified_at: number }> } };

export type GetRecordWithSystemPropertiesQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordId: Scalars['String']['input'];
}>;


export type GetRecordWithSystemPropertiesQuery = { records: { list: Array<{ id: string, active: boolean, uuid: string, created_at: number, modified_at: number, created_by?: { id: string } | null, modified_by?: { id: string } | null }> } };

export type CreateRecordMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  data?: InputMaybe<CreateRecordDataInput>;
  skipActivate?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CreateRecordMutation = { createRecord: { valuesErrors?: Array<{ attribute?: string | null, input?: string | null, message: string, type: string }> | null, record?: { id: string, uuid: string } | null } };

export type DeleteRecordMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  library?: InputMaybe<Scalars['ID']['input']>;
}>;


export type DeleteRecordMutation = { deleteRecord: { id: string } };

export type ActivateNewRecordMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
}>;


export type ActivateNewRecordMutation = { activateNewRecord: { record?: { id: string } | null } };

export type DeactivateRecordsMutationVariables = Exact<{
  libraryId: Scalars['String']['input'];
  recordsIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  filters?: InputMaybe<Array<RecordFilterInput> | RecordFilterInput>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
}>;


export type DeactivateRecordsMutation = { deactivateRecords: Array<{ id: string }> };

export type SearchRecordsQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
  retrieveInactive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type SearchRecordsQuery = { records: { totalCount?: number | null, list: Array<{ id: string, active: boolean }> } };

export type PurgeInactiveRecordsMutationVariables = Exact<{
  libraryId: Scalars['String']['input'];
}>;


export type PurgeInactiveRecordsMutation = { purgeInactiveRecords: Array<{ id: string }> };

export type GetRecordByUuidQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordUUID: Scalars['String']['input'];
  retrieveInactive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetRecordByUuidQuery = { records: { list: Array<{ id: string, uuid: string, active: boolean, created_at: number, modified_at: number, created_by: Array<{ payload?: { id: string } | null }>, modified_by: Array<{ payload?: { id: string } | null }>, whoAmI: { label?: string | null } }> } };

export type SaveTreeMutationVariables = Exact<{
  tree: TreeInput;
}>;


export type SaveTreeMutation = { saveTree: { id: string } };

export type TreeAddElementMutationVariables = Exact<{
  treeId: Scalars['ID']['input'];
  element: TreeElementInput;
  parent?: InputMaybe<Scalars['ID']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TreeAddElementMutation = { treeAddElement: { id: string } };

export type DeleteTreeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTreeMutation = { deleteTree: { id: string } };

export type SaveValueBatchMutationVariables = Exact<{
  library?: InputMaybe<Scalars['ID']['input']>;
  recordId?: InputMaybe<Scalars['ID']['input']>;
  values?: InputMaybe<Array<InputMaybe<ValueBatchInput>> | InputMaybe<ValueBatchInput>>;
  deleteEmpty?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type SaveValueBatchMutation = { saveValueBatch: { errors?: Array<{ attribute?: string | null, input?: string | null, message: string, type: string }> | null, values?: Array<
      | { id_value?: string | null, linkPayload?: { id: string } | null }
      | { id_value?: string | null, treePayload?: { id: string } | null }
      | { payload?: any | null, id_value?: string | null }
    > | null } };

export type SaveValueMutationVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  attributeId: Scalars['ID']['input'];
  value: ValueInput;
  recordId: Scalars['ID']['input'];
}>;


export type SaveValueMutation = { saveValue: Array<
    | { id_value?: string | null, linkPayload?: { id: string } | null }
    | { id_value?: string | null, treePayload?: { id: string } | null }
    | { payload?: any | null, id_value?: string | null }
  > };

export type DeleteValueMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
  attribute: Scalars['ID']['input'];
  value?: InputMaybe<ValueInput>;
}>;


export type DeleteValueMutation = { deleteValue: Array<
    | { id_value?: string | null, linkPayload?: { id: string } | null }
    | { id_value?: string | null, treePayload?: { id: string } | null }
    | { payload?: any | null, id_value?: string | null }
  > };

export type GetRecordByIdStandardValuesPropertyQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordId: Scalars['String']['input'];
  attributeId: Scalars['ID']['input'];
}>;


export type GetRecordByIdStandardValuesPropertyQuery = { records: { list: Array<{ id: string, active: boolean, whoAmI: { library: { id: string } }, property: Array<{ id_value?: string | null, payload?: any | null }> }> } };

export type GetRecordByIdLinkValuesPropertyQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordId: Scalars['String']['input'];
  attributeId: Scalars['ID']['input'];
}>;


export type GetRecordByIdLinkValuesPropertyQuery = { records: { list: Array<{ id: string, active: boolean, whoAmI: { library: { id: string } }, property: Array<{ id_value?: string | null, payload?: { id: string, library: { id: string } } | null }> }> } };

export type ListDistinctValuesQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  attribute: Scalars['ID']['input'];
  recordFilters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
}>;


export type ListDistinctValuesQuery = { listDistinctValues?: Array<
    | { count: number }
    | { count: number, treeNode?: { id: string } | null }
  > | null };

export type SaveValueBulkMutationVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  attributeId: Scalars['ID']['input'];
  recordsFilters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  mapping: Array<SaveValueBulkMappingInput> | SaveValueBulkMappingInput;
}>;


export type SaveValueBulkMutation = { saveValueBulk: string };

export type GetRecordByIdTreeValuesPropertyQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordId: Scalars['String']['input'];
  attributeId: Scalars['ID']['input'];
}>;


export type GetRecordByIdTreeValuesPropertyQuery = { records: { list: Array<{ id: string, active: boolean, whoAmI: { library: { id: string } }, property: Array<{ id_value?: string | null, payload?: { id: string, record: { id: string, library: { id: string } } } | null }> }> } };

export type CreateViewV2MutationVariables = Exact<{
  view: ViewV2CreateInput;
}>;


export type CreateViewV2Mutation = { createViewV2: { id: string } };

export type GetViewsV2QueryVariables = Exact<{
  library: Scalars['ID']['input'];
  origin?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetViewsV2Query = { viewsV2: { totalCount: number, list: Array<{ id: string, modified_at: number, created_at: number, shared: boolean, label: any, origin?: string | null, shortcuts: Array<ViewV2Shortcut>, created_by: { id: string, whoAmI: { id: string, label?: string | null } }, display: { type: ViewV2Types, settings?: any | null, attributes: Array<{ visible: boolean, attribute: { id: string } }> }, filters: Array<{ pinned: boolean, values: Array<string | null>, condition: RecordFilterCondition, withEmptyValues?: boolean | null, attributes: Array<{ id: string }> }>, sorts: Array<{ activated: boolean, order: SortOrder, attributes: Array<{ id: string }> }> }> } };

export type GetViewV2QueryVariables = Exact<{
  viewId: Scalars['ID']['input'];
}>;


export type GetViewV2Query = { viewV2: { id: string, created_by: { id: string, whoAmI: { id: string, label?: string | null } } } };

export type UpdateViewV2MutationVariables = Exact<{
  view: ViewV2UpdateInput;
}>;


export type UpdateViewV2Mutation = { updateViewV2: { id: string, origin?: string | null, display: { type: ViewV2Types, settings?: any | null } } };

export type DeleteViewV2MutationVariables = Exact<{
  viewId: Scalars['ID']['input'];
}>;


export type DeleteViewV2Mutation = { deleteViewV2: { id: string } };

export const SaveValuePayloadFragmentDoc = gql`
    fragment SaveValuePayload on Value {
  id_value
  payload
}
    `;
export const SaveLinkValuePayloadFragmentDoc = gql`
    fragment SaveLinkValuePayload on LinkValue {
  id_value
  linkPayload: payload {
    id
  }
}
    `;
export const SaveTreeValuePayloadFragmentDoc = gql`
    fragment SaveTreeValuePayload on TreeValue {
  id_value
  treePayload: payload {
    id
  }
}
    `;
export const SaveApiKeyDocument = gql`
    mutation SaveApiKey($apiKey: ApiKeyInput!) {
  saveApiKey(apiKey: $apiKey) {
    id
    label
    key
    expiresAt
    user {
      id
    }
    createdBy {
      id
    }
    modifiedBy {
      id
    }
  }
}
    `;
export const GetApiKeysDocument = gql`
    query GetApiKeys {
  apiKeys {
    list {
      id
      label
      key
      expiresAt
      user {
        id
      }
    }
  }
}
    `;
export const DeleteApiKeyDocument = gql`
    mutation DeleteApiKey($id: String!) {
  deleteApiKey(id: $id) {
    id
  }
}
    `;
export const SaveAttributeDocument = gql`
    mutation SaveAttribute($attribute: AttributeInput) {
  saveAttribute(attribute: $attribute) {
    id
  }
}
    `;
export const DeleteAttributeDocument = gql`
    mutation DeleteAttribute($id: ID!) {
  deleteAttribute(id: $id) {
    id
  }
}
    `;
export const GetLinkAttributeSmartFilterDocument = gql`
    query getLinkAttributeSmartFilter($filters: AttributesFiltersInput) {
  attributes(filters: $filters) {
    list {
      ... on LinkAttribute {
        smart_filter {
          enable
          through {
            id
          }
        }
      }
    }
  }
}
    `;
export const MeDocument = gql`
    query Me {
  me {
    id
  }
}
    `;
export const GetAutomationRulesDocument = gql`
    query GetAutomationRules($filters: AutomationRulesFiltersInput) {
  automationRules(filters: $filters) {
    list {
      id
      label
      description
      version
      active
      createdAt
      createdBy
      modifiedAt
      modifiedBy {
        id
      }
      trigger {
        synchronous
        eventAction
        eventTopic {
          library
        }
      }
      pipeline {
        steps {
          type
          name
          params
        }
      }
    }
  }
}
    `;
export const CreateAutomationRuleDocument = gql`
    mutation CreateAutomationRule($rule: CreateAutomationRuleInput!) {
  createAutomationRule(rule: $rule) {
    id
    label
    modifiedAt
    active
    trigger {
      synchronous
      eventAction
      eventTopic {
        library
      }
    }
    pipeline {
      steps {
        type
        name
        params
      }
    }
  }
}
    `;
export const UpdateAutomationRuleDocument = gql`
    mutation UpdateAutomationRule($rule: UpdateAutomationRuleInput!) {
  updateAutomationRule(rule: $rule) {
    id
    label
    description
    active
    modifiedAt
    trigger {
      synchronous
      eventAction
      eventTopic {
        library
      }
    }
    pipeline {
      steps {
        type
        name
        params
      }
    }
  }
}
    `;
export const DuplicateAutomationRuleDocument = gql`
    mutation DuplicateAutomationRule($ruleId: ID!, $label: String!) {
  duplicateAutomationRule(ruleId: $ruleId, label: $label) {
    id
    label
    description
    version
    active
    trigger {
      synchronous
      eventAction
      eventTopic {
        library
      }
    }
    pipeline {
      steps {
        type
        name
        params
      }
    }
  }
}
    `;
export const DeleteAutomationRuleDocument = gql`
    mutation DeleteAutomationRule($ruleId: ID!) {
  deleteAutomationRule(ruleId: $ruleId) {
    id
  }
}
    `;
export const SetAutomationRulesActiveDocument = gql`
    mutation SetAutomationRulesActive($ruleIds: [ID!]!, $active: Boolean!) {
  setAutomationRulesActive(ruleIds: $ruleIds, active: $active) {
    id
    active
  }
}
    `;
export const DeleteAutomationRulesDocument = gql`
    mutation DeleteAutomationRules($ruleIds: [ID!]!) {
  deleteAutomationRules(ruleIds: $ruleIds) {
    id
  }
}
    `;
export const GetAutomationRuleFormDocument = gql`
    query GetAutomationRuleForm($formType: AutomationRuleJsonSchemaFormType!) {
  automationRuleForm(formType: $formType) {
    jsonSchema
    uiSchema
  }
}
    `;
export const PostDiscussionCommentDocument = gql`
    mutation PostDiscussionComment($comment: DiscussionCommentInput) {
  postDiscussionComment(comment: $comment) {
    id
  }
}
    `;
export const ExportDocument = gql`
    query Export($library: ID!, $filters: [RecordFilterInput], $searchQuery: String, $profile: String) {
  export(
    library: $library
    filters: $filters
    searchQuery: $searchQuery
    profile: $profile
  )
}
    `;
export const SaveGlobalSettingsDocument = gql`
    mutation SaveGlobalSettings($settings: GlobalSettingsInput!) {
  saveGlobalSettings(settings: $settings) {
    settings
  }
}
    `;
export const GetRecordsLinkValuesPropertyDocument = gql`
    query GetRecordsLinkValuesProperty($library: ID!, $filters: [RecordFilterInput], $retrieveInactive: Boolean, $attribute: ID!) {
  records(
    library: $library
    filters: $filters
    retrieveInactive: $retrieveInactive
  ) {
    list {
      id
      whoAmI {
        library {
          id
        }
      }
      active
      property(attribute: $attribute) {
        id_value
        ... on LinkValue {
          linkPayload: payload {
            id
          }
        }
      }
    }
  }
}
    `;
export const SaveLibraryDocument = gql`
    mutation SaveLibrary($library: LibraryInput) {
  saveLibrary(library: $library) {
    id
  }
}
    `;
export const DeleteLibraryDocument = gql`
    mutation DeleteLibrary($id: ID) {
  deleteLibrary(id: $id) {
    id
  }
}
    `;
export const NotificationsDocument = gql`
    query Notifications {
  notifications {
    totalCount
    list {
      id
      date
      level
      title
      message
      relatedEntities {
        url
        label
      }
      attachments {
        url
        label
      }
      taskId
    }
  }
}
    `;
export const SavePermissionDocument = gql`
    mutation SavePermission($permission: PermissionInput!) {
  savePermission(permission: $permission) {
    type
  }
}
    `;
export const GetRecordDocument = gql`
    query GetRecord($libraryId: ID!, $recordId: String!) {
  records(
    library: $libraryId
    filters: [{field: "id", condition: EQUAL, value: $recordId}]
  ) {
    list {
      id
      modified_at
    }
  }
}
    `;
export const GetRecordWithSystemPropertiesDocument = gql`
    query GetRecordWithSystemProperties($libraryId: ID!, $recordId: String!) {
  records(
    library: $libraryId
    filters: [{field: "id", condition: EQUAL, value: $recordId}]
  ) {
    list {
      id
      active
      uuid
      created_at
      created_by {
        id
      }
      modified_at
      modified_by {
        id
      }
    }
  }
}
    `;
export const CreateRecordDocument = gql`
    mutation CreateRecord($library: ID!, $data: CreateRecordDataInput, $skipActivate: Boolean) {
  createRecord(library: $library, data: $data, skipActivate: $skipActivate) {
    valuesErrors {
      attribute
      input
      message
      type
    }
    record {
      id
      uuid
    }
  }
}
    `;
export const DeleteRecordDocument = gql`
    mutation DeleteRecord($id: ID, $library: ID) {
  deleteRecord(id: $id, library: $library) {
    id
  }
}
    `;
export const ActivateNewRecordDocument = gql`
    mutation ActivateNewRecord($library: ID!, $recordId: ID!) {
  activateNewRecord(library: $library, recordId: $recordId) {
    record {
      id
    }
  }
}
    `;
export const DeactivateRecordsDocument = gql`
    mutation DeactivateRecords($libraryId: String!, $recordsIds: [String!], $filters: [RecordFilterInput!], $searchQuery: String) {
  deactivateRecords(
    libraryId: $libraryId
    recordsIds: $recordsIds
    filters: $filters
    searchQuery: $searchQuery
  ) {
    id
  }
}
    `;
export const SearchRecordsDocument = gql`
    query SearchRecords($libraryId: ID!, $searchQuery: String, $filters: [RecordFilterInput], $retrieveInactive: Boolean) {
  records(
    library: $libraryId
    searchQuery: $searchQuery
    filters: $filters
    retrieveInactive: $retrieveInactive
  ) {
    totalCount
    list {
      id
      active
    }
  }
}
    `;
export const PurgeInactiveRecordsDocument = gql`
    mutation PurgeInactiveRecords($libraryId: String!) {
  purgeInactiveRecords(libraryId: $libraryId) {
    id
  }
}
    `;
export const GetRecordByUuidDocument = gql`
    query GetRecordByUUID($libraryId: ID!, $recordUUID: String!, $retrieveInactive: Boolean) {
  records(
    library: $libraryId
    filters: [{field: "uuid", condition: EQUAL, value: $recordUUID}]
    retrieveInactive: $retrieveInactive
  ) {
    list {
      id
      uuid
      active
      created_by: property(attribute: "created_by") {
        ... on LinkValue {
          payload {
            id
          }
        }
      }
      modified_by: property(attribute: "modified_by") {
        ... on LinkValue {
          payload {
            id
          }
        }
      }
      whoAmI {
        label
      }
      created_at
      modified_at
    }
  }
}
    `;
export const SaveTreeDocument = gql`
    mutation SaveTree($tree: TreeInput!) {
  saveTree(tree: $tree) {
    id
  }
}
    `;
export const TreeAddElementDocument = gql`
    mutation TreeAddElement($treeId: ID!, $element: TreeElementInput!, $parent: ID, $order: Int) {
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
export const DeleteTreeDocument = gql`
    mutation DeleteTree($id: ID!) {
  deleteTree(id: $id) {
    id
  }
}
    `;
export const SaveValueBatchDocument = gql`
    mutation SaveValueBatch($library: ID, $recordId: ID, $values: [ValueBatchInput], $deleteEmpty: Boolean) {
  saveValueBatch(
    library: $library
    recordId: $recordId
    values: $values
    deleteEmpty: $deleteEmpty
  ) {
    errors {
      type
      message
      input
      attribute
    }
    values {
      id_value
      ...SaveValuePayload
      ...SaveLinkValuePayload
      ...SaveTreeValuePayload
    }
  }
}
    ${SaveValuePayloadFragmentDoc}
${SaveLinkValuePayloadFragmentDoc}
${SaveTreeValuePayloadFragmentDoc}`;
export const SaveValueDocument = gql`
    mutation SaveValue($libraryId: ID!, $attributeId: ID!, $value: ValueInput!, $recordId: ID!) {
  saveValue(
    library: $libraryId
    attribute: $attributeId
    value: $value
    recordId: $recordId
  ) {
    id_value
    ...SaveValuePayload
    ...SaveLinkValuePayload
    ...SaveTreeValuePayload
  }
}
    ${SaveValuePayloadFragmentDoc}
${SaveLinkValuePayloadFragmentDoc}
${SaveTreeValuePayloadFragmentDoc}`;
export const DeleteValueDocument = gql`
    mutation DeleteValue($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput) {
  deleteValue(
    library: $library
    recordId: $recordId
    attribute: $attribute
    value: $value
  ) {
    id_value
    ...SaveValuePayload
    ...SaveLinkValuePayload
    ...SaveTreeValuePayload
  }
}
    ${SaveValuePayloadFragmentDoc}
${SaveLinkValuePayloadFragmentDoc}
${SaveTreeValuePayloadFragmentDoc}`;
export const GetRecordByIdStandardValuesPropertyDocument = gql`
    query GetRecordByIdStandardValuesProperty($libraryId: ID!, $recordId: String!, $attributeId: ID!) {
  records(
    library: $libraryId
    filters: [{field: "id", condition: EQUAL, value: $recordId}]
  ) {
    list {
      id
      whoAmI {
        library {
          id
        }
      }
      active
      property(attribute: $attributeId) {
        ... on Value {
          id_value
          payload
        }
      }
    }
  }
}
    `;
export const GetRecordByIdLinkValuesPropertyDocument = gql`
    query GetRecordByIdLinkValuesProperty($libraryId: ID!, $recordId: String!, $attributeId: ID!) {
  records(
    library: $libraryId
    filters: [{field: "id", condition: EQUAL, value: $recordId}]
  ) {
    list {
      id
      whoAmI {
        library {
          id
        }
      }
      active
      property(attribute: $attributeId) {
        ... on LinkValue {
          id_value
          payload {
            id
            library {
              id
            }
          }
        }
      }
    }
  }
}
    `;
export const ListDistinctValuesDocument = gql`
    query ListDistinctValues($library: ID!, $attribute: ID!, $recordFilters: [RecordFilterInput], $searchQuery: String) {
  listDistinctValues(
    library: $library
    attribute: $attribute
    recordFilters: $recordFilters
    searchQuery: $searchQuery
  ) {
    count
    ... on TreeDistinctValues {
      treeNode: value {
        id
      }
    }
  }
}
    `;
export const SaveValueBulkDocument = gql`
    mutation SaveValueBulk($libraryId: ID!, $attributeId: ID!, $recordsFilters: [RecordFilterInput], $searchQuery: String, $mapping: [SaveValueBulkMappingInput!]!) {
  saveValueBulk(
    libraryId: $libraryId
    attributeId: $attributeId
    recordsFilters: $recordsFilters
    searchQuery: $searchQuery
    mapping: $mapping
  )
}
    `;
export const GetRecordByIdTreeValuesPropertyDocument = gql`
    query GetRecordByIdTreeValuesProperty($libraryId: ID!, $recordId: String!, $attributeId: ID!) {
  records(
    library: $libraryId
    filters: [{field: "id", condition: EQUAL, value: $recordId}]
  ) {
    list {
      id
      whoAmI {
        library {
          id
        }
      }
      active
      property(attribute: $attributeId) {
        ... on TreeValue {
          id_value
          payload {
            id
            record {
              id
              library {
                id
              }
            }
          }
        }
      }
    }
  }
}
    `;
export const CreateViewV2Document = gql`
    mutation CreateViewV2($view: ViewV2CreateInput!) {
  createViewV2(view: $view) {
    id
  }
}
    `;
export const GetViewsV2Document = gql`
    query GetViewsV2($library: ID!, $origin: String) {
  viewsV2(library: $library, origin: $origin) {
    totalCount
    list {
      id
      created_by {
        id
        whoAmI {
          id
          label
        }
      }
      display {
        type
        attributes {
          attribute {
            id
          }
          visible
        }
        settings
      }
      modified_at
      created_at
      shared
      label
      origin
      filters {
        pinned
        attributes {
          id
        }
        values
        condition
        withEmptyValues
      }
      sorts {
        activated
        attributes {
          id
        }
        order
      }
      shortcuts
    }
  }
}
    `;
export const GetViewV2Document = gql`
    query GetViewV2($viewId: ID!) {
  viewV2(viewId: $viewId) {
    id
    created_by {
      id
      whoAmI {
        id
        label
      }
    }
  }
}
    `;
export const UpdateViewV2Document = gql`
    mutation UpdateViewV2($view: ViewV2UpdateInput!) {
  updateViewV2(view: $view) {
    id
    display {
      type
      settings
    }
    origin
  }
}
    `;
export const DeleteViewV2Document = gql`
    mutation DeleteViewV2($viewId: ID!) {
  deleteViewV2(viewId: $viewId) {
    id
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    SaveApiKey(variables: SaveApiKeyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveApiKeyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveApiKeyMutation>({ document: SaveApiKeyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveApiKey', 'mutation', variables);
    },
    GetApiKeys(variables?: GetApiKeysQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetApiKeysQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetApiKeysQuery>({ document: GetApiKeysDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetApiKeys', 'query', variables);
    },
    DeleteApiKey(variables: DeleteApiKeyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteApiKeyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteApiKeyMutation>({ document: DeleteApiKeyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteApiKey', 'mutation', variables);
    },
    SaveAttribute(variables?: SaveAttributeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveAttributeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveAttributeMutation>({ document: SaveAttributeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveAttribute', 'mutation', variables);
    },
    DeleteAttribute(variables: DeleteAttributeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteAttributeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteAttributeMutation>({ document: DeleteAttributeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAttribute', 'mutation', variables);
    },
    getLinkAttributeSmartFilter(variables?: GetLinkAttributeSmartFilterQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLinkAttributeSmartFilterQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLinkAttributeSmartFilterQuery>({ document: GetLinkAttributeSmartFilterDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getLinkAttributeSmartFilter', 'query', variables);
    },
    Me(variables?: MeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeQuery>({ document: MeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Me', 'query', variables);
    },
    GetAutomationRules(variables?: GetAutomationRulesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetAutomationRulesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAutomationRulesQuery>({ document: GetAutomationRulesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAutomationRules', 'query', variables);
    },
    CreateAutomationRule(variables: CreateAutomationRuleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateAutomationRuleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateAutomationRuleMutation>({ document: CreateAutomationRuleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateAutomationRule', 'mutation', variables);
    },
    UpdateAutomationRule(variables: UpdateAutomationRuleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateAutomationRuleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateAutomationRuleMutation>({ document: UpdateAutomationRuleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateAutomationRule', 'mutation', variables);
    },
    DuplicateAutomationRule(variables: DuplicateAutomationRuleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DuplicateAutomationRuleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DuplicateAutomationRuleMutation>({ document: DuplicateAutomationRuleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DuplicateAutomationRule', 'mutation', variables);
    },
    DeleteAutomationRule(variables: DeleteAutomationRuleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteAutomationRuleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteAutomationRuleMutation>({ document: DeleteAutomationRuleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAutomationRule', 'mutation', variables);
    },
    SetAutomationRulesActive(variables: SetAutomationRulesActiveMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetAutomationRulesActiveMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetAutomationRulesActiveMutation>({ document: SetAutomationRulesActiveDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetAutomationRulesActive', 'mutation', variables);
    },
    DeleteAutomationRules(variables: DeleteAutomationRulesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteAutomationRulesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteAutomationRulesMutation>({ document: DeleteAutomationRulesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAutomationRules', 'mutation', variables);
    },
    GetAutomationRuleForm(variables: GetAutomationRuleFormQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetAutomationRuleFormQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAutomationRuleFormQuery>({ document: GetAutomationRuleFormDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAutomationRuleForm', 'query', variables);
    },
    PostDiscussionComment(variables?: PostDiscussionCommentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PostDiscussionCommentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PostDiscussionCommentMutation>({ document: PostDiscussionCommentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'PostDiscussionComment', 'mutation', variables);
    },
    Export(variables: ExportQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ExportQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExportQuery>({ document: ExportDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Export', 'query', variables);
    },
    SaveGlobalSettings(variables: SaveGlobalSettingsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveGlobalSettingsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveGlobalSettingsMutation>({ document: SaveGlobalSettingsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveGlobalSettings', 'mutation', variables);
    },
    GetRecordsLinkValuesProperty(variables: GetRecordsLinkValuesPropertyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRecordsLinkValuesPropertyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordsLinkValuesPropertyQuery>({ document: GetRecordsLinkValuesPropertyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRecordsLinkValuesProperty', 'query', variables);
    },
    SaveLibrary(variables?: SaveLibraryMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveLibraryMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveLibraryMutation>({ document: SaveLibraryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveLibrary', 'mutation', variables);
    },
    DeleteLibrary(variables?: DeleteLibraryMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteLibraryMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteLibraryMutation>({ document: DeleteLibraryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteLibrary', 'mutation', variables);
    },
    Notifications(variables?: NotificationsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<NotificationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<NotificationsQuery>({ document: NotificationsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Notifications', 'query', variables);
    },
    SavePermission(variables: SavePermissionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SavePermissionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SavePermissionMutation>({ document: SavePermissionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SavePermission', 'mutation', variables);
    },
    GetRecord(variables: GetRecordQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRecordQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordQuery>({ document: GetRecordDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRecord', 'query', variables);
    },
    GetRecordWithSystemProperties(variables: GetRecordWithSystemPropertiesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRecordWithSystemPropertiesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordWithSystemPropertiesQuery>({ document: GetRecordWithSystemPropertiesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRecordWithSystemProperties', 'query', variables);
    },
    CreateRecord(variables: CreateRecordMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateRecordMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateRecordMutation>({ document: CreateRecordDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateRecord', 'mutation', variables);
    },
    DeleteRecord(variables?: DeleteRecordMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteRecordMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteRecordMutation>({ document: DeleteRecordDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteRecord', 'mutation', variables);
    },
    ActivateNewRecord(variables: ActivateNewRecordMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ActivateNewRecordMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ActivateNewRecordMutation>({ document: ActivateNewRecordDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ActivateNewRecord', 'mutation', variables);
    },
    DeactivateRecords(variables: DeactivateRecordsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeactivateRecordsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeactivateRecordsMutation>({ document: DeactivateRecordsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeactivateRecords', 'mutation', variables);
    },
    SearchRecords(variables: SearchRecordsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SearchRecordsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SearchRecordsQuery>({ document: SearchRecordsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SearchRecords', 'query', variables);
    },
    PurgeInactiveRecords(variables: PurgeInactiveRecordsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PurgeInactiveRecordsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PurgeInactiveRecordsMutation>({ document: PurgeInactiveRecordsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'PurgeInactiveRecords', 'mutation', variables);
    },
    GetRecordByUUID(variables: GetRecordByUuidQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRecordByUuidQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordByUuidQuery>({ document: GetRecordByUuidDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRecordByUUID', 'query', variables);
    },
    SaveTree(variables: SaveTreeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveTreeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveTreeMutation>({ document: SaveTreeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveTree', 'mutation', variables);
    },
    TreeAddElement(variables: TreeAddElementMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<TreeAddElementMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<TreeAddElementMutation>({ document: TreeAddElementDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'TreeAddElement', 'mutation', variables);
    },
    DeleteTree(variables: DeleteTreeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteTreeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteTreeMutation>({ document: DeleteTreeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteTree', 'mutation', variables);
    },
    SaveValueBatch(variables?: SaveValueBatchMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveValueBatchMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveValueBatchMutation>({ document: SaveValueBatchDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveValueBatch', 'mutation', variables);
    },
    SaveValue(variables: SaveValueMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveValueMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveValueMutation>({ document: SaveValueDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveValue', 'mutation', variables);
    },
    DeleteValue(variables: DeleteValueMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteValueMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteValueMutation>({ document: DeleteValueDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteValue', 'mutation', variables);
    },
    GetRecordByIdStandardValuesProperty(variables: GetRecordByIdStandardValuesPropertyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRecordByIdStandardValuesPropertyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordByIdStandardValuesPropertyQuery>({ document: GetRecordByIdStandardValuesPropertyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRecordByIdStandardValuesProperty', 'query', variables);
    },
    GetRecordByIdLinkValuesProperty(variables: GetRecordByIdLinkValuesPropertyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRecordByIdLinkValuesPropertyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordByIdLinkValuesPropertyQuery>({ document: GetRecordByIdLinkValuesPropertyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRecordByIdLinkValuesProperty', 'query', variables);
    },
    ListDistinctValues(variables: ListDistinctValuesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ListDistinctValuesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListDistinctValuesQuery>({ document: ListDistinctValuesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ListDistinctValues', 'query', variables);
    },
    SaveValueBulk(variables: SaveValueBulkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveValueBulkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveValueBulkMutation>({ document: SaveValueBulkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveValueBulk', 'mutation', variables);
    },
    GetRecordByIdTreeValuesProperty(variables: GetRecordByIdTreeValuesPropertyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRecordByIdTreeValuesPropertyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordByIdTreeValuesPropertyQuery>({ document: GetRecordByIdTreeValuesPropertyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRecordByIdTreeValuesProperty', 'query', variables);
    },
    CreateViewV2(variables: CreateViewV2MutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateViewV2Mutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateViewV2Mutation>({ document: CreateViewV2Document, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateViewV2', 'mutation', variables);
    },
    GetViewsV2(variables: GetViewsV2QueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetViewsV2Query> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetViewsV2Query>({ document: GetViewsV2Document, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetViewsV2', 'query', variables);
    },
    GetViewV2(variables: GetViewV2QueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetViewV2Query> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetViewV2Query>({ document: GetViewV2Document, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetViewV2', 'query', variables);
    },
    UpdateViewV2(variables: UpdateViewV2MutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateViewV2Mutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateViewV2Mutation>({ document: UpdateViewV2Document, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateViewV2', 'mutation', variables);
    },
    DeleteViewV2(variables: DeleteViewV2MutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteViewV2Mutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteViewV2Mutation>({ document: DeleteViewV2Document, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteViewV2', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;