import {AttributeFormats, AttributeTypes, IAttribute, ValueVersionMode} from '../../_types/attribute';

const base: IAttribute = {
    id: 'test_attribute',
    label: {
        fr: 'Mon Attribut',
        en: 'My Attribute'
    },
    type: AttributeTypes.SIMPLE,
    format: AttributeFormats.TEXT,
    multiple_values: false,
    system: false,
    linked_library: null,
    linked_tree: null,
    embedded_fields: null,
    actions_list: null,
    permissions_conf: null,
    versions_conf: {versionable: false}
};

export const mockAttrSimple = {...base, id: 'simple_attribute'};
export const mockAttrId = {...base, id: 'id', system: true};

export const mockAttrAdv = {...base, id: 'advanced_attribute', type: AttributeTypes.ADVANCED};
export const mockAttrAdvMultiVal = {...mockAttrAdv, multiple_values: true};
export const mockAttrAdvVersionable = {
    ...mockAttrAdv,
    versions_conf: {versionable: true, mode: ValueVersionMode.SMART, trees: ['my_tree']}
};
export const mockAttrAdvVersionableSimple = {
    ...mockAttrAdvVersionable,
    versions_conf: {...mockAttrAdvVersionable.versions_conf, mode: ValueVersionMode.SIMPLE}
};

export const mockAttrSimpleLink = {...base, id: 'simple_link_attribute', type: AttributeTypes.SIMPLE_LINK};

export const mockAttrAdvLink = {...base, id: 'adv_link_attribute', type: AttributeTypes.ADVANCED_LINK};
export const mockAttrAdvLinkMultiVal = {...mockAttrAdvLink, multiple_values: true};

export const mockAttrTree = {...base, id: 'tree_attribute', type: AttributeTypes.TREE};
export const mockAttrTreeVersionable = {
    ...mockAttrTree,
    versions_conf: {versionable: true, mode: ValueVersionMode.SMART, trees: ['my_tree']}
};
export const mockAttrTreeVersionableSimple = {
    ...mockAttrTreeVersionable,
    versions_conf: {...mockAttrTreeVersionable.versions_conf, mode: ValueVersionMode.SIMPLE}
};
export const mockAttrTreeMultival = {...mockAttrTree, multiple_values: true};
