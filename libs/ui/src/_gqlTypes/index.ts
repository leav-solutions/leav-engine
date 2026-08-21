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
  column_split_enabled?: InputMaybe<Scalars['Boolean']['input']>;
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

export type DetailsApplicationFragment = { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } };

export type RecordIdentityFragment = { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } };

export type AttributeDetailsLinkAttributeFragment = { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, description?: any | null, required: boolean, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_library?: { id: string, label?: any | null } | null, smart_filter?: { enable: boolean, through?: { id: string } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null };

export type AttributeDetailsStandardAttributeFragment = { unique?: boolean | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, description?: any | null, required: boolean, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, smart_filter?: { enable: boolean } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null };

export type AttributeDetailsTreeAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, description?: any | null, required: boolean, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_tree?: { id: string, label?: any | null } | null, tree_selection_conf?: { selectableNodes?: TreeSelectableNodes | null, defaultExpanded?: boolean | null, displayRootNode?: string | null, maxDepth?: number | null, showSelectChildrenButton?: boolean | null, showSelectDescendantsButton?: boolean | null } | null, permissions_conf_dependent_values?: { dependenciesTreeAttributes: Array<{ id: string }> } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null };

export type AttributeDetailsFragment =
  | AttributeDetailsLinkAttributeFragment
  | AttributeDetailsStandardAttributeFragment
  | AttributeDetailsTreeAttributeFragment
;

export type AttributesByLibAttributeLinkAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, linked_library?: { id: string } | null };

export type AttributesByLibAttributeStandardAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, embedded_fields?: Array<{ id: string, format?: AttributeFormat | null, label?: any | null } | null> | null };

export type AttributesByLibAttributeTreeAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, linked_tree?: { id: string, label?: any | null, libraries: Array<{ library: { id: string, label?: any | null } }> } | null };

export type AttributesByLibAttributeFragment =
  | AttributesByLibAttributeLinkAttributeFragment
  | AttributesByLibAttributeStandardAttributeFragment
  | AttributesByLibAttributeTreeAttributeFragment
;

export type AttributesByLibLinkAttributeFragment = { linked_library?: { id: string } | null };

export type LibraryLightFragment = { id: string, label?: any | null, icon?: { id: string, whoAmI: { id: string, preview?: IPreviewScalar | null, library: { id: string } } } | null };

export type LibraryDetailsFragment = { id: string, label?: any | null, behavior: LibraryBehavior, system?: boolean | null, fullTextAttributes?: Array<{ id: string, label?: any | null }> | null, attributes?: Array<
    | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_library?: { id: string, behavior: LibraryBehavior } | null }
    | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null }
    | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_tree?: { id: string } | null }
  > | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
      | { id: string, label?: any | null }
      | { id: string, label?: any | null, linked_tree?: { id: string } | null }
    > } | null, recordIdentityConf?: { label?: string | null, subLabel?: string | null, color?: string | null, preview?: string | null, treeColorPreview?: string | null, parentContext?: string | null } | null, permissions?: { admin_library: boolean, access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, previewsSettings?: Array<{ label: any, description?: any | null, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } }> | null };

export type LibraryAttributesLinkAttributeFragment = { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_library?: { id: string, behavior: LibraryBehavior } | null };

export type LibraryAttributesStandardAttributeFragment = { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null };

export type LibraryAttributesTreeAttributeFragment = { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_tree?: { id: string } | null };

export type LibraryAttributesFragment =
  | LibraryAttributesLinkAttributeFragment
  | LibraryAttributesStandardAttributeFragment
  | LibraryAttributesTreeAttributeFragment
;

export type LibraryLinkAttributeDetailsFragment = { linked_library?: { id: string, behavior: LibraryBehavior } | null };

export type LibraryTreeAttributeDetailsFragment = { linked_tree?: { id: string } | null };

export type LibraryPreviewsSettingsFragment = { label: any, description?: any | null, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } };

export type RecordFormElementFragment = { id: string, containerId: string, uiElementType: string, type: FormElementTypes, valueError?: string | null, values?: Array<
    | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
    | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
    | { payload?: any | null, raw_payload?: any | null, value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
  > | null, attribute?:
    | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_library?: { id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null } | null, linkValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
         | null, metadata_fields?: Array<{ id: string }> | null }> | null }
    | { character_limit?: number | null, id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, values_list?:
        | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
        | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
       | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
         | null, metadata_fields?: Array<{ id: string }> | null }> | null }
    | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_tree?: { id: string, label?: any | null } | null, tree_selection_conf?: { selectableNodes?: TreeSelectableNodes | null, defaultExpanded?: boolean | null, displayRootNode?: string | null, maxDepth?: number | null, showSelectChildrenButton?: boolean | null, showSelectDescendantsButton?: boolean | null } | null, treeValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
         | null, metadata_fields?: Array<{ id: string }> | null }> | null }
   | null, settings: Array<{ key: string, value: any }>, joinLibraryContext?: { mandatoryAttribute:
      | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_library?: { id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null } | null, linkValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
            | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
            | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
           | null, metadata_fields?: Array<{ id: string }> | null }> | null }
      | { character_limit?: number | null, id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, values_list?:
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
         | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
            | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
            | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
           | null, metadata_fields?: Array<{ id: string }> | null }> | null }
      | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_tree?: { id: string, label?: any | null } | null, tree_selection_conf?: { selectableNodes?: TreeSelectableNodes | null, defaultExpanded?: boolean | null, displayRootNode?: string | null, maxDepth?: number | null, showSelectChildrenButton?: boolean | null, showSelectDescendantsButton?: boolean | null } | null, treeValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
            | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
            | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
           | null, metadata_fields?: Array<{ id: string }> | null }> | null }
     } | null };

export type ValueDetailsLinkValueFragment = { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null };

export type ValueDetailsTreeValueFragment = { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null };

export type ValueDetailsValueFragment = { payload?: any | null, raw_payload?: any | null, value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null };

export type ValueDetailsFragment =
  | ValueDetailsLinkValueFragment
  | ValueDetailsTreeValueFragment
  | ValueDetailsValueFragment
;

export type ValuesVersionDetailsFragment = { treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null };

export type RecordFormAttributeLinkAttributeFragment = { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_library?: { id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null } | null, linkValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
      | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
      | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
     | null, metadata_fields?: Array<{ id: string }> | null }> | null };

export type RecordFormAttributeStandardAttributeFragment = { character_limit?: number | null, id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, values_list?:
    | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
    | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
   | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
      | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
      | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
     | null, metadata_fields?: Array<{ id: string }> | null }> | null };

export type RecordFormAttributeTreeAttributeFragment = { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_tree?: { id: string, label?: any | null } | null, tree_selection_conf?: { selectableNodes?: TreeSelectableNodes | null, defaultExpanded?: boolean | null, displayRootNode?: string | null, maxDepth?: number | null, showSelectChildrenButton?: boolean | null, showSelectDescendantsButton?: boolean | null } | null, treeValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
      | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
      | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
     | null, metadata_fields?: Array<{ id: string }> | null }> | null };

export type RecordFormAttributeFragment =
  | RecordFormAttributeLinkAttributeFragment
  | RecordFormAttributeStandardAttributeFragment
  | RecordFormAttributeTreeAttributeFragment
;

export type StandardValuesListFragmentStandardDateRangeValuesListConfFragment = { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null };

export type StandardValuesListFragmentStandardStringValuesListConfFragment = { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null };

export type StandardValuesListFragmentFragment =
  | StandardValuesListFragmentStandardDateRangeValuesListConfFragment
  | StandardValuesListFragmentStandardStringValuesListConfFragment
;

export type JoinLibraryContextFragment = { mandatoryAttribute:
    | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_library?: { id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null } | null, linkValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
         | null, metadata_fields?: Array<{ id: string }> | null }> | null }
    | { character_limit?: number | null, id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, values_list?:
        | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
        | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
       | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
         | null, metadata_fields?: Array<{ id: string }> | null }> | null }
    | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_tree?: { id: string, label?: any | null } | null, tree_selection_conf?: { selectableNodes?: TreeSelectableNodes | null, defaultExpanded?: boolean | null, displayRootNode?: string | null, maxDepth?: number | null, showSelectChildrenButton?: boolean | null, showSelectDescendantsButton?: boolean | null } | null, treeValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
         | null, metadata_fields?: Array<{ id: string }> | null }> | null }
   };

export type TreeDetailsFragment = { id: string, label?: any | null, behavior: TreeBehavior, system: boolean, libraries: Array<{ library: { id: string, label?: any | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }> };

export type TreeLightFragment = { id: string, label?: any | null };

export type TreeNodeChildFragment = { id: string, order?: number | null, childrenCount?: number | null, record: { id: string, active: Array<{ value?: any | null }>, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ id: string, record: { id: string, library: { id: string, label?: any | null }, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null, permissions: { access_tree: boolean, detach: boolean, edit_children: boolean } };

export type ViewDetailsFragment = { id: string, shared: boolean, label: any, description?: any | null, color?: string | null, display: { size?: ViewSizes | null, type: ViewTypes }, created_by?: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } | null, filters?: Array<{ field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, withEmptyValues?: boolean | null, tree?: { id: string, label?: any | null } | null }> | null, sort?: Array<{ field: string, order: SortOrder }> | null, valuesVersions?: Array<{ treeId: string, treeNode: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } }> | null, attributes?: Array<{ id: string }> | null };

export type ViewDetailsFilterFragment = { field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, withEmptyValues?: boolean | null, tree?: { id: string, label?: any | null } | null };

export type TreeAttributeForMassEditionFragment = { id: string, tree_values?: Array<{ node?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, color?: string | null } } } | null, allowedDependentValues?: Array<{ nodeId?: string | null }> | null }> | null };

export type AttributesByLibAttributeWithPermissionsLinkAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, required: boolean, readonly: boolean, compute: boolean, permissions: { access_attribute: boolean }, valuesList?: { enable: boolean, allowFreeEntry?: boolean | null, linkedValues?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean, through?: { id: string } | null } | null };

export type AttributesByLibAttributeWithPermissionsStandardAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, required: boolean, readonly: boolean, compute: boolean, embedded_fields?: Array<{ id: string, format?: AttributeFormat | null, label?: any | null } | null> | null, valuesList?:
    | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
    | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
   | null, smart_filter?: { enable: boolean } | null, permissions: { access_attribute: boolean } };

export type AttributesByLibAttributeWithPermissionsTreeAttributeFragment = { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, required: boolean, readonly: boolean, compute: boolean, linked_tree?: { id: string, label?: any | null, libraries: Array<{ library: { id: string, label?: any | null } }> } | null, permissions_conf_dependent_values?: { dependenciesTreeAttributes: Array<{ id: string }> } | null, permissions: { access_attribute: boolean } };

export type AttributesByLibAttributeWithPermissionsFragment =
  | AttributesByLibAttributeWithPermissionsLinkAttributeFragment
  | AttributesByLibAttributeWithPermissionsStandardAttributeFragment
  | AttributesByLibAttributeWithPermissionsTreeAttributeFragment
;

export type AttributesByLibLinkAttributeWithPermissionsFragment = { valuesList?: { enable: boolean, allowFreeEntry?: boolean | null, linkedValues?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean, through?: { id: string } | null } | null };

export type StandardAttributeDetailsFragment = { id: string, type: AttributeType, embedded_fields?: Array<{ id: string, format?: AttributeFormat | null, label?: any | null } | null> | null, valuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null } | null, smart_filter?: { enable: boolean } | null };

export type LinkAttributeDetailsFragment = { label?: any | null, type: AttributeType, linked_library?: { id: string, label?: any | null } | null, valuesList?: { allowFreeEntry?: boolean | null, enable: boolean, linkedValues?: Array<{ id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } }> | null } | null, smart_filter?: { enable: boolean, through?: { id: string } | null } | null };

export type TreeAttributeDetailsFragment = { id: string, label?: any | null, linked_tree?: { id: string, label?: any | null } | null };

export type AttributePropertiesLinkAttributeStandardAttributeFragment = { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null };

export type AttributePropertiesTreeAttributeFragment = { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_tree?: { id: string } | null };

export type AttributePropertiesFragment =
  | AttributePropertiesLinkAttributeStandardAttributeFragment
  | AttributePropertiesTreeAttributeFragment
;

export type PropertyValueLinkValueFragment = { linkPayload?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null };

export type PropertyValueTreeValueFragment = { treePayload?: { record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } | null };

export type PropertyValueValueFragment = { valuePayload?: any | null, valueRawPayload?: any | null };

export type PropertyValueFragment =
  | PropertyValueLinkValueFragment
  | PropertyValueTreeValueFragment
  | PropertyValueValueFragment
;

export type LinkPropertyLinkValueFragment = { id_value?: string | null, payload?: { id: string, properties: Array<{ attributeId: string, attributeProperties:
        | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null }
        | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_tree?: { id: string } | null }
      , values: Array<
        | { linkPayload?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }
        | { treePayload?: { record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } | null }
        | { valuePayload?: any | null, valueRawPayload?: any | null }
      > }>, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null };

export type LinkPropertyTreeValueValueFragment = { id_value?: string | null };

export type LinkPropertyFragment =
  | LinkPropertyLinkValueFragment
  | LinkPropertyTreeValueValueFragment
;

export type LibraryAttributeLinkAttributeFragment = { id: string, type: AttributeType, label?: any | null, permissions: { access_attribute: boolean }, linked_library?: { id: string, label?: any | null, attributes?: Array<{ id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null }> | null } | null };

export type LibraryAttributeStandardAttributeFragment = { format?: AttributeFormat | null, id: string, type: AttributeType, label?: any | null, permissions: { access_attribute: boolean } };

export type LibraryAttributeTreeAttributeFragment = { id: string, type: AttributeType, label?: any | null, permissions: { access_attribute: boolean } };

export type LibraryAttributeFragment =
  | LibraryAttributeLinkAttributeFragment
  | LibraryAttributeStandardAttributeFragment
  | LibraryAttributeTreeAttributeFragment
;

export type LibraryAttributeLinkFragment = { linked_library?: { id: string, label?: any | null, attributes?: Array<{ id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null }> | null } | null };

export type ExplorerV2LinkPropertyLinkValueFragment = { id_value?: string | null, payload?: { id: string, properties: Array<{ attributeId: string, values: Array<
        | { linkPayload?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }
        | { treePayload?: { record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } | null }
        | { valuePayload?: any | null, valueRawPayload?: any | null }
      > }>, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null };

export type ExplorerV2LinkPropertyTreeValueValueFragment = { id_value?: string | null };

export type ExplorerV2LinkPropertyFragment =
  | ExplorerV2LinkPropertyLinkValueFragment
  | ExplorerV2LinkPropertyTreeValueValueFragment
;

export type ExplorerV2AttributePropertiesLinkAttributeFragment = { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_library?: { id: string, recordIdentityConf?: { color?: string | null } | null } | null };

export type ExplorerV2AttributePropertiesStandardAttributeFragment = { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null };

export type ExplorerV2AttributePropertiesTreeAttributeFragment = { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_tree?: { id: string, libraries: Array<{ library: { id: string, recordIdentityConf?: { color?: string | null } | null } }> } | null, permissions_conf_dependent_values?: { dependenciesTreeAttributes: Array<
      | { id: string }
      | { id: string, linked_tree?: { libraries: Array<{ library: { id: string } }> } | null }
    > } | null };

export type ExplorerV2AttributePropertiesFragment =
  | ExplorerV2AttributePropertiesLinkAttributeFragment
  | ExplorerV2AttributePropertiesStandardAttributeFragment
  | ExplorerV2AttributePropertiesTreeAttributeFragment
;

export type RecordHistoryLogEntryFragment = { action?: LogAction | null, time: number, topic?: { attribute?:
      | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean }
      | { id: string, label?: any | null }
      | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, embedded_fields?: Array<{ id: string, label?: any | null } | null> | null }
     | null } | null, user:
    | { id: string, label?: any | null }
    | { id: string, whoAmI: { id: string, library: { id: string } }, properties: Array<{ attributeId: string, values: Array<{ payload?: any | null }> }> }
  , before?: { asString?: string | null } | null, after?: { asString?: string | null } | null };

export type RecordHistoryLogAttributeLinkAttributeTreeAttributeFragment = { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean };

export type RecordHistoryLogAttributeLogUnknownEntityFragment = Record<PropertyKey, never>;

export type RecordHistoryLogAttributeStandardAttributeFragment = { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, embedded_fields?: Array<{ id: string, label?: any | null } | null> | null };

export type RecordHistoryLogAttributeFragment =
  | RecordHistoryLogAttributeLinkAttributeTreeAttributeFragment
  | RecordHistoryLogAttributeLogUnknownEntityFragment
  | RecordHistoryLogAttributeStandardAttributeFragment
;

export type CheckApplicationExistenceQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  endpoint?: InputMaybe<Scalars['String']['input']>;
}>;


export type CheckApplicationExistenceQuery = { applications?: { totalCount: number } | null };

export type GetApplicationByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetApplicationByIdQuery = { applications?: { list: Array<{ id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } }> } | null };

export type GetApplicationModulesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApplicationModulesQuery = { applicationsModules: Array<{ id: string, description?: string | null, version?: string | null }> };

export type SaveApplicationMutationVariables = Exact<{
  application: ApplicationInput;
}>;


export type SaveApplicationMutation = { saveApplication: { id: string, label: any, type: ApplicationType, description?: any | null, endpoint?: string | null, url?: string | null, color?: string | null, module?: string | null, settings?: any | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, permissions: { access_application: boolean, admin_application: boolean } } };

export type CheckAttributeExistenceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CheckAttributeExistenceQuery = { attributes?: { totalCount: number } | null };

export type DeleteAttributeMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
}>;


export type DeleteAttributeMutation = { deleteAttribute: { id: string } };

export type GetAttributeByIdQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetAttributeByIdQuery = { attributes?: { list: Array<
      | { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, description?: any | null, required: boolean, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_library?: { id: string, label?: any | null } | null, smart_filter?: { enable: boolean, through?: { id: string } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
      | { unique?: boolean | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, description?: any | null, required: boolean, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, smart_filter?: { enable: boolean } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, description?: any | null, required: boolean, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_tree?: { id: string, label?: any | null } | null, tree_selection_conf?: { selectableNodes?: TreeSelectableNodes | null, defaultExpanded?: boolean | null, displayRootNode?: string | null, maxDepth?: number | null, showSelectChildrenButton?: boolean | null, showSelectDescendantsButton?: boolean | null } | null, permissions_conf_dependent_values?: { dependenciesTreeAttributes: Array<{ id: string }> } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    > } | null };

export type GetAttributesByLibQueryVariables = Exact<{
  library: Scalars['String']['input'];
}>;


export type GetAttributesByLibQuery = { attributes?: { list: Array<
      | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, linked_library?: { id: string } | null }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, embedded_fields?: Array<{ id: string, format?: AttributeFormat | null, label?: any | null } | null> | null }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, readonly: boolean, linked_tree?: { id: string, label?: any | null, libraries: Array<{ library: { id: string, label?: any | null } }> } | null }
    > } | null };

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
  libraryId: Scalars['String']['input'];
}>;


