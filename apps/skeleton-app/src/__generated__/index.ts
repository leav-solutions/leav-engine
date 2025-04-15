// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
  Preview: any;
  SystemTranslation: any;
  SystemTranslationOptional: any;
  TaskPriority: any;
  Upload: any;
};

export type Action = {
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  input_types: Array<ActionIoTypes>;
  name: Scalars['String'];
  output_types: Array<ActionIoTypes>;
  params?: Maybe<Array<ActionParam>>;
};

export type ActionConfiguration = {
  error_message?: Maybe<Scalars['SystemTranslationOptional']>;
  id: Scalars['ID'];
  is_system: Scalars['Boolean'];
  name: Scalars['String'];
  params?: Maybe<Array<ActionConfigurationParam>>;
};

export type ActionConfigurationInput = {
  error_message?: InputMaybe<Scalars['SystemTranslationOptional']>;
  id: Scalars['ID'];
  params?: InputMaybe<Array<ActionConfigurationParamInput>>;
};

export type ActionConfigurationParam = {
  name: Scalars['String'];
  value: Scalars['String'];
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

export type ActionListIoTypes = {
  deleteValue: Array<IoTypes>;
  getValue: Array<IoTypes>;
  saveValue: Array<IoTypes>;
};

export type ActionParam = {
  description?: Maybe<Scalars['String']>;
  helper_value?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  required?: Maybe<Scalars['Boolean']>;
  type: Scalars['String'];
};

export type ActionsListConfiguration = {
  deleteValue?: Maybe<Array<ActionConfiguration>>;
  getValue?: Maybe<Array<ActionConfiguration>>;
  saveValue?: Maybe<Array<ActionConfiguration>>;
};

export type ActionsListConfigurationInput = {
  deleteValue?: InputMaybe<Array<ActionConfigurationInput>>;
  getValue?: InputMaybe<Array<ActionConfigurationInput>>;
  saveValue?: InputMaybe<Array<ActionConfigurationInput>>;
};

export type ApiKey = {
  createdAt: Scalars['Int'];
  createdBy: Record;
  expiresAt?: Maybe<Scalars['Int']>;
  id: Scalars['String'];
  key?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  modifiedAt: Scalars['Int'];
  modifiedBy: Record;
  user: Record;
};

export type ApiKeyInput = {
  expiresAt?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  label: Scalars['String'];
  userId: Scalars['String'];
};

export type ApiKeyList = {
  list: Array<ApiKey>;
  totalCount: Scalars['Int'];
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

export type Application = {
  color?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['SystemTranslation']>;
  endpoint?: Maybe<Scalars['String']>;
  icon?: Maybe<Record>;
  id: Scalars['ID'];
  label: Scalars['SystemTranslation'];
  module?: Maybe<Scalars['String']>;
  permissions: ApplicationPermissions;
  settings?: Maybe<Scalars['JSONObject']>;
  system: Scalars['Boolean'];
  type: ApplicationType;
  url?: Maybe<Scalars['String']>;
};


export type ApplicationLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export type ApplicationEvent = {
  application: Application;
  type: ApplicationEventTypes;
};

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

export type ApplicationModule = {
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  version?: Maybe<Scalars['String']>;
};

export type ApplicationPermissions = {
  access_application: Scalars['Boolean'];
  admin_application: Scalars['Boolean'];
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

export type ApplicationsList = {
  list: Array<Application>;
  totalCount: Scalars['Int'];
};

export type Attribute = {
  actions_list?: Maybe<ActionsListConfiguration>;
  compute: Scalars['Boolean'];
  description?: Maybe<Scalars['SystemTranslationOptional']>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID'];
  input_types: ActionListIoTypes;
  label?: Maybe<Scalars['SystemTranslation']>;
  libraries?: Maybe<Array<Library>>;
  metadata_fields?: Maybe<Array<StandardAttribute>>;
  multiple_values: Scalars['Boolean'];
  output_types: ActionListIoTypes;
  permissions: AttributePermissions;
  permissions_conf?: Maybe<TreepermissionsConf>;
  readonly: Scalars['Boolean'];
  required: Scalars['Boolean'];
  settings?: Maybe<Scalars['JSONObject']>;
  system: Scalars['Boolean'];
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
  multiple_values?: InputMaybe<Scalars['Boolean']>;
  permissions_conf?: InputMaybe<TreepermissionsConfInput>;
  readonly?: InputMaybe<Scalars['Boolean']>;
  required?: InputMaybe<Scalars['Boolean']>;
  reverse_link?: InputMaybe<Scalars['String']>;
  settings?: InputMaybe<Scalars['JSONObject']>;
  type?: InputMaybe<AttributeType>;
  unique?: InputMaybe<Scalars['Boolean']>;
  values_list?: InputMaybe<ValuesListConfInput>;
  versions_conf?: InputMaybe<ValuesVersionsConfInput>;
};

export type AttributePermissions = {
  access_attribute: Scalars['Boolean'];
  edit_value: Scalars['Boolean'];
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

export type AttributesList = {
  list: Array<Attribute>;
  totalCount: Scalars['Int'];
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

export type CreateRecordResult = {
  record?: Maybe<Record>;
  valuesErrors?: Maybe<Array<ValueBatchError>>;
};

export type DateRangeValue = {
  from?: Maybe<Scalars['String']>;
  to?: Maybe<Scalars['String']>;
};

export type DeleteTaskInput = {
  archive: Scalars['Boolean'];
  id: Scalars['ID'];
};

export type EmbeddedAttribute = {
  description?: Maybe<Scalars['SystemTranslationOptional']>;
  embedded_fields?: Maybe<Array<Maybe<EmbeddedAttribute>>>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID'];
  label?: Maybe<Scalars['SystemTranslation']>;
  validation_regex?: Maybe<Scalars['String']>;
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

export type Form = {
  dependencyAttributes?: Maybe<Array<Attribute>>;
  elements: Array<FormElementsByDeps>;
  id: Scalars['ID'];
  label?: Maybe<Scalars['SystemTranslation']>;
  library: Library;
  system: Scalars['Boolean'];
};


export type FormLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export type FormDependencyValue = {
  attribute: Scalars['ID'];
  value: Scalars['ID'];
};

export type FormDependencyValueInput = {
  attribute: Scalars['ID'];
  value: Scalars['ID'];
};

export type FormElement = {
  attribute?: Maybe<Attribute>;
  containerId: Scalars['ID'];
  id: Scalars['ID'];
  order: Scalars['Int'];
  settings: Array<FormElementSettings>;
  type: FormElementTypes;
  uiElementType: Scalars['String'];
};

export type FormElementInput = {
  containerId: Scalars['ID'];
  id: Scalars['ID'];
  order: Scalars['Int'];
  settings: Array<FormElementSettingsInput>;
  type: FormElementTypes;
  uiElementType: Scalars['String'];
};

export type FormElementSettings = {
  key: Scalars['String'];
  value: Scalars['Any'];
};

export type FormElementSettingsInput = {
  key: Scalars['String'];
  value: Scalars['Any'];
};

export enum FormElementTypes {
  field = 'field',
  layout = 'layout'
}

export type FormElementWithValues = {
  attribute?: Maybe<Attribute>;
  containerId: Scalars['ID'];
  id: Scalars['ID'];
  order: Scalars['Int'];
  settings: Array<FormElementSettings>;
  type: FormElementTypes;
  uiElementType: Scalars['String'];
  valueError?: Maybe<Scalars['String']>;
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

export type FormsList = {
  list: Array<Form>;
  totalCount: Scalars['Int'];
};

export enum FormsSortableFields {
  id = 'id',
  library = 'library',
  system = 'system'
}

export type GenericValue = {
  attribute: Attribute;
  created_at?: Maybe<Scalars['Int']>;
  created_by?: Maybe<Record>;
  id_value?: Maybe<Scalars['ID']>;
  isCalculated?: Maybe<Scalars['Boolean']>;
  isInherited?: Maybe<Scalars['Boolean']>;
  metadata?: Maybe<Array<Maybe<ValueMetadata>>>;
  modified_at?: Maybe<Scalars['Int']>;
  modified_by?: Maybe<Record>;
  version?: Maybe<Array<Maybe<ValueVersion>>>;
};

export type GlobalSettings = {
  defaultApp: Scalars['String'];
  favicon?: Maybe<Record>;
  icon?: Maybe<Record>;
  name: Scalars['String'];
};

export type GlobalSettingsFileInput = {
  library: Scalars['String'];
  recordId: Scalars['String'];
};

export type GlobalSettingsInput = {
  defaultApp?: InputMaybe<Scalars['String']>;
  favicon?: InputMaybe<GlobalSettingsFileInput>;
  icon?: InputMaybe<GlobalSettingsFileInput>;
  name?: InputMaybe<Scalars['String']>;
};

export type HeritedPermissionAction = {
  allowed: Scalars['Boolean'];
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
  label?: Maybe<Scalars['SystemTranslation']>;
  name: PermissionsActions;
};

export type LibrariesFiltersInput = {
  behavior?: InputMaybe<Array<LibraryBehavior>>;
  id?: InputMaybe<Array<Scalars['ID']>>;
  label?: InputMaybe<Array<Scalars['String']>>;
  system?: InputMaybe<Scalars['Boolean']>;
};

export type LibrariesList = {
  list: Array<Library>;
  totalCount: Scalars['Int'];
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
  fullTextAttributes?: Maybe<Array<Attribute>>;
  icon?: Maybe<Record>;
  id: Scalars['ID'];
  label?: Maybe<Scalars['SystemTranslation']>;
  linkedTrees?: Maybe<Array<Tree>>;
  permissions?: Maybe<LibraryPermissions>;
  permissions_conf?: Maybe<TreepermissionsConf>;
  previewsSettings?: Maybe<Array<LibraryPreviewsSettings>>;
  recordIdentityConf?: Maybe<RecordIdentityConf>;
  settings?: Maybe<Scalars['JSONObject']>;
  system?: Maybe<Scalars['Boolean']>;
};


export type LibraryLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export enum LibraryBehavior {
  directories = 'directories',
  files = 'files',
  standard = 'standard'
}

export type LibraryGraphqlNames = {
  filter: Scalars['String'];
  list: Scalars['String'];
  query: Scalars['String'];
  searchableFields: Scalars['String'];
  type: Scalars['String'];
};

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
  settings?: InputMaybe<Scalars['JSONObject']>;
};

export type LibraryPermissions = {
  access_library: Scalars['Boolean'];
  access_record: Scalars['Boolean'];
  admin_library: Scalars['Boolean'];
  create_record: Scalars['Boolean'];
  delete_record: Scalars['Boolean'];
  edit_record: Scalars['Boolean'];
};

export type LibraryPreviewsSettings = {
  description?: Maybe<Scalars['SystemTranslation']>;
  label: Scalars['SystemTranslation'];
  system: Scalars['Boolean'];
  versions: PreviewVersion;
};

export type LibraryPreviewsSettingsInput = {
  description?: InputMaybe<Scalars['SystemTranslationOptional']>;
  label: Scalars['SystemTranslation'];
  versions: PreviewVersionInput;
};

export type LinkAttribute = Attribute & {
  actions_list?: Maybe<ActionsListConfiguration>;
  compute: Scalars['Boolean'];
  description?: Maybe<Scalars['SystemTranslationOptional']>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID'];
  input_types: ActionListIoTypes;
  label?: Maybe<Scalars['SystemTranslation']>;
  libraries?: Maybe<Array<Library>>;
  linked_library?: Maybe<Library>;
  metadata_fields?: Maybe<Array<StandardAttribute>>;
  multiple_values: Scalars['Boolean'];
  output_types: ActionListIoTypes;
  permissions: AttributePermissions;
  permissions_conf?: Maybe<TreepermissionsConf>;
  readonly: Scalars['Boolean'];
  required: Scalars['Boolean'];
  reverse_link?: Maybe<Scalars['String']>;
  settings?: Maybe<Scalars['JSONObject']>;
  system: Scalars['Boolean'];
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

export type LinkValue = GenericValue & {
  attribute: Attribute;
  created_at?: Maybe<Scalars['Int']>;
  created_by?: Maybe<Record>;
  id_value?: Maybe<Scalars['ID']>;
  isCalculated?: Maybe<Scalars['Boolean']>;
  isInherited?: Maybe<Scalars['Boolean']>;
  metadata?: Maybe<Array<Maybe<ValueMetadata>>>;
  modified_at?: Maybe<Scalars['Int']>;
  modified_by?: Maybe<Record>;
  payload?: Maybe<Record>;
  /** @deprecated Use payload instead */
  value?: Maybe<Record>;
  version?: Maybe<Array<Maybe<ValueVersion>>>;
};

export type LinkValuesListConf = {
  allowFreeEntry?: Maybe<Scalars['Boolean']>;
  allowListUpdate?: Maybe<Scalars['Boolean']>;
  enable: Scalars['Boolean'];
  values?: Maybe<Array<Record>>;
};

export type Log = {
  action?: Maybe<LogAction>;
  after?: Maybe<Scalars['Any']>;
  before?: Maybe<Scalars['Any']>;
  instanceId: Scalars['String'];
  metadata?: Maybe<Scalars['Any']>;
  queryId: Scalars['String'];
  time: Scalars['Int'];
  topic?: Maybe<LogTopic>;
  trigger?: Maybe<Scalars['String']>;
  user: Record;
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

export type LogTopic = {
  apiKey?: Maybe<Scalars['String']>;
  application?: Maybe<Application>;
  attribute?: Maybe<Attribute>;
  filename?: Maybe<Scalars['String']>;
  library?: Maybe<Library>;
  permission?: Maybe<PermissionTopic>;
  profile?: Maybe<VersionProfile>;
  record?: Maybe<Record>;
  tree?: Maybe<Tree>;
};

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

export type Mutation = {
  cancelTask: Scalars['Boolean'];
  createDirectory: Record;
  createRecord: CreateRecordResult;
  deactivateRecords: Array<Record>;
  deleteApiKey: ApiKey;
  deleteApplication: Application;
  deleteAttribute: Attribute;
  deleteForm?: Maybe<Form>;
  deleteLibrary: Library;
  deleteRecord: Record;
  deleteTasks: Scalars['Boolean'];
  deleteTree: Tree;
  deleteValue: Array<GenericValue>;
  deleteVersionProfile: VersionProfile;
  deleteView: View;
  forcePreviewsGeneration: Scalars['Boolean'];
  importConfig: Scalars['ID'];
  importData: Scalars['ID'];
  importExcel: Scalars['ID'];
  indexRecords: Scalars['Boolean'];
  purgeInactiveRecords: Array<Record>;
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
  saveValueBatch: SaveValueBatchResult;
  saveVersionProfile: VersionProfile;
  saveView: View;
  treeAddElement: TreeNode;
  treeDeleteElement: Scalars['ID'];
  treeMoveElement: TreeNode;
  updateView: View;
  upload: Array<UploadData>;
};


export type MutationCancelTaskArgs = {
  taskId: Scalars['ID'];
};


export type MutationCreateDirectoryArgs = {
  library: Scalars['String'];
  name: Scalars['String'];
  nodeId: Scalars['String'];
};


export type MutationCreateRecordArgs = {
  data?: InputMaybe<CreateRecordDataInput>;
  library: Scalars['ID'];
};


export type MutationDeactivateRecordsArgs = {
  filters?: InputMaybe<Array<RecordFilterInput>>;
  libraryId: Scalars['String'];
  recordsIds?: InputMaybe<Array<Scalars['String']>>;
};


export type MutationDeleteApiKeyArgs = {
  id: Scalars['String'];
};


export type MutationDeleteApplicationArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteAttributeArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteFormArgs = {
  id: Scalars['ID'];
  library: Scalars['ID'];
};


export type MutationDeleteLibraryArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteRecordArgs = {
  id?: InputMaybe<Scalars['ID']>;
  library?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteTasksArgs = {
  tasks: Array<DeleteTaskInput>;
};


export type MutationDeleteTreeArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteValueArgs = {
  attribute: Scalars['ID'];
  library: Scalars['ID'];
  recordId: Scalars['ID'];
  value?: InputMaybe<ValueInput>;
};


export type MutationDeleteVersionProfileArgs = {
  id: Scalars['String'];
};


export type MutationDeleteViewArgs = {
  viewId: Scalars['String'];
};


export type MutationForcePreviewsGenerationArgs = {
  failedOnly?: InputMaybe<Scalars['Boolean']>;
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>>>;
  libraryId: Scalars['ID'];
  previewVersionSizeNames?: InputMaybe<Array<Scalars['String']>>;
  recordIds?: InputMaybe<Array<Scalars['ID']>>;
};


export type MutationImportConfigArgs = {
  clear?: InputMaybe<Scalars['Boolean']>;
  file: Scalars['Upload'];
};


export type MutationImportDataArgs = {
  file: Scalars['Upload'];
  startAt?: InputMaybe<Scalars['Int']>;
};


export type MutationImportExcelArgs = {
  file: Scalars['Upload'];
  sheets?: InputMaybe<Array<InputMaybe<SheetInput>>>;
  startAt?: InputMaybe<Scalars['Int']>;
};


export type MutationIndexRecordsArgs = {
  libraryId: Scalars['String'];
  records?: InputMaybe<Array<Scalars['String']>>;
};


export type MutationPurgeInactiveRecordsArgs = {
  libraryId: Scalars['String'];
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
  global: Scalars['Boolean'];
  key: Scalars['String'];
  value?: InputMaybe<Scalars['Any']>;
};


export type MutationSaveValueArgs = {
  attribute?: InputMaybe<Scalars['ID']>;
  library?: InputMaybe<Scalars['ID']>;
  recordId?: InputMaybe<Scalars['ID']>;
  value?: InputMaybe<ValueInput>;
};


export type MutationSaveValueBatchArgs = {
  deleteEmpty?: InputMaybe<Scalars['Boolean']>;
  library?: InputMaybe<Scalars['ID']>;
  recordId?: InputMaybe<Scalars['ID']>;
  values?: InputMaybe<Array<InputMaybe<ValueBatchInput>>>;
  version?: InputMaybe<Array<InputMaybe<ValueVersionInput>>>;
};


export type MutationSaveVersionProfileArgs = {
  versionProfile: VersionProfileInput;
};


export type MutationSaveViewArgs = {
  view: ViewInput;
};


export type MutationTreeAddElementArgs = {
  element: TreeElementInput;
  order?: InputMaybe<Scalars['Int']>;
  parent?: InputMaybe<Scalars['ID']>;
  treeId: Scalars['ID'];
};


export type MutationTreeDeleteElementArgs = {
  deleteChildren?: InputMaybe<Scalars['Boolean']>;
  nodeId: Scalars['ID'];
  treeId: Scalars['ID'];
};


export type MutationTreeMoveElementArgs = {
  nodeId: Scalars['ID'];
  order?: InputMaybe<Scalars['Int']>;
  parentTo?: InputMaybe<Scalars['ID']>;
  treeId: Scalars['ID'];
};


export type MutationUpdateViewArgs = {
  view: ViewInputPartial;
};


export type MutationUploadArgs = {
  files: Array<FileInput>;
  library: Scalars['String'];
  nodeId: Scalars['String'];
};

export type Pagination = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
};

export type Permission = {
  actions: Array<PermissionAction>;
  applyTo?: Maybe<Scalars['ID']>;
  permissionTreeTarget?: Maybe<PermissionsTreeTarget>;
  type: PermissionTypes;
  usersGroup?: Maybe<Scalars['ID']>;
};

export type PermissionAction = {
  allowed?: Maybe<Scalars['Boolean']>;
  name: PermissionsActions;
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

export type PermissionTopic = {
  applyTo?: Maybe<Scalars['Any']>;
  type: Scalars['String'];
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

export type PermissionsTreeTarget = {
  nodeId?: Maybe<Scalars['ID']>;
  tree: Scalars['ID'];
};

export type PermissionsTreeTargetInput = {
  nodeId?: InputMaybe<Scalars['ID']>;
  tree: Scalars['ID'];
};

export type Plugin = {
  author?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  version?: Maybe<Scalars['String']>;
};

export type PreviewVersion = {
  background: Scalars['String'];
  density: Scalars['Int'];
  sizes: Array<PreviewVersionSize>;
};

export type PreviewVersionInput = {
  background: Scalars['String'];
  density: Scalars['Int'];
  sizes: Array<PreviewVersionSizeInput>;
};

export type PreviewVersionSize = {
  name: Scalars['String'];
  size: Scalars['Int'];
};

export type PreviewVersionSizeInput = {
  name: Scalars['String'];
  size: Scalars['Int'];
};

export type Progress = {
  description?: Maybe<Scalars['SystemTranslation']>;
  percent?: Maybe<Scalars['Int']>;
};

export type Query = {
  apiKeys: ApiKeyList;
  applications?: Maybe<ApplicationsList>;
  applicationsModules: Array<ApplicationModule>;
  attributes?: Maybe<AttributesList>;
  availableActions?: Maybe<Array<Action>>;
  doesFileExistAsChild?: Maybe<Scalars['Boolean']>;
  export: Scalars['String'];
  forms?: Maybe<FormsList>;
  fullTreeContent?: Maybe<Scalars['FullTreeContent']>;
  getRecordByNodeId: Record;
  globalSettings: GlobalSettings;
  inheritedPermissions?: Maybe<Array<HeritedPermissionAction>>;
  isAllowed?: Maybe<Array<PermissionAction>>;
  langs: Array<Maybe<Scalars['String']>>;
  libraries?: Maybe<LibrariesList>;
  logs?: Maybe<Array<Log>>;
  me?: Maybe<Record>;
  permissions?: Maybe<Array<PermissionAction>>;
  permissionsActionsByType: Array<LabeledPermissionsActions>;
  plugins: Array<Plugin>;
  recordForm?: Maybe<RecordForm>;
  records: RecordsList;
  runActionsListAndFormatOnValue: Array<Value>;
  tasks: TasksList;
  treeContent: Array<TreeNode>;
  treeNodeChildren: TreeNodeLightList;
  trees?: Maybe<TreesList>;
  userData: UserData;
  version: Scalars['String'];
  versionProfiles: VersionProfileList;
  view: View;
  views: ViewsList;
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


export type QueryDoesFileExistAsChildArgs = {
  filename: Scalars['String'];
  parentNode?: InputMaybe<Scalars['ID']>;
  treeId: Scalars['ID'];
};


export type QueryExportArgs = {
  attributes?: InputMaybe<Array<Scalars['ID']>>;
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>>>;
  library: Scalars['ID'];
  startAt?: InputMaybe<Scalars['Int']>;
};


export type QueryFormsArgs = {
  filters: FormFiltersInput;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortForms>;
};


export type QueryFullTreeContentArgs = {
  treeId: Scalars['ID'];
};


export type QueryGetRecordByNodeIdArgs = {
  nodeId: Scalars['ID'];
  treeId: Scalars['ID'];
};


export type QueryInheritedPermissionsArgs = {
  actions: Array<PermissionsActions>;
  applyTo?: InputMaybe<Scalars['ID']>;
  permissionTreeTarget?: InputMaybe<PermissionsTreeTargetInput>;
  type: PermissionTypes;
  userGroupNodeId?: InputMaybe<Scalars['ID']>;
};


export type QueryIsAllowedArgs = {
  actions: Array<PermissionsActions>;
  applyTo?: InputMaybe<Scalars['ID']>;
  target?: InputMaybe<PermissionTarget>;
  type: PermissionTypes;
};


export type QueryLibrariesArgs = {
  filters?: InputMaybe<LibrariesFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortLibraries>;
  strictFilters?: InputMaybe<Scalars['Boolean']>;
};


export type QueryLogsArgs = {
  filters?: InputMaybe<LogFilterInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<LogSortInput>;
};


export type QueryPermissionsArgs = {
  actions: Array<PermissionsActions>;
  applyTo?: InputMaybe<Scalars['ID']>;
  permissionTreeTarget?: InputMaybe<PermissionsTreeTargetInput>;
  type: PermissionTypes;
  usersGroup?: InputMaybe<Scalars['ID']>;
};


export type QueryPermissionsActionsByTypeArgs = {
  applyOn?: InputMaybe<Scalars['String']>;
  type: PermissionTypes;
};


export type QueryRecordFormArgs = {
  formId: Scalars['String'];
  libraryId: Scalars['String'];
  recordId?: InputMaybe<Scalars['String']>;
  version?: InputMaybe<Array<ValueVersionInput>>;
};


export type QueryRecordsArgs = {
  filters?: InputMaybe<Array<InputMaybe<RecordFilterInput>>>;
  library: Scalars['ID'];
  multipleSort?: InputMaybe<Array<RecordSortInput>>;
  pagination?: InputMaybe<RecordsPagination>;
  retrieveInactive?: InputMaybe<Scalars['Boolean']>;
  searchQuery?: InputMaybe<Scalars['String']>;
  version?: InputMaybe<Array<InputMaybe<ValueVersionInput>>>;
};


export type QueryRunActionsListAndFormatOnValueArgs = {
  library?: InputMaybe<Scalars['ID']>;
  value?: InputMaybe<ValueBatchInput>;
  version?: InputMaybe<Array<InputMaybe<ValueVersionInput>>>;
};


export type QueryTasksArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<RecordSortInput>;
};


export type QueryTreeContentArgs = {
  startAt?: InputMaybe<Scalars['ID']>;
  treeId: Scalars['ID'];
};


export type QueryTreeNodeChildrenArgs = {
  node?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
  treeId: Scalars['ID'];
};


export type QueryTreesArgs = {
  filters?: InputMaybe<TreesFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortTrees>;
};


export type QueryUserDataArgs = {
  global?: InputMaybe<Scalars['Boolean']>;
  keys: Array<Scalars['String']>;
};


export type QueryVersionProfilesArgs = {
  filters?: InputMaybe<VersionProfilesFiltersInput>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<SortVersionProfilesInput>;
};


export type QueryViewArgs = {
  viewId: Scalars['String'];
};


export type QueryViewsArgs = {
  library: Scalars['String'];
};

export type Record = {
  id: Scalars['ID'];
  library: Library;
  permissions: RecordPermissions;
  properties: Array<RecordProperty>;
  property: Array<GenericValue>;
  whoAmI: RecordIdentity;
};


export type RecordPropertiesArgs = {
  attributeIds: Array<Scalars['ID']>;
};


export type RecordPropertyArgs = {
  attribute: Scalars['ID'];
};

export type RecordFilter = {
  condition?: Maybe<RecordFilterCondition>;
  field?: Maybe<Scalars['String']>;
  operator?: Maybe<RecordFilterOperator>;
  tree?: Maybe<Tree>;
  value?: Maybe<Scalars['String']>;
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

export type RecordForm = {
  dependencyAttributes?: Maybe<Array<Attribute>>;
  elements: Array<FormElementWithValues>;
  id: Scalars['ID'];
  label?: Maybe<Scalars['SystemTranslation']>;
  library: Library;
  recordId?: Maybe<Scalars['ID']>;
  system: Scalars['Boolean'];
};


export type RecordFormLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export type RecordIdentity = {
  color?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  label?: Maybe<Scalars['String']>;
  library: Library;
  preview?: Maybe<Scalars['Preview']>;
  subLabel?: Maybe<Scalars['String']>;
};

export type RecordIdentityConf = {
  color?: Maybe<Scalars['ID']>;
  label?: Maybe<Scalars['ID']>;
  preview?: Maybe<Scalars['ID']>;
  subLabel?: Maybe<Scalars['ID']>;
  treeColorPreview?: Maybe<Scalars['ID']>;
};

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

export type RecordPermissions = {
  access_record: Scalars['Boolean'];
  create_record: Scalars['Boolean'];
  delete_record: Scalars['Boolean'];
  edit_record: Scalars['Boolean'];
};

export type RecordProperty = {
  attributeId: Scalars['ID'];
  attributeProperties: Attribute;
  values: Array<GenericValue>;
};

export type RecordSort = {
  field: Scalars['String'];
  order: SortOrder;
};

export type RecordSortInput = {
  field: Scalars['String'];
  order: SortOrder;
};

export type RecordUpdateEvent = {
  record: Record;
  updatedValues: Array<RecordUpdatedValues>;
};

export type RecordUpdateFilterInput = {
  ignoreOwnEvents?: InputMaybe<Scalars['Boolean']>;
  libraries?: InputMaybe<Array<Scalars['ID']>>;
  records?: InputMaybe<Array<Scalars['ID']>>;
};

export type RecordUpdatedValues = {
  attribute: Scalars['String'];
  value: GenericValue;
};

export type RecordsList = {
  cursor?: Maybe<RecordsListCursor>;
  list: Array<Record>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type RecordsListCursor = {
  next?: Maybe<Scalars['String']>;
  prev?: Maybe<Scalars['String']>;
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

export type StandardAttribute = Attribute & {
  actions_list?: Maybe<ActionsListConfiguration>;
  character_limit?: Maybe<Scalars['Int']>;
  compute: Scalars['Boolean'];
  description?: Maybe<Scalars['SystemTranslationOptional']>;
  embedded_fields?: Maybe<Array<Maybe<EmbeddedAttribute>>>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID'];
  input_types: ActionListIoTypes;
  label?: Maybe<Scalars['SystemTranslation']>;
  libraries?: Maybe<Array<Library>>;
  metadata_fields?: Maybe<Array<StandardAttribute>>;
  multiple_values: Scalars['Boolean'];
  output_types: ActionListIoTypes;
  permissions: AttributePermissions;
  permissions_conf?: Maybe<TreepermissionsConf>;
  readonly: Scalars['Boolean'];
  required: Scalars['Boolean'];
  settings?: Maybe<Scalars['JSONObject']>;
  system: Scalars['Boolean'];
  type: AttributeType;
  unique?: Maybe<Scalars['Boolean']>;
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
  allowFreeEntry?: Maybe<Scalars['Boolean']>;
  allowListUpdate?: Maybe<Scalars['Boolean']>;
  enable: Scalars['Boolean'];
  values?: Maybe<Array<DateRangeValue>>;
};

export type StandardStringValuesListConf = {
  allowFreeEntry?: Maybe<Scalars['Boolean']>;
  allowListUpdate?: Maybe<Scalars['Boolean']>;
  enable: Scalars['Boolean'];
  values?: Maybe<Array<Scalars['String']>>;
};

export type StandardValuesListConf = StandardDateRangeValuesListConf | StandardStringValuesListConf;

export type StreamProgress = {
  delta?: Maybe<Scalars['Int']>;
  eta?: Maybe<Scalars['Int']>;
  length?: Maybe<Scalars['Int']>;
  percentage?: Maybe<Scalars['Int']>;
  remaining?: Maybe<Scalars['Int']>;
  runtime?: Maybe<Scalars['Int']>;
  speed?: Maybe<Scalars['Int']>;
  transferred?: Maybe<Scalars['Int']>;
};

export type Subscription = {
  applicationEvent: ApplicationEvent;
  recordUpdate: RecordUpdateEvent;
  task: Task;
  treeEvent: TreeEvent;
  upload: UploadProgress;
};


export type SubscriptionApplicationEventArgs = {
  filters?: InputMaybe<ApplicationEventFiltersInput>;
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
  archive: Scalars['Boolean'];
  canceledBy?: Maybe<Record>;
  completedAt?: Maybe<Scalars['Int']>;
  created_at: Scalars['Int'];
  created_by: Record;
  id: Scalars['ID'];
  label: Scalars['SystemTranslation'];
  link?: Maybe<TaskLink>;
  modified_at: Scalars['Int'];
  priority: Scalars['TaskPriority'];
  progress?: Maybe<Progress>;
  role?: Maybe<TaskRole>;
  startAt: Scalars['Int'];
  startedAt?: Maybe<Scalars['Int']>;
  status: TaskStatus;
};

export type TaskFiltersInput = {
  archive?: InputMaybe<Scalars['Boolean']>;
  created_by?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  status?: InputMaybe<TaskStatus>;
  type?: InputMaybe<TaskType>;
};

export type TaskLink = {
  name: Scalars['String'];
  url: Scalars['String'];
};

export type TaskRole = {
  detail?: Maybe<Scalars['String']>;
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
  IMPORT_CONFIG = 'IMPORT_CONFIG',
  IMPORT_DATA = 'IMPORT_DATA',
  INDEXATION = 'INDEXATION'
}

export type TasksList = {
  list: Array<Task>;
  totalCount: Scalars['Int'];
};

export type Tree = {
  behavior: TreeBehavior;
  defaultElement?: Maybe<TreeNode>;
  id: Scalars['ID'];
  label?: Maybe<Scalars['SystemTranslation']>;
  libraries: Array<TreeLibrary>;
  permissions: TreePermissions;
  permissions_conf?: Maybe<Array<TreeNodePermissionsConf>>;
  settings?: Maybe<Scalars['JSONObject']>;
  system: Scalars['Boolean'];
};


export type TreeLabelArgs = {
  lang?: InputMaybe<Array<AvailableLanguage>>;
};

export type TreeAttribute = Attribute & {
  actions_list?: Maybe<ActionsListConfiguration>;
  compute: Scalars['Boolean'];
  description?: Maybe<Scalars['SystemTranslationOptional']>;
  format?: Maybe<AttributeFormat>;
  id: Scalars['ID'];
  input_types: ActionListIoTypes;
  label?: Maybe<Scalars['SystemTranslation']>;
  libraries?: Maybe<Array<Library>>;
  linked_tree?: Maybe<Tree>;
  metadata_fields?: Maybe<Array<StandardAttribute>>;
  multiple_values: Scalars['Boolean'];
  output_types: ActionListIoTypes;
  permissions: AttributePermissions;
  permissions_conf?: Maybe<TreepermissionsConf>;
  readonly: Scalars['Boolean'];
  required: Scalars['Boolean'];
  settings?: Maybe<Scalars['JSONObject']>;
  system: Scalars['Boolean'];
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

export enum TreeBehavior {
  files = 'files',
  standard = 'standard'
}

export type TreeElement = {
  id?: Maybe<Scalars['ID']>;
  library?: Maybe<Scalars['String']>;
};

export type TreeElementInput = {
  id: Scalars['ID'];
  library: Scalars['String'];
};

export type TreeEvent = {
  element: TreeNode;
  parentNode?: Maybe<TreeNode>;
  parentNodeBefore?: Maybe<TreeNode>;
  treeId: Scalars['ID'];
  type: TreeEventTypes;
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

export type TreeLibrary = {
  library: Library;
  settings: TreeLibrarySettings;
};

export type TreeLibraryInput = {
  library: Scalars['ID'];
  settings: TreeLibrarySettingsInput;
};

export type TreeLibrarySettings = {
  allowMultiplePositions: Scalars['Boolean'];
  allowedAtRoot: Scalars['Boolean'];
  allowedChildren: Array<Scalars['String']>;
};

export type TreeLibrarySettingsInput = {
  allowMultiplePositions: Scalars['Boolean'];
  allowedAtRoot: Scalars['Boolean'];
  allowedChildren: Array<Scalars['String']>;
};

export type TreeNode = {
  ancestors?: Maybe<Array<TreeNode>>;
  children?: Maybe<Array<TreeNode>>;
  childrenCount?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  linkedRecords?: Maybe<Array<Record>>;
  order?: Maybe<Scalars['Int']>;
  permissions: TreeNodePermissions;
  record: Record;
};


export type TreeNodeLinkedRecordsArgs = {
  attribute?: InputMaybe<Scalars['ID']>;
};

export type TreeNodeLight = {
  ancestors?: Maybe<Array<TreeNode>>;
  childrenCount?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  linkedRecords?: Maybe<Array<Record>>;
  order?: Maybe<Scalars['Int']>;
  permissions: TreeNodePermissions;
  record: Record;
};


export type TreeNodeLightLinkedRecordsArgs = {
  attribute?: InputMaybe<Scalars['ID']>;
};

export type TreeNodeLightList = {
  list: Array<TreeNodeLight>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TreeNodePermissions = {
  access_tree: Scalars['Boolean'];
  detach: Scalars['Boolean'];
  edit_children: Scalars['Boolean'];
};

export type TreeNodePermissionsConf = {
  libraryId: Scalars['ID'];
  permissionsConf: TreepermissionsConf;
};

export type TreeNodePermissionsConfInput = {
  libraryId: Scalars['ID'];
  permissionsConf: TreepermissionsConfInput;
};

export type TreePermissions = {
  access_tree: Scalars['Boolean'];
  edit_children: Scalars['Boolean'];
};

export type TreeValue = GenericValue & {
  attribute: Attribute;
  created_at?: Maybe<Scalars['Int']>;
  created_by?: Maybe<Record>;
  id_value?: Maybe<Scalars['ID']>;
  isCalculated?: Maybe<Scalars['Boolean']>;
  isInherited?: Maybe<Scalars['Boolean']>;
  metadata?: Maybe<Array<Maybe<ValueMetadata>>>;
  modified_at?: Maybe<Scalars['Int']>;
  modified_by?: Maybe<Record>;
  payload?: Maybe<TreeNode>;
  /** @deprecated Use payload instead */
  value?: Maybe<TreeNode>;
  version?: Maybe<Array<Maybe<ValueVersion>>>;
};

export type TreeValuesListConf = {
  allowFreeEntry?: Maybe<Scalars['Boolean']>;
  allowListUpdate?: Maybe<Scalars['Boolean']>;
  enable: Scalars['Boolean'];
  values?: Maybe<Array<TreeNode>>;
};

export type TreepermissionsConf = {
  permissionTreeAttributes: Array<Attribute>;
  relation: PermissionsRelation;
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

export type TreesList = {
  list: Array<Tree>;
  totalCount: Scalars['Int'];
};

export enum TreesSortableFields {
  behavior = 'behavior',
  id = 'id',
  system = 'system'
}

export type UploadData = {
  record: Record;
  uid: Scalars['String'];
};

export type UploadFiltersInput = {
  uid?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type UploadProgress = {
  progress: StreamProgress;
  uid: Scalars['String'];
  userId: Scalars['String'];
};

export enum UserCoreDataKeys {
  applications_consultation = 'applications_consultation'
}

export type UserData = {
  data?: Maybe<Scalars['Any']>;
  global: Scalars['Boolean'];
};

export type Value = GenericValue & {
  attribute: Attribute;
  created_at?: Maybe<Scalars['Int']>;
  created_by?: Maybe<Record>;
  id_value?: Maybe<Scalars['ID']>;
  isCalculated?: Maybe<Scalars['Boolean']>;
  isInherited?: Maybe<Scalars['Boolean']>;
  metadata?: Maybe<Array<Maybe<ValueMetadata>>>;
  modified_at?: Maybe<Scalars['Int']>;
  modified_by?: Maybe<Record>;
  /**  it can be "\__empty_value__" whatever the format  */
  payload?: Maybe<Scalars['Any']>;
  /**  it can be "\__empty_value__" whatever the format  */
  raw_payload?: Maybe<Scalars['Any']>;
  /** @deprecated Use raw_payload instead */
  raw_value?: Maybe<Scalars['Any']>;
  /** @deprecated Use payload instead */
  value?: Maybe<Scalars['Any']>;
  version?: Maybe<Array<Maybe<ValueVersion>>>;
};

export type ValueBatchError = {
  attribute: Scalars['String'];
  input?: Maybe<Scalars['String']>;
  message: Scalars['String'];
  type: Scalars['String'];
};

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

export type ValueMetadata = {
  name: Scalars['String'];
  value?: Maybe<Value>;
};

export type ValueMetadataInput = {
  name: Scalars['String'];
  value?: InputMaybe<Scalars['String']>;
};

export type ValueVersion = {
  treeId: Scalars['String'];
  treeNode?: Maybe<TreeNode>;
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

export type ValuesVersionsConf = {
  mode?: Maybe<ValueVersionMode>;
  profile?: Maybe<VersionProfile>;
  versionable: Scalars['Boolean'];
};

export type ValuesVersionsConfInput = {
  mode?: InputMaybe<ValueVersionMode>;
  profile?: InputMaybe<Scalars['String']>;
  versionable: Scalars['Boolean'];
};

export type VersionProfile = {
  description?: Maybe<Scalars['SystemTranslation']>;
  id: Scalars['String'];
  label: Scalars['SystemTranslation'];
  linkedAttributes: Array<Attribute>;
  trees: Array<Tree>;
};

export type VersionProfileInput = {
  description?: InputMaybe<Scalars['SystemTranslationOptional']>;
  id: Scalars['String'];
  label?: InputMaybe<Scalars['SystemTranslation']>;
  trees?: InputMaybe<Array<Scalars['String']>>;
};

export type VersionProfileList = {
  list: Array<VersionProfile>;
  totalCount: Scalars['Int'];
};

export type VersionProfilesFiltersInput = {
  id?: InputMaybe<Scalars['ID']>;
  label?: InputMaybe<Scalars['String']>;
  trees?: InputMaybe<Scalars['String']>;
};

export enum VersionProfilesSortableFields {
  id = 'id'
}

export type View = {
  attributes?: Maybe<Array<Attribute>>;
  color?: Maybe<Scalars['String']>;
  created_at: Scalars['Int'];
  created_by: Record;
  description?: Maybe<Scalars['SystemTranslationOptional']>;
  display: ViewDisplay;
  filters?: Maybe<Array<RecordFilter>>;
  id: Scalars['String'];
  label: Scalars['SystemTranslation'];
  library: Scalars['String'];
  modified_at: Scalars['Int'];
  shared: Scalars['Boolean'];
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

export type ViewValuesVersion = {
  treeId: Scalars['String'];
  treeNode: TreeNode;
};

export type ViewValuesVersionInput = {
  treeId: Scalars['String'];
  treeNode: Scalars['String'];
};

export type ViewsList = {
  list: Array<View>;
  totalCount: Scalars['Int'];
};

export type SaveValueBatchResult = {
  errors?: Maybe<Array<ValueBatchError>>;
  values?: Maybe<Array<GenericValue>>;
};

export type GetApplicationSkeletonSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApplicationSkeletonSettingsQuery = { applications?: { list: Array<{ settings?: any | null }> } | null };


export const GetApplicationSkeletonSettingsDocument = gql`
    query GetApplicationSkeletonSettings {
  applications(filters: {id: "skeleton-app"}) {
    list {
      settings
    }
  }
}
    `;

/**
 * __useGetApplicationSkeletonSettingsQuery__
 *
 * To run a query within a React component, call `useGetApplicationSkeletonSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApplicationSkeletonSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApplicationSkeletonSettingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetApplicationSkeletonSettingsQuery(baseOptions?: Apollo.QueryHookOptions<GetApplicationSkeletonSettingsQuery, GetApplicationSkeletonSettingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApplicationSkeletonSettingsQuery, GetApplicationSkeletonSettingsQueryVariables>(GetApplicationSkeletonSettingsDocument, options);
      }
export function useGetApplicationSkeletonSettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApplicationSkeletonSettingsQuery, GetApplicationSkeletonSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApplicationSkeletonSettingsQuery, GetApplicationSkeletonSettingsQueryVariables>(GetApplicationSkeletonSettingsDocument, options);
        }
export function useGetApplicationSkeletonSettingsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetApplicationSkeletonSettingsQuery, GetApplicationSkeletonSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetApplicationSkeletonSettingsQuery, GetApplicationSkeletonSettingsQueryVariables>(GetApplicationSkeletonSettingsDocument, options);
        }
export type GetApplicationSkeletonSettingsQueryHookResult = ReturnType<typeof useGetApplicationSkeletonSettingsQuery>;
export type GetApplicationSkeletonSettingsLazyQueryHookResult = ReturnType<typeof useGetApplicationSkeletonSettingsLazyQuery>;
export type GetApplicationSkeletonSettingsSuspenseQueryHookResult = ReturnType<typeof useGetApplicationSkeletonSettingsSuspenseQuery>;
export type GetApplicationSkeletonSettingsQueryResult = Apollo.QueryResult<GetApplicationSkeletonSettingsQuery, GetApplicationSkeletonSettingsQueryVariables>;