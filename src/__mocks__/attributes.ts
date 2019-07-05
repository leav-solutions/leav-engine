import {GET_ATTRIBUTES_attributes} from '../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType, ValueVersionMode} from '../_gqlTypes/globalTypes';

const base: GET_ATTRIBUTES_attributes = {
    id: 'test_attribute',
    label: {
        fr: 'Mon Attribut',
        en: 'My Attribute'
    },
    type: AttributeType.simple,
    format: AttributeFormat.text,
    multiple_values: false,
    system: false,
    linked_tree: null,
    linked_library: null,
    permissions_conf: null,
    versions_conf: {versionable: false, mode: ValueVersionMode.smart, trees: null}
};

export const mockAttrSimple = {...base, id: 'simple_attribute'};
export const mockAttrId = {...base, id: 'id', system: true};

export const mockAttrAdv = {...base, id: 'advanced_attribute', type: AttributeType.advanced};
export const mockAttrAdvMultiVal = {...mockAttrAdv, multiple_values: true};
export const mockAttrAdvVersionable = {
    ...mockAttrAdv,
    versions_conf: {versionable: true, trees: ['tree_attribute']}
};

export const mockAttrSimpleLink = {...base, id: 'simple_link_attribute', type: AttributeType.simple_link};

export const mockAttrAdvLink = {...base, id: 'adv_link_attribute', type: AttributeType.advanced_link};
export const mockAttrAdvLinkMultiVal = {...mockAttrAdvLink, multiple_values: true};

export const mockAttrTree = {...base, id: 'tree_attribute', type: AttributeType.tree};
export const mockAttrTreeMultival = {...mockAttrTree, multiple_values: true};