export type GetVersionableAttributesByLibraryQuery = { attributes?: { list: Array<{ id: string, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null }> } | null };

export type SaveAttributeMutationVariables = Exact<{
  attribute: AttributeInput;
}>;


export type SaveAttributeMutation = { saveAttribute:
    | { reverse_link?: string | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, description?: any | null, required: boolean, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_library?: { id: string, label?: any | null } | null, smart_filter?: { enable: boolean, through?: { id: string } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    | { unique?: boolean | null, id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, description?: any | null, required: boolean, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, smart_filter?: { enable: boolean } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
    | { id: string, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, label?: any | null, description?: any | null, required: boolean, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_tree?: { id: string, label?: any | null } | null, tree_selection_conf?: { selectableNodes?: TreeSelectableNodes | null, defaultExpanded?: boolean | null, displayRootNode?: string | null, maxDepth?: number | null, showSelectChildrenButton?: boolean | null, showSelectDescendantsButton?: boolean | null } | null, permissions_conf_dependent_values?: { dependenciesTreeAttributes: Array<{ id: string }> } | null, metadata_fields?: Array<{ id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null }> | null, versions_conf?: { versionable: boolean, mode?: ValueVersionMode | null, profile?: { id: string, label: any, trees: Array<{ id: string, label?: any | null }> } | null } | null, libraries?: Array<{ id: string, label?: any | null }> | null }
   };

export type ExportQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  filters?: InputMaybe<Array<RecordFilterInput> | RecordFilterInput>;
  profile?: InputMaybe<Scalars['String']['input']>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
}>;


export type ExportQuery = { export: string };

export type CreateDirectoryMutationVariables = Exact<{
  library: Scalars['String']['input'];
  nodeId: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type CreateDirectoryMutation = { createDirectory: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } };

export type ForcePreviewsGenerationMutationVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  filters?: InputMaybe<Array<RecordFilterInput> | RecordFilterInput>;
  recordIds?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  failedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  previewVersionSizeNames?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type ForcePreviewsGenerationMutation = { forcePreviewsGeneration: boolean };

export type GetDirectoryDataQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  directoryId: Scalars['String']['input'];
}>;


export type GetDirectoryDataQuery = { records: { list: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } }, created_at: Array<{ value?: any | null }>, created_by: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }>, modified_at: Array<{ value?: any | null }>, modified_by: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }>, file_name: Array<{ value?: any | null }>, file_path: Array<{ value?: any | null }>, library: { behavior: LibraryBehavior } }> } };

export type UploadUpdateSubscriptionVariables = Exact<{
  filters?: InputMaybe<UploadFiltersInput>;
}>;


export type UploadUpdateSubscription = { upload: { userId: string, uid: string, progress: { length?: number | null, transferred?: number | null, speed?: number | null, runtime?: number | null, remaining?: number | null, percentage?: number | null, eta?: number | null, delta?: number | null } } };

export type UploadMutationVariables = Exact<{
  library: Scalars['String']['input'];
  nodeId: Scalars['String']['input'];
  files: Array<FileInput> | FileInput;
}>;


export type UploadMutation = { upload: Array<{ uid: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> };

export type ImportExcelMutationVariables = Exact<{
  file: Scalars['Upload']['input'];
  sheets?: InputMaybe<Array<InputMaybe<SheetInput>> | InputMaybe<SheetInput>>;
  startAt?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ImportExcelMutation = { importExcel: string };

export type CheckLibraryExistenceQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type CheckLibraryExistenceQuery = { libraries?: { totalCount: number } | null };

export type DeleteLibraryMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
}>;


export type DeleteLibraryMutation = { deleteLibrary: { id: string } };

export type GetLibrariesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLibrariesQuery = { libraries?: { list: Array<{ id: string, label?: any | null, icon?: { id: string, whoAmI: { id: string, preview?: IPreviewScalar | null, library: { id: string } } } | null }> } | null };

export type GetLibraryByIdQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type GetLibraryByIdQuery = { libraries?: { list: Array<{ id: string, label?: any | null, behavior: LibraryBehavior, system?: boolean | null, fullTextAttributes?: Array<{ id: string, label?: any | null }> | null, attributes?: Array<
        | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_library?: { id: string, behavior: LibraryBehavior } | null }
        | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null }
        | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_tree?: { id: string } | null }
      > | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, linked_tree?: { id: string } | null }
        > } | null, recordIdentityConf?: { label?: string | null, subLabel?: string | null, color?: string | null, preview?: string | null, treeColorPreview?: string | null, parentContext?: string | null } | null, permissions?: { admin_library: boolean, access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, previewsSettings?: Array<{ label: any, description?: any | null, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } }> | null }> } | null };

export type GetLibraryPermissionsQueryVariables = Exact<{
  libraryId?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type GetLibraryPermissionsQuery = { libraries?: { list: Array<{ permissions?: { access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null }> } | null };

export type GetLibraryPreviewsSettingsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetLibraryPreviewsSettingsQuery = { libraries?: { list: Array<{ id: string, label?: any | null, behavior: LibraryBehavior, previewsSettings?: Array<{ label: any, description?: any | null, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } }> | null }> } | null };

export type SaveLibraryMutationVariables = Exact<{
  library: LibraryInput;
}>;


export type SaveLibraryMutation = { saveLibrary: { id: string, label?: any | null, behavior: LibraryBehavior, system?: boolean | null, fullTextAttributes?: Array<{ id: string, label?: any | null }> | null, attributes?: Array<
      | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_library?: { id: string, behavior: LibraryBehavior } | null }
      | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null }
      | { id: string, label?: any | null, system: boolean, type: AttributeType, format?: AttributeFormat | null, linked_tree?: { id: string } | null }
    > | null, permissions_conf?: { relation: PermissionsRelation, permissionTreeAttributes: Array<
        | { id: string, label?: any | null }
        | { id: string, label?: any | null, linked_tree?: { id: string } | null }
      > } | null, recordIdentityConf?: { label?: string | null, subLabel?: string | null, color?: string | null, preview?: string | null, treeColorPreview?: string | null, parentContext?: string | null } | null, permissions?: { admin_library: boolean, access_library: boolean, access_record: boolean, create_record: boolean, edit_record: boolean, delete_record: boolean } | null, icon?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, previewsSettings?: Array<{ label: any, description?: any | null, system: boolean, versions: { background: string, density: number, sizes: Array<{ name: string, size: number }> } }> | null } };

export type IsAllowedQueryVariables = Exact<{
  type: PermissionTypes;
  actions: Array<PermissionsActions> | PermissionsActions;
  applyTo?: InputMaybe<Scalars['ID']['input']>;
  target?: InputMaybe<PermissionTarget>;
}>;


export type IsAllowedQuery = { isAllowed?: Array<{ name: PermissionsActions, allowed?: boolean | null }> | null };

export type ActivateNewRecordMutationVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
  formId?: InputMaybe<Scalars['String']['input']>;
}>;


export type ActivateNewRecordMutation = { activateNewRecord: { record?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, valuesErrors?: Array<{ type: string, attribute?: string | null, input?: string | null, message: string }> | null } };

export type ActivateRecordsMutationVariables = Exact<{
  libraryId: Scalars['String']['input'];
  recordsIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  filters?: InputMaybe<Array<RecordFilterInput> | RecordFilterInput>;
}>;


export type ActivateRecordsMutation = { activateRecords: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> };

export type CreateRecordMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  skipActivate?: InputMaybe<Scalars['Boolean']['input']>;
  data?: InputMaybe<CreateRecordDataInput>;
}>;


export type CreateRecordMutation = { createRecord: { record?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, valuesErrors?: Array<{ type: string, attribute?: string | null, input?: string | null, message: string }> | null } };

export type DeactivateRecordsMutationVariables = Exact<{
  libraryId: Scalars['String']['input'];
  recordsIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  filters?: InputMaybe<Array<RecordFilterInput> | RecordFilterInput>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
}>;


export type DeactivateRecordsMutation = { deactivateRecords: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> };

export type DoesFileExistAsChildQueryVariables = Exact<{
  parentNode?: InputMaybe<Scalars['ID']['input']>;
  treeId: Scalars['ID']['input'];
  filename: Scalars['String']['input'];
}>;


export type DoesFileExistAsChildQuery = { doesFileExistAsChild?: boolean | null };

export type GetFileDataQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  fileId: Scalars['String']['input'];
  previewsStatusAttribute: Scalars['ID']['input'];
}>;


export type GetFileDataQuery = { records: { list: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } }, created_at: Array<{ value?: any | null }>, created_by: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }>, modified_at: Array<{ value?: any | null }>, modified_by: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }>, file_name: Array<{ value?: any | null }>, file_path: Array<{ value?: any | null }>, previews_status: Array<{ value?: any | null }>, library: { behavior: LibraryBehavior } }> } };

export type RecordFormQueryVariables = Exact<{
  libraryId: Scalars['String']['input'];
  formId: Scalars['String']['input'];
  recordId?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Array<ValueVersionInput> | ValueVersionInput>;
}>;


export type RecordFormQuery = { recordForm?: { id: string, recordId?: string | null, library: { id: string }, dependencyAttributes?: Array<{ id: string }> | null, elements: Array<{ id: string, containerId: string, uiElementType: string, type: FormElementTypes, valueError?: string | null, values?: Array<
        | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
        | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
        | { payload?: any | null, raw_payload?: any | null, value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
      > | null, attribute?:
        | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_library?: { id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null } | null, linkValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
              | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
              | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
             | null, metadata_fields?: Array<{ id: string }> | null }> | null }
        | { character_limit?: number | null, id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, values_list?:
            | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
            | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
           | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
              | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
              | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
             | null, metadata_fields?: Array<{ id: string }> | null }> | null }
        | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_tree?: { id: string, label?: any | null } | null, tree_selection_conf?: { selectableNodes?: TreeSelectableNodes | null, defaultExpanded?: boolean | null, displayRootNode?: string | null, maxDepth?: number | null, showSelectChildrenButton?: boolean | null, showSelectDescendantsButton?: boolean | null } | null, treeValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
              | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
              | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
             | null, metadata_fields?: Array<{ id: string }> | null }> | null }
       | null, settings: Array<{ key: string, value: any }>, joinLibraryContext?: { mandatoryAttribute:
          | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_library?: { id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null } | null, linkValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
                | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
                | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
               | null, metadata_fields?: Array<{ id: string }> | null }> | null }
          | { character_limit?: number | null, id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, values_list?:
              | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
              | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
             | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
                | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
                | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
               | null, metadata_fields?: Array<{ id: string }> | null }> | null }
          | { id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, required: boolean, multiple_values: boolean, compute: boolean, linked_tree?: { id: string, label?: any | null } | null, tree_selection_conf?: { selectableNodes?: TreeSelectableNodes | null, defaultExpanded?: boolean | null, displayRootNode?: string | null, maxDepth?: number | null, showSelectChildrenButton?: boolean | null, showSelectDescendantsButton?: boolean | null } | null, treeValuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<{ id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null }> | null } | null, permissions: { access_attribute: boolean, edit_value: boolean }, versions_conf?: { versionable: boolean, profile?: { id: string, trees: Array<{ id: string, label?: any | null }> } | null } | null, metadata_fields?: Array<{ id: string, label?: any | null, description?: any | null, type: AttributeType, format?: AttributeFormat | null, system: boolean, readonly: boolean, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean }, values_list?:
                | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
                | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
               | null, metadata_fields?: Array<{ id: string }> | null }> | null }
         } | null }>, sidePanel?: { enable: boolean, isOpenByDefault?: boolean | null } | null } | null };

export type RecordUpdateSubscriptionVariables = Exact<{
  filters?: InputMaybe<RecordUpdateFilterInput>;
}>;


export type RecordUpdateSubscription = { recordUpdate: { record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } }, modified_by: Array<{ value?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }> }, updatedValues: Array<{ attribute: string, value:
        | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
        | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
        | { payload?: any | null, raw_payload?: any | null, value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
       }> } };

export type GetRecordsFromLibraryQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  pagination?: InputMaybe<RecordsPagination>;
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
}>;


export type GetRecordsFromLibraryQuery = { records: { totalCount?: number | null, list: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> } };

export type IndexRecordsMutationVariables = Exact<{
  libraryId: Scalars['String']['input'];
  records?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type IndexRecordsMutation = { indexRecords: boolean };

export type PurgeRecordMutationVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
}>;


export type PurgeRecordMutation = { purgeRecord: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } };

export type GetRecordIdCardQueryVariables = Exact<{
  id?: InputMaybe<Scalars['String']['input']>;
  libraryId: Scalars['ID']['input'];
}>;


export type GetRecordIdCardQuery = { records: { list: Array<{ id: string, whoAmI: { id: string, color?: string | null, label?: string | null, subLabel?: string | null, preview?: IPreviewScalar | null, parentContext?: Array<{ id: string, label?: string | null }> | null } }> } };

export type CancelTaskMutationVariables = Exact<{
  taskId: Scalars['ID']['input'];
}>;


export type CancelTaskMutation = { cancelTask: boolean };

export type CheckTreeExistenceQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type CheckTreeExistenceQuery = { trees?: { totalCount: number } | null };

export type DeleteTreeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTreeMutation = { deleteTree: { id: string } };

export type GetTreeByIdQueryVariables = Exact<{
  id?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type GetTreeByIdQuery = { trees?: { list: Array<{ id: string, label?: any | null, behavior: TreeBehavior, system: boolean, libraries: Array<{ library: { id: string, label?: any | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }> }> } | null };

export type GetTreeLibrariesQueryVariables = Exact<{
  treeId?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  library?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetTreeLibrariesQuery = { trees?: { totalCount: number, list: Array<{ id: string, behavior: TreeBehavior, system: boolean, libraries: Array<{ library: { id: string, label?: any | null, behavior: LibraryBehavior, system?: boolean | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }> }> } | null };

export type GetTreesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTreesQuery = { trees?: { list: Array<{ id: string, label?: any | null }> } | null };

export type SaveTreeMutationVariables = Exact<{
  tree: TreeInput;
}>;


export type SaveTreeMutation = { saveTree: { id: string, label?: any | null, behavior: TreeBehavior, system: boolean, libraries: Array<{ library: { id: string, label?: any | null }, settings: { allowMultiplePositions: boolean, allowedAtRoot: boolean, allowedChildren: Array<string> } }> } };

export type TreeNodeChildrenQueryVariables = Exact<{
  treeId: Scalars['ID']['input'];
  node?: InputMaybe<Scalars['ID']['input']>;
  pagination?: InputMaybe<Pagination>;
  childrenAsRecordValuePermissionFilter?: InputMaybe<ChildrenAsRecordValuePermissionFilterInput>;
  dependentValuesPermissionFilter?: InputMaybe<DependentValuesPermissionFilterInput>;
}>;


export type TreeNodeChildrenQuery = { treeNodeChildren: { totalCount?: number | null, list: Array<{ id: string, order?: number | null, childrenCount?: number | null, record: { id: string, active: Array<{ value?: any | null }>, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ id: string, record: { id: string, library: { id: string, label?: any | null }, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null, permissions: { access_tree: boolean, detach: boolean, edit_children: boolean } }> } };

export type GetUserDataQueryVariables = Exact<{
  keys: Array<Scalars['String']['input']> | Scalars['String']['input'];
  global?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetUserDataQuery = { userData: { global: boolean, data?: any | null } };

export type SaveUserDataMutationVariables = Exact<{
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Any']['input']>;
  global: Scalars['Boolean']['input'];
}>;


export type SaveUserDataMutation = { saveUserData: { global: boolean, data?: any | null } };

export type DeleteValueMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
  attribute: Scalars['ID']['input'];
  value?: InputMaybe<ValueInput>;
}>;


export type DeleteValueMutation = { deleteValue: Array<
    | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
    | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
    | { payload?: any | null, raw_payload?: any | null, value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
  > };

export type SaveValueBatchMutationVariables = Exact<{
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
  version?: InputMaybe<Array<ValueVersionInput> | ValueVersionInput>;
  values: Array<ValueBatchInput> | ValueBatchInput;
  deleteEmpty?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type SaveValueBatchMutation = { saveValueBatch: { values?: Array<
      | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, linkValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
      | { id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, treeValue?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }, ancestors?: Array<{ record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } }> | null } | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
      | { payload?: any | null, raw_payload?: any | null, value?: any | null, raw_value?: any | null, id_value?: string | null, isInherited?: boolean | null, isCalculated?: boolean | null, modified_at?: number | null, created_at?: number | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null, attribute: { id: string, format?: AttributeFormat | null, type: AttributeType, system: boolean }, metadata?: Array<{ name: string, value?: { id_value?: string | null, modified_at?: number | null, created_at?: number | null, payload?: any | null, raw_payload?: any | null, modified_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, created_by?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null, version?: Array<{ treeId: string, treeNode?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } } | null } | null> | null } | null } | null> | null }
    > | null, errors?: Array<{ type: string, attribute?: string | null, input?: string | null, message: string }> | null } };

export type SaveValueBulkMutationVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordsFilters: Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  attributeId: Scalars['ID']['input'];
  mapping: Array<SaveValueBulkMappingInput> | SaveValueBulkMappingInput;
}>;


export type SaveValueBulkMutation = { saveValueBulk: string };

export type DeleteViewMutationVariables = Exact<{
  viewId: Scalars['String']['input'];
}>;


export type DeleteViewMutation = { deleteView: { id: string, library: string } };

export type GetViewQueryVariables = Exact<{
  viewId: Scalars['String']['input'];
}>;


export type GetViewQuery = { view: { id: string, shared: boolean, label: any, description?: any | null, color?: string | null, display: { size?: ViewSizes | null, type: ViewTypes }, created_by?: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } | null, filters?: Array<{ field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, withEmptyValues?: boolean | null, tree?: { id: string, label?: any | null } | null }> | null, sort?: Array<{ field: string, order: SortOrder }> | null, valuesVersions?: Array<{ treeId: string, treeNode: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } }> | null, attributes?: Array<{ id: string }> | null } };

export type GetViewsListQueryVariables = Exact<{
  libraryId: Scalars['String']['input'];
}>;


export type GetViewsListQuery = { views: { totalCount: number, list: Array<{ id: string, shared: boolean, label: any, description?: any | null, color?: string | null, display: { size?: ViewSizes | null, type: ViewTypes }, created_by?: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } | null, filters?: Array<{ field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, withEmptyValues?: boolean | null, tree?: { id: string, label?: any | null } | null }> | null, sort?: Array<{ field: string, order: SortOrder }> | null, valuesVersions?: Array<{ treeId: string, treeNode: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } }> | null, attributes?: Array<{ id: string }> | null }> } };

