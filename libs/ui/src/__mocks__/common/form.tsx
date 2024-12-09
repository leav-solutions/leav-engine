// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    FormFieldTypes,
    FormUIElementTypes,
    ICommonFieldsSettings,
    IFormDividerSettings,
    IFormTabsSettings,
    TabsDirection
} from '@leav/utils';
import {IRecordForm, RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {AttributeFormat, AttributeType, FormElementTypes, LibraryBehavior} from '_ui/_gqlTypes';
import {mockRecord} from '_ui/__mocks__/common/record';
import {FormElement, IFormElementProps} from '../../components/RecordEdition/EditRecordContent/_types';
import {IRecordPropertyTree} from '../../_queries/records/getRecordPropertiesQuery';
import {mockAttributeSimple, mockFormAttribute} from './attribute';
import {mockModifier} from './value';
import {mockVersionProfile} from './versionProfile';

const formElementBase = {
    type: FormElementTypes.layout,
    attribute: null,
    valueError: null,
    values: [
        {
            value: 'My value formatted',
            raw_value: 'my_raw_value',
            payload: 'My value formatted',
            raw_payload: 'my_raw_payload',
            created_at: 123456789,
            modified_at: 123456789,
            created_by: mockModifier,
            modified_by: mockModifier,
            id_value: null,
            attribute: mockAttributeSimple,
            metadata: null,
            version: null
        }
    ],
    settings: {}
};

export const mockFormElementContainer: FormElement<{}> = {
    ...formElementBase,
    id: 'container',
    containerId: '__root',
    uiElement: () => <div>{FormUIElementTypes.FIELDS_CONTAINER}</div>,
    type: FormElementTypes.layout,
    uiElementType: FormUIElementTypes.FIELDS_CONTAINER
};

export const mockFormElementInput: FormElement<{}> = {
    ...formElementBase,
    id: 'input_element',
    containerId: '__root',
    settings: {attribute: 'test_attribute'},
    attribute: {...mockFormAttribute, format: AttributeFormat.text, versions_conf: {versionable: false, profile: null}},
    uiElement: () => <div>{FormFieldTypes.TEXT_INPUT}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.TEXT_INPUT
};

export const mockFormElementMultipleInput: FormElement<{}> = {
    ...formElementBase,
    id: 'input_element',
    containerId: '__root',
    settings: {attribute: 'test_attribute'},
    attribute: {
        ...mockFormAttribute,
        type: AttributeType.advanced,
        multiple_values: true,
        format: AttributeFormat.text,
        versions_conf: {versionable: false, profile: null}
    },
    uiElement: () => <div>{FormFieldTypes.TEXT_INPUT}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.TEXT_INPUT
};

export const mockFormElementDate: FormElement<{}> = {
    ...formElementBase,
    id: 'date_element',
    containerId: '__root',
    settings: {attribute: 'test_attribute'},
    uiElement: () => <div>{FormFieldTypes.DATE}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.DATE
};

export const mockFormElementInputVersionable: FormElement<{}> = {
    ...mockFormElementInput,
    attribute: {
        ...mockFormElementInput.attribute,
        versions_conf: {
            versionable: true,
            profile: mockVersionProfile
        }
    }
};

export const mockLinkValue = {
    linkValue: {
        id: '123456',
        whoAmI: {
            ...mockRecord
        }
    },
    created_at: 123456789,
    modified_at: 123456789,
    created_by: mockModifier,
    modified_by: mockModifier,
    id_value: null,
    metadata: null,
    version: null
};

const mockFormAttributeLink = {
    ...mockFormAttribute,
    type: AttributeType.advanced_link,
    linked_library: {
        id: 'test_lib',
        behavior: LibraryBehavior.standard,
        label: {fr: 'Lib'},
        permissions: {
            create_record: true
        }
    },
    system: false,
    linkValuesList: {enable: false, allowFreeEntry: false, allowListUpdate: false, values: []}
};

export const mockFormElementLink: FormElement<{}> = {
    ...formElementBase,
    id: 'link_element',
    containerId: '__root',
    settings: {attribute: 'test_attribute'},
    uiElement: () => <div>{FormFieldTypes.LINK}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.LINK,
    attribute: mockFormAttributeLink,
    values: [mockLinkValue]
};

export const mockFormElementLinkVersionable: FormElement<{}> = {
    ...mockFormElementLink,
    attribute: {
        ...mockFormElementLink.attribute,
        versions_conf: {
            versionable: true,
            profile: mockVersionProfile
        }
    }
};

const mockRecordIdentity = {
    id: '123456',
    whoAmI: {
        ...mockRecord,
        id: '123456',
        label: 'Record label A',
        library: {
            ...mockRecord.library,
            id: 'linked_lib',
            label: {en: 'Linked lib'}
        }
    }
};

const mockRecord2 = {
    id: '123458',
    whoAmI: {
        ...mockRecord,
        id: '123458',
        label: 'Record label B',
        library: {
            ...mockRecord.library,
            id: 'linked_lib',
            label: {en: 'Linked lib'}
        }
    }
};

const mockRecordAncestor = {
    id: '123457',
    whoAmI: {
        ...mockRecord,
        id: '123457',
        label: 'Record label ancestor',
        library: {
            ...mockRecord.library,
            id: 'linked_lib',
            label: {en: 'Linked lib'}
        }
    }
};

export const mockTreeValueA: IRecordPropertyTree = {
    treeValue: {
        id: '123456',
        record: mockRecordIdentity,
        ancestors: [
            {
                record: mockRecordAncestor
            },
            {
                record: mockRecordIdentity
            }
        ]
    },
    created_at: 123456789,
    modified_at: 123456789,
    created_by: mockModifier,
    modified_by: mockModifier,
    metadata: null,
    id_value: '123456'
};

export const mockTreeValueB: IRecordPropertyTree = {
    ...mockTreeValueA,
    treeValue: {
        id: '123457',
        record: mockRecord2,
        ancestors: [
            {
                record: mockRecordAncestor
            },
            {
                record: mockRecord2
            }
        ]
    },
    id_value: '987654'
};

export const mockFormElementTree: FormElement<ICommonFieldsSettings> = {
    ...formElementBase,
    id: 'tree_element',
    containerId: '__root',
    settings: {label: {en: 'my label'}, attribute: 'test'},
    uiElement: () => <div>{FormFieldTypes.TREE}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.TREE,
    attribute: {
        ...mockFormAttribute,
        type: AttributeType.tree,
        linked_tree: {
            id: 'my_linked_tree',
            label: {
                fr: 'Mon arbre',
                en: 'My tree'
            }
        },
        treeValuesList: {enable: false, allowFreeEntry: false, allowListUpdate: false, values: []}
    },
    values: [
        {...(mockTreeValueA as unknown as RecordFormElementsValueTreeValue)},
        {...(mockTreeValueB as unknown as RecordFormElementsValueTreeValue)}
    ]
};

export const mockFormElementTextBlock: FormElement<{}> = {
    ...formElementBase,
    id: 'text_block',
    containerId: '__root',
    settings: {
        content: '**text content**'
    },
    uiElement: () => <div>{FormUIElementTypes.TEXT_BLOCK}</div>,
    uiElementType: FormUIElementTypes.TEXT_BLOCK
};

export const mockFormElementDivider: FormElement<IFormDividerSettings> = {
    ...formElementBase,
    id: 'divider',
    containerId: '__root',
    uiElement: () => <div>{FormUIElementTypes.DIVIDER}</div>,
    uiElementType: FormUIElementTypes.DIVIDER
};

export const mockFormElementTabs: FormElement<IFormTabsSettings> = {
    ...formElementBase,
    id: 'tabs',
    containerId: '__root',
    settings: {
        tabs: [
            {id: 'tab1', label: {fr: 'Tab 1'}},
            {id: 'tab2', label: {fr: 'Tab 2'}}
        ],
        direction: TabsDirection.HORIZONTAL
    },
    uiElement: () => <div>{FormUIElementTypes.TABS}</div>,
    uiElementType: FormUIElementTypes.TABS
};

export const mockCommonFormElementProps: Partial<IFormElementProps<any>> = {
    onValueDelete: jest.fn(),
    onValueSubmit: jest.fn(),
    onDeleteMultipleValues: jest.fn()
};

export const mockRecordForm: IRecordForm = {
    id: 'edition_form',
    library: {
        id: 'test_lib'
    },
    recordId: '123456',
    dependencyAttributes: [],
    elements: [{...mockFormElementInput, settings: [{key: 'my_settings', value: 'value'}]}]
};
