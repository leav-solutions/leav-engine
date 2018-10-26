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
    permissionsConf?: ITreePermissionsConf;
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