export type SaveViewMutationVariables = Exact<{
  view: ViewInput;
}>;


export type SaveViewMutation = { saveView: { id: string, shared: boolean, label: any, description?: any | null, color?: string | null, display: { size?: ViewSizes | null, type: ViewTypes }, created_by?: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } | null, filters?: Array<{ field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, withEmptyValues?: boolean | null, tree?: { id: string, label?: any | null } | null }> | null, sort?: Array<{ field: string, order: SortOrder }> | null, valuesVersions?: Array<{ treeId: string, treeNode: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } }> | null, attributes?: Array<{ id: string }> | null } };

export type AttributeWithValuesForMassEditionQueryVariables = Exact<{
  attributeId: Scalars['ID']['input'];
}>;


export type AttributeWithValuesForMassEditionQuery = { attributes?: { list: Array<{ id: string, tree_values?: Array<{ node?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, color?: string | null } } } | null, allowedDependentValues?: Array<{ nodeId?: string | null }> | null }> | null }> } | null };

export type GetAttributesByLibWithPermissionsQueryVariables = Exact<{
  library: Scalars['String']['input'];
}>;


export type GetAttributesByLibWithPermissionsQuery = { attributes?: { list: Array<
      | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, required: boolean, readonly: boolean, compute: boolean, valuesList?: { enable: boolean, allowFreeEntry?: boolean | null, linkedValues?: Array<{ id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } }> | null } | null, linked_library?: { id: string } | null, smart_filter?: { enable: boolean, through?: { id: string } | null } | null, permissions: { access_attribute: boolean } }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, required: boolean, readonly: boolean, compute: boolean, embedded_fields?: Array<{ id: string, format?: AttributeFormat | null, label?: any | null } | null> | null, valuesList?:
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, dateRangeValues?: Array<{ from?: string | null, to?: string | null }> | null }
          | { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null }
         | null, smart_filter?: { enable: boolean } | null, permissions: { access_attribute: boolean } }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, multiple_values: boolean, system: boolean, required: boolean, readonly: boolean, compute: boolean, linked_tree?: { id: string, label?: any | null, libraries: Array<{ library: { id: string, label?: any | null } }> } | null, permissions_conf_dependent_values?: { dependenciesTreeAttributes: Array<{ id: string }> } | null, permissions: { access_attribute: boolean } }
    > } | null };

export type ExplorerAttributesQueryVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type ExplorerAttributesQuery = { attributes?: { list: Array<
      | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, linked_library?: { id: string, label?: any | null } | null, valuesList?: { allowFreeEntry?: boolean | null, enable: boolean, linkedValues?: Array<{ id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } }> | null } | null, smart_filter?: { enable: boolean, through?: { id: string } | null } | null, permissions: { access_attribute: boolean } }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, embedded_fields?: Array<{ id: string, format?: AttributeFormat | null, label?: any | null } | null> | null, valuesList?: { enable: boolean, allowFreeEntry?: boolean | null, allowListUpdate?: boolean | null, values?: Array<string> | null } | null, smart_filter?: { enable: boolean } | null, permissions: { access_attribute: boolean } }
      | { id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null, linked_tree?: { id: string, label?: any | null } | null, permissions: { access_attribute: boolean } }
    > } | null };

export type ExplorerLinkAttributeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ExplorerLinkAttributeQuery = { attributes?: { list: Array<
      | { label?: any | null, type: AttributeType, id: string, multiple_values: boolean, linked_library?: { id: string, label?: any | null } | null, valuesList?: { allowFreeEntry?: boolean | null, enable: boolean, linkedValues?: Array<{ id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } }> | null } | null, smart_filter?: { enable: boolean, through?: { id: string } | null } | null, permissions: { access_attribute: boolean, edit_value: boolean } }
      | { id: string, multiple_values: boolean, permissions: { access_attribute: boolean, edit_value: boolean } }
      | { label?: any | null, id: string, multiple_values: boolean, linked_tree?: { id: string, label?: any | null } | null, permissions: { access_attribute: boolean, edit_value: boolean } }
    > } | null };

export type ExplorerLibraryCountDataQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
}>;


export type ExplorerLibraryCountDataQuery = { records: { totalCount?: number | null } };

export type ExplorerLibraryDataQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  attributeIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  pagination?: InputMaybe<RecordsPagination>;
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
  multipleSort?: InputMaybe<Array<RecordSortInput> | RecordSortInput>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
}>;


export type ExplorerLibraryDataQuery = { records: { totalCount?: number | null, list: Array<{ id: string, active: boolean, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } }, permissions: { create_record: boolean, delete_record: boolean }, properties: Array<{ attributeId: string, attributeProperties:
          | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null }
          | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_tree?: { id: string } | null }
        , values: Array<
          | { linkPayload?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }
          | { treePayload?: { record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } | null }
          | { valuePayload?: any | null, valueRawPayload?: any | null }
        > }> }> } };

export type ExplorerLinkDataQueryVariables = Exact<{
  attributeIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  parentLibraryId: Scalars['ID']['input'];
  parentRecordId?: InputMaybe<Scalars['String']['input']>;
  linkAttributeId: Scalars['ID']['input'];
}>;


export type ExplorerLinkDataQuery = { records: { list: Array<{ id: string, whoAmI: { id: string, library: { id: string } }, property: Array<
        | { id_value?: string | null, payload?: { id: string, properties: Array<{ attributeId: string, attributeProperties:
                | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null }
                | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_tree?: { id: string } | null }
              , values: Array<
                | { linkPayload?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }
                | { treePayload?: { record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } | null }
                | { valuePayload?: any | null, valueRawPayload?: any | null }
              > }>, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }
        | { id_value?: string | null }
      > }> } };

export type GetLibraryAttributesQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
}>;


export type GetLibraryAttributesQuery = { libraries?: { list: Array<{ id: string, attributes?: Array<
        | { id: string, type: AttributeType, label?: any | null, linked_library?: { id: string, label?: any | null, attributes?: Array<{ id: string, type: AttributeType, format?: AttributeFormat | null, label?: any | null }> | null } | null, permissions: { access_attribute: boolean } }
        | { format?: AttributeFormat | null, id: string, type: AttributeType, label?: any | null, permissions: { access_attribute: boolean } }
        | { id: string, type: AttributeType, label?: any | null, permissions: { access_attribute: boolean } }
      > | null }> } | null };

export type ExplorerLibraryDetailsQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
}>;


export type ExplorerLibraryDetailsQuery = { libraries?: { list: Array<{ id: string, label?: any | null, behavior: LibraryBehavior, permissions?: { create_record: boolean } | null }> } | null };

export type LibraryExportProfilesQueryVariables = Exact<{
  libraryId?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type LibraryExportProfilesQuery = { libraries?: { list: Array<{ id: string, exportProfiles?: { defaultProfile: string, profiles: Array<{ label: string, columns: Array<{ columnLabel: string, attribute: string }>, error?: { message: string } | null }> } | null }> } | null };

export type MassEditableAttributesQueryVariables = Exact<{
  libraryId: Scalars['String']['input'];
}>;


export type MassEditableAttributesQuery = { attributes?: { list: Array<
      | { id: string, label?: any | null }
      | { id: string, label?: any | null, permissions_conf_dependent_values?: { dependenciesTreeAttributes: Array<
            | { id: string, label?: any | null }
            | { id: string, label?: any | null, linked_tree?: { libraries: Array<{ library: { id: string } }> } | null }
          > } | null }
    > } | null };

export type ExplorerSelectionIdsQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
}>;


export type ExplorerSelectionIdsQuery = { records: { list: Array<{ id: string }> } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me?: { id: string, whoAmI: { id: string, library: { id: string } } } | null };

export type TreeAttributeRemappingQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  attributeId: Scalars['ID']['input'];
  recordFilters: Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  attributeDependentValue?: InputMaybe<AttributeDependentValueInput>;
}>;


export type TreeAttributeRemappingQuery = { listDistinctValues?: Array<
    | { count: number }
    | { count: number, treeNode?: { id: string } | null }
  > | null, attributes?: { list: Array<{ tree_values?: Array<{ node?: { id: string, record: { id: string, whoAmI: { label?: string | null, color?: string | null } } } | null, allowedDependentValues?: Array<{ nodeId?: string | null }> | null }> | null }> } | null };

export type UpdateViewMutationVariables = Exact<{
  view: ViewInputPartial;
}>;


export type UpdateViewMutation = { updateView: { id: string, shared: boolean, label: any, description?: any | null, color?: string | null, display: { size?: ViewSizes | null, type: ViewTypes }, created_by?: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } | null, filters?: Array<{ field?: string | null, value?: string | null, condition?: RecordFilterCondition | null, operator?: RecordFilterOperator | null, withEmptyValues?: boolean | null, tree?: { id: string, label?: any | null } | null }> | null, sort?: Array<{ field: string, order: SortOrder }> | null, valuesVersions?: Array<{ treeId: string, treeNode: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } }> | null, attributes?: Array<{ id: string }> | null } };

export type ValuesOccurrencesForDependencyQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  dependencyAttributeId: Scalars['ID']['input'];
  recordFilters: Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
}>;


export type ValuesOccurrencesForDependencyQuery = { listDistinctValues?: Array<{ treeNode?: { id: string, record: { id: string, whoAmI: { label?: string | null } } } | null }> | null };

export type ExplorerV2LibraryDataQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  attributeIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  pagination?: InputMaybe<RecordsPagination>;
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
  multipleSort?: InputMaybe<Array<RecordSortInput> | RecordSortInput>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
}>;


export type ExplorerV2LibraryDataQuery = { records: { totalCount?: number | null, list: Array<{ id: string, active: boolean, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } }, permissions: { create_record: boolean, delete_record: boolean }, properties: Array<{ attributeId: string, values: Array<
          | { linkPayload?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }
          | { treePayload?: { record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } | null }
          | { valuePayload?: any | null, valueRawPayload?: any | null }
        > }> }> } };

export type ExplorerV2LinkDataQueryVariables = Exact<{
  attributeIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  parentLibraryId: Scalars['ID']['input'];
  parentRecordId?: InputMaybe<Scalars['String']['input']>;
  linkAttributeId: Scalars['ID']['input'];
}>;


export type ExplorerV2LinkDataQuery = { records: { list: Array<{ id: string, whoAmI: { id: string, library: { id: string } }, property: Array<
        | { id_value?: string | null, payload?: { id: string, properties: Array<{ attributeId: string, values: Array<
                | { linkPayload?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }
                | { treePayload?: { record: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } } | null }
                | { valuePayload?: any | null, valueRawPayload?: any | null }
              > }>, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }
        | { id_value?: string | null }
      > }> } };

export type KanbanTransitionsQueryVariables = Exact<{
  attributeId: Scalars['ID']['input'];
}>;


export type KanbanTransitionsQuery = { attributes?: { list: Array<
      | { id: string, permissions: { edit_value: boolean } }
      | { id: string, tree_values?: Array<{ node?: { id: string } | null, allowedDependentValues?: Array<{ nodeId?: string | null }> | null }> | null, permissions: { edit_value: boolean } }
    > } | null };

export type ExplorerV2LibraryMetadataQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
}>;


export type ExplorerV2LibraryMetadataQuery = { libraries?: { list: Array<{ id: string, label?: any | null, behavior: LibraryBehavior, recordIdentityConf?: { color?: string | null } | null, permissions?: { create_record: boolean } | null, attributes?: Array<
        | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_library?: { id: string, recordIdentityConf?: { color?: string | null } | null } | null }
        | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null }
        | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, multi_link_display_option?: MultiDisplayOption | null, multi_tree_display_option?: MultiDisplayOption | null, linked_tree?: { id: string, libraries: Array<{ library: { id: string, recordIdentityConf?: { color?: string | null } | null } }> } | null, permissions_conf_dependent_values?: { dependenciesTreeAttributes: Array<
              | { id: string }
              | { id: string, linked_tree?: { libraries: Array<{ library: { id: string } }> } | null }
            > } | null }
      > | null }> } | null };

export type ListDistinctValuesQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  attribute: Scalars['ID']['input'];
  recordFilters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
}>;


export type ListDistinctValuesQuery = { listDistinctValues?: Array<
    | { count: number }
    | { count: number, value?: { id: string, record: { id: string, whoAmI: { id: string, label?: string | null, color?: string | null, library: { id: string } } } } | null }
  > | null };

export type TreeFiltersDataQueryQueryVariables = Exact<{
  treeId: Scalars['ID']['input'];
  startAt?: InputMaybe<Scalars['ID']['input']>;
  accessRecordByDefaultPermission?: InputMaybe<AccessRecordByDefaultPermissionInput>;
}>;


export type TreeFiltersDataQueryQuery = { treeContent: Array<{ id: string, accessRecordByDefaultPermission?: boolean | null, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } }> };

export type SmartFilterListValuesQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  attribute: Scalars['ID']['input'];
  recordFilters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
}>;


export type SmartFilterListValuesQuery = { listDistinctValues?: Array<
    | { count: number, recordValue?: { id: string, whoAmI: { id: string, label?: string | null, subLabel?: string | null, color?: string | null, preview?: IPreviewScalar | null, library: { id: string, label?: any | null } } } | null }
    | { count: number, standardValue?: any | null }
    | { count: number }
  > | null };

export type FilterTreeDataQueryQueryVariables = Exact<{
  treeId: Scalars['ID']['input'];
  startAt?: InputMaybe<Scalars['ID']['input']>;
  accessRecordByDefaultPermission?: InputMaybe<AccessRecordByDefaultPermissionInput>;
}>;


export type FilterTreeDataQueryQuery = { treeContent: Array<{ id: string, accessRecordByDefaultPermission?: boolean | null, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } }> };

export type NotificationSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NotificationSubscription = { notification: { id: string, date: number, level: NotificationLevel, message: string, title: string, attachments?: Array<{ label: string, url: string, trackingEvent?: { category: string, action: string, name?: string | null, value?: number | null } | null }> | null, relatedEntities?: Array<{ label: string, url: string }> | null, trackingEvents?: Array<{ category: string, action: string, name?: string | null, value?: number | null }> | null } };

export type GetRecordHistoryQueryVariables = Exact<{
  record: LogTopicRecordFilterInput;
  attributeId?: InputMaybe<Scalars['String']['input']>;
  actions?: InputMaybe<Array<LogAction> | LogAction>;
  pagination?: InputMaybe<Pagination>;
}>;


export type GetRecordHistoryQuery = { logs?: { total: number, logs: Array<{ action?: LogAction | null, time: number, topic?: { attribute?:
          | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean }
          | { id: string, label?: any | null }
          | { id: string, label?: any | null, type: AttributeType, format?: AttributeFormat | null, multiple_values: boolean, embedded_fields?: Array<{ id: string, label?: any | null } | null> | null }
         | null } | null, user:
        | { id: string, label?: any | null }
        | { id: string, whoAmI: { id: string, library: { id: string } }, properties: Array<{ attributeId: string, values: Array<{ payload?: any | null }> }> }
      , before?: { asString?: string | null } | null, after?: { asString?: string | null } | null }> } | null };

export type TreeContentDataQueryQueryVariables = Exact<{
  treeId: Scalars['ID']['input'];
  startAt?: InputMaybe<Scalars['ID']['input']>;
  childrenAsRecordValuePermissionFilter?: InputMaybe<ChildrenAsRecordValuePermissionFilterInput>;
  dependentValuesPermissionFilter?: InputMaybe<DependentValuesPermissionFilterInput>;
}>;


export type TreeContentDataQueryQuery = { treeContent: Array<{ id: string, childrenCount?: number | null, record: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } } } }> };

export type TreeDataQueryQueryVariables = Exact<{
  treeId: Scalars['ID']['input'];
}>;


export type TreeDataQueryQuery = { trees?: { list: Array<{ id: string, label?: any | null }> } | null };

export type GlobalSettingsFlagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GlobalSettingsFlagsQuery = { globalSettings: { settings?: any | null } };

export type RecordUpdateLightSubscriptionVariables = Exact<{
  filters?: InputMaybe<RecordUpdateFilterInput>;
}>;


