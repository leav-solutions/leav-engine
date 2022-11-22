// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    GET_ATTRIBUTES_BY_LIB_attributes_list,
    GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute
} from '../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';

export interface ICommonAttributeComponentProps {
    attribute: GET_ATTRIBUTES_BY_LIB_attributes_list;
    library: string;
    path: string;
    depth: number;
    parentAttribute?:
        | GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute
        | GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute;
}
