import {AttributeFormats, AttributeTypes, IAttribute, ValueVersionMode} from '../../_types/attribute';

const base: IAttribute = {
    id: 'test_attribute',
    label: {
        fr: 'Mon Attribut',
        en: 'My Attribute'
    },
    type: AttributeTypes.SIMPLE,
    format: AttributeFormats.TEXT,
    multipleValues: false,
    system: false,
    linked_library: null,
    linked_tree: null,
    embedded_fields: null,
    actions_list: null,
    permissionsConf: null,
    versionsConf: {versionable: false}
};

export const mockAttrSimple = {...base, id: 'simple_attribute'};
export const mockAttrId = {...base, id: 'id', system: true};

export const mockAttrAdv = {...base, id: 'advanced_attribute', type: AttributeTypes.ADVANCED};
export const mockAttrAdvMultiVal = {...mockAttrAdv, multipleValues: true};
export const mockAttrAdvVersionable = {
    ...mockAttrAdv,
    versionsConf: {versionable: true, mode: ValueVersionMode.SMART, trees: ['my_tree']}
};
export const mockAttrAdvVersionableSimple = {
    ...mockAttrAdvVersionable,
    versionsConf: {...mockAttrAdvVersionable.versionsConf, mode: ValueVersionMode.SIMPLE}
};

export const mockAttrSimpleLink = {...base, id: 'simple_link_attribute', type: AttributeTypes.SIMPLE_LINK};

export const mockAttrAdvLink = {...base, id: 'adv_link_attribute', type: AttributeTypes.ADVANCED_LINK};
export const mockAttrAdvLinkMultiVal = {...mockAttrAdvLink, multipleValues: true};

export const mockAttrTree = {...base, id: 'tree_attribute', type: AttributeTypes.TREE};
export const mockAttrTreeVersionable = {
    ...mockAttrTree,
    versionsConf: {versionable: true, mode: ValueVersionMode.SMART, trees: ['my_tree']}
};
export const mockAttrTreeVersionableSimple = {
    ...mockAttrTreeVersionable,
    versionsConf: {...mockAttrTreeVersionable.versionsConf, mode: ValueVersionMode.SIMPLE}
};
export const mockAttrTreeMultival = {...mockAttrTree, multipleValues: true};
