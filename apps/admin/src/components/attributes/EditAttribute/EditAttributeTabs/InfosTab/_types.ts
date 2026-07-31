import {
    type GET_ATTRIBUTE_BY_ID_attributes_list,
    type GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf,
} from '../../../../../_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {type Override} from '../../../../../_types/Override';

export type AttributeInfosFormValuesVersionsConf = Override<
    GET_ATTRIBUTE_BY_ID_attributes_list_StandardAttribute_versions_conf,
    {profile: string}
>;

/**
 * `multi_link_display_option` / `multi_tree_display_option` are left out on purpose: both are edited
 * and saved by the Display tab, so carrying them here would let a save of this form write back a
 * stale value.
 */
export type AttributeInfosFormValues = Override<
    Omit<GET_ATTRIBUTE_BY_ID_attributes_list, 'multi_tree_display_option' | 'multi_link_display_option'>,
    {
        linked_library?: string;
        linked_tree?: string;
        reverse_link?: string;
        versions_conf: AttributeInfosFormValuesVersionsConf;
        unique: boolean;
        character_limit?: number;
    }
>;
