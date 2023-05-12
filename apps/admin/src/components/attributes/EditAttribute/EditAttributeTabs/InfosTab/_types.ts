// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    GET_ATTRIBUTE_BY_ID_attributes_list,
    GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf
} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {Override} from '_types/Override';

export type AttributeInfosFormValuesVersionsConf = Override<
    GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf,
    {profile: string}
>;

export type AttributeInfosFormValues = Override<
    GET_ATTRIBUTE_BY_ID_attributes_list,
    {
        linked_library?: string;
        linked_tree?: string;
        reverse_link?: string;
        versions_conf: AttributeInfosFormValuesVersionsConf;
        unique: boolean;
    }
>;
