// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISelectedAttribute} from '_ui/types/attributes';
import {
    AttributeDetailsFragment,
    AttributeFormat,
    AttributeType,
    GetAttributesQuery,
    LibraryAttributesFragment,
    RecordFormAttributeFragment,
    RecordFormAttributeTreeAttributeFragment
} from '_ui/_gqlTypes';

export const mockLibraryAttribute: LibraryAttributesFragment = {
    id: 'my_attribute',
    type: AttributeType.simple,
    format: AttributeFormat.text,
    label: {
        fr: 'Mon attribut',
        en: 'My attribute'
    },
    system: false
};

export const mockAttributeSimple: GetAttributesQuery['attributes']['list'][0] = {
    id: 'my_attribute',
    label: {
        fr: 'Mon attribut',
        en: 'My attribute'
    },
    type: AttributeType.simple,
    format: AttributeFormat.text,
    system: false
};

export const mockAttributeWithDetails: AttributeDetailsFragment = {
    id: 'my_attribute',
    label: {
        fr: 'Mon attribut',
        en: 'My attribute'
    },
    format: AttributeFormat.text,
    type: AttributeType.simple,
    system: false,
    description: {
        fr: 'Ma description',
        en: 'My description'
    },
    maxLength: null,
    unique: false,
    readonly: false,
    multiple_values: false
};

export const mockAttributeLink: AttributeDetailsFragment = {
    ...mockAttributeWithDetails,
    type: AttributeType.advanced_link,
    linked_library: {
        id: 'my_linked_library',
        label: {
            fr: 'Ma biblio',
            en: 'My library'
        }
    }
};

export const mockAttributeTree: AttributeDetailsFragment = {
    ...mockAttributeWithDetails,
    type: AttributeType.tree,
    linked_tree: {
        id: 'my_linked_tree',
        label: {
            fr: 'Mon arbre',
            en: 'My tree'
        }
    }
};

export const mockAttributeVersionable: AttributeDetailsFragment = {
    ...mockAttributeWithDetails,
    versions_conf: {
        versionable: true,
        profile: {
            id: 'my_profile',
            label: {
                fr: 'Mon profil',
                en: 'My profile'
            },
            trees: [
                {
                    id: 'my_tree',
                    label: {
                        fr: 'Mon arbre',
                        en: 'My tree'
                    }
                }
            ]
        }
    }
};

export const mockFormAttribute: RecordFormAttributeFragment = {
    id: 'test_attribute',
    type: AttributeType.simple,
    format: AttributeFormat.extended,
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
        allowListUpdate: false,
        values: []
    },
    permissions: {
        access_attribute: true,
        edit_value: true
    },
    metadata_fields: [
        {
            ...mockAttributeWithDetails,
            permissions: {
                access_attribute: true,
                edit_value: true
            }
        }
    ],
    versions_conf: null
};

export const mockFormAttributeTree: RecordFormAttributeTreeAttributeFragment = {
    ...mockFormAttribute,
    ...mockAttributeTree,
    metadata_fields: null,
    treeValuesList: {enable: false, allowFreeEntry: false, allowListUpdate: false, values: []}
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