export type RecordUpdateLightSubscription = { recordUpdate: { record: { id: string }, updatedValues: Array<{ attribute: string }> } };

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
  description
  required
  multiple_values
  multi_link_display_option
  multi_tree_display_option
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
    smart_filter {
      enable
    }
  }
  ... on LinkAttribute {
    linked_library {
      id
      label
    }
    reverse_link
    smart_filter {
      enable
      through {
        id
      }
    }
  }
  ... on TreeAttribute {
    linked_tree {
      id
      label
    }
    tree_selection_conf {
      selectableNodes
      defaultExpanded
      displayRootNode
      maxDepth
      showSelectChildrenButton
      showSelectDescendantsButton
    }
    permissions_conf_dependent_values {
      dependenciesTreeAttributes {
        id
      }
    }
  }
}
    `;
export const AttributesByLibLinkAttributeFragmentDoc = gql`
    fragment AttributesByLibLinkAttribute on LinkAttribute {
  linked_library {
    id
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
  ...AttributesByLibLinkAttribute
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
    ${AttributesByLibLinkAttributeFragmentDoc}`;
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
export const LibraryTreeAttributeDetailsFragmentDoc = gql`
    fragment LibraryTreeAttributeDetails on TreeAttribute {
  linked_tree {
    id
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
  ...LibraryTreeAttributeDetails
}
    ${LibraryLinkAttributeDetailsFragmentDoc}
${LibraryTreeAttributeDetailsFragmentDoc}`;
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
    parentContext
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
  isCalculated
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
      payload
      raw_payload
    }
  }
  ... on Value {
    payload
    raw_payload
    value
    raw_value
  }
  ... on LinkValue {
    linkValue: payload {
      ...RecordIdentity
    }
  }
  ... on TreeValue {
    treeValue: payload {
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
  required
  multiple_values
  compute
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
    character_limit
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
      allowListUpdate
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
    tree_selection_conf {
      selectableNodes
      defaultExpanded
      displayRootNode
      maxDepth
      showSelectChildrenButton
      showSelectDescendantsButton
    }
    treeValuesList: values_list {
      enable
      allowFreeEntry
      allowListUpdate
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
export const JoinLibraryContextFragmentDoc = gql`
    fragment JoinLibraryContext on FormElementJoinLibraryContext {
  mandatoryAttribute {
    ...RecordFormAttribute
  }
}
    ${RecordFormAttributeFragmentDoc}`;
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
  joinLibraryContext {
    ...JoinLibraryContext
  }
}
    ${ValueDetailsFragmentDoc}
${RecordFormAttributeFragmentDoc}
${JoinLibraryContextFragmentDoc}`;
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
export const ViewDetailsFilterFragmentDoc = gql`
    fragment ViewDetailsFilter on RecordFilter {
  field
  value
  tree {
    id
    label
  }
  condition
  operator
  withEmptyValues
}
    `;
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
    ...ViewDetailsFilter
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
  attributes {
    id
  }
}
    ${ViewDetailsFilterFragmentDoc}
${RecordIdentityFragmentDoc}`;
export const TreeAttributeForMassEditionFragmentDoc = gql`
    fragment TreeAttributeForMassEdition on TreeAttribute {
  id
  tree_values {
    node {
      id
      record {
        id
        whoAmI {
          id
          label
          color
        }
      }
    }
    allowedDependentValues {
      nodeId
    }
  }
}
    `;
export const AttributesByLibLinkAttributeWithPermissionsFragmentDoc = gql`
    fragment AttributesByLibLinkAttributeWithPermissions on LinkAttribute {
  valuesList: values_list {
    enable
    allowFreeEntry
    linkedValues: values {
      ...RecordIdentity
    }
  }
  linked_library {
    id
  }
  smart_filter {
    enable
    through {
      id
    }
  }
}
    ${RecordIdentityFragmentDoc}`;
export const AttributesByLibAttributeWithPermissionsFragmentDoc = gql`
    fragment AttributesByLibAttributeWithPermissions on Attribute {
  id
  type
  format
  label
  multiple_values
  system
  required
  readonly
  compute
  permissions {
    access_attribute
  }
  ...AttributesByLibLinkAttributeWithPermissions
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
    permissions_conf_dependent_values {
      dependenciesTreeAttributes {
        id
      }
    }
  }
  ... on StandardAttribute {
    embedded_fields {
      id
      format
      label
    }
    valuesList: values_list {
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
    smart_filter {
      enable
    }
  }
}
    ${AttributesByLibLinkAttributeWithPermissionsFragmentDoc}`;
export const LinkAttributeDetailsFragmentDoc = gql`
    fragment LinkAttributeDetails on LinkAttribute {
  label
  type
  linked_library {
    id
    label
  }
  valuesList: values_list {
    allowFreeEntry
    enable
    linkedValues: values {
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
  smart_filter {
    enable
    through {
      id
    }
  }
}
    `;
export const TreeAttributeDetailsFragmentDoc = gql`
    fragment TreeAttributeDetails on TreeAttribute {
  id
  label
  linked_tree {
    id
    label
  }
}
    `;
export const StandardAttributeDetailsFragmentDoc = gql`
    fragment StandardAttributeDetails on StandardAttribute {
  id
  type
  embedded_fields {
    id
    format
    label
  }
  valuesList: values_list {
    ... on StandardStringValuesListConf {
      enable
      allowFreeEntry
      allowListUpdate
      values
    }
  }
  smart_filter {
    enable
  }
}
    `;
export const AttributePropertiesFragmentDoc = gql`
    fragment AttributeProperties on Attribute {
  id
  label
  type
  format
  multiple_values
  multi_link_display_option
  multi_tree_display_option
  ... on TreeAttribute {
    linked_tree {
      id
    }
  }
}
    `;
export const PropertyValueFragmentDoc = gql`
    fragment PropertyValue on GenericValue {
  ... on Value {
    valuePayload: payload
    valueRawPayload: raw_payload
  }
  ... on LinkValue {
    linkPayload: payload {
      ...RecordIdentity
    }
  }
  ... on TreeValue {
    treePayload: payload {
      record {
        ...RecordIdentity
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}`;
export const LinkPropertyFragmentDoc = gql`
    fragment LinkProperty on GenericValue {
  id_value
  ... on LinkValue {
    payload {
      ...RecordIdentity
      properties(attributeIds: $attributeIds) {
        attributeId
        attributeProperties {
          ...AttributeProperties
        }
        values {
          ...PropertyValue
        }
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}
${AttributePropertiesFragmentDoc}
${PropertyValueFragmentDoc}`;
export const LibraryAttributeLinkFragmentDoc = gql`
    fragment LibraryAttributeLink on LinkAttribute {
  linked_library {
    id
    label
    attributes {
      id
      type
      format
      label
    }
  }
}
    `;
export const LibraryAttributeFragmentDoc = gql`
    fragment LibraryAttribute on Attribute {
  id
  type
  label
  permissions {
    access_attribute
  }
  ... on StandardAttribute {
    format
  }
  ...LibraryAttributeLink
}
    ${LibraryAttributeLinkFragmentDoc}`;
export const ExplorerV2LinkPropertyFragmentDoc = gql`
    fragment ExplorerV2LinkProperty on GenericValue {
  id_value
  ... on LinkValue {
    payload {
      ...RecordIdentity
      properties(attributeIds: $attributeIds) {
        attributeId
        values {
          ...PropertyValue
        }
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}
${PropertyValueFragmentDoc}`;
export const ExplorerV2AttributePropertiesFragmentDoc = gql`
    fragment ExplorerV2AttributeProperties on Attribute {
  id
  label
  type
  format
  multiple_values
  multi_link_display_option
  multi_tree_display_option
  ... on LinkAttribute {
    linked_library {
      id
      recordIdentityConf {
        color
      }
    }
  }
  ... on TreeAttribute {
    linked_tree {
      id
      libraries {
        library {
          id
          recordIdentityConf {
            color
          }
        }
      }
    }
    permissions_conf_dependent_values {
      dependenciesTreeAttributes {
        id
        ... on TreeAttribute {
          linked_tree {
            libraries {
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
export const RecordHistoryLogAttributeFragmentDoc = gql`
    fragment RecordHistoryLogAttribute on LogAttribute {
  ... on StandardAttribute {
    id
    label
    type
    format
    multiple_values
    embedded_fields {
      id
      label
    }
  }
  ... on LinkAttribute {
    id
    label
    type
    format
    multiple_values
  }
  ... on TreeAttribute {
    id
    label
    type
    format
    multiple_values
  }
}
    `;
export const RecordHistoryLogEntryFragmentDoc = gql`
    fragment RecordHistoryLogEntry on Log {
  action
  time
  topic {
    attribute {
      ...RecordHistoryLogAttribute
      ... on LogUnknownEntity {
        id
        label
      }
    }
  }
  user {
    ... on Record {
      id
      whoAmI {
        id
        library {
          id
        }
      }
      properties(attributeIds: ["email"]) {
        attributeId
        values {
          ... on Value {
            payload
          }
        }
      }
    }
    ... on LogUnknownEntity {
      id
      label
    }
  }
  before {
    asString
  }
  after {
    asString
  }
}
    ${RecordHistoryLogAttributeFragmentDoc}`;
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
// @ts-ignore
export function useCheckApplicationExistenceSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>): Apollo.UseSuspenseQueryResult<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>;
export function useCheckApplicationExistenceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>): Apollo.UseSuspenseQueryResult<CheckApplicationExistenceQuery | undefined, CheckApplicationExistenceQueryVariables>;
export function useCheckApplicationExistenceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckApplicationExistenceQuery, CheckApplicationExistenceQueryVariables>(CheckApplicationExistenceDocument, options);
        }
export type CheckApplicationExistenceQueryHookResult = ReturnType<typeof useCheckApplicationExistenceQuery>;
export type CheckApplicationExistenceLazyQueryHookResult = ReturnType<typeof useCheckApplicationExistenceLazyQuery>;
export type CheckApplicationExistenceSuspenseQueryHookResult = ReturnType<typeof useCheckApplicationExistenceSuspenseQuery>;
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
export function useCheckAttributeExistenceQuery(baseOptions: Apollo.QueryHookOptions<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables> & ({ variables: CheckAttributeExistenceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>(CheckAttributeExistenceDocument, options);
      }
export function useCheckAttributeExistenceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>(CheckAttributeExistenceDocument, options);
        }
// @ts-ignore
export function useCheckAttributeExistenceSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>): Apollo.UseSuspenseQueryResult<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>;
export function useCheckAttributeExistenceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>): Apollo.UseSuspenseQueryResult<CheckAttributeExistenceQuery | undefined, CheckAttributeExistenceQueryVariables>;
export function useCheckAttributeExistenceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckAttributeExistenceQuery, CheckAttributeExistenceQueryVariables>(CheckAttributeExistenceDocument, options);
        }
export type CheckAttributeExistenceQueryHookResult = ReturnType<typeof useCheckAttributeExistenceQuery>;
export type CheckAttributeExistenceLazyQueryHookResult = ReturnType<typeof useCheckAttributeExistenceLazyQuery>;
export type CheckAttributeExistenceSuspenseQueryHookResult = ReturnType<typeof useCheckAttributeExistenceSuspenseQuery>;
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
export function useGetAttributesByLibQuery(baseOptions: Apollo.QueryHookOptions<GetAttributesByLibQuery, GetAttributesByLibQueryVariables> & ({ variables: GetAttributesByLibQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>(GetAttributesByLibDocument, options);
      }
export function useGetAttributesByLibLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>(GetAttributesByLibDocument, options);
        }
// @ts-ignore
export function useGetAttributesByLibSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>;
export function useGetAttributesByLibSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributesByLibQuery | undefined, GetAttributesByLibQueryVariables>;
export function useGetAttributesByLibSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAttributesByLibQuery, GetAttributesByLibQueryVariables>(GetAttributesByLibDocument, options);
        }
export type GetAttributesByLibQueryHookResult = ReturnType<typeof useGetAttributesByLibQuery>;
export type GetAttributesByLibLazyQueryHookResult = ReturnType<typeof useGetAttributesByLibLazyQuery>;
export type GetAttributesByLibSuspenseQueryHookResult = ReturnType<typeof useGetAttributesByLibSuspenseQuery>;
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
export function useGetVersionableAttributesByLibraryQuery(baseOptions: Apollo.QueryHookOptions<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables> & ({ variables: GetVersionableAttributesByLibraryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>(GetVersionableAttributesByLibraryDocument, options);
      }
export function useGetVersionableAttributesByLibraryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>(GetVersionableAttributesByLibraryDocument, options);
        }
// @ts-ignore
export function useGetVersionableAttributesByLibrarySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>): Apollo.UseSuspenseQueryResult<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>;
export function useGetVersionableAttributesByLibrarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>): Apollo.UseSuspenseQueryResult<GetVersionableAttributesByLibraryQuery | undefined, GetVersionableAttributesByLibraryQueryVariables>;
export function useGetVersionableAttributesByLibrarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetVersionableAttributesByLibraryQuery, GetVersionableAttributesByLibraryQueryVariables>(GetVersionableAttributesByLibraryDocument, options);
        }
export type GetVersionableAttributesByLibraryQueryHookResult = ReturnType<typeof useGetVersionableAttributesByLibraryQuery>;
export type GetVersionableAttributesByLibraryLazyQueryHookResult = ReturnType<typeof useGetVersionableAttributesByLibraryLazyQuery>;
export type GetVersionableAttributesByLibrarySuspenseQueryHookResult = ReturnType<typeof useGetVersionableAttributesByLibrarySuspenseQuery>;
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
    query EXPORT($library: ID!, $filters: [RecordFilterInput!], $profile: String, $searchQuery: String) {
  export(
    library: $library
    filters: $filters
    profile: $profile
    searchQuery: $searchQuery
  )
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
 *      filters: // value for 'filters'
 *      profile: // value for 'profile'
 *      searchQuery: // value for 'searchQuery'
 *   },
 * });
 */
export function useExportQuery(baseOptions: Apollo.QueryHookOptions<ExportQuery, ExportQueryVariables> & ({ variables: ExportQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExportQuery, ExportQueryVariables>(ExportDocument, options);
      }
export function useExportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExportQuery, ExportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExportQuery, ExportQueryVariables>(ExportDocument, options);
        }
// @ts-ignore
export function useExportSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExportQuery, ExportQueryVariables>): Apollo.UseSuspenseQueryResult<ExportQuery, ExportQueryVariables>;
export function useExportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExportQuery, ExportQueryVariables>): Apollo.UseSuspenseQueryResult<ExportQuery | undefined, ExportQueryVariables>;
export function useExportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExportQuery, ExportQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExportQuery, ExportQueryVariables>(ExportDocument, options);
        }
export type ExportQueryHookResult = ReturnType<typeof useExportQuery>;
export type ExportLazyQueryHookResult = ReturnType<typeof useExportLazyQuery>;
export type ExportSuspenseQueryHookResult = ReturnType<typeof useExportSuspenseQuery>;
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
export function useGetDirectoryDataQuery(baseOptions: Apollo.QueryHookOptions<GetDirectoryDataQuery, GetDirectoryDataQueryVariables> & ({ variables: GetDirectoryDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>(GetDirectoryDataDocument, options);
      }
export function useGetDirectoryDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>(GetDirectoryDataDocument, options);
        }
// @ts-ignore
export function useGetDirectoryDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>;
export function useGetDirectoryDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetDirectoryDataQuery | undefined, GetDirectoryDataQueryVariables>;
export function useGetDirectoryDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDirectoryDataQuery, GetDirectoryDataQueryVariables>(GetDirectoryDataDocument, options);
        }
export type GetDirectoryDataQueryHookResult = ReturnType<typeof useGetDirectoryDataQuery>;
export type GetDirectoryDataLazyQueryHookResult = ReturnType<typeof useGetDirectoryDataLazyQuery>;
export type GetDirectoryDataSuspenseQueryHookResult = ReturnType<typeof useGetDirectoryDataSuspenseQuery>;
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
// @ts-ignore
export function useCheckLibraryExistenceSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>): Apollo.UseSuspenseQueryResult<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>;
export function useCheckLibraryExistenceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>): Apollo.UseSuspenseQueryResult<CheckLibraryExistenceQuery | undefined, CheckLibraryExistenceQueryVariables>;
export function useCheckLibraryExistenceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckLibraryExistenceQuery, CheckLibraryExistenceQueryVariables>(CheckLibraryExistenceDocument, options);
        }
export type CheckLibraryExistenceQueryHookResult = ReturnType<typeof useCheckLibraryExistenceQuery>;
export type CheckLibraryExistenceLazyQueryHookResult = ReturnType<typeof useCheckLibraryExistenceLazyQuery>;
export type CheckLibraryExistenceSuspenseQueryHookResult = ReturnType<typeof useCheckLibraryExistenceSuspenseQuery>;
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
// @ts-ignore
export function useGetLibraryByIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>;
export function useGetLibraryByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryByIdQuery | undefined, GetLibraryByIdQueryVariables>;
export function useGetLibraryByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLibraryByIdQuery, GetLibraryByIdQueryVariables>(GetLibraryByIdDocument, options);
        }
export type GetLibraryByIdQueryHookResult = ReturnType<typeof useGetLibraryByIdQuery>;
export type GetLibraryByIdLazyQueryHookResult = ReturnType<typeof useGetLibraryByIdLazyQuery>;
export type GetLibraryByIdSuspenseQueryHookResult = ReturnType<typeof useGetLibraryByIdSuspenseQuery>;
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
export function useGetLibraryPreviewsSettingsQuery(baseOptions: Apollo.QueryHookOptions<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables> & ({ variables: GetLibraryPreviewsSettingsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>(GetLibraryPreviewsSettingsDocument, options);
      }
export function useGetLibraryPreviewsSettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>(GetLibraryPreviewsSettingsDocument, options);
        }
// @ts-ignore
export function useGetLibraryPreviewsSettingsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>;
export function useGetLibraryPreviewsSettingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryPreviewsSettingsQuery | undefined, GetLibraryPreviewsSettingsQueryVariables>;
export function useGetLibraryPreviewsSettingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLibraryPreviewsSettingsQuery, GetLibraryPreviewsSettingsQueryVariables>(GetLibraryPreviewsSettingsDocument, options);
        }
export type GetLibraryPreviewsSettingsQueryHookResult = ReturnType<typeof useGetLibraryPreviewsSettingsQuery>;
export type GetLibraryPreviewsSettingsLazyQueryHookResult = ReturnType<typeof useGetLibraryPreviewsSettingsLazyQuery>;
export type GetLibraryPreviewsSettingsSuspenseQueryHookResult = ReturnType<typeof useGetLibraryPreviewsSettingsSuspenseQuery>;
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
export const ActivateNewRecordDocument = gql`
    mutation activateNewRecord($libraryId: ID!, $recordId: ID!, $formId: String) {
  activateNewRecord(library: $libraryId, recordId: $recordId, formId: $formId) {
    record {
      ...RecordIdentity
    }
    valuesErrors {
      type
      attribute
      input
      message
    }
  }
}
    ${RecordIdentityFragmentDoc}`;
export type ActivateNewRecordMutationFn = Apollo.MutationFunction<ActivateNewRecordMutation, ActivateNewRecordMutationVariables>;

/**
 * __useActivateNewRecordMutation__
 *
 * To run a mutation, you first call `useActivateNewRecordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateNewRecordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateNewRecordMutation, { data, loading, error }] = useActivateNewRecordMutation({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      recordId: // value for 'recordId'
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useActivateNewRecordMutation(baseOptions?: Apollo.MutationHookOptions<ActivateNewRecordMutation, ActivateNewRecordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ActivateNewRecordMutation, ActivateNewRecordMutationVariables>(ActivateNewRecordDocument, options);
      }
export type ActivateNewRecordMutationHookResult = ReturnType<typeof useActivateNewRecordMutation>;
export type ActivateNewRecordMutationResult = Apollo.MutationResult<ActivateNewRecordMutation>;
export type ActivateNewRecordMutationOptions = Apollo.BaseMutationOptions<ActivateNewRecordMutation, ActivateNewRecordMutationVariables>;
export const ActivateRecordsDocument = gql`
    mutation ACTIVATE_RECORDS($libraryId: String!, $recordsIds: [String!], $filters: [RecordFilterInput!]) {
  activateRecords(
    recordsIds: $recordsIds
    filters: $filters
    libraryId: $libraryId
  ) {
    id
    ...RecordIdentity
  }
}
    ${RecordIdentityFragmentDoc}`;
export type ActivateRecordsMutationFn = Apollo.MutationFunction<ActivateRecordsMutation, ActivateRecordsMutationVariables>;

/**
 * __useActivateRecordsMutation__
 *
 * To run a mutation, you first call `useActivateRecordsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateRecordsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateRecordsMutation, { data, loading, error }] = useActivateRecordsMutation({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      recordsIds: // value for 'recordsIds'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useActivateRecordsMutation(baseOptions?: Apollo.MutationHookOptions<ActivateRecordsMutation, ActivateRecordsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ActivateRecordsMutation, ActivateRecordsMutationVariables>(ActivateRecordsDocument, options);
      }
export type ActivateRecordsMutationHookResult = ReturnType<typeof useActivateRecordsMutation>;
export type ActivateRecordsMutationResult = Apollo.MutationResult<ActivateRecordsMutation>;
export type ActivateRecordsMutationOptions = Apollo.BaseMutationOptions<ActivateRecordsMutation, ActivateRecordsMutationVariables>;
export const CreateRecordDocument = gql`
    mutation CREATE_RECORD($library: ID!, $skipActivate: Boolean, $data: CreateRecordDataInput) {
  createRecord(library: $library, skipActivate: $skipActivate, data: $data) {
    record {
      ...RecordIdentity
    }
    valuesErrors {
      type
      attribute
      input
      message
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
 *      skipActivate: // value for 'skipActivate'
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
    mutation DEACTIVATE_RECORDS($libraryId: String!, $recordsIds: [String!], $filters: [RecordFilterInput!], $searchQuery: String) {
  deactivateRecords(
    recordsIds: $recordsIds
    filters: $filters
    libraryId: $libraryId
    searchQuery: $searchQuery
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
 *      searchQuery: // value for 'searchQuery'
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
export function useDoesFileExistAsChildQuery(baseOptions: Apollo.QueryHookOptions<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables> & ({ variables: DoesFileExistAsChildQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>(DoesFileExistAsChildDocument, options);
      }
export function useDoesFileExistAsChildLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>(DoesFileExistAsChildDocument, options);
        }
// @ts-ignore
export function useDoesFileExistAsChildSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>): Apollo.UseSuspenseQueryResult<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>;
export function useDoesFileExistAsChildSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>): Apollo.UseSuspenseQueryResult<DoesFileExistAsChildQuery | undefined, DoesFileExistAsChildQueryVariables>;
export function useDoesFileExistAsChildSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DoesFileExistAsChildQuery, DoesFileExistAsChildQueryVariables>(DoesFileExistAsChildDocument, options);
        }
export type DoesFileExistAsChildQueryHookResult = ReturnType<typeof useDoesFileExistAsChildQuery>;
export type DoesFileExistAsChildLazyQueryHookResult = ReturnType<typeof useDoesFileExistAsChildLazyQuery>;
export type DoesFileExistAsChildSuspenseQueryHookResult = ReturnType<typeof useDoesFileExistAsChildSuspenseQuery>;
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
export function useGetFileDataQuery(baseOptions: Apollo.QueryHookOptions<GetFileDataQuery, GetFileDataQueryVariables> & ({ variables: GetFileDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFileDataQuery, GetFileDataQueryVariables>(GetFileDataDocument, options);
      }
export function useGetFileDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFileDataQuery, GetFileDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFileDataQuery, GetFileDataQueryVariables>(GetFileDataDocument, options);
        }
// @ts-ignore
export function useGetFileDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFileDataQuery, GetFileDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetFileDataQuery, GetFileDataQueryVariables>;
export function useGetFileDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFileDataQuery, GetFileDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetFileDataQuery | undefined, GetFileDataQueryVariables>;
export function useGetFileDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFileDataQuery, GetFileDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFileDataQuery, GetFileDataQueryVariables>(GetFileDataDocument, options);
        }
export type GetFileDataQueryHookResult = ReturnType<typeof useGetFileDataQuery>;
export type GetFileDataLazyQueryHookResult = ReturnType<typeof useGetFileDataLazyQuery>;
export type GetFileDataSuspenseQueryHookResult = ReturnType<typeof useGetFileDataSuspenseQuery>;
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
    sidePanel {
      enable
      isOpenByDefault
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
export function useRecordFormQuery(baseOptions: Apollo.QueryHookOptions<RecordFormQuery, RecordFormQueryVariables> & ({ variables: RecordFormQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecordFormQuery, RecordFormQueryVariables>(RecordFormDocument, options);
      }
export function useRecordFormLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecordFormQuery, RecordFormQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecordFormQuery, RecordFormQueryVariables>(RecordFormDocument, options);
        }
// @ts-ignore
export function useRecordFormSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<RecordFormQuery, RecordFormQueryVariables>): Apollo.UseSuspenseQueryResult<RecordFormQuery, RecordFormQueryVariables>;
export function useRecordFormSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RecordFormQuery, RecordFormQueryVariables>): Apollo.UseSuspenseQueryResult<RecordFormQuery | undefined, RecordFormQueryVariables>;
export function useRecordFormSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RecordFormQuery, RecordFormQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RecordFormQuery, RecordFormQueryVariables>(RecordFormDocument, options);
        }
export type RecordFormQueryHookResult = ReturnType<typeof useRecordFormQuery>;
export type RecordFormLazyQueryHookResult = ReturnType<typeof useRecordFormLazyQuery>;
export type RecordFormSuspenseQueryHookResult = ReturnType<typeof useRecordFormSuspenseQuery>;
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
export const GetRecordsFromLibraryDocument = gql`
    query getRecordsFromLibrary($libraryId: ID!, $pagination: RecordsPagination, $filters: [RecordFilterInput]) {
  records(library: $libraryId, filters: $filters, pagination: $pagination) {
    totalCount
    list {
      ...RecordIdentity
    }
  }
}
    ${RecordIdentityFragmentDoc}`;

/**
 * __useGetRecordsFromLibraryQuery__
 *
 * To run a query within a React component, call `useGetRecordsFromLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecordsFromLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecordsFromLibraryQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      pagination: // value for 'pagination'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetRecordsFromLibraryQuery(baseOptions: Apollo.QueryHookOptions<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables> & ({ variables: GetRecordsFromLibraryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables>(GetRecordsFromLibraryDocument, options);
      }
export function useGetRecordsFromLibraryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables>(GetRecordsFromLibraryDocument, options);
        }
// @ts-ignore
export function useGetRecordsFromLibrarySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables>;
export function useGetRecordsFromLibrarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecordsFromLibraryQuery | undefined, GetRecordsFromLibraryQueryVariables>;
export function useGetRecordsFromLibrarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables>(GetRecordsFromLibraryDocument, options);
        }
export type GetRecordsFromLibraryQueryHookResult = ReturnType<typeof useGetRecordsFromLibraryQuery>;
export type GetRecordsFromLibraryLazyQueryHookResult = ReturnType<typeof useGetRecordsFromLibraryLazyQuery>;
export type GetRecordsFromLibrarySuspenseQueryHookResult = ReturnType<typeof useGetRecordsFromLibrarySuspenseQuery>;
export type GetRecordsFromLibraryQueryResult = Apollo.QueryResult<GetRecordsFromLibraryQuery, GetRecordsFromLibraryQueryVariables>;
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
export const PurgeRecordDocument = gql`
    mutation purgeRecord($libraryId: ID!, $recordId: ID!) {
  purgeRecord(libraryId: $libraryId, recordId: $recordId) {
    ...RecordIdentity
  }
}
    ${RecordIdentityFragmentDoc}`;
export type PurgeRecordMutationFn = Apollo.MutationFunction<PurgeRecordMutation, PurgeRecordMutationVariables>;

/**
 * __usePurgeRecordMutation__
 *
 * To run a mutation, you first call `usePurgeRecordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePurgeRecordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [purgeRecordMutation, { data, loading, error }] = usePurgeRecordMutation({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      recordId: // value for 'recordId'
 *   },
 * });
 */
export function usePurgeRecordMutation(baseOptions?: Apollo.MutationHookOptions<PurgeRecordMutation, PurgeRecordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PurgeRecordMutation, PurgeRecordMutationVariables>(PurgeRecordDocument, options);
      }
export type PurgeRecordMutationHookResult = ReturnType<typeof usePurgeRecordMutation>;
export type PurgeRecordMutationResult = Apollo.MutationResult<PurgeRecordMutation>;
export type PurgeRecordMutationOptions = Apollo.BaseMutationOptions<PurgeRecordMutation, PurgeRecordMutationVariables>;
export const GetRecordIdCardDocument = gql`
    query GetRecordIdCard($id: String, $libraryId: ID!) {
  records(
    library: $libraryId
    filters: [{field: "id", condition: EQUAL, value: $id}]
  ) {
    list {
      id
      whoAmI {
        id
        color
        label
        subLabel
        preview
        parentContext {
          id
          label
        }
      }
    }
  }
}
    `;

/**
 * __useGetRecordIdCardQuery__
 *
 * To run a query within a React component, call `useGetRecordIdCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecordIdCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecordIdCardQuery({
 *   variables: {
 *      id: // value for 'id'
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useGetRecordIdCardQuery(baseOptions: Apollo.QueryHookOptions<GetRecordIdCardQuery, GetRecordIdCardQueryVariables> & ({ variables: GetRecordIdCardQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecordIdCardQuery, GetRecordIdCardQueryVariables>(GetRecordIdCardDocument, options);
      }
export function useGetRecordIdCardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecordIdCardQuery, GetRecordIdCardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecordIdCardQuery, GetRecordIdCardQueryVariables>(GetRecordIdCardDocument, options);
        }
// @ts-ignore
export function useGetRecordIdCardSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecordIdCardQuery, GetRecordIdCardQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecordIdCardQuery, GetRecordIdCardQueryVariables>;
export function useGetRecordIdCardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecordIdCardQuery, GetRecordIdCardQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecordIdCardQuery | undefined, GetRecordIdCardQueryVariables>;
export function useGetRecordIdCardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecordIdCardQuery, GetRecordIdCardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecordIdCardQuery, GetRecordIdCardQueryVariables>(GetRecordIdCardDocument, options);
        }
export type GetRecordIdCardQueryHookResult = ReturnType<typeof useGetRecordIdCardQuery>;
export type GetRecordIdCardLazyQueryHookResult = ReturnType<typeof useGetRecordIdCardLazyQuery>;
export type GetRecordIdCardSuspenseQueryHookResult = ReturnType<typeof useGetRecordIdCardSuspenseQuery>;
export type GetRecordIdCardQueryResult = Apollo.QueryResult<GetRecordIdCardQuery, GetRecordIdCardQueryVariables>;
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
// @ts-ignore
export function useCheckTreeExistenceSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>): Apollo.UseSuspenseQueryResult<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>;
export function useCheckTreeExistenceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>): Apollo.UseSuspenseQueryResult<CheckTreeExistenceQuery | undefined, CheckTreeExistenceQueryVariables>;
export function useCheckTreeExistenceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckTreeExistenceQuery, CheckTreeExistenceQueryVariables>(CheckTreeExistenceDocument, options);
        }
export type CheckTreeExistenceQueryHookResult = ReturnType<typeof useCheckTreeExistenceQuery>;
export type CheckTreeExistenceLazyQueryHookResult = ReturnType<typeof useCheckTreeExistenceLazyQuery>;
export type CheckTreeExistenceSuspenseQueryHookResult = ReturnType<typeof useCheckTreeExistenceSuspenseQuery>;
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
    query TREE_NODE_CHILDREN($treeId: ID!, $node: ID, $pagination: Pagination, $childrenAsRecordValuePermissionFilter: ChildrenAsRecordValuePermissionFilterInput, $dependentValuesPermissionFilter: DependentValuesPermissionFilterInput) {
  treeNodeChildren(
    treeId: $treeId
    node: $node
    pagination: $pagination
    childrenAsRecordValuePermissionFilter: $childrenAsRecordValuePermissionFilter
    dependentValuesPermissionFilter: $dependentValuesPermissionFilter
  ) {
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
 *      childrenAsRecordValuePermissionFilter: // value for 'childrenAsRecordValuePermissionFilter'
 *      dependentValuesPermissionFilter: // value for 'dependentValuesPermissionFilter'
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
export const SaveValueBulkDocument = gql`
    mutation SAVE_VALUE_BULK($libraryId: ID!, $recordsFilters: [RecordFilterInput]!, $searchQuery: String, $attributeId: ID!, $mapping: [SaveValueBulkMappingInput!]!) {
  saveValueBulk(
    libraryId: $libraryId
    recordsFilters: $recordsFilters
    searchQuery: $searchQuery
    attributeId: $attributeId
    mapping: $mapping
  )
}
    `;
export type SaveValueBulkMutationFn = Apollo.MutationFunction<SaveValueBulkMutation, SaveValueBulkMutationVariables>;

/**
 * __useSaveValueBulkMutation__
 *
 * To run a mutation, you first call `useSaveValueBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveValueBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveValueBulkMutation, { data, loading, error }] = useSaveValueBulkMutation({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      recordsFilters: // value for 'recordsFilters'
 *      searchQuery: // value for 'searchQuery'
 *      attributeId: // value for 'attributeId'
 *      mapping: // value for 'mapping'
 *   },
 * });
 */
export function useSaveValueBulkMutation(baseOptions?: Apollo.MutationHookOptions<SaveValueBulkMutation, SaveValueBulkMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveValueBulkMutation, SaveValueBulkMutationVariables>(SaveValueBulkDocument, options);
      }
export type SaveValueBulkMutationHookResult = ReturnType<typeof useSaveValueBulkMutation>;
export type SaveValueBulkMutationResult = Apollo.MutationResult<SaveValueBulkMutation>;
export type SaveValueBulkMutationOptions = Apollo.BaseMutationOptions<SaveValueBulkMutation, SaveValueBulkMutationVariables>;
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
export function useGetViewQuery(baseOptions: Apollo.QueryHookOptions<GetViewQuery, GetViewQueryVariables> & ({ variables: GetViewQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewQuery, GetViewQueryVariables>(GetViewDocument, options);
      }
export function useGetViewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewQuery, GetViewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewQuery, GetViewQueryVariables>(GetViewDocument, options);
        }
// @ts-ignore
export function useGetViewSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetViewQuery, GetViewQueryVariables>): Apollo.UseSuspenseQueryResult<GetViewQuery, GetViewQueryVariables>;
export function useGetViewSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewQuery, GetViewQueryVariables>): Apollo.UseSuspenseQueryResult<GetViewQuery | undefined, GetViewQueryVariables>;
export function useGetViewSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewQuery, GetViewQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetViewQuery, GetViewQueryVariables>(GetViewDocument, options);
        }
export type GetViewQueryHookResult = ReturnType<typeof useGetViewQuery>;
export type GetViewLazyQueryHookResult = ReturnType<typeof useGetViewLazyQuery>;
export type GetViewSuspenseQueryHookResult = ReturnType<typeof useGetViewSuspenseQuery>;
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
export function useGetViewsListQuery(baseOptions: Apollo.QueryHookOptions<GetViewsListQuery, GetViewsListQueryVariables> & ({ variables: GetViewsListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewsListQuery, GetViewsListQueryVariables>(GetViewsListDocument, options);
      }
export function useGetViewsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewsListQuery, GetViewsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewsListQuery, GetViewsListQueryVariables>(GetViewsListDocument, options);
        }
// @ts-ignore
export function useGetViewsListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetViewsListQuery, GetViewsListQueryVariables>): Apollo.UseSuspenseQueryResult<GetViewsListQuery, GetViewsListQueryVariables>;
export function useGetViewsListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewsListQuery, GetViewsListQueryVariables>): Apollo.UseSuspenseQueryResult<GetViewsListQuery | undefined, GetViewsListQueryVariables>;
export function useGetViewsListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewsListQuery, GetViewsListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetViewsListQuery, GetViewsListQueryVariables>(GetViewsListDocument, options);
        }
export type GetViewsListQueryHookResult = ReturnType<typeof useGetViewsListQuery>;
export type GetViewsListLazyQueryHookResult = ReturnType<typeof useGetViewsListLazyQuery>;
export type GetViewsListSuspenseQueryHookResult = ReturnType<typeof useGetViewsListSuspenseQuery>;
export type GetViewsListQueryResult = Apollo.QueryResult<GetViewsListQuery, GetViewsListQueryVariables>;
export const SaveViewDocument = gql`
    mutation SAVE_VIEW($view: ViewInput!) {
  saveView(view: $view) {
    ...ViewDetails
  }
}
    ${ViewDetailsFragmentDoc}`;
export type SaveViewMutationFn = Apollo.MutationFunction<SaveViewMutation, SaveViewMutationVariables>;

/**
 * __useSaveViewMutation__
 *
 * To run a mutation, you first call `useSaveViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveViewMutation, { data, loading, error }] = useSaveViewMutation({
 *   variables: {
 *      view: // value for 'view'
 *   },
 * });
 */
export function useSaveViewMutation(baseOptions?: Apollo.MutationHookOptions<SaveViewMutation, SaveViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveViewMutation, SaveViewMutationVariables>(SaveViewDocument, options);
      }
export type SaveViewMutationHookResult = ReturnType<typeof useSaveViewMutation>;
export type SaveViewMutationResult = Apollo.MutationResult<SaveViewMutation>;
export type SaveViewMutationOptions = Apollo.BaseMutationOptions<SaveViewMutation, SaveViewMutationVariables>;
export const AttributeWithValuesForMassEditionDocument = gql`
    query AttributeWithValuesForMassEdition($attributeId: ID!) {
  attributes(filters: {id: $attributeId}) {
    list {
      ...TreeAttributeForMassEdition
    }
  }
}
    ${TreeAttributeForMassEditionFragmentDoc}`;

/**
 * __useAttributeWithValuesForMassEditionQuery__
 *
 * To run a query within a React component, call `useAttributeWithValuesForMassEditionQuery` and pass it any options that fit your needs.
 * When your component renders, `useAttributeWithValuesForMassEditionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAttributeWithValuesForMassEditionQuery({
 *   variables: {
 *      attributeId: // value for 'attributeId'
 *   },
 * });
 */
export function useAttributeWithValuesForMassEditionQuery(baseOptions: Apollo.QueryHookOptions<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables> & ({ variables: AttributeWithValuesForMassEditionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables>(AttributeWithValuesForMassEditionDocument, options);
      }
export function useAttributeWithValuesForMassEditionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables>(AttributeWithValuesForMassEditionDocument, options);
        }
// @ts-ignore
export function useAttributeWithValuesForMassEditionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables>): Apollo.UseSuspenseQueryResult<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables>;
export function useAttributeWithValuesForMassEditionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables>): Apollo.UseSuspenseQueryResult<AttributeWithValuesForMassEditionQuery | undefined, AttributeWithValuesForMassEditionQueryVariables>;
export function useAttributeWithValuesForMassEditionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables>(AttributeWithValuesForMassEditionDocument, options);
        }
