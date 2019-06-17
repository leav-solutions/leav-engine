import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';

const base: IAttribute = {
    id: 'simple_attribute',
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
    permissionsConf: null
};

export const mockAttrSimple = {...base};
export const mockAttrId = {...base, id: 'id', system: true};

export const mockAttrAdv = {...base, type: AttributeTypes.ADVANCED};
export const mockAttrAdvMultiVal = {...mockAttrAdv, multipleValues: true};

export const mockAttrSimpleLink = {...base, type: AttributeTypes.SIMPLE_LINK};

export const mockAttrAdvLink = {...base, type: AttributeTypes.ADVANCED_LINK};
export const mockAttrAdvLinkMultiVal = {...mockAttrAdvLink, multipleValues: true};

export const mockAttrTree = {...base, type: AttributeTypes.TREE};
export const mockAttrTreeMultival = {...mockAttrTree, multipleValues: true};
