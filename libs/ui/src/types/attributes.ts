// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {SystemTranslation} from './scalars';
import {IParentAttributeData, ITreeData} from './search';

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