export type AttributeWithValuesForMassEditionQueryHookResult = ReturnType<typeof useAttributeWithValuesForMassEditionQuery>;
export type AttributeWithValuesForMassEditionLazyQueryHookResult = ReturnType<typeof useAttributeWithValuesForMassEditionLazyQuery>;
export type AttributeWithValuesForMassEditionSuspenseQueryHookResult = ReturnType<typeof useAttributeWithValuesForMassEditionSuspenseQuery>;
export type AttributeWithValuesForMassEditionQueryResult = Apollo.QueryResult<AttributeWithValuesForMassEditionQuery, AttributeWithValuesForMassEditionQueryVariables>;
export const GetAttributesByLibWithPermissionsDocument = gql`
    query getAttributesByLibWithPermissions($library: String!) {
  attributes(filters: {libraries: [$library]}) {
    list {
      ...AttributesByLibAttributeWithPermissions
    }
  }
}
    ${AttributesByLibAttributeWithPermissionsFragmentDoc}`;

/**
 * __useGetAttributesByLibWithPermissionsQuery__
 *
 * To run a query within a React component, call `useGetAttributesByLibWithPermissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAttributesByLibWithPermissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAttributesByLibWithPermissionsQuery({
 *   variables: {
 *      library: // value for 'library'
 *   },
 * });
 */
