import {ISystemTranslation} from './systemTranslation';

export interface IAttribute {
    id: string;
    system?: boolean;
    label?: ISystemTranslation;
    type: AttributeTypes;
    format?: AttributeFormats;
    linked_library?: string;
}

/**
 * Accepted fields to filter attributes list
 */
export interface IAttributeFilterOptions {
    id?: string;
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
    NUMERIC = 'numeric'
}
