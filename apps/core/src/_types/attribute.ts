// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListEvents, ActionsListIOTypes, IActionsListConfig} from './actionsList';
import {ITreePermissionsConf} from './permissions';
import {IRecord} from './record';
import {IGetCoreEntitiesParams} from './shared';
import {ISystemTranslation} from './systemTranslation';
import {ITreeElement} from './tree';
import {IDateRangeValue} from './value';

export interface IAttribute extends ICoreEntity {
    system?: boolean;
    readonly?: boolean;
    type: AttributeTypes;
    format?: AttributeFormats;
    linked_library?: string;
    linked_tree?: string;
    embedded_fields?: IEmbeddedAttribute[];
    actions_list?: IActionsListConfig;
    permissions_conf?: ITreePermissionsConf;
    multiple_values?: boolean;
    versions_conf?: IAttributeVersionsConf;
    metadata_fields?: string[];
    values_list?: IValuesListConf;
    reverse_link?: string | IAttribute; // linked attribute
    unique?: boolean; // only on simple attribute
}

export enum ValueVersionMode {
    SIMPLE = 'simple',
    SMART = 'smart'
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
    versionable?: boolean;
}

export interface IGetCoreAttributesParams extends IGetCoreEntitiesParams {
    filters?: IAttributeFilterOptions;
}

export interface IValuesListConf {
    enable: boolean;
    values?: string[] | IDateRangeValue[] | IRecord[] | ITreeElement[];
    allowFreeEntry?: boolean;
}

export type IOAllowedTypes = {
    [eventName in ActionsListEvents]: ActionsListIOTypes[];
};

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
    DATE_RANGE = 'date_range',
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