export function useGetAttributesByLibWithPermissionsQuery(baseOptions: Apollo.QueryHookOptions<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables> & ({ variables: GetAttributesByLibWithPermissionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables>(GetAttributesByLibWithPermissionsDocument, options);
      }
export function useGetAttributesByLibWithPermissionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables>(GetAttributesByLibWithPermissionsDocument, options);
        }
// @ts-ignore
export function useGetAttributesByLibWithPermissionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables>;
export function useGetAttributesByLibWithPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAttributesByLibWithPermissionsQuery | undefined, GetAttributesByLibWithPermissionsQueryVariables>;
export function useGetAttributesByLibWithPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables>(GetAttributesByLibWithPermissionsDocument, options);
        }
export type GetAttributesByLibWithPermissionsQueryHookResult = ReturnType<typeof useGetAttributesByLibWithPermissionsQuery>;
export type GetAttributesByLibWithPermissionsLazyQueryHookResult = ReturnType<typeof useGetAttributesByLibWithPermissionsLazyQuery>;
export type GetAttributesByLibWithPermissionsSuspenseQueryHookResult = ReturnType<typeof useGetAttributesByLibWithPermissionsSuspenseQuery>;
export type GetAttributesByLibWithPermissionsQueryResult = Apollo.QueryResult<GetAttributesByLibWithPermissionsQuery, GetAttributesByLibWithPermissionsQueryVariables>;
export const ExplorerAttributesDocument = gql`
    query ExplorerAttributes($ids: [ID!]) {
  attributes(filters: {ids: $ids}) {
    list {
      id
      type
      format
      label
      permissions {
        access_attribute
      }
      ...StandardAttributeDetails
      ...LinkAttributeDetails
      ...TreeAttributeDetails
    }
  }
}
    ${StandardAttributeDetailsFragmentDoc}
${LinkAttributeDetailsFragmentDoc}
${TreeAttributeDetailsFragmentDoc}`;

/**
 * __useExplorerAttributesQuery__
 *
 * To run a query within a React component, call `useExplorerAttributesQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerAttributesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerAttributesQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useExplorerAttributesQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>(ExplorerAttributesDocument, options);
      }
export function useExplorerAttributesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>(ExplorerAttributesDocument, options);
        }
// @ts-ignore
export function useExplorerAttributesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>;
export function useExplorerAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerAttributesQuery | undefined, ExplorerAttributesQueryVariables>;
export function useExplorerAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>(ExplorerAttributesDocument, options);
        }
export type ExplorerAttributesQueryHookResult = ReturnType<typeof useExplorerAttributesQuery>;
export type ExplorerAttributesLazyQueryHookResult = ReturnType<typeof useExplorerAttributesLazyQuery>;
export type ExplorerAttributesSuspenseQueryHookResult = ReturnType<typeof useExplorerAttributesSuspenseQuery>;
export type ExplorerAttributesQueryResult = Apollo.QueryResult<ExplorerAttributesQuery, ExplorerAttributesQueryVariables>;
export const ExplorerLinkAttributeDocument = gql`
    query ExplorerLinkAttribute($id: ID!) {
  attributes(filters: {ids: [$id]}) {
    list {
      id
      multiple_values
      permissions {
        access_attribute
        edit_value
      }
      ...LinkAttributeDetails
      ...TreeAttributeDetails
    }
  }
}
    ${LinkAttributeDetailsFragmentDoc}
${TreeAttributeDetailsFragmentDoc}`;

/**
 * __useExplorerLinkAttributeQuery__
 *
 * To run a query within a React component, call `useExplorerLinkAttributeQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerLinkAttributeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerLinkAttributeQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerLinkAttributeQuery(baseOptions: Apollo.QueryHookOptions<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables> & ({ variables: ExplorerLinkAttributeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables>(ExplorerLinkAttributeDocument, options);
      }
export function useExplorerLinkAttributeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables>(ExplorerLinkAttributeDocument, options);
        }
// @ts-ignore
export function useExplorerLinkAttributeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables>;
export function useExplorerLinkAttributeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLinkAttributeQuery | undefined, ExplorerLinkAttributeQueryVariables>;
export function useExplorerLinkAttributeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables>(ExplorerLinkAttributeDocument, options);
        }
export type ExplorerLinkAttributeQueryHookResult = ReturnType<typeof useExplorerLinkAttributeQuery>;
export type ExplorerLinkAttributeLazyQueryHookResult = ReturnType<typeof useExplorerLinkAttributeLazyQuery>;
export type ExplorerLinkAttributeSuspenseQueryHookResult = ReturnType<typeof useExplorerLinkAttributeSuspenseQuery>;
export type ExplorerLinkAttributeQueryResult = Apollo.QueryResult<ExplorerLinkAttributeQuery, ExplorerLinkAttributeQueryVariables>;
export const ExplorerLibraryCountDataDocument = gql`
    query ExplorerLibraryCountData($libraryId: ID!, $filters: [RecordFilterInput]) {
  records(library: $libraryId, filters: $filters) {
    totalCount
  }
}
    `;

/**
 * __useExplorerLibraryCountDataQuery__
 *
 * To run a query within a React component, call `useExplorerLibraryCountDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerLibraryCountDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerLibraryCountDataQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useExplorerLibraryCountDataQuery(baseOptions: Apollo.QueryHookOptions<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables> & ({ variables: ExplorerLibraryCountDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables>(ExplorerLibraryCountDataDocument, options);
      }
export function useExplorerLibraryCountDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables>(ExplorerLibraryCountDataDocument, options);
        }
// @ts-ignore
export function useExplorerLibraryCountDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables>;
export function useExplorerLibraryCountDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLibraryCountDataQuery | undefined, ExplorerLibraryCountDataQueryVariables>;
export function useExplorerLibraryCountDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables>(ExplorerLibraryCountDataDocument, options);
        }
export type ExplorerLibraryCountDataQueryHookResult = ReturnType<typeof useExplorerLibraryCountDataQuery>;
export type ExplorerLibraryCountDataLazyQueryHookResult = ReturnType<typeof useExplorerLibraryCountDataLazyQuery>;
export type ExplorerLibraryCountDataSuspenseQueryHookResult = ReturnType<typeof useExplorerLibraryCountDataSuspenseQuery>;
export type ExplorerLibraryCountDataQueryResult = Apollo.QueryResult<ExplorerLibraryCountDataQuery, ExplorerLibraryCountDataQueryVariables>;
export const ExplorerLibraryDataDocument = gql`
    query ExplorerLibraryData($libraryId: ID!, $attributeIds: [ID!]!, $pagination: RecordsPagination, $filters: [RecordFilterInput], $multipleSort: [RecordSortInput!], $searchQuery: String) {
  records(
    library: $libraryId
    filters: $filters
    pagination: $pagination
    multipleSort: $multipleSort
    searchQuery: $searchQuery
  ) {
    totalCount
    list {
      ...RecordIdentity
      active
      permissions {
        create_record
        delete_record
      }
      properties(attributeIds: $attributeIds) {
        attributeId
        attributeProperties {
          ...AttributeProperties
        }
        values {
          ...PropertyValue
        }
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}
${AttributePropertiesFragmentDoc}
${PropertyValueFragmentDoc}`;

/**
 * __useExplorerLibraryDataQuery__
 *
 * To run a query within a React component, call `useExplorerLibraryDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerLibraryDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerLibraryDataQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      attributeIds: // value for 'attributeIds'
 *      pagination: // value for 'pagination'
 *      filters: // value for 'filters'
 *      multipleSort: // value for 'multipleSort'
 *      searchQuery: // value for 'searchQuery'
 *   },
 * });
 */
export function useExplorerLibraryDataQuery(baseOptions: Apollo.QueryHookOptions<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables> & ({ variables: ExplorerLibraryDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables>(ExplorerLibraryDataDocument, options);
      }
export function useExplorerLibraryDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables>(ExplorerLibraryDataDocument, options);
        }
// @ts-ignore
export function useExplorerLibraryDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables>;
export function useExplorerLibraryDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLibraryDataQuery | undefined, ExplorerLibraryDataQueryVariables>;
export function useExplorerLibraryDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables>(ExplorerLibraryDataDocument, options);
        }
export type ExplorerLibraryDataQueryHookResult = ReturnType<typeof useExplorerLibraryDataQuery>;
export type ExplorerLibraryDataLazyQueryHookResult = ReturnType<typeof useExplorerLibraryDataLazyQuery>;
export type ExplorerLibraryDataSuspenseQueryHookResult = ReturnType<typeof useExplorerLibraryDataSuspenseQuery>;
export type ExplorerLibraryDataQueryResult = Apollo.QueryResult<ExplorerLibraryDataQuery, ExplorerLibraryDataQueryVariables>;
export const ExplorerLinkDataDocument = gql`
    query ExplorerLinkData($attributeIds: [ID!]!, $parentLibraryId: ID!, $parentRecordId: String, $linkAttributeId: ID!) {
  records(
    library: $parentLibraryId
    filters: [{field: "id", condition: EQUAL, value: $parentRecordId}]
    retrieveInactive: true
  ) {
    list {
      id
      whoAmI {
        id
        library {
          id
        }
      }
      property(attribute: $linkAttributeId) {
        ...LinkProperty
      }
    }
  }
}
    ${LinkPropertyFragmentDoc}`;

/**
 * __useExplorerLinkDataQuery__
 *
 * To run a query within a React component, call `useExplorerLinkDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerLinkDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerLinkDataQuery({
 *   variables: {
 *      attributeIds: // value for 'attributeIds'
 *      parentLibraryId: // value for 'parentLibraryId'
 *      parentRecordId: // value for 'parentRecordId'
 *      linkAttributeId: // value for 'linkAttributeId'
 *   },
 * });
 */
export function useExplorerLinkDataQuery(baseOptions: Apollo.QueryHookOptions<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables> & ({ variables: ExplorerLinkDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables>(ExplorerLinkDataDocument, options);
      }
export function useExplorerLinkDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables>(ExplorerLinkDataDocument, options);
        }
// @ts-ignore
export function useExplorerLinkDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables>;
export function useExplorerLinkDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLinkDataQuery | undefined, ExplorerLinkDataQueryVariables>;
export function useExplorerLinkDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables>(ExplorerLinkDataDocument, options);
        }
export type ExplorerLinkDataQueryHookResult = ReturnType<typeof useExplorerLinkDataQuery>;
export type ExplorerLinkDataLazyQueryHookResult = ReturnType<typeof useExplorerLinkDataLazyQuery>;
export type ExplorerLinkDataSuspenseQueryHookResult = ReturnType<typeof useExplorerLinkDataSuspenseQuery>;
export type ExplorerLinkDataQueryResult = Apollo.QueryResult<ExplorerLinkDataQuery, ExplorerLinkDataQueryVariables>;
export const GetLibraryAttributesDocument = gql`
    query GetLibraryAttributes($libraryId: ID!) {
  libraries(filters: {id: [$libraryId]}) {
    list {
      id
      attributes {
        ...LibraryAttribute
      }
    }
  }
}
    ${LibraryAttributeFragmentDoc}`;

/**
 * __useGetLibraryAttributesQuery__
 *
 * To run a query within a React component, call `useGetLibraryAttributesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibraryAttributesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibraryAttributesQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useGetLibraryAttributesQuery(baseOptions: Apollo.QueryHookOptions<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables> & ({ variables: GetLibraryAttributesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables>(GetLibraryAttributesDocument, options);
      }
export function useGetLibraryAttributesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables>(GetLibraryAttributesDocument, options);
        }
// @ts-ignore
export function useGetLibraryAttributesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables>;
export function useGetLibraryAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryAttributesQuery | undefined, GetLibraryAttributesQueryVariables>;
export function useGetLibraryAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables>(GetLibraryAttributesDocument, options);
        }
export type GetLibraryAttributesQueryHookResult = ReturnType<typeof useGetLibraryAttributesQuery>;
export type GetLibraryAttributesLazyQueryHookResult = ReturnType<typeof useGetLibraryAttributesLazyQuery>;
export type GetLibraryAttributesSuspenseQueryHookResult = ReturnType<typeof useGetLibraryAttributesSuspenseQuery>;
export type GetLibraryAttributesQueryResult = Apollo.QueryResult<GetLibraryAttributesQuery, GetLibraryAttributesQueryVariables>;
export const ExplorerLibraryDetailsDocument = gql`
    query ExplorerLibraryDetails($libraryId: ID!) {
  libraries(filters: {id: [$libraryId]}) {
    list {
      id
      label
      behavior
      permissions {
        create_record
      }
    }
  }
}
    `;

/**
 * __useExplorerLibraryDetailsQuery__
 *
 * To run a query within a React component, call `useExplorerLibraryDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerLibraryDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerLibraryDetailsQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useExplorerLibraryDetailsQuery(baseOptions: Apollo.QueryHookOptions<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables> & ({ variables: ExplorerLibraryDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables>(ExplorerLibraryDetailsDocument, options);
      }
export function useExplorerLibraryDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables>(ExplorerLibraryDetailsDocument, options);
        }
// @ts-ignore
export function useExplorerLibraryDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables>;
export function useExplorerLibraryDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerLibraryDetailsQuery | undefined, ExplorerLibraryDetailsQueryVariables>;
export function useExplorerLibraryDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables>(ExplorerLibraryDetailsDocument, options);
        }
export type ExplorerLibraryDetailsQueryHookResult = ReturnType<typeof useExplorerLibraryDetailsQuery>;
export type ExplorerLibraryDetailsLazyQueryHookResult = ReturnType<typeof useExplorerLibraryDetailsLazyQuery>;
export type ExplorerLibraryDetailsSuspenseQueryHookResult = ReturnType<typeof useExplorerLibraryDetailsSuspenseQuery>;
export type ExplorerLibraryDetailsQueryResult = Apollo.QueryResult<ExplorerLibraryDetailsQuery, ExplorerLibraryDetailsQueryVariables>;
export const LibraryExportProfilesDocument = gql`
    query libraryExportProfiles($libraryId: [ID!]) {
  libraries(filters: {id: $libraryId}) {
    list {
      id
      exportProfiles {
        defaultProfile
        profiles {
          label
          columns {
            columnLabel
            attribute
          }
          error {
            message
          }
        }
      }
    }
  }
}
    `;

/**
 * __useLibraryExportProfilesQuery__
 *
 * To run a query within a React component, call `useLibraryExportProfilesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLibraryExportProfilesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLibraryExportProfilesQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useLibraryExportProfilesQuery(baseOptions?: Apollo.QueryHookOptions<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>(LibraryExportProfilesDocument, options);
      }
export function useLibraryExportProfilesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>(LibraryExportProfilesDocument, options);
        }
// @ts-ignore
export function useLibraryExportProfilesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>): Apollo.UseSuspenseQueryResult<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>;
export function useLibraryExportProfilesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>): Apollo.UseSuspenseQueryResult<LibraryExportProfilesQuery | undefined, LibraryExportProfilesQueryVariables>;
export function useLibraryExportProfilesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>(LibraryExportProfilesDocument, options);
        }
export type LibraryExportProfilesQueryHookResult = ReturnType<typeof useLibraryExportProfilesQuery>;
export type LibraryExportProfilesLazyQueryHookResult = ReturnType<typeof useLibraryExportProfilesLazyQuery>;
export type LibraryExportProfilesSuspenseQueryHookResult = ReturnType<typeof useLibraryExportProfilesSuspenseQuery>;
export type LibraryExportProfilesQueryResult = Apollo.QueryResult<LibraryExportProfilesQuery, LibraryExportProfilesQueryVariables>;
export const MassEditableAttributesDocument = gql`
    query MassEditableAttributes($libraryId: String!) {
  attributes(
    filters: {multiple_values: false, type: tree, libraries: [$libraryId]}
  ) {
    list {
      id
      label
      ... on TreeAttribute {
        id
        permissions_conf_dependent_values {
          dependenciesTreeAttributes {
            id
            label
            ... on TreeAttribute {
              linked_tree {
                libraries {
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
  }
}
    `;

/**
 * __useMassEditableAttributesQuery__
 *
 * To run a query within a React component, call `useMassEditableAttributesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMassEditableAttributesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMassEditableAttributesQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useMassEditableAttributesQuery(baseOptions: Apollo.QueryHookOptions<MassEditableAttributesQuery, MassEditableAttributesQueryVariables> & ({ variables: MassEditableAttributesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MassEditableAttributesQuery, MassEditableAttributesQueryVariables>(MassEditableAttributesDocument, options);
      }
export function useMassEditableAttributesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MassEditableAttributesQuery, MassEditableAttributesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MassEditableAttributesQuery, MassEditableAttributesQueryVariables>(MassEditableAttributesDocument, options);
        }
// @ts-ignore
export function useMassEditableAttributesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MassEditableAttributesQuery, MassEditableAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<MassEditableAttributesQuery, MassEditableAttributesQueryVariables>;
export function useMassEditableAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MassEditableAttributesQuery, MassEditableAttributesQueryVariables>): Apollo.UseSuspenseQueryResult<MassEditableAttributesQuery | undefined, MassEditableAttributesQueryVariables>;
export function useMassEditableAttributesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MassEditableAttributesQuery, MassEditableAttributesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MassEditableAttributesQuery, MassEditableAttributesQueryVariables>(MassEditableAttributesDocument, options);
        }
export type MassEditableAttributesQueryHookResult = ReturnType<typeof useMassEditableAttributesQuery>;
export type MassEditableAttributesLazyQueryHookResult = ReturnType<typeof useMassEditableAttributesLazyQuery>;
export type MassEditableAttributesSuspenseQueryHookResult = ReturnType<typeof useMassEditableAttributesSuspenseQuery>;
export type MassEditableAttributesQueryResult = Apollo.QueryResult<MassEditableAttributesQuery, MassEditableAttributesQueryVariables>;
export const ExplorerSelectionIdsDocument = gql`
    query ExplorerSelectionIds($libraryId: ID!, $filters: [RecordFilterInput]) {
  records(library: $libraryId, filters: $filters) {
    list {
      id
    }
  }
}
    `;

/**
 * __useExplorerSelectionIdsQuery__
 *
 * To run a query within a React component, call `useExplorerSelectionIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerSelectionIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerSelectionIdsQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useExplorerSelectionIdsQuery(baseOptions: Apollo.QueryHookOptions<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables> & ({ variables: ExplorerSelectionIdsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables>(ExplorerSelectionIdsDocument, options);
      }
export function useExplorerSelectionIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables>(ExplorerSelectionIdsDocument, options);
        }
// @ts-ignore
export function useExplorerSelectionIdsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables>;
export function useExplorerSelectionIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerSelectionIdsQuery | undefined, ExplorerSelectionIdsQueryVariables>;
export function useExplorerSelectionIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables>(ExplorerSelectionIdsDocument, options);
        }
export type ExplorerSelectionIdsQueryHookResult = ReturnType<typeof useExplorerSelectionIdsQuery>;
export type ExplorerSelectionIdsLazyQueryHookResult = ReturnType<typeof useExplorerSelectionIdsLazyQuery>;
export type ExplorerSelectionIdsSuspenseQueryHookResult = ReturnType<typeof useExplorerSelectionIdsSuspenseQuery>;
export type ExplorerSelectionIdsQueryResult = Apollo.QueryResult<ExplorerSelectionIdsQuery, ExplorerSelectionIdsQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    whoAmI {
      id
      library {
        id
      }
    }
  }
}
    `;

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
export const TreeAttributeRemappingDocument = gql`
    query TreeAttributeRemapping($libraryId: ID!, $attributeId: ID!, $recordFilters: [RecordFilterInput]!, $searchQuery: String, $attributeDependentValue: AttributeDependentValueInput) {
  listDistinctValues(
    library: $libraryId
    attribute: $attributeId
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
  attributes(filters: {id: $attributeId}) {
    list {
      ... on TreeAttribute {
        tree_values(attributeDependentValue: $attributeDependentValue) {
          node {
            id
            record {
              id
              whoAmI {
                label
                color
              }
            }
          }
          allowedDependentValues {
            nodeId
          }
        }
      }
    }
  }
}
    `;

/**
 * __useTreeAttributeRemappingQuery__
 *
 * To run a query within a React component, call `useTreeAttributeRemappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useTreeAttributeRemappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTreeAttributeRemappingQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      attributeId: // value for 'attributeId'
 *      recordFilters: // value for 'recordFilters'
 *      searchQuery: // value for 'searchQuery'
 *      attributeDependentValue: // value for 'attributeDependentValue'
 *   },
 * });
 */
