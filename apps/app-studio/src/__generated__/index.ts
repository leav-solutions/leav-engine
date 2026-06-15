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
  Preview: { input: any; output: any; }
  SystemTranslation: { input: any; output: any; }
  SystemTranslationOptional: { input: any; output: any; }
  TaskPriority: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type AccessRecordByDefaultPermissionInput = {
  attributeId: Scalars['ID']['input'];
  libraryId: Scalars['ID']['input'];
};

export type Action = {
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  input_types: Array<ActionIoTypes>;
  name: Scalars['String']['output'];
  output_types: Array<ActionIoTypes>;
  params?: Maybe<Array<ActionParam>>;
};

export type ActionConfiguration = {
  error_message?: Maybe<Scalars['SystemTranslationOptional']['output']>;
  id: Scalars['ID']['output'];
  is_system: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  params?: Maybe<Array<ActionConfigurationParam>>;
};

export type ActionConfigurationInput = {
  error_message?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  id: Scalars['ID']['input'];
  params?: InputMaybe<Array<ActionConfigurationParamInput>>;
};

export type ActionConfigurationParam = {
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
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

export type ActionListIoTypes = {
  deleteValue: Array<IoTypes>;
  getValue: Array<IoTypes>;
  postDeleteValue: Array<IoTypes>;
  postSaveValue: Array<IoTypes>;
  saveValue: Array<IoTypes>;
};

export type ActionParam = {
  description?: Maybe<Scalars['String']['output']>;
  helper_value?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  required?: Maybe<Scalars['Boolean']['output']>;
  type: Scalars['String']['output'];
};

export type ActionsListConfiguration = {
  deleteValue?: Maybe<Array<ActionConfiguration>>;
  getValue?: Maybe<Array<ActionConfiguration>>;
  postDeleteValue?: Maybe<Array<ActionConfiguration>>;
  postSaveValue?: Maybe<Array<ActionConfiguration>>;
  saveValue?: Maybe<Array<ActionConfiguration>>;
};

export type ActionsListConfigurationInput = {
  deleteValue?: InputMaybe<Array<ActionConfigurationInput>>;
  getValue?: InputMaybe<Array<ActionConfigurationInput>>;
  postDeleteValue?: InputMaybe<Array<ActionConfigurationInput>>;
  postSaveValue?: InputMaybe<Array<ActionConfigurationInput>>;
  saveValue?: InputMaybe<Array<ActionConfigurationInput>>;
};

export type ApiKey = {
  createdAt: Scalars['Int']['output'];
  createdBy: Record;
  expiresAt?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  key?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  modifiedAt: Scalars['Int']['output'];
  modifiedBy: Record;
  user: Record;
};

export type ApiKeyInput = {
  expiresAt?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type ApiKeyList = {
  list: Array<ApiKey>;
  totalCount: Scalars['Int']['output'];
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

export type Application = {
  appStudioSettings?: Maybe<Scalars['JSONObject']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['SystemTranslation']['output']>;
  endpoint?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Record>;
  id: Scalars['ID']['output'];
  label: Scalars['SystemTranslation']['output'];
  module?: Maybe<Scalars['String']['output']>;
  permissions: ApplicationPermissions;
  settings?: Maybe<Scalars['JSONObject']['output']>;
  system: Scalars['Boolean']['output'];
  type: ApplicationType;
  url?: Maybe<Scalars['String']['output']>;
};


export type ApplicationLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export type ApplicationEvent = {
  application: Application;
  type: ApplicationEventTypes;
};

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

export type ApplicationModule = {
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

export type ApplicationPermissions = {
  access_application: Scalars['Boolean']['output'];
  admin_application: Scalars['Boolean']['output'];
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

export type ApplicationsList = {
  list: Array<Application>;
  totalCount: Scalars['Int']['output'];
};

export type Attachment = {
  label: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Attribute = {
  actions_list?: Maybe<ActionsListConfiguration>;
  compute: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['SystemTranslationOptional']['output']>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID']['output'];
  input_types: ActionListIoTypes;
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  libraries?: Maybe<Array<Library>>;
  metadata_fields?: Maybe<Array<StandardAttribute>>;
  multi_link_display_option?: Maybe<MultiDisplayOption>;
  multi_tree_display_option?: Maybe<MultiDisplayOption>;
  multiple_values: Scalars['Boolean']['output'];
  output_types: ActionListIoTypes;
  permissions: AttributePermissions;
  permissions_conf?: Maybe<TreepermissionsConf>;
  readonly: Scalars['Boolean']['output'];
  required: Scalars['Boolean']['output'];
  settings?: Maybe<Scalars['JSONObject']['output']>;
  system: Scalars['Boolean']['output'];
  type: AttributeType;
  versions_conf?: Maybe<ValuesVersionsConf>;
};


export type AttributeDescriptionArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};


export type AttributeLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};


export type AttributePermissionsArgs = {
  record?: InputMaybe<AttributePermissionsRecord>;
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
  type?: InputMaybe<AttributeType>;
  unique?: InputMaybe<Scalars['Boolean']['input']>;
  values_list?: InputMaybe<ValuesListConfInput>;
  versions_conf?: InputMaybe<ValuesVersionsConfInput>;
};

export type AttributePermissions = {
  access_attribute: Scalars['Boolean']['output'];
  edit_value: Scalars['Boolean']['output'];
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

export type AttributesList = {
  list: Array<Attribute>;
  totalCount: Scalars['Int']['output'];
};

export enum AttributesSortableFields {
  format = 'format',
  id = 'id',
  linked_library = 'linked_library',
  linked_tree = 'linked_tree',
  multiple_values = 'multiple_values',
  type = 'type'
}

export type AutomationRule = {
  active: Scalars['Boolean']['output'];
  createdAt: Scalars['Int']['output'];
  createdBy: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  modifiedAt: Scalars['Int']['output'];
  modifiedBy: Scalars['String']['output'];
  pipeline: AutomationRulePipeline;
  trigger: AutomationRuleTrigger;
};

export enum AutomationRuleActions {
  condition = 'condition',
  jexlExpression = 'jexlExpression',
  modifyAttribute = 'modifyAttribute',
  notification = 'notification'
}

export enum AutomationRuleEventAction {
  RECORD_INIT = 'RECORD_INIT',
  RECORD_SAVE = 'RECORD_SAVE',
  VALUE_DELETE = 'VALUE_DELETE',
  VALUE_SAVE = 'VALUE_SAVE'
}

export type AutomationRuleForm = {
  jsonSchema: Scalars['JSONObject']['output'];
  uiSchema: Scalars['JSONObject']['output'];
};

export enum AutomationRuleJsonSchemaFormType {
  creation = 'creation',
  edition = 'edition'
}

export type AutomationRulePipeline = {
  steps: Array<AutomationRulePipelineStep>;
};

export type AutomationRulePipelineInput = {
  steps: Array<AutomationRulePipelineStepInput>;
};

export type AutomationRulePipelineStep = {
  name?: Maybe<Scalars['String']['output']>;
  params: Scalars['JSON']['output'];
  type: AutomationRuleActions;
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

export type AutomationRuleTrigger = {
  eventAction: AutomationRuleEventAction;
  eventTopic?: Maybe<EventTopic>;
  synchronous: Scalars['Boolean']['output'];
};

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
};

export type AutomationRulesList = {
  list: Array<AutomationRule>;
  totalCount: Scalars['Int']['output'];
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

export type CampaignsFraming = {
  computed?: Maybe<CampaignsFramingComputed>;
  id: Scalars['String']['output'];
};

export type CampaignsFramingComputed = {
  framing?: Maybe<Scalars['JSONObject']['output']>;
  results?: Maybe<Scalars['JSONObject']['output']>;
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
};

export type CreateRecordDataInput = {
  values?: InputMaybe<Array<ValueBatchInput>>;
  version?: InputMaybe<Array<ValueVersionInput>>;
};

export type CreateRecordResult = {
  record?: Maybe<Record>;
  valuesErrors?: Maybe<Array<ValueBatchError>>;
};

export type DateRangeValue = {
  from?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Scalars['String']['output']>;
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

export type DiscussionComment = {
  id: Scalars['ID']['output'];
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

export type EmbeddedAttribute = {
  description?: Maybe<Scalars['SystemTranslationOptional']['output']>;
  embedded_fields?: Maybe<Array<Maybe<EmbeddedAttribute>>>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  validation_regex?: Maybe<Scalars['String']['output']>;
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
  AUTOMATION_PIPELINE_FAILURE = 'AUTOMATION_PIPELINE_FAILURE',
  AUTOMATION_PIPELINE_SUCCESS = 'AUTOMATION_PIPELINE_SUCCESS',
  AUTOMATION_RULE_CREATE = 'AUTOMATION_RULE_CREATE',
  AUTOMATION_RULE_DELETE = 'AUTOMATION_RULE_DELETE',
  AUTOMATION_RULE_UPDATE = 'AUTOMATION_RULE_UPDATE',
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
  PLANNING_RECONDUCTION_END = 'PLANNING_RECONDUCTION_END',
  PLANNING_RECONDUCTION_START = 'PLANNING_RECONDUCTION_START',
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

export type EventTopic = {
  apiKey?: Maybe<Scalars['String']['output']>;
  application?: Maybe<Scalars['String']['output']>;
  attribute?: Maybe<Scalars['String']['output']>;
  automationRule?: Maybe<Scalars['String']['output']>;
  filename?: Maybe<Scalars['String']['output']>;
  library?: Maybe<Scalars['String']['output']>;
  permission?: Maybe<EventTopicPermission>;
  profile?: Maybe<Scalars['String']['output']>;
  record?: Maybe<EventTopicRecord>;
  tree?: Maybe<Scalars['String']['output']>;
};

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

export type EventTopicPermission = {
  applyTo?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
};

export type EventTopicPermissionInput = {
  applyTo?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};

export type EventTopicRecord = {
  id: Scalars['String']['output'];
  libraryId: Scalars['String']['output'];
};

export type EventTopicRecordInput = {
  id: Scalars['String']['input'];
  libraryId: Scalars['String']['input'];
};

export type ExportProfile = {
  columns: Array<ExportProfileColumn>;
  error?: Maybe<ExportProfileError>;
  label: Scalars['String']['output'];
};

export type ExportProfileColumn = {
  attribute: Scalars['String']['output'];
  columnLabel: Scalars['String']['output'];
};

export type ExportProfileError = {
  message: Scalars['String']['output'];
};

export type ExportProfiles = {
  defaultProfile: Scalars['String']['output'];
  profiles: Array<ExportProfile>;
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

export type Form = {
  dependencyAttributes?: Maybe<Array<Attribute>>;
  elements: Array<FormElementsByDeps>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  library: Library;
  sidePanel?: Maybe<FormSidePanel>;
  system: Scalars['Boolean']['output'];
};


export type FormLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export type FormDependencyValue = {
  attribute: Scalars['ID']['output'];
  value: Scalars['ID']['output'];
};

export type FormDependencyValueInput = {
  attribute: Scalars['ID']['input'];
  value: Scalars['ID']['input'];
};

export type FormElement = {
  attribute?: Maybe<Attribute>;
  containerId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  /** In case the form element is a join library link */
  joinLibraryContext?: Maybe<FormElementJoinLibraryContext>;
  order: Scalars['Int']['output'];
  settings: Array<FormElementSettings>;
  type: FormElementTypes;
  uiElementType: Scalars['String']['output'];
};

export type FormElementInput = {
  containerId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
  order: Scalars['Int']['input'];
  settings: Array<FormElementSettingsInput>;
  type: FormElementTypes;
  uiElementType: Scalars['String']['input'];
};

export type FormElementJoinLibraryContext = {
  /** Mandatory attribute of the join library, can be simple or advanced mono link, or mono tree */
  mandatoryAttribute: Attribute;
};

export type FormElementSettings = {
  key: Scalars['String']['output'];
  value: Scalars['Any']['output'];
};

export type FormElementSettingsInput = {
  key: Scalars['String']['input'];
  value: Scalars['Any']['input'];
};

export enum FormElementTypes {
  field = 'field',
  layout = 'layout'
}

export type FormElementWithValues = {
  attribute?: Maybe<Attribute>;
  containerId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  /** In case the form element is a join library link */
  joinLibraryContext?: Maybe<FormElementJoinLibraryContext>;
  order: Scalars['Int']['output'];
  settings: Array<FormElementSettings>;
  type: FormElementTypes;
  uiElementType: Scalars['String']['output'];
  valueError?: Maybe<Scalars['String']['output']>;
  values?: Maybe<Array<GenericValue>>;
};

export type FormElementsByDeps = {
  dependencyValue?: Maybe<FormDependencyValue>;
  elements: Array<FormElement>;
};

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

export type FormSidePanel = {
  enable: Scalars['Boolean']['output'];
  isOpenByDefault?: Maybe<Scalars['Boolean']['output']>;
};

export type FormSidePanelInput = {
  enable: Scalars['Boolean']['input'];
  isOpenByDefault: Scalars['Boolean']['input'];
};

export type FormsList = {
  list: Array<Form>;
  totalCount: Scalars['Int']['output'];
};

export enum FormsSortableFields {
  id = 'id',
  library = 'library',
  system = 'system'
}

export type GenericDistinctValues = {
  count: Scalars['Int']['output'];
};

export type GenericValue = {
  attribute: Attribute;
  created_at?: Maybe<Scalars['Int']['output']>;
  created_by?: Maybe<Record>;
  id_value?: Maybe<Scalars['ID']['output']>;
  isCalculated?: Maybe<Scalars['Boolean']['output']>;
  isInherited?: Maybe<Scalars['Boolean']['output']>;
  metadata?: Maybe<Array<Maybe<ValueMetadata>>>;
  modified_at?: Maybe<Scalars['Int']['output']>;
  modified_by?: Maybe<Record>;
  version?: Maybe<Array<Maybe<ValueVersion>>>;
};

export type GlobalSettings = {
  defaultApp: Scalars['String']['output'];
  favicon?: Maybe<Record>;
  icon?: Maybe<Record>;
  name: Scalars['String']['output'];
  settings?: Maybe<Scalars['JSONObject']['output']>;
};

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

export type HeritedPermissionAction = {
  allowed: Scalars['Boolean']['output'];
  name: PermissionsActions;
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

export type LabeledPermissionsActions = {
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  name: PermissionsActions;
};

export type LibrariesFiltersInput = {
  behavior?: InputMaybe<Array<LibraryBehavior>>;
  id?: InputMaybe<Array<Scalars['ID']['input']>>;
  label?: InputMaybe<Array<Scalars['String']['input']>>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
};

export type LibrariesList = {
  list: Array<Library>;
  totalCount: Scalars['Int']['output'];
};

export enum LibrariesSortableFields {
  behavior = 'behavior',
  id = 'id',
  system = 'system'
}

export type Library = {
  attributes?: Maybe<Array<Attribute>>;
  behavior: LibraryBehavior;
  defaultView?: Maybe<View>;
  exportProfiles?: Maybe<ExportProfiles>;
  fullTextAttributes?: Maybe<Array<Attribute>>;
  icon?: Maybe<Record>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  linkedTrees?: Maybe<Array<Tree>>;
  mandatoryAttribute?: Maybe<Attribute>;
  permissions?: Maybe<LibraryPermissions>;
  permissions_conf?: Maybe<TreepermissionsConf>;
  previewsSettings?: Maybe<Array<LibraryPreviewsSettings>>;
  recordIdentityConf?: Maybe<RecordIdentityConf>;
  settings?: Maybe<Scalars['JSONObject']['output']>;
  system?: Maybe<Scalars['Boolean']['output']>;
};


export type LibraryLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export enum LibraryBehavior {
  directories = 'directories',
  files = 'files',
  join = 'join',
  standard = 'standard'
}

export type LibraryGraphqlNames = {
  filter: Scalars['String']['output'];
  list: Scalars['String']['output'];
  query: Scalars['String']['output'];
  searchableFields: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

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

export type LibraryPermissions = {
  access_library: Scalars['Boolean']['output'];
  access_record: Scalars['Boolean']['output'];
  access_record_by_default: Scalars['Boolean']['output'];
  admin_library: Scalars['Boolean']['output'];
  create_record: Scalars['Boolean']['output'];
  delete_record: Scalars['Boolean']['output'];
  edit_record: Scalars['Boolean']['output'];
};

export type LibraryPreviewsSettings = {
  description?: Maybe<Scalars['SystemTranslation']['output']>;
  label: Scalars['SystemTranslation']['output'];
  system: Scalars['Boolean']['output'];
  versions: PreviewVersion;
};

export type LibraryPreviewsSettingsInput = {
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  label: Scalars['SystemTranslation']['input'];
  versions: PreviewVersionInput;
};

export type LinkAttribute = Attribute & {
  actions_list?: Maybe<ActionsListConfiguration>;
  compute: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['SystemTranslationOptional']['output']>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID']['output'];
  input_types: ActionListIoTypes;
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  libraries?: Maybe<Array<Library>>;
  linked_library?: Maybe<Library>;
  metadata_fields?: Maybe<Array<StandardAttribute>>;
  multi_link_display_option?: Maybe<MultiDisplayOption>;
  multi_tree_display_option?: Maybe<MultiDisplayOption>;
  multiple_values: Scalars['Boolean']['output'];
  output_types: ActionListIoTypes;
  permissions: AttributePermissions;
  permissions_conf?: Maybe<TreepermissionsConf>;
  readonly: Scalars['Boolean']['output'];
  required: Scalars['Boolean']['output'];
  reverse_link?: Maybe<Scalars['String']['output']>;
  settings?: Maybe<Scalars['JSONObject']['output']>;
  smart_filter?: Maybe<SmartFilterConf>;
  system: Scalars['Boolean']['output'];
  type: AttributeType;
  values_list?: Maybe<LinkValuesListConf>;
  versions_conf?: Maybe<ValuesVersionsConf>;
};


export type LinkAttributeDescriptionArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};


export type LinkAttributeLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};


export type LinkAttributePermissionsArgs = {
  record?: InputMaybe<AttributePermissionsRecord>;
};

export type LinkDistinctValues = GenericDistinctValues & {
  count: Scalars['Int']['output'];
  value?: Maybe<Record>;
};

export type LinkValue = GenericValue & {
  attribute: Attribute;
  created_at?: Maybe<Scalars['Int']['output']>;
  created_by?: Maybe<Record>;
  id_value?: Maybe<Scalars['ID']['output']>;
  isCalculated?: Maybe<Scalars['Boolean']['output']>;
  isInherited?: Maybe<Scalars['Boolean']['output']>;
  metadata?: Maybe<Array<Maybe<ValueMetadata>>>;
  modified_at?: Maybe<Scalars['Int']['output']>;
  modified_by?: Maybe<Record>;
  payload?: Maybe<Record>;
  /** @deprecated Use payload instead */
  value?: Maybe<Record>;
  version?: Maybe<Array<Maybe<ValueVersion>>>;
};

export type LinkValuesListConf = {
  allowFreeEntry?: Maybe<Scalars['Boolean']['output']>;
  allowListUpdate?: Maybe<Scalars['Boolean']['output']>;
  enable: Scalars['Boolean']['output'];
  values?: Maybe<Array<Record>>;
};

export type Log = {
  action?: Maybe<LogAction>;
  after?: Maybe<LogData>;
  before?: Maybe<LogData>;
  instanceId: Scalars['String']['output'];
  metadata?: Maybe<Scalars['Any']['output']>;
  queryId: Scalars['String']['output'];
  time: Scalars['Int']['output'];
  topic?: Maybe<LogTopic>;
  trigger?: Maybe<Scalars['String']['output']>;
  user: LogUser;
};

export enum LogAction {
  API_KEY_DELETE = 'API_KEY_DELETE',
  API_KEY_SAVE = 'API_KEY_SAVE',
  APP_DELETE = 'APP_DELETE',
  APP_SAVE = 'APP_SAVE',
  ATTRIBUTE_DELETE = 'ATTRIBUTE_DELETE',
  ATTRIBUTE_SAVE = 'ATTRIBUTE_SAVE',
  AUTOMATION_PIPELINE_FAILURE = 'AUTOMATION_PIPELINE_FAILURE',
  AUTOMATION_PIPELINE_SUCCESS = 'AUTOMATION_PIPELINE_SUCCESS',
  AUTOMATION_RULE_CREATE = 'AUTOMATION_RULE_CREATE',
  AUTOMATION_RULE_DELETE = 'AUTOMATION_RULE_DELETE',
  AUTOMATION_RULE_UPDATE = 'AUTOMATION_RULE_UPDATE',
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
  PLANNING_RECONDUCTION_END = 'PLANNING_RECONDUCTION_END',
  PLANNING_RECONDUCTION_START = 'PLANNING_RECONDUCTION_START',
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

export type LogApplication = Application | LogUnknownApplicationEntity;

export type LogAttribute = LinkAttribute | LogUnknownEntity | StandardAttribute | TreeAttribute;

export type LogAutomationRule = AutomationRule | LogUnknownAutomationRuleEntity;

export type LogData = {
  asString?: Maybe<Scalars['String']['output']>;
  raw?: Maybe<Scalars['Any']['output']>;
};

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

export type LogLibrary = Library | LogUnknownEntity;

export type LogRecord = LogUnknownEntity | Record;

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

export type LogTopic = {
  apiKey?: Maybe<Scalars['String']['output']>;
  application?: Maybe<LogApplication>;
  attribute?: Maybe<LogAttribute>;
  automationRule?: Maybe<LogAutomationRule>;
  filename?: Maybe<Scalars['String']['output']>;
  library?: Maybe<LogLibrary>;
  permission?: Maybe<PermissionTopic>;
  profile?: Maybe<LogVersionProfile>;
  record?: Maybe<LogRecord>;
  tree?: Maybe<LogTree>;
};

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

export type LogTree = LogUnknownEntity | Tree;

export type LogUnknownApplicationEntity = {
  id: Scalars['ID']['output'];
  label: Scalars['SystemTranslation']['output'];
};

export type LogUnknownAutomationRuleEntity = {
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
};

export type LogUnknownEntity = {
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['SystemTranslation']['output']>;
};

export type LogUnknownStringEntity = {
  id: Scalars['String']['output'];
  label?: Maybe<Scalars['SystemTranslation']['output']>;
};

export type LogUser = LogUnknownEntity | Record;

export type LogVersionProfile = LogUnknownStringEntity | VersionProfile;

export type Logs = {
  logs: Array<Log>;
  total: Scalars['Int']['output'];
};

export type MoveThematicResultThematic = {
  id: Scalars['ID']['output'];
  id_value: Scalars['ID']['output'];
  originalId: Scalars['ID']['output'];
};

export type MoveThematicsResult = {
  errors?: Maybe<Array<ValueBatchError>>;
  thematics?: Maybe<Array<MoveThematicResultThematic>>;
};

export enum MultiDisplayOption {
  avatar = 'avatar',
  badge_qty = 'badge_qty',
  tag = 'tag'
}

export type Mutation = {
  activateNewRecord: CreateRecordResult;
  activateRecords: Array<Record>;
  cancelTask: Scalars['Boolean']['output'];
  createAutomationRule: AutomationRule;
  createDirectory: Record;
  createRecord: CreateRecordResult;
  createViewV2: ViewV2;
  deactivateRecords: Array<Record>;
  deleteAllNotifications: Array<Notification>;
  deleteApiKey: ApiKey;
  deleteApplication: Application;
  deleteAttribute: Attribute;
  deleteAutomationRule: AutomationRule;
  deleteForm?: Maybe<Form>;
  deleteLibrary: Library;
  deleteNotification: Notification;
  deleteRecord: Record;
  deleteTasks: Scalars['Boolean']['output'];
  deleteTree: Tree;
  /**  The returned values are the deleted ones  */
  deleteValue: Array<GenericValue>;
  deleteVersionProfile: VersionProfile;
  deleteView: View;
  deleteViewV2: ViewV2;
  forcePreviewsGeneration: Scalars['Boolean']['output'];
  importConfig: Scalars['ID']['output'];
  importData: Scalars['ID']['output'];
  importExcel: Scalars['ID']['output'];
  indexRecords: Scalars['Boolean']['output'];
  initRenewCampaigns: Scalars['String']['output'];
  moveOrCopyCampaignThematics: MoveThematicsResult;
  postDiscussionComment: DiscussionComment;
  propagateFramingStatus: PropagateFramingStatusResponse;
  purgeInactiveRecords: Array<Record>;
  /**  Purge multiples values of a mono attribute and keep only the more recent one  */
  purgeMultipleValues: Scalars['String']['output'];
  purgeRecord: Record;
  removeCampaigns: RemoveCampaignsResult;
  removeStructureItems: RemoveStructureItemsResult;
  saveApiKey: ApiKey;
  saveApplication: Application;
  saveAttribute: Attribute;
  saveForm?: Maybe<Form>;
  saveGlobalSettings: GlobalSettings;
  saveLibrary: Library;
  savePermission: Permission;
  saveTree: Tree;
  saveUserData: UserData;
  saveValue: Array<GenericValue>;
  /**  Save multiple values for a single record  */
  saveValueBatch: SaveValueBatchResult;
  /**  Save values in bulk for all records matching the filters  */
  saveValueBulk: Scalars['ID']['output'];
  saveVersionProfile: VersionProfile;
  saveView: View;
  treeAddElement: TreeNode;
  treeDeleteElement: Scalars['ID']['output'];
  treeMoveElement: TreeNode;
  updateAutomationRule: AutomationRule;
  updateCampaignsDates: Array<SaveCampaignsDatesResult>;
  updateView: View;
  updateViewV2: ViewV2;
  upload: Array<UploadData>;
};


export type MutationActivateNewRecordArgs = {
  formId?: InputMaybe<Scalars['String']['input']>;
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
};


export type MutationActivateRecordsArgs = {
  filters?: InputMaybe<Array<RecordFilterInput>>;
  libraryId: Scalars['String']['input'];
  recordsIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationCancelTaskArgs = {
  taskId: Scalars['ID']['input'];
};


export type MutationCreateAutomationRuleArgs = {
  rule: CreateAutomationRuleInput;
};


export type MutationCreateDirectoryArgs = {
  library: Scalars['String']['input'];
  name: Scalars['String']['input'];
  nodeId: Scalars['String']['input'];
};


export type MutationCreateRecordArgs = {
  data?: InputMaybe<CreateRecordDataInput>;
  library: Scalars['ID']['input'];
  skipActivate?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationCreateViewV2Args = {
  view: ViewV2CreateInput;
};


export type MutationDeactivateRecordsArgs = {
  filters?: InputMaybe<Array<RecordFilterInput>>;
  libraryId: Scalars['String']['input'];
  recordsIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationDeleteApiKeyArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteApplicationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAttributeArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationDeleteAutomationRuleArgs = {
  ruleId: Scalars['ID']['input'];
};


export type MutationDeleteFormArgs = {
  id: Scalars['ID']['input'];
  library: Scalars['ID']['input'];
};


export type MutationDeleteLibraryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationDeleteNotificationArgs = {
  notificationId: Scalars['ID']['input'];
};


export type MutationDeleteRecordArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  library?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationDeleteTasksArgs = {
  tasks: Array<DeleteTaskInput>;
};


export type MutationDeleteTreeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteValueArgs = {
  attribute: Scalars['ID']['input'];
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
  value?: InputMaybe<ValueInput>;
};


export type MutationDeleteVersionProfileArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteViewArgs = {
  viewId: Scalars['String']['input'];
};


export type MutationDeleteViewV2Args = {
  viewId: Scalars['ID']['input'];
};


export type MutationForcePreviewsGenerationArgs = {
  failedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>>>;
  libraryId: Scalars['ID']['input'];
  previewVersionSizeNames?: InputMaybe<Array<Scalars['String']['input']>>;
  recordIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type MutationImportConfigArgs = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  file: Scalars['Upload']['input'];
};


export type MutationImportDataArgs = {
  file: Scalars['Upload']['input'];
  startAt?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationImportExcelArgs = {
  file: Scalars['Upload']['input'];
  sheets?: InputMaybe<Array<InputMaybe<SheetInput>>>;
  startAt?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationIndexRecordsArgs = {
  libraryId: Scalars['String']['input'];
  records?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationInitRenewCampaignsArgs = {
  campaigns: Array<CampaignToRenew>;
  fromPacId: Scalars['String']['input'];
  redirectUrl: Scalars['String']['input'];
  toPacId: Scalars['String']['input'];
};


export type MutationMoveOrCopyCampaignThematicsArgs = {
  moveThematic: Scalars['Boolean']['input'];
  thematics: Array<ThematicToRenew>;
  toCampaignId: Scalars['String']['input'];
};


export type MutationPostDiscussionCommentArgs = {
  comment?: InputMaybe<DiscussionCommentInput>;
};


export type MutationPropagateFramingStatusArgs = {
  campaignId: Scalars['String']['input'];
  categoriesFilter?: InputMaybe<Array<Scalars['String']['input']>>;
  categoryStatusFilter?: InputMaybe<Array<Scalars['String']['input']>>;
  structureItemCategoryId?: InputMaybe<Scalars['String']['input']>;
  structureItemId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationPurgeInactiveRecordsArgs = {
  libraryId: Scalars['String']['input'];
};


export type MutationPurgeMultipleValuesArgs = {
  attributeId: Scalars['ID']['input'];
};


export type MutationPurgeRecordArgs = {
  libraryId: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
};


export type MutationRemoveCampaignsArgs = {
  campaignsIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveStructureItemsArgs = {
  structureItemIds: Array<Scalars['ID']['input']>;
};


export type MutationSaveApiKeyArgs = {
  apiKey: ApiKeyInput;
};


export type MutationSaveApplicationArgs = {
  application: ApplicationInput;
};


export type MutationSaveAttributeArgs = {
  attribute?: InputMaybe<AttributeInput>;
};


export type MutationSaveFormArgs = {
  form: FormInput;
};


export type MutationSaveGlobalSettingsArgs = {
  settings?: InputMaybe<GlobalSettingsInput>;
};


export type MutationSaveLibraryArgs = {
  library?: InputMaybe<LibraryInput>;
};


export type MutationSavePermissionArgs = {
  permission?: InputMaybe<PermissionInput>;
};


export type MutationSaveTreeArgs = {
  tree: TreeInput;
};


export type MutationSaveUserDataArgs = {
  global: Scalars['Boolean']['input'];
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Any']['input']>;
};


export type MutationSaveValueArgs = {
  attribute: Scalars['ID']['input'];
  library: Scalars['ID']['input'];
  recordId: Scalars['ID']['input'];
  value: ValueInput;
};


export type MutationSaveValueBatchArgs = {
  deleteEmpty?: InputMaybe<Scalars['Boolean']['input']>;
  library?: InputMaybe<Scalars['ID']['input']>;
  recordId?: InputMaybe<Scalars['ID']['input']>;
  values?: InputMaybe<Array<InputMaybe<ValueBatchInput>>>;
  version?: InputMaybe<Array<InputMaybe<ValueVersionInput>>>;
};


export type MutationSaveValueBulkArgs = {
  attributeId: Scalars['ID']['input'];
  libraryId: Scalars['ID']['input'];
  mapping: Array<SaveValueBulkMappingInput>;
  recordsFilters?: InputMaybe<Array<InputMaybe<RecordFilterInput>>>;
};


export type MutationSaveVersionProfileArgs = {
  versionProfile: VersionProfileInput;
};


export type MutationSaveViewArgs = {
  view: ViewInput;
};


export type MutationTreeAddElementArgs = {
  element: TreeElementInput;
  order?: InputMaybe<Scalars['Int']['input']>;
  parent?: InputMaybe<Scalars['ID']['input']>;
  treeId: Scalars['ID']['input'];
};


export type MutationTreeDeleteElementArgs = {
  deleteChildren?: InputMaybe<Scalars['Boolean']['input']>;
  nodeId: Scalars['ID']['input'];
  treeId: Scalars['ID']['input'];
};


export type MutationTreeMoveElementArgs = {
  nodeId: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  parentTo?: InputMaybe<Scalars['ID']['input']>;
  treeId: Scalars['ID']['input'];
};


export type MutationUpdateAutomationRuleArgs = {
  rule: UpdateAutomationRuleInput;
};


export type MutationUpdateCampaignsDatesArgs = {
  campaigns: Array<CampaignToUpdateDates>;
};


export type MutationUpdateViewArgs = {
  view: ViewInputPartial;
};


export type MutationUpdateViewV2Args = {
  view: ViewV2UpdateInput;
};


export type MutationUploadArgs = {
  files: Array<FileInput>;
  library: Scalars['String']['input'];
  nodeId: Scalars['String']['input'];
};

export type Notification = {
  attachments?: Maybe<Array<Attachment>>;
  date: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  level: NotificationLevel;
  message: Scalars['String']['output'];
  relatedEntities?: Maybe<Array<RelatedEntity>>;
  taskId?: Maybe<Scalars['ID']['output']>;
  title: Scalars['String']['output'];
};

export enum NotificationLevel {
  error = 'error',
  info = 'info',
  success = 'success',
  warning = 'warning'
}

export type NotificationsList = {
  list: Array<Notification>;
  totalCount: Scalars['Int']['output'];
};

export type Pagination = {
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
};

export type PartialAutomationRuleTriggerInput = {
  eventAction?: InputMaybe<AutomationRuleEventAction>;
  eventTopic?: InputMaybe<EventTopicInput>;
  synchronous?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Permission = {
  actions: Array<PermissionAction>;
  applyTo?: Maybe<Scalars['ID']['output']>;
  dependenciesTreeTargets?: Maybe<Array<PermissionsDependenciesTreeTarget>>;
  permissionTreeTarget?: Maybe<PermissionsTreeTarget>;
  type: PermissionTypes;
  usersGroup?: Maybe<Scalars['ID']['output']>;
};

export type PermissionAction = {
  allowed?: Maybe<Scalars['Boolean']['output']>;
  name: PermissionsActions;
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

export type PermissionTopic = {
  applyTo?: Maybe<Scalars['Any']['output']>;
  type: Scalars['String']['output'];
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
  set_value = 'set_value'
}

export type PermissionsDependenciesTreeTarget = {
  attributeId: Scalars['ID']['output'];
  nodeId?: Maybe<Scalars['ID']['output']>;
  tree: Scalars['ID']['output'];
};

export type PermissionsDependenciesTreeTargetInput = {
  attributeId: Scalars['ID']['input'];
  nodeId?: InputMaybe<Scalars['ID']['input']>;
  tree: Scalars['ID']['input'];
};

export enum PermissionsRelation {
  and = 'and',
  or = 'or'
}

export type PermissionsTreeTarget = {
  nodeId?: Maybe<Scalars['ID']['output']>;
  tree: Scalars['ID']['output'];
};

export type PermissionsTreeTargetInput = {
  nodeId?: InputMaybe<Scalars['ID']['input']>;
  tree: Scalars['ID']['input'];
};

export type Plugin = {
  author?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

export type PreviewVersion = {
  background: Scalars['String']['output'];
  density: Scalars['Int']['output'];
  sizes: Array<PreviewVersionSize>;
};

export type PreviewVersionInput = {
  background: Scalars['String']['input'];
  density: Scalars['Int']['input'];
  sizes: Array<PreviewVersionSizeInput>;
};

export type PreviewVersionSize = {
  name: Scalars['String']['output'];
  size: Scalars['Int']['output'];
};

export type PreviewVersionSizeInput = {
  name: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};

export type Progress = {
  description?: Maybe<Scalars['SystemTranslation']['output']>;
  percent?: Maybe<Scalars['Int']['output']>;
};

export type PropagateFramingStatusResponse = {
  nbNotProcessed: Scalars['Int']['output'];
  nbSuccess: Scalars['Int']['output'];
};

export type Query = {
  apiKeys: ApiKeyList;
  applications?: Maybe<ApplicationsList>;
  applicationsModules: Array<ApplicationModule>;
  attributes?: Maybe<AttributesList>;
  automationRuleForm: AutomationRuleForm;
  automationRules: AutomationRulesList;
  availableActions?: Maybe<Array<Action>>;
  doesFileExistAsChild?: Maybe<Scalars['Boolean']['output']>;
  export: Scalars['String']['output'];
  forms?: Maybe<FormsList>;
  framingCampaigns: Array<CampaignsFraming>;
  framingReport: Scalars['ID']['output'];
  fullTreeContent?: Maybe<Scalars['FullTreeContent']['output']>;
  getRecordByNodeId: Record;
  globalSettings: GlobalSettings;
  inheritedPermissions?: Maybe<Array<HeritedPermissionAction>>;
  isAllowed?: Maybe<Array<PermissionAction>>;
  langs: Array<Maybe<Scalars['String']['output']>>;
  libraries?: Maybe<LibrariesList>;
  listDistinctValues?: Maybe<Array<GenericDistinctValues>>;
  logs?: Maybe<Logs>;
  me?: Maybe<Record>;
  notifications: NotificationsList;
  permissions?: Maybe<Array<PermissionAction>>;
  permissionsActionsByType: Array<LabeledPermissionsActions>;
  plugins: Array<Plugin>;
  recordForm?: Maybe<RecordForm>;
  records: RecordsList;
  tasks: TasksList;
  treeContent: Array<TreeNode>;
  treeNodeChildren: TreeNodeLightList;
  trees?: Maybe<TreesList>;
  userData: UserData;
  version: Scalars['String']['output'];
  versionProfiles: VersionProfileList;
  view: View;
  viewV2: ViewV2;
  views: ViewsList;
  viewsV2: ViewsV2List;
};


export type QueryApiKeysArgs = {
  filters?: InputMaybe<ApiKeysFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortApiKeysInput>;
};


export type QueryApplicationsArgs = {
  filters?: InputMaybe<ApplicationsFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortApplications>;
};


export type QueryAttributesArgs = {
  filters?: InputMaybe<AttributesFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortAttributes>;
};


export type QueryAutomationRuleFormArgs = {
  formType: AutomationRuleJsonSchemaFormType;
};


export type QueryAutomationRulesArgs = {
  filters?: InputMaybe<AutomationRulesFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<AutomationRulesSortInput>;
};


export type QueryDoesFileExistAsChildArgs = {
  filename: Scalars['String']['input'];
  parentNode?: InputMaybe<Scalars['ID']['input']>;
  treeId: Scalars['ID']['input'];
};


export type QueryExportArgs = {
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>>>;
  library: Scalars['ID']['input'];
  profile?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFormsArgs = {
  filters: FormFiltersInput;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortForms>;
};


export type QueryFramingCampaignsArgs = {
  categoriesFilter?: InputMaybe<Array<Scalars['String']['input']>>;
  categoryStatusFilter?: InputMaybe<Array<Scalars['String']['input']>>;
  filters?: InputMaybe<Array<RecordFilterInput>>;
  pacID: Scalars['String']['input'];
  searchFilter?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFramingReportArgs = {
  content?: InputMaybe<ReportFramingContentInput>;
  pacID: Scalars['String']['input'];
  timeZone?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFullTreeContentArgs = {
  treeId: Scalars['ID']['input'];
};


export type QueryGetRecordByNodeIdArgs = {
  nodeId: Scalars['ID']['input'];
  treeId: Scalars['ID']['input'];
};


export type QueryInheritedPermissionsArgs = {
  actions: Array<PermissionsActions>;
  applyTo?: InputMaybe<Scalars['ID']['input']>;
  dependenciesTreeTargets?: InputMaybe<Array<PermissionsDependenciesTreeTargetInput>>;
  permissionTreeTarget?: InputMaybe<PermissionsTreeTargetInput>;
  type: PermissionTypes;
  userGroupNodeId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryIsAllowedArgs = {
  actions: Array<PermissionsActions>;
  applyTo?: InputMaybe<Scalars['ID']['input']>;
  target?: InputMaybe<PermissionTarget>;
  type: PermissionTypes;
};


export type QueryLibrariesArgs = {
  filters?: InputMaybe<LibrariesFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortLibraries>;
  strictFilters?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryListDistinctValuesArgs = {
  attribute: Scalars['ID']['input'];
  library: Scalars['ID']['input'];
  recordFilters?: InputMaybe<Array<InputMaybe<RecordFilterInput>>>;
  version?: InputMaybe<Array<InputMaybe<ValueVersionInput>>>;
};


export type QueryLogsArgs = {
  filters?: InputMaybe<LogFilterInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<LogSortInput>;
};


export type QueryPermissionsArgs = {
  actions: Array<PermissionsActions>;
  applyTo?: InputMaybe<Scalars['ID']['input']>;
  dependenciesTreeTargets?: InputMaybe<Array<PermissionsDependenciesTreeTargetInput>>;
  permissionTreeTarget?: InputMaybe<PermissionsTreeTargetInput>;
  type: PermissionTypes;
  usersGroup?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryPermissionsActionsByTypeArgs = {
  applyOn?: InputMaybe<Scalars['String']['input']>;
  type: PermissionTypes;
};


export type QueryRecordFormArgs = {
  formId: Scalars['String']['input'];
  libraryId: Scalars['String']['input'];
  recordId?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Array<ValueVersionInput>>;
};


export type QueryRecordsArgs = {
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>>>;
  library: Scalars['ID']['input'];
  multipleSort?: InputMaybe<Array<RecordSortInput>>;
  pagination?: InputMaybe<RecordsPagination>;
  retrieveInactive?: InputMaybe<Scalars['Boolean']['input']>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Array<InputMaybe<ValueVersionInput>>>;
};


export type QueryTasksArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<RecordSortInput>;
};


export type QueryTreeContentArgs = {
  accessRecordByDefaultPermission?: InputMaybe<AccessRecordByDefaultPermissionInput>;
  childrenAsRecordValuePermissionFilter?: InputMaybe<ChildrenAsRecordValuePermissionFilterInput>;
  dependentValuesPermissionFilter?: InputMaybe<DependentValuesPermissionFilterInput>;
  startAt?: InputMaybe<Scalars['ID']['input']>;
  treeId: Scalars['ID']['input'];
};


export type QueryTreeNodeChildrenArgs = {
  accessRecordByDefaultPermission?: InputMaybe<AccessRecordByDefaultPermissionInput>;
  childrenAsRecordValuePermissionFilter?: InputMaybe<ChildrenAsRecordValuePermissionFilterInput>;
  dependentValuesPermissionFilter?: InputMaybe<DependentValuesPermissionFilterInput>;
  node?: InputMaybe<Scalars['ID']['input']>;
  pagination?: InputMaybe<Pagination>;
  treeId: Scalars['ID']['input'];
};


export type QueryTreesArgs = {
  filters?: InputMaybe<TreesFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortTrees>;
};


export type QueryUserDataArgs = {
  global?: InputMaybe<Scalars['Boolean']['input']>;
  keys: Array<Scalars['String']['input']>;
};


export type QueryVersionProfilesArgs = {
  filters?: InputMaybe<VersionProfilesFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortVersionProfilesInput>;
};


export type QueryViewArgs = {
  viewId: Scalars['String']['input'];
};


export type QueryViewV2Args = {
  viewId: Scalars['ID']['input'];
};


export type QueryViewsArgs = {
  library: Scalars['String']['input'];
};


export type QueryViewsV2Args = {
  library: Scalars['ID']['input'];
};

export type Record = {
  active: Scalars['Boolean']['output'];
  created_at: Scalars['Int']['output'];
  created_by: Record;
  id: Scalars['ID']['output'];
  library: Library;
  modified_at: Scalars['Int']['output'];
  modified_by: Record;
  permissions: RecordPermissions;
  properties: Array<RecordProperty>;
  property: Array<GenericValue>;
  whoAmI: RecordIdentity;
};


export type RecordPropertiesArgs = {
  attributeIds: Array<Scalars['ID']['input']>;
};


export type RecordPropertyArgs = {
  attribute: Scalars['ID']['input'];
};

export type RecordFilter = {
  condition?: Maybe<RecordFilterCondition>;
  field?: Maybe<Scalars['String']['output']>;
  operator?: Maybe<RecordFilterOperator>;
  tree?: Maybe<Tree>;
  value?: Maybe<Scalars['String']['output']>;
  withEmptyValues?: Maybe<Scalars['Boolean']['output']>;
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

export type RecordForm = {
  dependencyAttributes?: Maybe<Array<Attribute>>;
  elements: Array<FormElementWithValues>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  library: Library;
  recordId?: Maybe<Scalars['ID']['output']>;
  sidePanel?: Maybe<FormSidePanel>;
  system: Scalars['Boolean']['output'];
};


export type RecordFormLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export type RecordIdentity = {
  color?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  library: Library;
  parentContext?: Maybe<Array<RecordIdentity>>;
  preview?: Maybe<Scalars['Preview']['output']>;
  subLabel?: Maybe<Scalars['String']['output']>;
};

export type RecordIdentityConf = {
  color?: Maybe<Scalars['ID']['output']>;
  label?: Maybe<Scalars['ID']['output']>;
  parentContext?: Maybe<Scalars['ID']['output']>;
  preview?: Maybe<Scalars['ID']['output']>;
  subLabel?: Maybe<Scalars['ID']['output']>;
  treeColorPreview?: Maybe<Scalars['ID']['output']>;
};

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

export type RecordNewCommentEvent = {
  comment: Record;
  record: Record;
};

export type RecordNewCommentFilterInput = {
  ignoreOwnEvents?: InputMaybe<Scalars['Boolean']['input']>;
  libraries?: InputMaybe<Array<Scalars['ID']['input']>>;
  records?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type RecordPermissions = {
  access_record: Scalars['Boolean']['output'];
  access_record_by_default: Scalars['Boolean']['output'];
  create_record: Scalars['Boolean']['output'];
  delete_record: Scalars['Boolean']['output'];
  edit_record: Scalars['Boolean']['output'];
};

export enum RecordPermissionsActions {
  access_record = 'access_record',
  access_record_by_default = 'access_record_by_default',
  create_record = 'create_record',
  delete_record = 'delete_record',
  edit_record = 'edit_record'
}

export type RecordProperty = {
  attributeId: Scalars['ID']['output'];
  attributeProperties: Attribute;
  recordAttributePermissions: AttributePermissions;
  values: Array<GenericValue>;
};

export type RecordSort = {
  field: Scalars['String']['output'];
  order: SortOrder;
};

export type RecordSortInput = {
  field: Scalars['String']['input'];
  order: SortOrder;
};

export type RecordUpdateEvent = {
  record: Record;
  updatedValues: Array<RecordUpdatedValues>;
};

export type RecordUpdateFilterInput = {
  ignoreOwnEvents?: InputMaybe<Scalars['Boolean']['input']>;
  libraries?: InputMaybe<Array<Scalars['ID']['input']>>;
  records?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type RecordUpdatedValues = {
  attribute: Scalars['String']['output'];
  value: GenericValue;
};

export type RecordsList = {
  cursor?: Maybe<RecordsListCursor>;
  list: Array<Record>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type RecordsListCursor = {
  next?: Maybe<Scalars['String']['output']>;
  prev?: Maybe<Scalars['String']['output']>;
};

export type RecordsPagination = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type RelatedEntity = {
  label: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type RenewCampaignResultThematic = {
  id: Scalars['ID']['output'];
  id_value: Scalars['ID']['output'];
  thematic_id: Scalars['ID']['output'];
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
  categoryStatus?: InputMaybe<Array<Scalars['String']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type SaveCampaignsDatesResult = {
  campaign_id: Scalars['ID']['output'];
  errors?: Maybe<Array<ValueBatchError>>;
  values: Array<GenericValue>;
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

export type SmartFilterConf = {
  enable: Scalars['Boolean']['output'];
  through?: Maybe<Attribute>;
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

export type StandardAttribute = Attribute & {
  actions_list?: Maybe<ActionsListConfiguration>;
  character_limit?: Maybe<Scalars['Int']['output']>;
  compute: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['SystemTranslationOptional']['output']>;
  embedded_fields?: Maybe<Array<Maybe<EmbeddedAttribute>>>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID']['output'];
  input_types: ActionListIoTypes;
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  libraries?: Maybe<Array<Library>>;
  metadata_fields?: Maybe<Array<StandardAttribute>>;
  multi_link_display_option?: Maybe<MultiDisplayOption>;
  multi_tree_display_option?: Maybe<MultiDisplayOption>;
  multiple_values: Scalars['Boolean']['output'];
  output_types: ActionListIoTypes;
  permissions: AttributePermissions;
  permissions_conf?: Maybe<TreepermissionsConf>;
  readonly: Scalars['Boolean']['output'];
  required: Scalars['Boolean']['output'];
  settings?: Maybe<Scalars['JSONObject']['output']>;
  smart_filter?: Maybe<SmartFilterConf>;
  system: Scalars['Boolean']['output'];
  type: AttributeType;
  unique?: Maybe<Scalars['Boolean']['output']>;
  values_list?: Maybe<StandardValuesListConf>;
  versions_conf?: Maybe<ValuesVersionsConf>;
};


export type StandardAttributeDescriptionArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};


export type StandardAttributeLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};


export type StandardAttributePermissionsArgs = {
  record?: InputMaybe<AttributePermissionsRecord>;
};

export type StandardDateRangeValuesListConf = {
  allowFreeEntry?: Maybe<Scalars['Boolean']['output']>;
  allowListUpdate?: Maybe<Scalars['Boolean']['output']>;
  enable: Scalars['Boolean']['output'];
  values?: Maybe<Array<DateRangeValue>>;
};

export type StandardDistinctValues = GenericDistinctValues & {
  count: Scalars['Int']['output'];
  value?: Maybe<Scalars['Any']['output']>;
};

export type StandardStringValuesListConf = {
  allowFreeEntry?: Maybe<Scalars['Boolean']['output']>;
  allowListUpdate?: Maybe<Scalars['Boolean']['output']>;
  enable: Scalars['Boolean']['output'];
  values?: Maybe<Array<Scalars['String']['output']>>;
};

export type StandardValuesListConf = StandardDateRangeValuesListConf | StandardStringValuesListConf;

export type StreamProgress = {
  delta?: Maybe<Scalars['Int']['output']>;
  eta?: Maybe<Scalars['Int']['output']>;
  length?: Maybe<Scalars['Int']['output']>;
  percentage?: Maybe<Scalars['Int']['output']>;
  remaining?: Maybe<Scalars['Int']['output']>;
  runtime?: Maybe<Scalars['Int']['output']>;
  speed?: Maybe<Scalars['Int']['output']>;
  transferred?: Maybe<Scalars['Int']['output']>;
};

export type Subscription = {
  applicationEvent: ApplicationEvent;
  notification: Notification;
  recordNewComment: RecordNewCommentEvent;
  recordUpdate: RecordUpdateEvent;
  task: Task;
  treeEvent: TreeEvent;
  upload: UploadProgress;
};


export type SubscriptionApplicationEventArgs = {
  filters?: InputMaybe<ApplicationEventFiltersInput>;
};


export type SubscriptionRecordNewCommentArgs = {
  filters?: InputMaybe<RecordNewCommentFilterInput>;
};


export type SubscriptionRecordUpdateArgs = {
  filters?: InputMaybe<RecordUpdateFilterInput>;
};


export type SubscriptionTaskArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
};


export type SubscriptionTreeEventArgs = {
  filters?: InputMaybe<TreeEventFiltersInput>;
};


export type SubscriptionUploadArgs = {
  filters?: InputMaybe<UploadFiltersInput>;
};

export type Task = {
  archive: Scalars['Boolean']['output'];
  canceledBy?: Maybe<Record>;
  completedAt?: Maybe<Scalars['Int']['output']>;
  created_at: Scalars['Int']['output'];
  created_by: Record;
  id: Scalars['ID']['output'];
  label: Scalars['SystemTranslation']['output'];
  link?: Maybe<TaskLink>;
  modified_at: Scalars['Int']['output'];
  priority: Scalars['TaskPriority']['output'];
  progress?: Maybe<Progress>;
  role?: Maybe<TaskRole>;
  startAt: Scalars['Int']['output'];
  startedAt?: Maybe<Scalars['Int']['output']>;
  status: TaskStatus;
};

export type TaskFiltersInput = {
  archive?: InputMaybe<Scalars['Boolean']['input']>;
  created_by?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<TaskStatus>;
  type?: InputMaybe<TaskType>;
};

export type TaskLink = {
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type TaskRole = {
  detail?: Maybe<Scalars['String']['output']>;
  type: TaskType;
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

export type TasksList = {
  list: Array<Task>;
  totalCount: Scalars['Int']['output'];
};

export type ThematicToRenew = {
  campaignId: Scalars['String']['input'];
  thematicId: Scalars['String']['input'];
};

export type Tree = {
  behavior: TreeBehavior;
  defaultElement?: Maybe<TreeNode>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  libraries: Array<TreeLibrary>;
  permissions: TreePermissions;
  permissions_conf?: Maybe<Array<TreeNodePermissionsConf>>;
  settings?: Maybe<Scalars['JSONObject']['output']>;
  system: Scalars['Boolean']['output'];
};


export type TreeLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export type TreeAllowedDependentValues = {
  nodeId?: Maybe<Scalars['ID']['output']>;
};

export type TreeAttribute = Attribute & {
  actions_list?: Maybe<ActionsListConfiguration>;
  compute: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['SystemTranslationOptional']['output']>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID']['output'];
  input_types: ActionListIoTypes;
  label?: Maybe<Scalars['SystemTranslation']['output']>;
  libraries?: Maybe<Array<Library>>;
  linked_tree?: Maybe<Tree>;
  metadata_fields?: Maybe<Array<StandardAttribute>>;
  multi_link_display_option?: Maybe<MultiDisplayOption>;
  multi_tree_display_option?: Maybe<MultiDisplayOption>;
  multiple_values: Scalars['Boolean']['output'];
  output_types: ActionListIoTypes;
  permissions: AttributePermissions;
  permissions_conf?: Maybe<TreepermissionsConf>;
  permissions_conf_dependent_values?: Maybe<TreePermissionsDependentValuesConf>;
  readonly: Scalars['Boolean']['output'];
  required: Scalars['Boolean']['output'];
  settings?: Maybe<Scalars['JSONObject']['output']>;
  system: Scalars['Boolean']['output'];
  /**  List of all tree nodes with their allowed dependent values for this attribute, include null node for root if applicable. */
  tree_values?: Maybe<Array<TreeDependentValuesNode>>;
  type: AttributeType;
  values_list?: Maybe<TreeValuesListConf>;
  versions_conf?: Maybe<ValuesVersionsConf>;
};


export type TreeAttributeDescriptionArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};


export type TreeAttributeLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};


export type TreeAttributePermissionsArgs = {
  record?: InputMaybe<AttributePermissionsRecord>;
};


export type TreeAttributeTreeValuesArgs = {
  attributeDependentValue?: InputMaybe<AttributeDependentValueInput>;
};

export enum TreeBehavior {
  files = 'files',
  standard = 'standard'
}

export type TreeDependentValuesNode = {
  allowedDependentValues?: Maybe<Array<TreeAllowedDependentValues>>;
  node?: Maybe<TreeNodeLight>;
};

export type TreeDistinctValues = GenericDistinctValues & {
  count: Scalars['Int']['output'];
  value?: Maybe<TreeNode>;
};

export type TreeElement = {
  id?: Maybe<Scalars['ID']['output']>;
  library?: Maybe<Scalars['String']['output']>;
};

export type TreeElementInput = {
  id: Scalars['ID']['input'];
  library: Scalars['String']['input'];
};

export type TreeEvent = {
  element: TreeNode;
  parentNode?: Maybe<TreeNode>;
  parentNodeBefore?: Maybe<TreeNode>;
  treeId: Scalars['ID']['output'];
  type: TreeEventTypes;
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

export type TreeLibrary = {
  library: Library;
  settings: TreeLibrarySettings;
};

export type TreeLibraryInput = {
  library: Scalars['ID']['input'];
  settings: TreeLibrarySettingsInput;
};

export type TreeLibrarySettings = {
  allowMultiplePositions: Scalars['Boolean']['output'];
  allowedAtRoot: Scalars['Boolean']['output'];
  allowedChildren: Array<Scalars['String']['output']>;
};

export type TreeLibrarySettingsInput = {
  allowMultiplePositions: Scalars['Boolean']['input'];
  allowedAtRoot: Scalars['Boolean']['input'];
  allowedChildren: Array<Scalars['String']['input']>;
};

export type TreeNode = {
  accessRecordByDefaultPermission?: Maybe<Scalars['Boolean']['output']>;
  ancestors?: Maybe<Array<TreeNode>>;
  children?: Maybe<Array<TreeNode>>;
  childrenCount?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  linkedRecords?: Maybe<Array<Record>>;
  order?: Maybe<Scalars['Int']['output']>;
  permissions: TreeNodePermissions;
  record: Record;
};


export type TreeNodeLinkedRecordsArgs = {
  attribute?: InputMaybe<Scalars['ID']['input']>;
};

export type TreeNodeLight = {
  accessRecordByDefaultPermission?: Maybe<Scalars['Boolean']['output']>;
  ancestors?: Maybe<Array<TreeNode>>;
  childrenCount?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  linkedRecords?: Maybe<Array<Record>>;
  order?: Maybe<Scalars['Int']['output']>;
  permissions: TreeNodePermissions;
  record: Record;
};


export type TreeNodeLightLinkedRecordsArgs = {
  attribute?: InputMaybe<Scalars['ID']['input']>;
};

export type TreeNodeLightList = {
  list: Array<TreeNodeLight>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TreeNodePermissions = {
  access_tree: Scalars['Boolean']['output'];
  detach: Scalars['Boolean']['output'];
  edit_children: Scalars['Boolean']['output'];
};

export type TreeNodePermissionsConf = {
  libraryId: Scalars['ID']['output'];
  permissionsConf: TreepermissionsConf;
};

export type TreeNodePermissionsConfInput = {
  libraryId: Scalars['ID']['input'];
  permissionsConf: TreepermissionsConfInput;
};

export type TreePermissions = {
  access_tree: Scalars['Boolean']['output'];
  detach: Scalars['Boolean']['output'];
  edit_children: Scalars['Boolean']['output'];
};

export type TreePermissionsDependentValuesConf = {
  allowByDefault: Scalars['Boolean']['output'];
  dependenciesTreeAttributes: Array<Attribute>;
};

export type TreePermissionsDependentValuesConfInput = {
  allowByDefault: Scalars['Boolean']['input'];
  dependenciesTreeAttributes: Array<Scalars['ID']['input']>;
};

export type TreeValue = GenericValue & {
  attribute: Attribute;
  created_at?: Maybe<Scalars['Int']['output']>;
  created_by?: Maybe<Record>;
  id_value?: Maybe<Scalars['ID']['output']>;
  isCalculated?: Maybe<Scalars['Boolean']['output']>;
  isInherited?: Maybe<Scalars['Boolean']['output']>;
  metadata?: Maybe<Array<Maybe<ValueMetadata>>>;
  modified_at?: Maybe<Scalars['Int']['output']>;
  modified_by?: Maybe<Record>;
  payload?: Maybe<TreeNode>;
  /** @deprecated Use payload instead */
  value?: Maybe<TreeNode>;
  version?: Maybe<Array<Maybe<ValueVersion>>>;
};

export type TreeValuesListConf = {
  allowFreeEntry?: Maybe<Scalars['Boolean']['output']>;
  allowListUpdate?: Maybe<Scalars['Boolean']['output']>;
  enable: Scalars['Boolean']['output'];
  values?: Maybe<Array<TreeNode>>;
};

export type TreepermissionsConf = {
  permissionTreeAttributes: Array<Attribute>;
  relation: PermissionsRelation;
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

export type TreesList = {
  list: Array<Tree>;
  totalCount: Scalars['Int']['output'];
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
};

export type UploadData = {
  record: Record;
  uid: Scalars['String']['output'];
};

export type UploadFiltersInput = {
  uid?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type UploadProgress = {
  progress: StreamProgress;
  uid: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export enum UserCoreDataKeys {
  applications_consultation = 'applications_consultation'
}

export type UserData = {
  data?: Maybe<Scalars['Any']['output']>;
  global: Scalars['Boolean']['output'];
};

export type Value = GenericValue & {
  attribute: Attribute;
  created_at?: Maybe<Scalars['Int']['output']>;
  created_by?: Maybe<Record>;
  id_value?: Maybe<Scalars['ID']['output']>;
  isCalculated?: Maybe<Scalars['Boolean']['output']>;
  isInherited?: Maybe<Scalars['Boolean']['output']>;
  metadata?: Maybe<Array<Maybe<ValueMetadata>>>;
  modified_at?: Maybe<Scalars['Int']['output']>;
  modified_by?: Maybe<Record>;
  /**  it can be "\__empty_value__" whatever the format  */
  payload?: Maybe<Scalars['Any']['output']>;
  /**  it can be "\__empty_value__" whatever the format  */
  raw_payload?: Maybe<Scalars['Any']['output']>;
  /** @deprecated Use raw_payload instead */
  raw_value?: Maybe<Scalars['Any']['output']>;
  /** @deprecated Use payload instead */
  value?: Maybe<Scalars['Any']['output']>;
  version?: Maybe<Array<Maybe<ValueVersion>>>;
};

export type ValueBatchError = {
  attribute: Scalars['String']['output'];
  input?: Maybe<Scalars['String']['output']>;
  library?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

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

export type ValueMetadata = {
  name: Scalars['String']['output'];
  value?: Maybe<Value>;
};

export type ValueMetadataInput = {
  name: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type ValueVersion = {
  treeId: Scalars['String']['output'];
  treeNode?: Maybe<TreeNode>;
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

export type ValuesVersionsConf = {
  mode?: Maybe<ValueVersionMode>;
  profile?: Maybe<VersionProfile>;
  versionable: Scalars['Boolean']['output'];
};

export type ValuesVersionsConfInput = {
  mode?: InputMaybe<ValueVersionMode>;
  profile?: InputMaybe<Scalars['String']['input']>;
  versionable: Scalars['Boolean']['input'];
};

export type VersionProfile = {
  description?: Maybe<Scalars['SystemTranslation']['output']>;
  id: Scalars['String']['output'];
  label: Scalars['SystemTranslation']['output'];
  linkedAttributes: Array<Attribute>;
  trees: Array<Tree>;
};

export type VersionProfileInput = {
  description?: InputMaybe<Scalars['SystemTranslationOptional']['input']>;
  id: Scalars['String']['input'];
  label?: InputMaybe<Scalars['SystemTranslation']['input']>;
  trees?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type VersionProfileList = {
  list: Array<VersionProfile>;
  totalCount: Scalars['Int']['output'];
};

export type VersionProfilesFiltersInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  trees?: InputMaybe<Scalars['String']['input']>;
};

export enum VersionProfilesSortableFields {
  id = 'id'
}

export type View = {
  /**  The whoAmI column will never be included in attributes because is already hard-coded to be present */
  attributes?: Maybe<Array<Attribute>>;
  color?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Int']['output'];
  created_by: Record;
  description?: Maybe<Scalars['SystemTranslationOptional']['output']>;
  display: ViewDisplay;
  filters?: Maybe<Array<RecordFilter>>;
  id: Scalars['String']['output'];
  label: Scalars['SystemTranslation']['output'];
  library: Scalars['String']['output'];
  modified_at: Scalars['Int']['output'];
  shared: Scalars['Boolean']['output'];
  sort?: Maybe<Array<RecordSort>>;
  valuesVersions?: Maybe<Array<ViewValuesVersion>>;
};

export type ViewDisplay = {
  size?: Maybe<ViewSizes>;
  type: ViewTypes;
};

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

export type ViewV2 = {
  created_at: Scalars['Int']['output'];
  created_by: Record;
  display: ViewV2Display;
  filters: Array<ViewV2Filter>;
  id: Scalars['ID']['output'];
  label: Scalars['SystemTranslation']['output'];
  library: Scalars['ID']['output'];
  modified_at: Scalars['Int']['output'];
  shared: Scalars['Boolean']['output'];
  sorts: Array<ViewV2Sort>;
  valuesVersions?: Maybe<Array<ViewV2ValuesVersion>>;
};

export type ViewV2CreateInput = {
  display: ViewV2DisplayInput;
  filters?: InputMaybe<Array<ViewV2FilterInput>>;
  label: Scalars['SystemTranslation']['input'];
  library: Scalars['ID']['input'];
  shared: Scalars['Boolean']['input'];
  sorts?: InputMaybe<Array<ViewV2SortInput>>;
  valuesVersions?: InputMaybe<Array<ViewV2ValuesVersionInput>>;
};

export type ViewV2Display = {
  attributes: Array<ViewV2DisplayAttribute>;
  type: ViewV2Types;
};

export type ViewV2DisplayAttribute = {
  attribute: Attribute;
  visible: Scalars['Boolean']['output'];
};

export type ViewV2DisplayAttributeInput = {
  attributeId: Scalars['ID']['input'];
  visible: Scalars['Boolean']['input'];
};

export type ViewV2DisplayInput = {
  /**  The whoAmI column should never be included in attributes because is already hard-coded to be present */
  attributes?: InputMaybe<Array<ViewV2DisplayAttributeInput>>;
  type: ViewV2Types;
};

export type ViewV2Filter = {
  attributes: Array<Attribute>;
  condition: RecordFilterCondition;
  pinned: Scalars['Boolean']['output'];
  values: Array<Maybe<Scalars['String']['output']>>;
};

export type ViewV2FilterInput = {
  attributes: Array<Scalars['ID']['input']>;
  condition: RecordFilterCondition;
  pinned: Scalars['Boolean']['input'];
  values: Array<InputMaybe<Scalars['String']['input']>>;
};

export type ViewV2Sort = {
  attributes: Array<Attribute>;
  order: SortOrder;
};

export type ViewV2SortInput = {
  attributes: Array<Scalars['ID']['input']>;
  order: SortOrder;
};

export enum ViewV2Types {
  cards = 'cards',
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
  shared?: InputMaybe<Scalars['Boolean']['input']>;
  sorts?: InputMaybe<Array<ViewV2SortInput>>;
  valuesVersions?: InputMaybe<Array<ViewV2ValuesVersionInput>>;
};

export type ViewV2ValuesVersion = {
  treeId: Scalars['ID']['output'];
  treeNode: TreeNode;
};

export type ViewV2ValuesVersionInput = {
  treeId: Scalars['ID']['input'];
  treeNode: Scalars['ID']['input'];
};

export type ViewValuesVersion = {
  treeId: Scalars['String']['output'];
  treeNode: TreeNode;
};

export type ViewValuesVersionInput = {
  treeId: Scalars['String']['input'];
  treeNode: Scalars['String']['input'];
};

export type ViewsList = {
  list: Array<View>;
  totalCount: Scalars['Int']['output'];
};

export type ViewsV2List = {
  list: Array<ViewV2>;
  totalCount: Scalars['Int']['output'];
};

export type RemoveCampaignsResult = {
  errors?: Maybe<Array<ValueBatchError>>;
  values: Array<Scalars['ID']['output']>;
};

export type RemoveStructureItemsResult = {
  errors?: Maybe<Array<ValueBatchError>>;
  values: Array<Scalars['ID']['output']>;
};

export type SaveValueBatchResult = {
  errors?: Maybe<Array<ValueBatchError>>;
  values?: Maybe<Array<GenericValue>>;
};

export type GetApplicationDataByEndpointQueryVariables = Exact<{
  endpoint: Scalars['String']['input'];
}>;


export type GetApplicationDataByEndpointQuery = { applications?: { list: Array<{ id: string, label: any, appStudioSettings?: any | null, permissions: { access_application: boolean } }> } | null };

export type GetLanguagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLanguagesQuery = { langs: Array<string | null> };

export type GetUserIdentityQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserIdentityQuery = { me?: { id: string, whoAmI: { id: string, label?: string | null, library: { id: string } }, user_groups: Array<{ payload?: { record: { whoAmI: { label?: string | null } } } | null }> } | null };

export type GetRecordInformationQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
}>;


export type GetRecordInformationQuery = { records: { list: Array<{ created_by: Array<{ payload?: { id: string, email: Array<{ values: Array<{ payload?: any | null }> }> } | null }>, modified_by: Array<{ payload?: { id: string, email: Array<{ values: Array<{ payload?: any | null }> }> } | null }>, created_at: Array<{ payload?: any | null }>, modified_at: Array<{ payload?: any | null }>, library: { label?: any | null } }> } };

export type PostDiscussionCommentMutationVariables = Exact<{
  comment: DiscussionCommentInput;
}>;


export type PostDiscussionCommentMutation = { postDiscussionComment: { id: string } };

export type GetUsersQueryVariables = Exact<{
  query: Scalars['String']['input'];
  pagination?: InputMaybe<RecordsPagination>;
}>;


export type GetUsersQuery = { records: { list: Array<{ id: string, label: Array<{ payload?: any | null }> }> } };

export type GetThreadStatusOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetThreadStatusOptionsQuery = { treeNodeChildren: { list: Array<{ id: string, record: { label: Array<{ payload?: any | null }> } }> } };

export type GetThreadQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
  recordId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetThreadQuery = { records: { list: Array<{ permissions: { edit_record: boolean }, threads: Array<{ payload?: { id: string, label: Array<{ payload?: any | null }>, status: Array<{ payload?: { id: string } | null }>, comments: Array<{ payload?: { id: string, content: Array<{ payload?: any | null }>, author: Array<{ payload?: { id: string, name: Array<{ payload?: any | null }> } | null }>, createdAt: Array<{ raw_payload?: any | null }> } | null }> } | null }> }> } };

export type CreateViewV2MutationVariables = Exact<{
  view: ViewV2CreateInput;
}>;


export type CreateViewV2Mutation = { createViewV2: { id: string, library: string, label: any, shared: boolean, created_by: { id: string, whoAmI: { id: string, label?: string | null } }, display: { type: ViewV2Types, attributes: Array<{ visible: boolean, attribute: { id: string, label?: any | null } }> } } };

export type UpdateViewV2MutationVariables = Exact<{
  view: ViewV2UpdateInput;
}>;


export type UpdateViewV2Mutation = { updateViewV2: { id: string, library: string, label: any, shared: boolean, created_by: { id: string, whoAmI: { id: string, label?: string | null } }, display: { type: ViewV2Types, attributes: Array<{ visible: boolean, attribute: { id: string, label?: any | null } }> } } };

export type GetPermissionEditViewOnLibraryQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
}>;


export type GetPermissionEditViewOnLibraryQuery = { libraries?: { list: Array<{ id: string, permissions?: { admin_library: boolean } | null }> } | null };

export type GetViewV2QueryVariables = Exact<{
  viewId: Scalars['ID']['input'];
}>;


export type GetViewV2Query = { viewV2: { id: string, library: string, label: any, shared: boolean, created_by: { id: string, whoAmI: { id: string, label?: string | null } }, display: { type: ViewV2Types, attributes: Array<{ visible: boolean, attribute: { id: string, label?: any | null } }> } } };

export type AppStudioViewSettingsViewFragment = { id: string, library: string, label: any, shared: boolean, created_by: { id: string, whoAmI: { id: string, label?: string | null } }, display: { type: ViewV2Types, attributes: Array<{ visible: boolean, attribute: { id: string, label?: any | null } }> } };

export type GetViewListQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
}>;


export type GetViewListQuery = { viewsV2: { list: Array<{ id: string, label: any, shared: boolean, created_by: { id: string } }> } };

export type GetLibraryNameQueryVariables = Exact<{
  libraryId: Scalars['ID']['input'];
}>;


export type GetLibraryNameQuery = { libraries?: { list: Array<{ label?: any | null }> } | null };

export type PanelAttributeCountQueryVariables = Exact<{
  library: Scalars['ID']['input'];
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>> | InputMaybe<RecordFilterInput>>;
}>;


export type PanelAttributeCountQuery = { records: { totalCount?: number | null } };

export type DeleteUserNotificationMutationVariables = Exact<{
  notificationId: Scalars['ID']['input'];
}>;


export type DeleteUserNotificationMutation = { deleteNotification: { id: string } };

export type DeleteAllUserNotificationsMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAllUserNotificationsMutation = { deleteAllNotifications: Array<{ id: string }> };

export type GetUserNotificationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserNotificationsQuery = { notifications: { list: Array<{ id: string, date: number, level: NotificationLevel, message: string, title: string, attachments?: Array<{ label: string, url: string }> | null, relatedEntities?: Array<{ label: string, url: string }> | null }> } };

export type SubscribeToUserNotificationsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type SubscribeToUserNotificationsSubscription = { notification: { id: string, date: number, level: NotificationLevel, message: string, title: string, attachments?: Array<{ label: string, url: string }> | null, relatedEntities?: Array<{ label: string, url: string }> | null } };

export type ArchiveUserTasksMutationVariables = Exact<{
  tasks: Array<DeleteTaskInput> | DeleteTaskInput;
}>;


export type ArchiveUserTasksMutation = { deleteTasks: boolean };

export type GetUserTasksQueryVariables = Exact<{
  filters?: InputMaybe<TaskFiltersInput>;
}>;


export type GetUserTasksQuery = { tasks: { list: Array<{ id: string, status: TaskStatus, label: any, created_at: number, startedAt?: number | null, completedAt?: number | null, progress?: { description?: any | null, percent?: number | null } | null, link?: { url: string } | null }> } };

export type SubscribeToUserTasksSubscriptionVariables = Exact<{
  filters?: InputMaybe<TaskFiltersInput>;
}>;


export type SubscribeToUserTasksSubscription = { task: { id: string, status: TaskStatus, label: any, created_at: number, startedAt?: number | null, completedAt?: number | null, progress?: { description?: any | null, percent?: number | null } | null, link?: { url: string } | null } };

export const AppStudioViewSettingsViewFragmentDoc = gql`
    fragment AppStudioViewSettingsView on ViewV2 {
  id
  library
  label
  shared
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
      visible
      attribute {
        id
        label
      }
    }
  }
}
    `;
export const GetApplicationDataByEndpointDocument = gql`
    query GetApplicationDataByEndpoint($endpoint: String!) {
  applications(filters: {endpoint: $endpoint}) {
    list {
      id
      label
      permissions {
        access_application
      }
      appStudioSettings
    }
  }
}
    `;

/**
 * __useGetApplicationDataByEndpointQuery__
 *
 * To run a query within a React component, call `useGetApplicationDataByEndpointQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApplicationDataByEndpointQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApplicationDataByEndpointQuery({
 *   variables: {
 *      endpoint: // value for 'endpoint'
 *   },
 * });
 */
export function useGetApplicationDataByEndpointQuery(baseOptions: Apollo.QueryHookOptions<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables> & ({ variables: GetApplicationDataByEndpointQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables>(GetApplicationDataByEndpointDocument, options);
      }
export function useGetApplicationDataByEndpointLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables>(GetApplicationDataByEndpointDocument, options);
        }
// @ts-ignore
export function useGetApplicationDataByEndpointSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables>;
export function useGetApplicationDataByEndpointSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables>): Apollo.UseSuspenseQueryResult<GetApplicationDataByEndpointQuery | undefined, GetApplicationDataByEndpointQueryVariables>;
export function useGetApplicationDataByEndpointSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables>(GetApplicationDataByEndpointDocument, options);
        }
export type GetApplicationDataByEndpointQueryHookResult = ReturnType<typeof useGetApplicationDataByEndpointQuery>;
export type GetApplicationDataByEndpointLazyQueryHookResult = ReturnType<typeof useGetApplicationDataByEndpointLazyQuery>;
export type GetApplicationDataByEndpointSuspenseQueryHookResult = ReturnType<typeof useGetApplicationDataByEndpointSuspenseQuery>;
export type GetApplicationDataByEndpointQueryResult = Apollo.QueryResult<GetApplicationDataByEndpointQuery, GetApplicationDataByEndpointQueryVariables>;
export const GetLanguagesDocument = gql`
    query getLanguages {
  langs
}
    `;

/**
 * __useGetLanguagesQuery__
 *
 * To run a query within a React component, call `useGetLanguagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLanguagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLanguagesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLanguagesQuery(baseOptions?: Apollo.QueryHookOptions<GetLanguagesQuery, GetLanguagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLanguagesQuery, GetLanguagesQueryVariables>(GetLanguagesDocument, options);
      }
export function useGetLanguagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLanguagesQuery, GetLanguagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLanguagesQuery, GetLanguagesQueryVariables>(GetLanguagesDocument, options);
        }
// @ts-ignore
export function useGetLanguagesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLanguagesQuery, GetLanguagesQueryVariables>): Apollo.UseSuspenseQueryResult<GetLanguagesQuery, GetLanguagesQueryVariables>;
export function useGetLanguagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLanguagesQuery, GetLanguagesQueryVariables>): Apollo.UseSuspenseQueryResult<GetLanguagesQuery | undefined, GetLanguagesQueryVariables>;
export function useGetLanguagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLanguagesQuery, GetLanguagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLanguagesQuery, GetLanguagesQueryVariables>(GetLanguagesDocument, options);
        }
export type GetLanguagesQueryHookResult = ReturnType<typeof useGetLanguagesQuery>;
export type GetLanguagesLazyQueryHookResult = ReturnType<typeof useGetLanguagesLazyQuery>;
export type GetLanguagesSuspenseQueryHookResult = ReturnType<typeof useGetLanguagesSuspenseQuery>;
export type GetLanguagesQueryResult = Apollo.QueryResult<GetLanguagesQuery, GetLanguagesQueryVariables>;
export const GetUserIdentityDocument = gql`
    query getUserIdentity {
  me {
    id
    whoAmI {
      id
      label
      library {
        id
      }
    }
    user_groups: property(attribute: "user_groups") {
      ... on TreeValue {
        payload {
          record {
            whoAmI {
              label
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetUserIdentityQuery__
 *
 * To run a query within a React component, call `useGetUserIdentityQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserIdentityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserIdentityQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserIdentityQuery(baseOptions?: Apollo.QueryHookOptions<GetUserIdentityQuery, GetUserIdentityQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserIdentityQuery, GetUserIdentityQueryVariables>(GetUserIdentityDocument, options);
      }
export function useGetUserIdentityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserIdentityQuery, GetUserIdentityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserIdentityQuery, GetUserIdentityQueryVariables>(GetUserIdentityDocument, options);
        }
// @ts-ignore
export function useGetUserIdentitySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUserIdentityQuery, GetUserIdentityQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserIdentityQuery, GetUserIdentityQueryVariables>;
export function useGetUserIdentitySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserIdentityQuery, GetUserIdentityQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserIdentityQuery | undefined, GetUserIdentityQueryVariables>;
export function useGetUserIdentitySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserIdentityQuery, GetUserIdentityQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserIdentityQuery, GetUserIdentityQueryVariables>(GetUserIdentityDocument, options);
        }
export type GetUserIdentityQueryHookResult = ReturnType<typeof useGetUserIdentityQuery>;
export type GetUserIdentityLazyQueryHookResult = ReturnType<typeof useGetUserIdentityLazyQuery>;
export type GetUserIdentitySuspenseQueryHookResult = ReturnType<typeof useGetUserIdentitySuspenseQuery>;
export type GetUserIdentityQueryResult = Apollo.QueryResult<GetUserIdentityQuery, GetUserIdentityQueryVariables>;
export const GetRecordInformationDocument = gql`
    query getRecordInformation($library: ID!, $filters: [RecordFilterInput]) {
  records(library: $library, filters: $filters) {
    list {
      created_by: property(attribute: "created_by") {
        ... on LinkValue {
          payload {
            id
            email: properties(attributeIds: ["email"]) {
              values {
                ... on Value {
                  payload
                }
              }
            }
          }
        }
      }
      modified_by: property(attribute: "modified_by") {
        ... on LinkValue {
          payload {
            id
            email: properties(attributeIds: ["email"]) {
              values {
                ... on Value {
                  payload
                }
              }
            }
          }
        }
      }
      created_at: property(attribute: "created_at") {
        ... on Value {
          payload
        }
      }
      modified_at: property(attribute: "created_at") {
        ... on Value {
          payload
        }
      }
      library: library {
        label
      }
    }
  }
}
    `;

/**
 * __useGetRecordInformationQuery__
 *
 * To run a query within a React component, call `useGetRecordInformationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecordInformationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecordInformationQuery({
 *   variables: {
 *      library: // value for 'library'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetRecordInformationQuery(baseOptions: Apollo.QueryHookOptions<GetRecordInformationQuery, GetRecordInformationQueryVariables> & ({ variables: GetRecordInformationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecordInformationQuery, GetRecordInformationQueryVariables>(GetRecordInformationDocument, options);
      }
export function useGetRecordInformationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecordInformationQuery, GetRecordInformationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecordInformationQuery, GetRecordInformationQueryVariables>(GetRecordInformationDocument, options);
        }
// @ts-ignore
export function useGetRecordInformationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecordInformationQuery, GetRecordInformationQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecordInformationQuery, GetRecordInformationQueryVariables>;
export function useGetRecordInformationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecordInformationQuery, GetRecordInformationQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecordInformationQuery | undefined, GetRecordInformationQueryVariables>;
export function useGetRecordInformationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecordInformationQuery, GetRecordInformationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecordInformationQuery, GetRecordInformationQueryVariables>(GetRecordInformationDocument, options);
        }
export type GetRecordInformationQueryHookResult = ReturnType<typeof useGetRecordInformationQuery>;
export type GetRecordInformationLazyQueryHookResult = ReturnType<typeof useGetRecordInformationLazyQuery>;
export type GetRecordInformationSuspenseQueryHookResult = ReturnType<typeof useGetRecordInformationSuspenseQuery>;
export type GetRecordInformationQueryResult = Apollo.QueryResult<GetRecordInformationQuery, GetRecordInformationQueryVariables>;
export const PostDiscussionCommentDocument = gql`
    mutation PostDiscussionComment($comment: DiscussionCommentInput!) {
  postDiscussionComment(comment: $comment) {
    id
  }
}
    `;
export type PostDiscussionCommentMutationFn = Apollo.MutationFunction<PostDiscussionCommentMutation, PostDiscussionCommentMutationVariables>;

/**
 * __usePostDiscussionCommentMutation__
 *
 * To run a mutation, you first call `usePostDiscussionCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostDiscussionCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postDiscussionCommentMutation, { data, loading, error }] = usePostDiscussionCommentMutation({
 *   variables: {
 *      comment: // value for 'comment'
 *   },
 * });
 */
export function usePostDiscussionCommentMutation(baseOptions?: Apollo.MutationHookOptions<PostDiscussionCommentMutation, PostDiscussionCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PostDiscussionCommentMutation, PostDiscussionCommentMutationVariables>(PostDiscussionCommentDocument, options);
      }
export type PostDiscussionCommentMutationHookResult = ReturnType<typeof usePostDiscussionCommentMutation>;
export type PostDiscussionCommentMutationResult = Apollo.MutationResult<PostDiscussionCommentMutation>;
export type PostDiscussionCommentMutationOptions = Apollo.BaseMutationOptions<PostDiscussionCommentMutation, PostDiscussionCommentMutationVariables>;
export const GetUsersDocument = gql`
    query GetUsers($query: String!, $pagination: RecordsPagination) {
  records(
    library: "users"
    filters: [{field: "login", condition: NOT_EQUAL, value: ""}, {operator: AND}, {field: "email", condition: NOT_EQUAL, value: ""}, {operator: AND}, {field: "login", condition: CONTAINS, value: $query}]
    pagination: $pagination
  ) {
    list {
      id
      label: property(attribute: "login") {
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
 *      query: // value for 'query'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables> & ({ variables: GetUsersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
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
export const GetThreadStatusOptionsDocument = gql`
    query GetThreadStatusOptions {
  treeNodeChildren(treeId: "discussion_thread_statuses_tree") {
    list {
      id
      record {
        label: property(attribute: "statuses_label") {
          ... on Value {
            payload
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetThreadStatusOptionsQuery__
 *
 * To run a query within a React component, call `useGetThreadStatusOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetThreadStatusOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetThreadStatusOptionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetThreadStatusOptionsQuery(baseOptions?: Apollo.QueryHookOptions<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>(GetThreadStatusOptionsDocument, options);
      }
export function useGetThreadStatusOptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>(GetThreadStatusOptionsDocument, options);
        }
// @ts-ignore
export function useGetThreadStatusOptionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>;
export function useGetThreadStatusOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetThreadStatusOptionsQuery | undefined, GetThreadStatusOptionsQueryVariables>;
export function useGetThreadStatusOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>(GetThreadStatusOptionsDocument, options);
        }
export type GetThreadStatusOptionsQueryHookResult = ReturnType<typeof useGetThreadStatusOptionsQuery>;
export type GetThreadStatusOptionsLazyQueryHookResult = ReturnType<typeof useGetThreadStatusOptionsLazyQuery>;
export type GetThreadStatusOptionsSuspenseQueryHookResult = ReturnType<typeof useGetThreadStatusOptionsSuspenseQuery>;
export type GetThreadStatusOptionsQueryResult = Apollo.QueryResult<GetThreadStatusOptionsQuery, GetThreadStatusOptionsQueryVariables>;
export const GetThreadDocument = gql`
    query GetThread($libraryId: ID!, $recordId: String) {
  records(
    library: $libraryId
    filters: [{field: "id", condition: EQUAL, value: $recordId}]
  ) {
    list {
      permissions {
        edit_record
      }
      threads: property(attribute: "discussion_threads") {
        ... on LinkValue {
          payload {
            id
            label: property(attribute: "label") {
              ... on Value {
                payload
              }
            }
            status: property(attribute: "discussion_threads_status") {
              ... on TreeValue {
                payload {
                  id
                }
              }
            }
            comments: property(attribute: "discussion_threads_comments") {
              ... on LinkValue {
                payload {
                  id
                  content: property(attribute: "discussion_comments_text") {
                    ... on Value {
                      payload
                    }
                  }
                  author: property(attribute: "created_by") {
                    ... on LinkValue {
                      payload {
                        id
                        name: property(attribute: "login") {
                          ... on Value {
                            payload
                          }
                        }
                      }
                    }
                  }
                  createdAt: property(attribute: "created_at") {
                    ... on Value {
                      raw_payload
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
}
    `;

/**
 * __useGetThreadQuery__
 *
 * To run a query within a React component, call `useGetThreadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetThreadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetThreadQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *      recordId: // value for 'recordId'
 *   },
 * });
 */
export function useGetThreadQuery(baseOptions: Apollo.QueryHookOptions<GetThreadQuery, GetThreadQueryVariables> & ({ variables: GetThreadQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetThreadQuery, GetThreadQueryVariables>(GetThreadDocument, options);
      }
export function useGetThreadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetThreadQuery, GetThreadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetThreadQuery, GetThreadQueryVariables>(GetThreadDocument, options);
        }
// @ts-ignore
export function useGetThreadSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetThreadQuery, GetThreadQueryVariables>): Apollo.UseSuspenseQueryResult<GetThreadQuery, GetThreadQueryVariables>;
export function useGetThreadSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetThreadQuery, GetThreadQueryVariables>): Apollo.UseSuspenseQueryResult<GetThreadQuery | undefined, GetThreadQueryVariables>;
export function useGetThreadSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetThreadQuery, GetThreadQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetThreadQuery, GetThreadQueryVariables>(GetThreadDocument, options);
        }
export type GetThreadQueryHookResult = ReturnType<typeof useGetThreadQuery>;
export type GetThreadLazyQueryHookResult = ReturnType<typeof useGetThreadLazyQuery>;
export type GetThreadSuspenseQueryHookResult = ReturnType<typeof useGetThreadSuspenseQuery>;
export type GetThreadQueryResult = Apollo.QueryResult<GetThreadQuery, GetThreadQueryVariables>;
export const CreateViewV2Document = gql`
    mutation CreateViewV2($view: ViewV2CreateInput!) {
  createViewV2(view: $view) {
    ...AppStudioViewSettingsView
  }
}
    ${AppStudioViewSettingsViewFragmentDoc}`;
export type CreateViewV2MutationFn = Apollo.MutationFunction<CreateViewV2Mutation, CreateViewV2MutationVariables>;

/**
 * __useCreateViewV2Mutation__
 *
 * To run a mutation, you first call `useCreateViewV2Mutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateViewV2Mutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createViewV2Mutation, { data, loading, error }] = useCreateViewV2Mutation({
 *   variables: {
 *      view: // value for 'view'
 *   },
 * });
 */
export function useCreateViewV2Mutation(baseOptions?: Apollo.MutationHookOptions<CreateViewV2Mutation, CreateViewV2MutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateViewV2Mutation, CreateViewV2MutationVariables>(CreateViewV2Document, options);
      }
export type CreateViewV2MutationHookResult = ReturnType<typeof useCreateViewV2Mutation>;
export type CreateViewV2MutationResult = Apollo.MutationResult<CreateViewV2Mutation>;
export type CreateViewV2MutationOptions = Apollo.BaseMutationOptions<CreateViewV2Mutation, CreateViewV2MutationVariables>;
export const UpdateViewV2Document = gql`
    mutation UpdateViewV2($view: ViewV2UpdateInput!) {
  updateViewV2(view: $view) {
    ...AppStudioViewSettingsView
  }
}
    ${AppStudioViewSettingsViewFragmentDoc}`;
export type UpdateViewV2MutationFn = Apollo.MutationFunction<UpdateViewV2Mutation, UpdateViewV2MutationVariables>;

/**
 * __useUpdateViewV2Mutation__
 *
 * To run a mutation, you first call `useUpdateViewV2Mutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateViewV2Mutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateViewV2Mutation, { data, loading, error }] = useUpdateViewV2Mutation({
 *   variables: {
 *      view: // value for 'view'
 *   },
 * });
 */
export function useUpdateViewV2Mutation(baseOptions?: Apollo.MutationHookOptions<UpdateViewV2Mutation, UpdateViewV2MutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateViewV2Mutation, UpdateViewV2MutationVariables>(UpdateViewV2Document, options);
      }
export type UpdateViewV2MutationHookResult = ReturnType<typeof useUpdateViewV2Mutation>;
export type UpdateViewV2MutationResult = Apollo.MutationResult<UpdateViewV2Mutation>;
export type UpdateViewV2MutationOptions = Apollo.BaseMutationOptions<UpdateViewV2Mutation, UpdateViewV2MutationVariables>;
export const GetPermissionEditViewOnLibraryDocument = gql`
    query GetPermissionEditViewOnLibrary($libraryId: ID!) {
  libraries(filters: {id: [$libraryId]}) {
    list {
      id
      permissions {
        admin_library
      }
    }
  }
}
    `;

/**
 * __useGetPermissionEditViewOnLibraryQuery__
 *
 * To run a query within a React component, call `useGetPermissionEditViewOnLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPermissionEditViewOnLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPermissionEditViewOnLibraryQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useGetPermissionEditViewOnLibraryQuery(baseOptions: Apollo.QueryHookOptions<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables> & ({ variables: GetPermissionEditViewOnLibraryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables>(GetPermissionEditViewOnLibraryDocument, options);
      }
export function useGetPermissionEditViewOnLibraryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables>(GetPermissionEditViewOnLibraryDocument, options);
        }
// @ts-ignore
export function useGetPermissionEditViewOnLibrarySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables>): Apollo.UseSuspenseQueryResult<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables>;
export function useGetPermissionEditViewOnLibrarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables>): Apollo.UseSuspenseQueryResult<GetPermissionEditViewOnLibraryQuery | undefined, GetPermissionEditViewOnLibraryQueryVariables>;
export function useGetPermissionEditViewOnLibrarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables>(GetPermissionEditViewOnLibraryDocument, options);
        }
export type GetPermissionEditViewOnLibraryQueryHookResult = ReturnType<typeof useGetPermissionEditViewOnLibraryQuery>;
export type GetPermissionEditViewOnLibraryLazyQueryHookResult = ReturnType<typeof useGetPermissionEditViewOnLibraryLazyQuery>;
export type GetPermissionEditViewOnLibrarySuspenseQueryHookResult = ReturnType<typeof useGetPermissionEditViewOnLibrarySuspenseQuery>;
export type GetPermissionEditViewOnLibraryQueryResult = Apollo.QueryResult<GetPermissionEditViewOnLibraryQuery, GetPermissionEditViewOnLibraryQueryVariables>;
export const GetViewV2Document = gql`
    query GetViewV2($viewId: ID!) {
  viewV2(viewId: $viewId) {
    ...AppStudioViewSettingsView
  }
}
    ${AppStudioViewSettingsViewFragmentDoc}`;

/**
 * __useGetViewV2Query__
 *
 * To run a query within a React component, call `useGetViewV2Query` and pass it any options that fit your needs.
 * When your component renders, `useGetViewV2Query` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewV2Query({
 *   variables: {
 *      viewId: // value for 'viewId'
 *   },
 * });
 */
export function useGetViewV2Query(baseOptions: Apollo.QueryHookOptions<GetViewV2Query, GetViewV2QueryVariables> & ({ variables: GetViewV2QueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewV2Query, GetViewV2QueryVariables>(GetViewV2Document, options);
      }
export function useGetViewV2LazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewV2Query, GetViewV2QueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewV2Query, GetViewV2QueryVariables>(GetViewV2Document, options);
        }
// @ts-ignore
export function useGetViewV2SuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetViewV2Query, GetViewV2QueryVariables>): Apollo.UseSuspenseQueryResult<GetViewV2Query, GetViewV2QueryVariables>;
export function useGetViewV2SuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewV2Query, GetViewV2QueryVariables>): Apollo.UseSuspenseQueryResult<GetViewV2Query | undefined, GetViewV2QueryVariables>;
export function useGetViewV2SuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewV2Query, GetViewV2QueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetViewV2Query, GetViewV2QueryVariables>(GetViewV2Document, options);
        }
export type GetViewV2QueryHookResult = ReturnType<typeof useGetViewV2Query>;
export type GetViewV2LazyQueryHookResult = ReturnType<typeof useGetViewV2LazyQuery>;
export type GetViewV2SuspenseQueryHookResult = ReturnType<typeof useGetViewV2SuspenseQuery>;
export type GetViewV2QueryResult = Apollo.QueryResult<GetViewV2Query, GetViewV2QueryVariables>;
export const GetViewListDocument = gql`
    query GetViewList($libraryId: ID!) {
  viewsV2(library: $libraryId) {
    list {
      id
      label
      shared
      created_by {
        id
      }
    }
  }
}
    `;

/**
 * __useGetViewListQuery__
 *
 * To run a query within a React component, call `useGetViewListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewListQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useGetViewListQuery(baseOptions: Apollo.QueryHookOptions<GetViewListQuery, GetViewListQueryVariables> & ({ variables: GetViewListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewListQuery, GetViewListQueryVariables>(GetViewListDocument, options);
      }
export function useGetViewListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewListQuery, GetViewListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewListQuery, GetViewListQueryVariables>(GetViewListDocument, options);
        }
// @ts-ignore
export function useGetViewListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetViewListQuery, GetViewListQueryVariables>): Apollo.UseSuspenseQueryResult<GetViewListQuery, GetViewListQueryVariables>;
export function useGetViewListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewListQuery, GetViewListQueryVariables>): Apollo.UseSuspenseQueryResult<GetViewListQuery | undefined, GetViewListQueryVariables>;
export function useGetViewListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewListQuery, GetViewListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetViewListQuery, GetViewListQueryVariables>(GetViewListDocument, options);
        }
export type GetViewListQueryHookResult = ReturnType<typeof useGetViewListQuery>;
export type GetViewListLazyQueryHookResult = ReturnType<typeof useGetViewListLazyQuery>;
export type GetViewListSuspenseQueryHookResult = ReturnType<typeof useGetViewListSuspenseQuery>;
export type GetViewListQueryResult = Apollo.QueryResult<GetViewListQuery, GetViewListQueryVariables>;
export const GetLibraryNameDocument = gql`
    query GetLibraryName($libraryId: ID!) {
  libraries(filters: {id: [$libraryId]}) {
    list {
      label
    }
  }
}
    `;

/**
 * __useGetLibraryNameQuery__
 *
 * To run a query within a React component, call `useGetLibraryNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLibraryNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLibraryNameQuery({
 *   variables: {
 *      libraryId: // value for 'libraryId'
 *   },
 * });
 */
export function useGetLibraryNameQuery(baseOptions: Apollo.QueryHookOptions<GetLibraryNameQuery, GetLibraryNameQueryVariables> & ({ variables: GetLibraryNameQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLibraryNameQuery, GetLibraryNameQueryVariables>(GetLibraryNameDocument, options);
      }
export function useGetLibraryNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLibraryNameQuery, GetLibraryNameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLibraryNameQuery, GetLibraryNameQueryVariables>(GetLibraryNameDocument, options);
        }
// @ts-ignore
export function useGetLibraryNameSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLibraryNameQuery, GetLibraryNameQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryNameQuery, GetLibraryNameQueryVariables>;
export function useGetLibraryNameSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryNameQuery, GetLibraryNameQueryVariables>): Apollo.UseSuspenseQueryResult<GetLibraryNameQuery | undefined, GetLibraryNameQueryVariables>;
export function useGetLibraryNameSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLibraryNameQuery, GetLibraryNameQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLibraryNameQuery, GetLibraryNameQueryVariables>(GetLibraryNameDocument, options);
        }
export type GetLibraryNameQueryHookResult = ReturnType<typeof useGetLibraryNameQuery>;
export type GetLibraryNameLazyQueryHookResult = ReturnType<typeof useGetLibraryNameLazyQuery>;
export type GetLibraryNameSuspenseQueryHookResult = ReturnType<typeof useGetLibraryNameSuspenseQuery>;
export type GetLibraryNameQueryResult = Apollo.QueryResult<GetLibraryNameQuery, GetLibraryNameQueryVariables>;
export const PanelAttributeCountDocument = gql`
    query panelAttributeCount($library: ID!, $filters: [RecordFilterInput]) {
  records(library: $library, filters: $filters) {
    totalCount
  }
}
    `;

/**
 * __usePanelAttributeCountQuery__
 *
 * To run a query within a React component, call `usePanelAttributeCountQuery` and pass it any options that fit your needs.
 * When your component renders, `usePanelAttributeCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePanelAttributeCountQuery({
 *   variables: {
 *      library: // value for 'library'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function usePanelAttributeCountQuery(baseOptions: Apollo.QueryHookOptions<PanelAttributeCountQuery, PanelAttributeCountQueryVariables> & ({ variables: PanelAttributeCountQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PanelAttributeCountQuery, PanelAttributeCountQueryVariables>(PanelAttributeCountDocument, options);
      }
export function usePanelAttributeCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PanelAttributeCountQuery, PanelAttributeCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PanelAttributeCountQuery, PanelAttributeCountQueryVariables>(PanelAttributeCountDocument, options);
        }
// @ts-ignore
export function usePanelAttributeCountSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<PanelAttributeCountQuery, PanelAttributeCountQueryVariables>): Apollo.UseSuspenseQueryResult<PanelAttributeCountQuery, PanelAttributeCountQueryVariables>;
export function usePanelAttributeCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PanelAttributeCountQuery, PanelAttributeCountQueryVariables>): Apollo.UseSuspenseQueryResult<PanelAttributeCountQuery | undefined, PanelAttributeCountQueryVariables>;
export function usePanelAttributeCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PanelAttributeCountQuery, PanelAttributeCountQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PanelAttributeCountQuery, PanelAttributeCountQueryVariables>(PanelAttributeCountDocument, options);
        }
export type PanelAttributeCountQueryHookResult = ReturnType<typeof usePanelAttributeCountQuery>;
export type PanelAttributeCountLazyQueryHookResult = ReturnType<typeof usePanelAttributeCountLazyQuery>;
export type PanelAttributeCountSuspenseQueryHookResult = ReturnType<typeof usePanelAttributeCountSuspenseQuery>;
export type PanelAttributeCountQueryResult = Apollo.QueryResult<PanelAttributeCountQuery, PanelAttributeCountQueryVariables>;
export const DeleteUserNotificationDocument = gql`
    mutation deleteUserNotification($notificationId: ID!) {
  deleteNotification(notificationId: $notificationId) {
    id
  }
}
    `;
export type DeleteUserNotificationMutationFn = Apollo.MutationFunction<DeleteUserNotificationMutation, DeleteUserNotificationMutationVariables>;

/**
 * __useDeleteUserNotificationMutation__
 *
 * To run a mutation, you first call `useDeleteUserNotificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserNotificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserNotificationMutation, { data, loading, error }] = useDeleteUserNotificationMutation({
 *   variables: {
 *      notificationId: // value for 'notificationId'
 *   },
 * });
 */
export function useDeleteUserNotificationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserNotificationMutation, DeleteUserNotificationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserNotificationMutation, DeleteUserNotificationMutationVariables>(DeleteUserNotificationDocument, options);
      }
export type DeleteUserNotificationMutationHookResult = ReturnType<typeof useDeleteUserNotificationMutation>;
export type DeleteUserNotificationMutationResult = Apollo.MutationResult<DeleteUserNotificationMutation>;
export type DeleteUserNotificationMutationOptions = Apollo.BaseMutationOptions<DeleteUserNotificationMutation, DeleteUserNotificationMutationVariables>;
export const DeleteAllUserNotificationsDocument = gql`
    mutation deleteAllUserNotifications {
  deleteAllNotifications {
    id
  }
}
    `;
export type DeleteAllUserNotificationsMutationFn = Apollo.MutationFunction<DeleteAllUserNotificationsMutation, DeleteAllUserNotificationsMutationVariables>;

/**
 * __useDeleteAllUserNotificationsMutation__
 *
 * To run a mutation, you first call `useDeleteAllUserNotificationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAllUserNotificationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAllUserNotificationsMutation, { data, loading, error }] = useDeleteAllUserNotificationsMutation({
 *   variables: {
 *   },
 * });
 */
export function useDeleteAllUserNotificationsMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAllUserNotificationsMutation, DeleteAllUserNotificationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAllUserNotificationsMutation, DeleteAllUserNotificationsMutationVariables>(DeleteAllUserNotificationsDocument, options);
      }
export type DeleteAllUserNotificationsMutationHookResult = ReturnType<typeof useDeleteAllUserNotificationsMutation>;
export type DeleteAllUserNotificationsMutationResult = Apollo.MutationResult<DeleteAllUserNotificationsMutation>;
export type DeleteAllUserNotificationsMutationOptions = Apollo.BaseMutationOptions<DeleteAllUserNotificationsMutation, DeleteAllUserNotificationsMutationVariables>;
export const GetUserNotificationsDocument = gql`
    query getUserNotifications {
  notifications {
    list {
      id
      date
      level
      message
      title
      attachments {
        label
        url
      }
      relatedEntities {
        label
        url
      }
    }
  }
}
    `;

/**
 * __useGetUserNotificationsQuery__
 *
 * To run a query within a React component, call `useGetUserNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserNotificationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserNotificationsQuery(baseOptions?: Apollo.QueryHookOptions<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>(GetUserNotificationsDocument, options);
      }
export function useGetUserNotificationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>(GetUserNotificationsDocument, options);
        }
// @ts-ignore
export function useGetUserNotificationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>;
export function useGetUserNotificationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserNotificationsQuery | undefined, GetUserNotificationsQueryVariables>;
export function useGetUserNotificationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>(GetUserNotificationsDocument, options);
        }
export type GetUserNotificationsQueryHookResult = ReturnType<typeof useGetUserNotificationsQuery>;
export type GetUserNotificationsLazyQueryHookResult = ReturnType<typeof useGetUserNotificationsLazyQuery>;
export type GetUserNotificationsSuspenseQueryHookResult = ReturnType<typeof useGetUserNotificationsSuspenseQuery>;
export type GetUserNotificationsQueryResult = Apollo.QueryResult<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>;
export const SubscribeToUserNotificationsDocument = gql`
    subscription subscribeToUserNotifications {
  notification {
    id
    date
    level
    message
    title
    attachments {
      label
      url
    }
    relatedEntities {
      label
      url
    }
  }
}
    `;

/**
 * __useSubscribeToUserNotificationsSubscription__
 *
 * To run a query within a React component, call `useSubscribeToUserNotificationsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeToUserNotificationsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeToUserNotificationsSubscription({
 *   variables: {
 *   },
 * });
 */
export function useSubscribeToUserNotificationsSubscription(baseOptions?: Apollo.SubscriptionHookOptions<SubscribeToUserNotificationsSubscription, SubscribeToUserNotificationsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeToUserNotificationsSubscription, SubscribeToUserNotificationsSubscriptionVariables>(SubscribeToUserNotificationsDocument, options);
      }
export type SubscribeToUserNotificationsSubscriptionHookResult = ReturnType<typeof useSubscribeToUserNotificationsSubscription>;
export type SubscribeToUserNotificationsSubscriptionResult = Apollo.SubscriptionResult<SubscribeToUserNotificationsSubscription>;
export const ArchiveUserTasksDocument = gql`
    mutation archiveUserTasks($tasks: [DeleteTaskInput!]!) {
  deleteTasks(tasks: $tasks)
}
    `;
export type ArchiveUserTasksMutationFn = Apollo.MutationFunction<ArchiveUserTasksMutation, ArchiveUserTasksMutationVariables>;

/**
 * __useArchiveUserTasksMutation__
 *
 * To run a mutation, you first call `useArchiveUserTasksMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveUserTasksMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveUserTasksMutation, { data, loading, error }] = useArchiveUserTasksMutation({
 *   variables: {
 *      tasks: // value for 'tasks'
 *   },
 * });
 */
export function useArchiveUserTasksMutation(baseOptions?: Apollo.MutationHookOptions<ArchiveUserTasksMutation, ArchiveUserTasksMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ArchiveUserTasksMutation, ArchiveUserTasksMutationVariables>(ArchiveUserTasksDocument, options);
      }
export type ArchiveUserTasksMutationHookResult = ReturnType<typeof useArchiveUserTasksMutation>;
export type ArchiveUserTasksMutationResult = Apollo.MutationResult<ArchiveUserTasksMutation>;
export type ArchiveUserTasksMutationOptions = Apollo.BaseMutationOptions<ArchiveUserTasksMutation, ArchiveUserTasksMutationVariables>;
export const GetUserTasksDocument = gql`
    query getUserTasks($filters: TaskFiltersInput) {
  tasks(filters: $filters) {
    list {
      id
      status
      label
      created_at
      startedAt
      completedAt
      progress {
        description
        percent
      }
      link {
        url
      }
    }
  }
}
    `;

/**
 * __useGetUserTasksQuery__
 *
 * To run a query within a React component, call `useGetUserTasksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserTasksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserTasksQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetUserTasksQuery(baseOptions?: Apollo.QueryHookOptions<GetUserTasksQuery, GetUserTasksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserTasksQuery, GetUserTasksQueryVariables>(GetUserTasksDocument, options);
      }
export function useGetUserTasksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserTasksQuery, GetUserTasksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserTasksQuery, GetUserTasksQueryVariables>(GetUserTasksDocument, options);
        }
// @ts-ignore
export function useGetUserTasksSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUserTasksQuery, GetUserTasksQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserTasksQuery, GetUserTasksQueryVariables>;
export function useGetUserTasksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserTasksQuery, GetUserTasksQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserTasksQuery | undefined, GetUserTasksQueryVariables>;
export function useGetUserTasksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserTasksQuery, GetUserTasksQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserTasksQuery, GetUserTasksQueryVariables>(GetUserTasksDocument, options);
        }
export type GetUserTasksQueryHookResult = ReturnType<typeof useGetUserTasksQuery>;
export type GetUserTasksLazyQueryHookResult = ReturnType<typeof useGetUserTasksLazyQuery>;
export type GetUserTasksSuspenseQueryHookResult = ReturnType<typeof useGetUserTasksSuspenseQuery>;
export type GetUserTasksQueryResult = Apollo.QueryResult<GetUserTasksQuery, GetUserTasksQueryVariables>;
export const SubscribeToUserTasksDocument = gql`
    subscription subscribeToUserTasks($filters: TaskFiltersInput) {
  task(filters: $filters) {
    id
    status
    label
    created_at
    startedAt
    completedAt
    progress {
      description
      percent
    }
    link {
      url
    }
  }
}
    `;

/**
 * __useSubscribeToUserTasksSubscription__
 *
 * To run a query within a React component, call `useSubscribeToUserTasksSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeToUserTasksSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeToUserTasksSubscription({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useSubscribeToUserTasksSubscription(baseOptions?: Apollo.SubscriptionHookOptions<SubscribeToUserTasksSubscription, SubscribeToUserTasksSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeToUserTasksSubscription, SubscribeToUserTasksSubscriptionVariables>(SubscribeToUserTasksDocument, options);
      }
export type SubscribeToUserTasksSubscriptionHookResult = ReturnType<typeof useSubscribeToUserTasksSubscription>;
export type SubscribeToUserTasksSubscriptionResult = Apollo.SubscriptionResult<SubscribeToUserTasksSubscription>;