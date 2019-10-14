import {IActionsListConfig} from './actionsList';
import {ITreePermissionsConf} from './permissions';
import {ISystemTranslation} from './systemTranslation';

export interface IAttribute {
    id: string;
    system?: boolean;
    label?: ISystemTranslation;
    type: AttributeTypes;
    format?: AttributeFormats;
    linked_library?: string;
    linked_tree?: string;
    embedded_fields?: IEmbeddedAttribute[];
    actions_list?: IActionsListConfig;
    permissions_conf?: ITreePermissionsConf;
    multiple_values?: boolean;
    versions_conf?: IAttributeVersionsConf;
}

export enum ValueVersionMode {
    SIMPLE = 'simple',
    SMART = 'smart'
}

export interface IAttributeVersionsConf {
    versionable: boolean;
    mode?: ValueVersionMode;
    trees?: string[];
}

export interface IEmbeddedAttribute {
    id: string;
    label?: ISystemTranslation;
    format?: AttributeFormats;
    validation_regex?: string;
    embedded_fields?: IEmbeddedAttribute[];
}

/**
 * Accepted fields to filter attributes list
 */
export interface IAttributeFilterOptions {
    id?: string;
    type?: AttributeTypes[];
    format?: AttributeFormats[];
    system?: boolean;
    label?: string;
    linked_library?: string;
    multiple_values?: boolean;
}

export enum AttributeTypes {
    SIMPLE = 'simple',
    SIMPLE_LINK = 'simple_link',
    ADVANCED = 'advanced',
    ADVANCED_LINK = 'advanced_link',
    TREE = 'tree'
}

export enum AttributeFormats {
    TEXT = 'text',
    NUMERIC = 'numeric',
    DATE = 'date',
    ENCRYPTED = 'encrypted',
    BOOLEAN = 'boolean',
    EXTENDED = 'extended'
}

export enum IOTypes {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object'
}