export function useTreeAttributeRemappingQuery(baseOptions: Apollo.QueryHookOptions<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables> & ({ variables: TreeAttributeRemappingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables>(TreeAttributeRemappingDocument, options);
      }
export function useTreeAttributeRemappingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables>(TreeAttributeRemappingDocument, options);
        }
// @ts-ignore
export function useTreeAttributeRemappingSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables>): Apollo.UseSuspenseQueryResult<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables>;
export function useTreeAttributeRemappingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables>): Apollo.UseSuspenseQueryResult<TreeAttributeRemappingQuery | undefined, TreeAttributeRemappingQueryVariables>;
export function useTreeAttributeRemappingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables>(TreeAttributeRemappingDocument, options);
        }
export type TreeAttributeRemappingQueryHookResult = ReturnType<typeof useTreeAttributeRemappingQuery>;
export type TreeAttributeRemappingLazyQueryHookResult = ReturnType<typeof useTreeAttributeRemappingLazyQuery>;
export type TreeAttributeRemappingSuspenseQueryHookResult = ReturnType<typeof useTreeAttributeRemappingSuspenseQuery>;
export type TreeAttributeRemappingQueryResult = Apollo.QueryResult<TreeAttributeRemappingQuery, TreeAttributeRemappingQueryVariables>;
export const UpdateViewDocument = gql`
    mutation UpdateView($view: ViewInputPartial!) {
  updateView(view: $view) {
    ...ViewDetails
  }
}
    ${ViewDetailsFragmentDoc}`;
export type UpdateViewMutationFn = Apollo.MutationFunction<UpdateViewMutation, UpdateViewMutationVariables>;

/**
 * __useUpdateViewMutation__
 *
 * To run a mutation, you first call `useUpdateViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateViewMutation, { data, loading, error }] = useUpdateViewMutation({
 *   variables: {
 *      view: // value for 'view'
 *   },
 * });
 */
export function useUpdateViewMutation(baseOptions?: Apollo.MutationHookOptions<UpdateViewMutation, UpdateViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateViewMutation, UpdateViewMutationVariables>(UpdateViewDocument, options);
      }
export type UpdateViewMutationHookResult = ReturnType<typeof useUpdateViewMutation>;
export type UpdateViewMutationResult = Apollo.MutationResult<UpdateViewMutation>;
export type UpdateViewMutationOptions = Apollo.BaseMutationOptions<UpdateViewMutation, UpdateViewMutationVariables>;
export const ValuesOccurrencesForDependencyDocument = gql`
    query ValuesOccurrencesForDependency($libraryId: ID!, $dependencyAttributeId: ID!, $recordFilters: [RecordFilterInput]!, $searchQuery: String) {
  listDistinctValues(
    library: $libraryId
    attribute: $dependencyAttributeId
    recordFilters: $recordFilters
    searchQuery: $searchQuery
  ) {
    ... on TreeDistinctValues {
      treeNode: value {
        id
        record {
          id
          whoAmI {
            label
          }
        }
      }
    }
  }
}
    `;

/**
 * __useValuesOccurrencesForDependencyQuery__
 *
 * To run a query within a React component, call `useValuesOccurrencesForDependencyQuery` and pass it any options that fit your needs.
 * When your component renders, `useValuesOccurrencesForDependencyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValuesOccurrencesForDependencyQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      dependencyAttributeId: // value for 'dependencyAttributeId'
 *      recordFilters: // value for 'recordFilters'
 *      searchQuery: // value for 'searchQuery'
 *   },
 * });
 */
export function useValuesOccurrencesForDependencyQuery(baseOptions: Apollo.QueryHookOptions<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables> & ({ variables: ValuesOccurrencesForDependencyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables>(ValuesOccurrencesForDependencyDocument, options);
      }
export function useValuesOccurrencesForDependencyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables>(ValuesOccurrencesForDependencyDocument, options);
        }
// @ts-ignore
export function useValuesOccurrencesForDependencySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables>): Apollo.UseSuspenseQueryResult<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables>;
export function useValuesOccurrencesForDependencySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables>): Apollo.UseSuspenseQueryResult<ValuesOccurrencesForDependencyQuery | undefined, ValuesOccurrencesForDependencyQueryVariables>;
export function useValuesOccurrencesForDependencySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables>(ValuesOccurrencesForDependencyDocument, options);
        }
export type ValuesOccurrencesForDependencyQueryHookResult = ReturnType<typeof useValuesOccurrencesForDependencyQuery>;
export type ValuesOccurrencesForDependencyLazyQueryHookResult = ReturnType<typeof useValuesOccurrencesForDependencyLazyQuery>;
export type ValuesOccurrencesForDependencySuspenseQueryHookResult = ReturnType<typeof useValuesOccurrencesForDependencySuspenseQuery>;
export type ValuesOccurrencesForDependencyQueryResult = Apollo.QueryResult<ValuesOccurrencesForDependencyQuery, ValuesOccurrencesForDependencyQueryVariables>;
export const ExplorerV2LibraryDataDocument = gql`
    query ExplorerV2LibraryData($libraryId: ID!, $attributeIds: [ID!]!, $pagination: RecordsPagination, $filters: [RecordFilterInput], $multipleSort: [RecordSortInput!], $searchQuery: String) {
  records(
    library: $libraryId
    filters: $filters
    pagination: $pagination
    multipleSort: $multipleSort
    searchQuery: $searchQuery
  ) {
    totalCount
    list {
      ...RecordIdentity
      active
      permissions {
        create_record
        delete_record
      }
      properties(attributeIds: $attributeIds) {
        attributeId
        values {
          ...PropertyValue
        }
      }
    }
  }
}
    ${RecordIdentityFragmentDoc}
${PropertyValueFragmentDoc}`;

/**
 * __useExplorerV2LibraryDataQuery__
 *
 * To run a query within a React component, call `useExplorerV2LibraryDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerV2LibraryDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerV2LibraryDataQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      attributeIds: // value for 'attributeIds'
 *      pagination: // value for 'pagination'
 *      filters: // value for 'filters'
 *      multipleSort: // value for 'multipleSort'
 *      searchQuery: // value for 'searchQuery'
 *   },
 * });
 */
export function useExplorerV2LibraryDataQuery(baseOptions: Apollo.QueryHookOptions<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables> & ({ variables: ExplorerV2LibraryDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables>(ExplorerV2LibraryDataDocument, options);
      }
export function useExplorerV2LibraryDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables>(ExplorerV2LibraryDataDocument, options);
        }
// @ts-ignore
export function useExplorerV2LibraryDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables>;
export function useExplorerV2LibraryDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerV2LibraryDataQuery | undefined, ExplorerV2LibraryDataQueryVariables>;
export function useExplorerV2LibraryDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables>(ExplorerV2LibraryDataDocument, options);
        }
export type ExplorerV2LibraryDataQueryHookResult = ReturnType<typeof useExplorerV2LibraryDataQuery>;
export type ExplorerV2LibraryDataLazyQueryHookResult = ReturnType<typeof useExplorerV2LibraryDataLazyQuery>;
export type ExplorerV2LibraryDataSuspenseQueryHookResult = ReturnType<typeof useExplorerV2LibraryDataSuspenseQuery>;
export type ExplorerV2LibraryDataQueryResult = Apollo.QueryResult<ExplorerV2LibraryDataQuery, ExplorerV2LibraryDataQueryVariables>;
export const ExplorerV2LinkDataDocument = gql`
    query ExplorerV2LinkData($attributeIds: [ID!]!, $parentLibraryId: ID!, $parentRecordId: String, $linkAttributeId: ID!) {
  records(
    library: $parentLibraryId
    filters: [{field: "id", condition: EQUAL, value: $parentRecordId}]
    retrieveInactive: true
  ) {
    list {
      id
      whoAmI {
        id
        library {
          id
        }
      }
      property(attribute: $linkAttributeId) {
        ...ExplorerV2LinkProperty
      }
    }
  }
}
    ${ExplorerV2LinkPropertyFragmentDoc}`;

/**
 * __useExplorerV2LinkDataQuery__
 *
 * To run a query within a React component, call `useExplorerV2LinkDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerV2LinkDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerV2LinkDataQuery({
 *   variables: {
 *      attributeIds: // value for 'attributeIds'
 *      parentLibraryId: // value for 'parentLibraryId'
 *      parentRecordId: // value for 'parentRecordId'
 *      linkAttributeId: // value for 'linkAttributeId'
 *   },
 * });
 */
export function useExplorerV2LinkDataQuery(baseOptions: Apollo.QueryHookOptions<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables> & ({ variables: ExplorerV2LinkDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables>(ExplorerV2LinkDataDocument, options);
      }
export function useExplorerV2LinkDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables>(ExplorerV2LinkDataDocument, options);
        }
// @ts-ignore
export function useExplorerV2LinkDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables>;
export function useExplorerV2LinkDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerV2LinkDataQuery | undefined, ExplorerV2LinkDataQueryVariables>;
export function useExplorerV2LinkDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables>(ExplorerV2LinkDataDocument, options);
        }
export type ExplorerV2LinkDataQueryHookResult = ReturnType<typeof useExplorerV2LinkDataQuery>;
export type ExplorerV2LinkDataLazyQueryHookResult = ReturnType<typeof useExplorerV2LinkDataLazyQuery>;
export type ExplorerV2LinkDataSuspenseQueryHookResult = ReturnType<typeof useExplorerV2LinkDataSuspenseQuery>;
export type ExplorerV2LinkDataQueryResult = Apollo.QueryResult<ExplorerV2LinkDataQuery, ExplorerV2LinkDataQueryVariables>;
export const KanbanTransitionsDocument = gql`
    query KanbanTransitions($attributeId: ID!) {
  attributes(filters: {id: $attributeId}) {
    list {
      id
      permissions {
        edit_value
      }
      ... on TreeAttribute {
        tree_values {
          node {
            id
          }
          allowedDependentValues {
            nodeId
          }
        }
      }
    }
  }
}
    `;

/**
 * __useKanbanTransitionsQuery__
 *
 * To run a query within a React component, call `useKanbanTransitionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useKanbanTransitionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useKanbanTransitionsQuery({
 *   variables: {
 *      attributeId: // value for 'attributeId'
 *   },
 * });
 */
export function useKanbanTransitionsQuery(baseOptions: Apollo.QueryHookOptions<KanbanTransitionsQuery, KanbanTransitionsQueryVariables> & ({ variables: KanbanTransitionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<KanbanTransitionsQuery, KanbanTransitionsQueryVariables>(KanbanTransitionsDocument, options);
      }
export function useKanbanTransitionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<KanbanTransitionsQuery, KanbanTransitionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<KanbanTransitionsQuery, KanbanTransitionsQueryVariables>(KanbanTransitionsDocument, options);
        }
// @ts-ignore
export function useKanbanTransitionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<KanbanTransitionsQuery, KanbanTransitionsQueryVariables>): Apollo.UseSuspenseQueryResult<KanbanTransitionsQuery, KanbanTransitionsQueryVariables>;
export function useKanbanTransitionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<KanbanTransitionsQuery, KanbanTransitionsQueryVariables>): Apollo.UseSuspenseQueryResult<KanbanTransitionsQuery | undefined, KanbanTransitionsQueryVariables>;
export function useKanbanTransitionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<KanbanTransitionsQuery, KanbanTransitionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<KanbanTransitionsQuery, KanbanTransitionsQueryVariables>(KanbanTransitionsDocument, options);
        }
export type KanbanTransitionsQueryHookResult = ReturnType<typeof useKanbanTransitionsQuery>;
export type KanbanTransitionsLazyQueryHookResult = ReturnType<typeof useKanbanTransitionsLazyQuery>;
export type KanbanTransitionsSuspenseQueryHookResult = ReturnType<typeof useKanbanTransitionsSuspenseQuery>;
export type KanbanTransitionsQueryResult = Apollo.QueryResult<KanbanTransitionsQuery, KanbanTransitionsQueryVariables>;
export const ExplorerV2LibraryMetadataDocument = gql`
    query ExplorerV2LibraryMetadata($libraryId: ID!) {
  libraries(filters: {id: [$libraryId]}) {
    list {
      id
      label
      behavior
      recordIdentityConf {
        color
      }
      permissions {
        create_record
      }
      attributes {
        ...ExplorerV2AttributeProperties
      }
    }
  }
}
    ${ExplorerV2AttributePropertiesFragmentDoc}`;

/**
 * __useExplorerV2LibraryMetadataQuery__
 *
 * To run a query within a React component, call `useExplorerV2LibraryMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerV2LibraryMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerV2LibraryMetadataQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useExplorerV2LibraryMetadataQuery(baseOptions: Apollo.QueryHookOptions<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables> & ({ variables: ExplorerV2LibraryMetadataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables>(ExplorerV2LibraryMetadataDocument, options);
      }
export function useExplorerV2LibraryMetadataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables>(ExplorerV2LibraryMetadataDocument, options);
        }
// @ts-ignore
export function useExplorerV2LibraryMetadataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables>;
export function useExplorerV2LibraryMetadataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables>): Apollo.UseSuspenseQueryResult<ExplorerV2LibraryMetadataQuery | undefined, ExplorerV2LibraryMetadataQueryVariables>;
export function useExplorerV2LibraryMetadataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables>(ExplorerV2LibraryMetadataDocument, options);
        }
export type ExplorerV2LibraryMetadataQueryHookResult = ReturnType<typeof useExplorerV2LibraryMetadataQuery>;
export type ExplorerV2LibraryMetadataLazyQueryHookResult = ReturnType<typeof useExplorerV2LibraryMetadataLazyQuery>;
export type ExplorerV2LibraryMetadataSuspenseQueryHookResult = ReturnType<typeof useExplorerV2LibraryMetadataSuspenseQuery>;
export type ExplorerV2LibraryMetadataQueryResult = Apollo.QueryResult<ExplorerV2LibraryMetadataQuery, ExplorerV2LibraryMetadataQueryVariables>;
export const ListDistinctValuesDocument = gql`
    query ListDistinctValues($library: ID!, $attribute: ID!, $recordFilters: [RecordFilterInput]) {
  listDistinctValues(
    library: $library
    attribute: $attribute
    recordFilters: $recordFilters
  ) {
    count
    ... on TreeDistinctValues {
      value {
        id
        record {
          id
          whoAmI {
            id
            label
            color
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

/**
 * __useListDistinctValuesQuery__
 *
 * To run a query within a React component, call `useListDistinctValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useListDistinctValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListDistinctValuesQuery({
 *   variables: {
 *      library: // value for 'library'
 *      attribute: // value for 'attribute'
 *      recordFilters: // value for 'recordFilters'
 *   },
 * });
 */
