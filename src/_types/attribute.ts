import {ISystemTranslation} from './systemTranslation';

export interface IAttribute {
    id: string;
    system?: boolean;
    label?: ISystemTranslation;
    type: AttributeTypes;
    format?: AttributeFormats;
}

export enum AttributeTypes {
    LINK = 'link',
    INDEX = 'index',
    STANDARD = 'standard'
}

export enum AttributeFormats {
    TEXT = 'text',
    NUMERIC = 'numeric'
}
