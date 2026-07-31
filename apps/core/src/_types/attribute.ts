import {type ActionsListEvents, type ActionsListIOTypes, type ActionsListConfig} from './actionsList';
import {type ITreePermissionsDependentValuesConf, type ITreePermissionsConf} from './permissions';
import {type IQueryInfos} from './queryInfos';
import {type IRecord} from './record';
import {type IGetCoreEntitiesParams, type IKeyValue} from './shared';
import {type ISystemTranslation} from './systemTranslation';
import {type ITreeElement} from './tree';
import {type IDateRangeValue} from './value';

// properties system, readonly, required should nor be optional, as for graphql type
// but change this types as a lot of side effects for now
export interface IAttribute extends ICoreEntity {
    system?: boolean;
    readonly?: boolean;
    required?: boolean;
    character_limit?: number;
    type: AttributeTypes;
    format?: AttributeFormats;
    linked_library?: string;
    linked_tree?: string;
    embedded_fields?: IEmbeddedAttribute[];
    actions_list?: ActionsListConfig;
    permissions_conf?: ITreePermissionsConf;
    multiple_values?: boolean;
    versions_conf?: IAttributeVersionsConf;
    metadata_fields?: string[];
    values_list?: IValuesListConf;
    reverse_link?: string | IAttribute; // linked attribute
    unique?: boolean; // only on simple attribute
    description?: ISystemTranslation;
    settings?: IKeyValue<any>;
    multi_link_display_option?: MultiDisplayOption;
    multi_tree_display_option?: MultiDisplayOption;

    /**
     * only for tree attribute
     */
    permissions_conf_dependent_values?: ITreePermissionsDependentValuesConf;

    /**
     * only for tree attribute
     */
    tree_selection_conf?: ITreeSelectionConf;

    /**
     * only for link attribute
     */
    smart_filter?: {
        enable: boolean;
    };
}

export enum TreeSelectableNodes {
    ALL_NODES = 'all_nodes',
    LEAVES_ONLY = 'leaves_only',
}

/**
 * Selection behavior of a tree attribute, in the record form field and in the selection modal.
 * All fields are optional: a missing field means "system default".
 */
export interface ITreeSelectionConf {
    selectableNodes?: TreeSelectableNodes;
    defaultExpanded?: boolean;
    displayRootNode?: string;
    maxDepth?: number;
    showSelectChildrenButton?: boolean;
    showSelectDescendantsButton?: boolean;
}

export enum ValueVersionMode {
    SIMPLE = 'simple',
    SMART = 'smart',
}

export interface IAttributeVersionsConf {
    versionable: boolean;
    mode?: ValueVersionMode;
    profile?: string;
}

export interface IEmbeddedAttribute {
    id: string;
    label?: ISystemTranslation;
    description?: ISystemTranslation;
    format?: AttributeFormats;
    validation_regex?: string;
    embedded_fields?: IEmbeddedAttribute[];
}

/**
 * Accepted fields to filter attributes list
 */
export interface IAttributeFilterOptions extends ICoreEntityFilterOptions {
    type?: AttributeTypes[];
    format?: AttributeFormats[];
    system?: boolean;
    linked_library?: string;
    linked_tree?: string;
    multiple_values?: boolean;
    libraries?: string[];
    librariesExcluded?: string[];
    versionable?: boolean;
    metadata_fields?: string[];
}

export interface IGetCoreAttributesParams extends IGetCoreEntitiesParams {
    filters?: IAttributeFilterOptions;
}
export interface IGetCoreFormAttributesParams extends IGetCoreEntitiesParams {
    libraryId: string;
    formId: string;
    checkDependency?: boolean;
    ctx: IQueryInfos;
}

export interface IValuesListConf {
    enable: boolean;
    values?: string[] | IDateRangeValue[] | IRecord[] | ITreeElement[];
    allowFreeEntry?: boolean;
    allowListUpdate?: boolean;
}

export type IOAllowedTypes = {
    [eventName in ActionsListEvents]: ActionsListIOTypes[];
};

export enum AttributeTypes {
    SIMPLE = 'simple',
    SIMPLE_LINK = 'simple_link',
    ADVANCED = 'advanced',
    ADVANCED_LINK = 'advanced_link',
    TREE = 'tree',
}

export enum AttributeFormats {
    TEXT = 'text',
    NUMERIC = 'numeric',
    DATE = 'date',
    DATE_RANGE = 'date_range',
    ENCRYPTED = 'encrypted',
    BOOLEAN = 'boolean',
    EXTENDED = 'extended',
    COLOR = 'color',
    RICH_TEXT = 'rich_text',
}

export enum MultiDisplayOption {
    AVATAR = 'avatar',
    TAG = 'tag',
    BADGE_QTY = 'badge_qty',
}

export enum IOTypes {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object',
}