export function useListDistinctValuesQuery(baseOptions: Apollo.QueryHookOptions<ListDistinctValuesQuery, ListDistinctValuesQueryVariables> & ({ variables: ListDistinctValuesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListDistinctValuesQuery, ListDistinctValuesQueryVariables>(ListDistinctValuesDocument, options);
      }
export function useListDistinctValuesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListDistinctValuesQuery, ListDistinctValuesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListDistinctValuesQuery, ListDistinctValuesQueryVariables>(ListDistinctValuesDocument, options);
        }
// @ts-ignore
export function useListDistinctValuesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ListDistinctValuesQuery, ListDistinctValuesQueryVariables>): Apollo.UseSuspenseQueryResult<ListDistinctValuesQuery, ListDistinctValuesQueryVariables>;
export function useListDistinctValuesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ListDistinctValuesQuery, ListDistinctValuesQueryVariables>): Apollo.UseSuspenseQueryResult<ListDistinctValuesQuery | undefined, ListDistinctValuesQueryVariables>;
export function useListDistinctValuesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ListDistinctValuesQuery, ListDistinctValuesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListDistinctValuesQuery, ListDistinctValuesQueryVariables>(ListDistinctValuesDocument, options);
        }
export type ListDistinctValuesQueryHookResult = ReturnType<typeof useListDistinctValuesQuery>;
export type ListDistinctValuesLazyQueryHookResult = ReturnType<typeof useListDistinctValuesLazyQuery>;
export type ListDistinctValuesSuspenseQueryHookResult = ReturnType<typeof useListDistinctValuesSuspenseQuery>;
export type ListDistinctValuesQueryResult = Apollo.QueryResult<ListDistinctValuesQuery, ListDistinctValuesQueryVariables>;
export const TreeFiltersDataQueryDocument = gql`
    query TreeFiltersDataQuery($treeId: ID!, $startAt: ID, $accessRecordByDefaultPermission: AccessRecordByDefaultPermissionInput) {
  treeContent(
    treeId: $treeId
    startAt: $startAt
    accessRecordByDefaultPermission: $accessRecordByDefaultPermission
  ) {
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
    accessRecordByDefaultPermission
  }
}
    `;

/**
 * __useTreeFiltersDataQueryQuery__
 *
 * To run a query within a React component, call `useTreeFiltersDataQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useTreeFiltersDataQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTreeFiltersDataQueryQuery({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      startAt: // value for 'startAt'
 *      accessRecordByDefaultPermission: // value for 'accessRecordByDefaultPermission'
 *   },
 * });
 */
export function useTreeFiltersDataQueryQuery(baseOptions: Apollo.QueryHookOptions<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables> & ({ variables: TreeFiltersDataQueryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables>(TreeFiltersDataQueryDocument, options);
      }
export function useTreeFiltersDataQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables>(TreeFiltersDataQueryDocument, options);
        }
// @ts-ignore
export function useTreeFiltersDataQuerySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables>): Apollo.UseSuspenseQueryResult<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables>;
export function useTreeFiltersDataQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables>): Apollo.UseSuspenseQueryResult<TreeFiltersDataQueryQuery | undefined, TreeFiltersDataQueryQueryVariables>;
export function useTreeFiltersDataQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables>(TreeFiltersDataQueryDocument, options);
        }
export type TreeFiltersDataQueryQueryHookResult = ReturnType<typeof useTreeFiltersDataQueryQuery>;
export type TreeFiltersDataQueryLazyQueryHookResult = ReturnType<typeof useTreeFiltersDataQueryLazyQuery>;
export type TreeFiltersDataQuerySuspenseQueryHookResult = ReturnType<typeof useTreeFiltersDataQuerySuspenseQuery>;
export type TreeFiltersDataQueryQueryResult = Apollo.QueryResult<TreeFiltersDataQueryQuery, TreeFiltersDataQueryQueryVariables>;
export const SmartFilterListValuesDocument = gql`
    query SmartFilterListValues($library: ID!, $attribute: ID!, $recordFilters: [RecordFilterInput]) {
  listDistinctValues(
    library: $library
    attribute: $attribute
    recordFilters: $recordFilters
  ) {
    count
    ... on LinkDistinctValues {
      recordValue: value {
        ...RecordIdentity
      }
    }
    ... on StandardDistinctValues {
      standardValue: value
    }
  }
}
    ${RecordIdentityFragmentDoc}`;

/**
 * __useSmartFilterListValuesQuery__
 *
 * To run a query within a React component, call `useSmartFilterListValuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSmartFilterListValuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSmartFilterListValuesQuery({
 *   variables: {
 *      library: // value for 'library'
 *      attribute: // value for 'attribute'
 *      recordFilters: // value for 'recordFilters'
 *   },
 * });
 */
export function useSmartFilterListValuesQuery(baseOptions: Apollo.QueryHookOptions<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables> & ({ variables: SmartFilterListValuesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables>(SmartFilterListValuesDocument, options);
      }
export function useSmartFilterListValuesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables>(SmartFilterListValuesDocument, options);
        }
// @ts-ignore
export function useSmartFilterListValuesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables>): Apollo.UseSuspenseQueryResult<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables>;
export function useSmartFilterListValuesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables>): Apollo.UseSuspenseQueryResult<SmartFilterListValuesQuery | undefined, SmartFilterListValuesQueryVariables>;
export function useSmartFilterListValuesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables>(SmartFilterListValuesDocument, options);
        }
export type SmartFilterListValuesQueryHookResult = ReturnType<typeof useSmartFilterListValuesQuery>;
export type SmartFilterListValuesLazyQueryHookResult = ReturnType<typeof useSmartFilterListValuesLazyQuery>;
export type SmartFilterListValuesSuspenseQueryHookResult = ReturnType<typeof useSmartFilterListValuesSuspenseQuery>;
export type SmartFilterListValuesQueryResult = Apollo.QueryResult<SmartFilterListValuesQuery, SmartFilterListValuesQueryVariables>;
export const FilterTreeDataQueryDocument = gql`
    query FilterTreeDataQuery($treeId: ID!, $startAt: ID, $accessRecordByDefaultPermission: AccessRecordByDefaultPermissionInput) {
  treeContent(
    treeId: $treeId
    startAt: $startAt
    accessRecordByDefaultPermission: $accessRecordByDefaultPermission
  ) {
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
    accessRecordByDefaultPermission
  }
}
    `;

/**
 * __useFilterTreeDataQueryQuery__
 *
 * To run a query within a React component, call `useFilterTreeDataQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useFilterTreeDataQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFilterTreeDataQueryQuery({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      startAt: // value for 'startAt'
 *      accessRecordByDefaultPermission: // value for 'accessRecordByDefaultPermission'
 *   },
 * });
 */
export function useFilterTreeDataQueryQuery(baseOptions: Apollo.QueryHookOptions<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables> & ({ variables: FilterTreeDataQueryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables>(FilterTreeDataQueryDocument, options);
      }
export function useFilterTreeDataQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables>(FilterTreeDataQueryDocument, options);
        }
// @ts-ignore
export function useFilterTreeDataQuerySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables>): Apollo.UseSuspenseQueryResult<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables>;
export function useFilterTreeDataQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables>): Apollo.UseSuspenseQueryResult<FilterTreeDataQueryQuery | undefined, FilterTreeDataQueryQueryVariables>;
export function useFilterTreeDataQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables>(FilterTreeDataQueryDocument, options);
        }
export type FilterTreeDataQueryQueryHookResult = ReturnType<typeof useFilterTreeDataQueryQuery>;
export type FilterTreeDataQueryLazyQueryHookResult = ReturnType<typeof useFilterTreeDataQueryLazyQuery>;
export type FilterTreeDataQuerySuspenseQueryHookResult = ReturnType<typeof useFilterTreeDataQuerySuspenseQuery>;
export type FilterTreeDataQueryQueryResult = Apollo.QueryResult<FilterTreeDataQueryQuery, FilterTreeDataQueryQueryVariables>;
export const NotificationDocument = gql`
    subscription Notification {
  notification {
    id
    date
    level
    message
    title
    attachments {
      label
      url
      trackingEvent {
        category
        action
        name
        value
      }
    }
    relatedEntities {
      label
      url
    }
    trackingEvents {
      category
      action
      name
      value
    }
  }
}
    `;

/**
 * __useNotificationSubscription__
 *
 * To run a query within a React component, call `useNotificationSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNotificationSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotificationSubscription({
 *   variables: {
 *   },
 * });
 */
export function useNotificationSubscription(baseOptions?: Apollo.SubscriptionHookOptions<NotificationSubscription, NotificationSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<NotificationSubscription, NotificationSubscriptionVariables>(NotificationDocument, options);
      }
export type NotificationSubscriptionHookResult = ReturnType<typeof useNotificationSubscription>;
export type NotificationSubscriptionResult = Apollo.SubscriptionResult<NotificationSubscription>;
export const GetRecordHistoryDocument = gql`
    query getRecordHistory($record: LogTopicRecordFilterInput!, $attributeId: String, $actions: [LogAction!], $pagination: Pagination) {
  logs(
    filters: {topic: {record: $record, attribute: $attributeId}, actions: $actions}
    pagination: $pagination
  ) {
    total
    logs {
      ...RecordHistoryLogEntry
    }
  }
}
    ${RecordHistoryLogEntryFragmentDoc}`;

/**
 * __useGetRecordHistoryQuery__
 *
 * To run a query within a React component, call `useGetRecordHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecordHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecordHistoryQuery({
 *   variables: {
 *      record: // value for 'record'
 *      attributeId: // value for 'attributeId'
 *      actions: // value for 'actions'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetRecordHistoryQuery(baseOptions: Apollo.QueryHookOptions<GetRecordHistoryQuery, GetRecordHistoryQueryVariables> & ({ variables: GetRecordHistoryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecordHistoryQuery, GetRecordHistoryQueryVariables>(GetRecordHistoryDocument, options);
      }
export function useGetRecordHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecordHistoryQuery, GetRecordHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecordHistoryQuery, GetRecordHistoryQueryVariables>(GetRecordHistoryDocument, options);
        }
// @ts-ignore
export function useGetRecordHistorySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecordHistoryQuery, GetRecordHistoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecordHistoryQuery, GetRecordHistoryQueryVariables>;
export function useGetRecordHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecordHistoryQuery, GetRecordHistoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecordHistoryQuery | undefined, GetRecordHistoryQueryVariables>;
export function useGetRecordHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecordHistoryQuery, GetRecordHistoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecordHistoryQuery, GetRecordHistoryQueryVariables>(GetRecordHistoryDocument, options);
        }
export type GetRecordHistoryQueryHookResult = ReturnType<typeof useGetRecordHistoryQuery>;
export type GetRecordHistoryLazyQueryHookResult = ReturnType<typeof useGetRecordHistoryLazyQuery>;
export type GetRecordHistorySuspenseQueryHookResult = ReturnType<typeof useGetRecordHistorySuspenseQuery>;
export type GetRecordHistoryQueryResult = Apollo.QueryResult<GetRecordHistoryQuery, GetRecordHistoryQueryVariables>;
export const TreeContentDataQueryDocument = gql`
    query TreeContentDataQuery($treeId: ID!, $startAt: ID, $childrenAsRecordValuePermissionFilter: ChildrenAsRecordValuePermissionFilterInput, $dependentValuesPermissionFilter: DependentValuesPermissionFilterInput) {
  treeContent(
    treeId: $treeId
    startAt: $startAt
    childrenAsRecordValuePermissionFilter: $childrenAsRecordValuePermissionFilter
    dependentValuesPermissionFilter: $dependentValuesPermissionFilter
  ) {
    id
    childrenCount
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

/**
 * __useTreeContentDataQueryQuery__
 *
 * To run a query within a React component, call `useTreeContentDataQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useTreeContentDataQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTreeContentDataQueryQuery({
 *   variables: {
 *      treeId: // value for 'treeId'
 *      startAt: // value for 'startAt'
 *      childrenAsRecordValuePermissionFilter: // value for 'childrenAsRecordValuePermissionFilter'
 *      dependentValuesPermissionFilter: // value for 'dependentValuesPermissionFilter'
 *   },
 * });
 */
export function useTreeContentDataQueryQuery(baseOptions: Apollo.QueryHookOptions<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables> & ({ variables: TreeContentDataQueryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables>(TreeContentDataQueryDocument, options);
      }
export function useTreeContentDataQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables>(TreeContentDataQueryDocument, options);
        }
// @ts-ignore
export function useTreeContentDataQuerySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables>): Apollo.UseSuspenseQueryResult<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables>;
export function useTreeContentDataQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables>): Apollo.UseSuspenseQueryResult<TreeContentDataQueryQuery | undefined, TreeContentDataQueryQueryVariables>;
export function useTreeContentDataQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables>(TreeContentDataQueryDocument, options);
        }
export type TreeContentDataQueryQueryHookResult = ReturnType<typeof useTreeContentDataQueryQuery>;
export type TreeContentDataQueryLazyQueryHookResult = ReturnType<typeof useTreeContentDataQueryLazyQuery>;
export type TreeContentDataQuerySuspenseQueryHookResult = ReturnType<typeof useTreeContentDataQuerySuspenseQuery>;
export type TreeContentDataQueryQueryResult = Apollo.QueryResult<TreeContentDataQueryQuery, TreeContentDataQueryQueryVariables>;
export const TreeDataQueryDocument = gql`
    query TreeDataQuery($treeId: ID!) {
  trees(filters: {id: [$treeId]}) {
    list {
      id
      label
    }
  }
}
    `;

/**
 * __useTreeDataQueryQuery__
 *
 * To run a query within a React component, call `useTreeDataQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useTreeDataQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTreeDataQueryQuery({
 *   variables: {
 *      treeId: // value for 'treeId'
 *   },
 * });
 */
export function useTreeDataQueryQuery(baseOptions: Apollo.QueryHookOptions<TreeDataQueryQuery, TreeDataQueryQueryVariables> & ({ variables: TreeDataQueryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TreeDataQueryQuery, TreeDataQueryQueryVariables>(TreeDataQueryDocument, options);
      }
export function useTreeDataQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TreeDataQueryQuery, TreeDataQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TreeDataQueryQuery, TreeDataQueryQueryVariables>(TreeDataQueryDocument, options);
        }
// @ts-ignore
export function useTreeDataQuerySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TreeDataQueryQuery, TreeDataQueryQueryVariables>): Apollo.UseSuspenseQueryResult<TreeDataQueryQuery, TreeDataQueryQueryVariables>;
export function useTreeDataQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeDataQueryQuery, TreeDataQueryQueryVariables>): Apollo.UseSuspenseQueryResult<TreeDataQueryQuery | undefined, TreeDataQueryQueryVariables>;
export function useTreeDataQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TreeDataQueryQuery, TreeDataQueryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TreeDataQueryQuery, TreeDataQueryQueryVariables>(TreeDataQueryDocument, options);
        }
export type TreeDataQueryQueryHookResult = ReturnType<typeof useTreeDataQueryQuery>;
export type TreeDataQueryLazyQueryHookResult = ReturnType<typeof useTreeDataQueryLazyQuery>;
export type TreeDataQuerySuspenseQueryHookResult = ReturnType<typeof useTreeDataQuerySuspenseQuery>;
export type TreeDataQueryQueryResult = Apollo.QueryResult<TreeDataQueryQuery, TreeDataQueryQueryVariables>;
export const GlobalSettingsFlagsDocument = gql`
    query GlobalSettingsFlags {
  globalSettings {
    settings
  }
}
    `;

/**
 * __useGlobalSettingsFlagsQuery__
 *
 * To run a query within a React component, call `useGlobalSettingsFlagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGlobalSettingsFlagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGlobalSettingsFlagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGlobalSettingsFlagsQuery(baseOptions?: Apollo.QueryHookOptions<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>(GlobalSettingsFlagsDocument, options);
      }
export function useGlobalSettingsFlagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>(GlobalSettingsFlagsDocument, options);
        }
// @ts-ignore
export function useGlobalSettingsFlagsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>): Apollo.UseSuspenseQueryResult<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>;
export function useGlobalSettingsFlagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>): Apollo.UseSuspenseQueryResult<GlobalSettingsFlagsQuery | undefined, GlobalSettingsFlagsQueryVariables>;
export function useGlobalSettingsFlagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>(GlobalSettingsFlagsDocument, options);
        }
export type GlobalSettingsFlagsQueryHookResult = ReturnType<typeof useGlobalSettingsFlagsQuery>;
export type GlobalSettingsFlagsLazyQueryHookResult = ReturnType<typeof useGlobalSettingsFlagsLazyQuery>;
export type GlobalSettingsFlagsSuspenseQueryHookResult = ReturnType<typeof useGlobalSettingsFlagsSuspenseQuery>;
export type GlobalSettingsFlagsQueryResult = Apollo.QueryResult<GlobalSettingsFlagsQuery, GlobalSettingsFlagsQueryVariables>;
export const RecordUpdateLightDocument = gql`
    subscription RECORD_UPDATE_LIGHT($filters: RecordUpdateFilterInput) {
  recordUpdate(filters: $filters) {
    record {
      id
    }
    updatedValues {
      attribute
    }
  }
}
    `;

/**
 * __useRecordUpdateLightSubscription__
 *
 * To run a query within a React component, call `useRecordUpdateLightSubscription` and pass it any options that fit your needs.
 * When your component renders, `useRecordUpdateLightSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecordUpdateLightSubscription({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useRecordUpdateLightSubscription(baseOptions?: Apollo.SubscriptionHookOptions<RecordUpdateLightSubscription, RecordUpdateLightSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<RecordUpdateLightSubscription, RecordUpdateLightSubscriptionVariables>(RecordUpdateLightDocument, options);
      }
export type RecordUpdateLightSubscriptionHookResult = ReturnType<typeof useRecordUpdateLightSubscription>;
export type RecordUpdateLightSubscriptionResult = Apollo.SubscriptionResult<RecordUpdateLightSubscription>;