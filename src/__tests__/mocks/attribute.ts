// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

export const mockAttrSimple: IAttribute = {...base, id: 'simple_attribute'};
export const mockAttrId: IAttribute = {...base, id: 'id', system: true};

export const mockAttrAdv: IAttribute = {...base, id: 'advanced_attribute', type: AttributeTypes.ADVANCED};
export const mockAttrAdvMultiVal: IAttribute = {...mockAttrAdv, multiple_values: true};
export const mockAttrAdvVersionable: IAttribute = {
    ...mockAttrAdv,
    versions_conf: {versionable: true, mode: ValueVersionMode.SMART, trees: ['my_tree']}
};
export const mockAttrAdvVersionableSimple: IAttribute = {
    ...mockAttrAdvVersionable,
    versions_conf: {...mockAttrAdvVersionable.versions_conf, mode: ValueVersionMode.SIMPLE}
};

export const mockAttrAdvWithMetadata: IAttribute = {
    ...base,
    id: 'advanced_attribute_with_meta',
    type: AttributeTypes.ADVANCED,
    metadata_fields: ['meta_attribute']
};

export const mockAttrSimpleLink: IAttribute = {
    ...base,
    id: 'simple_link_attribute',
    type: AttributeTypes.SIMPLE_LINK,
    linked_library: 'test_lib'
};

export const mockAttrAdvLink: IAttribute = {
    ...base,
    id: 'adv_link_attribute',
    type: AttributeTypes.ADVANCED_LINK,
    linked_library: 'test_lib'
};
export const mockAttrAdvLinkMultiVal: IAttribute = {...mockAttrAdvLink, multiple_values: true};

export const mockAttrTree: IAttribute = {
    ...base,
    id: 'tree_attribute',
    type: AttributeTypes.TREE,
    linked_tree: 'my_tree'
};
export const mockAttrTreeVersionable: IAttribute = {
    ...mockAttrTree,
    versions_conf: {versionable: true, mode: ValueVersionMode.SMART, trees: ['my_tree']}
};
export const mockAttrTreeVersionableSimple: IAttribute = {
    ...mockAttrTreeVersionable,
    versions_conf: {...mockAttrTreeVersionable.versions_conf, mode: ValueVersionMode.SIMPLE}
};
export const mockAttrTreeMultival: IAttribute = {...mockAttrTree, multiple_values: true};
