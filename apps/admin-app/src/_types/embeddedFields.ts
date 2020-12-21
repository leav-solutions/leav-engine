// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat} from '../_gqlTypes/globalTypes';

// ====================================================
// GraphQL query operation: GET_EMBEDDED_FIELDS_QUERY
// ====================================================

export interface IGetEmbeddedFieldsQueryAttributesList {
    id: string;
    label: ILabel;
    format: AttributeFormat;
    embedded_fields?: IEmbeddedFields[];
}

export interface IEmbeddedFields {
    id: string;
    validation_regex?: string | null;
    format: string;
    label: ILabel | null;
    embedded_fields?: IEmbeddedFields[] | null;
}

export interface ILabel {
    [x: string]: string;
}

export interface IGetEmbeddedFieldsQueryAttributes {
    list: IGetEmbeddedFieldsQueryAttributesList[];
}

export interface IGetEmbeddedFieldsQuery {
    attributes: IGetEmbeddedFieldsQueryAttributes;
}

export interface IGetEmbeddedFieldsQueryVariables {
    attId: string;
}
