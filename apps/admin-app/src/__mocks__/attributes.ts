// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    GET_ATTRIBUTES_attributes_list,
    GET_ATTRIBUTES_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_attributes_list_TreeAttribute
} from '../_gqlTypes/GET_ATTRIBUTES';
import {GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute} from '../_gqlTypes/GET_ATTRIBUTES_VALUES_LIST';
import {AttributeFormat, AttributeType, ValueVersionMode} from '../_gqlTypes/globalTypes';

const base: GET_ATTRIBUTES_attributes_list = {
    id: 'test_attribute',
    label: {
        fr: 'Mon Attribut',
        en: 'My Attribute'
    },
    description: {
        fr: 'Mon Attribut',
        en: 'My Attribute'
    },
    type: AttributeType.simple,
    format: AttributeFormat.text,
    multiple_values: false,
    system: false,
    linked_tree: null,
    linked_library: null,
    reverse_link: null,
    permissions_conf: null,
    versions_conf: {versionable: false, mode: ValueVersionMode.smart, trees: null},
    metadata_fields: null
};

export const mockAttrSimple = {...base, id: 'simple_attribute'};
export const mockAttrId = {...base, id: 'id', system: true};
export const mockAttrSimpleWithValuesList = {
    ...mockAttrSimple,
    id: 'simple_attribute_with_values_list',
    values_list: {
        enable: true,
        allowFreeEntry: false,
        values: ['value 1', 'value 2']
    }
};

export const mockAttrAdv = {...base, id: 'advanced_attribute', type: AttributeType.advanced};
export const mockAttrAdvMultiVal = {...mockAttrAdv, multiple_values: true};
export const mockAttrAdvVersionable = {
    ...mockAttrAdv,
    versions_conf: {versionable: true, trees: ['tree_attribute']}
};

export const mockAttrSimpleLink = {...base, id: 'simple_link_attribute', type: AttributeType.simple_link};
export const mockAttrSimpleLinkWithValuesList = {
    ...mockAttrSimpleLink,
    id: 'simple_link_attribute_with_values_list',
    values_list: {
        enable: true,
        allowFreeEntry: false,
        values: ['132456', '987654']
    }
};

export const mockAttrAdvLink: GET_ATTRIBUTES_attributes_list_LinkAttribute = {
    ...base,
    id: 'adv_link_attribute',
    type: AttributeType.advanced_link,
    linked_library: {id: 'test_lib'},
    reverse_link: null
};
export const mockAttrAdvLinkMultiVal: GET_ATTRIBUTES_attributes_list_LinkAttribute = {
    ...mockAttrAdvLink,
    multiple_values: true
};
export const mockAttrAdvLinkWithValuesList: GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute = {
    ...mockAttrAdvLink,
    id: 'adv_link_attribute_with_values_list',
    values_list: {
        enable: true,
        allowFreeEntry: false,
        linkValues: [
            {
                whoAmI: {
                    id: '132456',
                    library: {id: 'test_lib', label: {fr: 'test'}},
                    color: null,
                    label: null,
                    preview: null
                }
            },
            {
                whoAmI: {
                    id: '987654',
                    library: {id: 'test_lib', label: {fr: 'test'}},
                    color: null,
                    label: null,
                    preview: null
                }
            }
        ]
    }
};

export const mockAttrTree: GET_ATTRIBUTES_attributes_list_TreeAttribute = {
    ...base,
    id: 'tree_attribute',
    type: AttributeType.tree,
    linked_tree: {id: 'test_tree'}
};
export const mockAttrTreeMultival: GET_ATTRIBUTES_attributes_list_TreeAttribute = {
    ...mockAttrTree,
    multiple_values: true
};
