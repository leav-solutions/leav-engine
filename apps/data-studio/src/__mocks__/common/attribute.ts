// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list} from '_gqlTypes/GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY';
import {
    RECORD_FORM_recordForm_elements_attribute,
    RECORD_FORM_recordForm_elements_attribute_TreeAttribute
} from '_gqlTypes/RECORD_FORM';
import {
    GET_ATTRIBUTES_BY_LIB_attributes_list,
    GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute,
    GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute
} from '../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {AttributeFormat, AttributeType} from '../../_gqlTypes/globalTypes';
import {IAttribute, ISelectedAttribute} from '../../_types/types';

const mockQueryAttribute: GET_ATTRIBUTES_BY_LIB_attributes_list = {
    id: 'test',
    type: AttributeType.simple,
    format: AttributeFormat.text,
    label: {
        fr: 'test',
        en: 'test'
    },
    multiple_values: false,
    embedded_fields: null,
    system: false,
    readonly: false
};

export const mockAttributeStandard: GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute = {
    ...mockQueryAttribute,
    embedded_fields: []
};

export const mockAttributeExtended: GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute = {
    ...mockAttributeStandard,
    format: AttributeFormat.extended,
    embedded_fields: [
        {
            format: AttributeFormat.text,
            id: 'subfield',
            label: {en: 'My subfield'}
        }
    ]
};

export const mockAttributeLink: GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute = {
    ...mockQueryAttribute,
    type: AttributeType.simple_link,
    linked_library: {id: 'test_lib'}
};

export const mockAttributeTree: GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute = {
    ...mockQueryAttribute,
    type: AttributeType.tree,
    linked_tree: {
        id: 'test_tree',
        label: {fr: 'test_tree'},
        libraries: [{library: {id: 'test_lib', label: {fr: 'my_lib'}}}]
    }
};

export const mockSelectedAttributeA: ISelectedAttribute = {
    id: 'A',
    type: AttributeType.simple,
    path: 'A',
    library: 'test_lib',
    label: {fr: 'My attribute'},
    multiple_values: false
};

export const mockSelectedAttributeB: ISelectedAttribute = {
    ...mockSelectedAttributeA,
    id: 'B',
    path: 'B'
};

export const mockSelectedAttributeC: ISelectedAttribute = {
    ...mockSelectedAttributeA,
    id: 'C',
    path: 'C'
};

export const mockAttribute: IAttribute = {
    id: 'testId',
    library: 'testLibrary',
    type: AttributeType.simple,
    format: AttributeFormat.text,
    label: {
        fr: 'test',
        en: 'test'
    },
    isLink: false,
    isMultiple: false
};

export const mockAttributeVersionable: GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list = {
    id: 'testId',
    versions_conf: {
        versionable: true,
        profile: {
            id: 'testProfile',
            trees: [
                {
                    id: 'testTree',
                    label: {
                        fr: 'testTree',
                        en: 'testTree'
                    }
                }
            ]
        }
    }
};

export const mockFormAttribute: RECORD_FORM_recordForm_elements_attribute = {
    id: 'test_attribute',
    type: AttributeType.simple,
    format: AttributeFormat.text,
    label: {
        fr: 'test',
        en: 'test'
    },
    description: {
        fr: 'Mon attribut',
        en: 'My attribute'
    },
    system: false,
    readonly: false,
    multiple_values: false,
    values_list: {
        enable: false,
        allowFreeEntry: false,
        values: []
    },
    permissions: {
        access_attribute: true,
        edit_value: true
    },
    metadata_fields: null,
    versions_conf: null
};

export const mockFormAttributeTree: RECORD_FORM_recordForm_elements_attribute_TreeAttribute = {
    ...mockFormAttribute,
    ...mockAttributeTree,
    treeValuesList: {enable: false, allowFreeEntry: false, values: []}
};
