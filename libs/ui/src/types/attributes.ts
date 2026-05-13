import {type AttributeFormat, type AttributeType} from '_ui/_gqlTypes';
import {type SystemTranslation} from './scalars';
import {type IAttribute, type IParentAttributeData, type ITreeData} from './search';

export interface ISelectedAttribute {
    id: string;
    library: string;
    path: string;
    label?: SystemTranslation | null;
    type: AttributeType;
    format?: AttributeFormat | null;
    multiple_values: boolean;
    parentAttributeData?: IParentAttributeData;
    embeddedFieldData?: IEmbeddedFields;
    treeData?: ITreeData;
}

export interface IEmbeddedFields {
    id: string;
    format: AttributeFormat;
    label: SystemTranslation;
    embedded_fields: IEmbeddedFields[];
}

export type FullTextAttribute = Pick<IAttribute, 'id' | 'label'>;
