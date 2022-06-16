// Copyright LEAV Solutions 2017
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
import {FormElement} from 'components/RecordEdition/EditRecord/_types';
import {IRecordPropertyTree} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {
    RECORD_FORM_recordForm,
    RECORD_FORM_recordForm_elements_values_LinkValue,
    RECORD_FORM_recordForm_elements_values_TreeValue
} from '_gqlTypes/RECORD_FORM';
import {mockAttribute, mockAttributeLink, mockAttributeTree, mockFormAttribute} from './attribute';
import {mockRecordWhoAmI} from './record';
import {mockModifier} from './value';

const formElementBase = {
    type: FormElementTypes.layout,
    attribute: null,
    values: [
        {
            value: 'My value formatted',
            raw_value: 'my_raw_value',
            created_at: 123456789,
            modified_at: 123456789,
            created_by: mockModifier,
            modified_by: mockModifier,
            id_value: null,
            attribute: mockAttribute,
            metadata: null
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
    attribute: mockFormAttribute,
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

export const mockLinkValue: RECORD_FORM_recordForm_elements_values_LinkValue = {
    linkValue: {
        id: '123456',
        whoAmI: {
            ...mockRecordWhoAmI
        }
    },
    created_at: 123456789,
    modified_at: 123456789,
    created_by: mockModifier,
    modified_by: mockModifier,
    id_value: null,
    metadata: null
};

export const mockFormElementLink: FormElement<{}> = {
    ...formElementBase,
    id: 'link_element',
    containerId: '__root',
    settings: {attribute: 'test_attribute'},
    uiElement: () => <div>{FormFieldTypes.LINK}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.LINK,
    attribute: {
        ...mockFormAttribute,
        ...mockAttributeLink,
        linked_library: {
            id: 'test_lib',
            label: {fr: 'Lib'},
            gqlNames: {query: 'test_lib', type: 'TestLib'}
        },
        system: false,
        linkValuesList: {enable: false, allowFreeEntry: false, values: []}
    },
    values: [mockLinkValue]
};

const mockRecord = {
    id: '123456',
    whoAmI: {
        ...mockRecordWhoAmI,
        id: '123456',
        label: 'Record label A',
        library: {
            ...mockRecordWhoAmI.library,
            id: 'linked_lib',
            label: {en: 'Linked lib'}
        }
    }
};

const mockRecord2 = {
    id: '123458',
    whoAmI: {
        ...mockRecordWhoAmI,
        id: '123458',
        label: 'Record label B',
        library: {
            ...mockRecordWhoAmI.library,
            id: 'linked_lib',
            label: {en: 'Linked lib'}
        }
    }
};

const mockRecordAncestor = {
    id: '123457',
    whoAmI: {
        ...mockRecordWhoAmI,
        id: '123457',
        label: 'Record label ancestor',
        library: {
            ...mockRecordWhoAmI.library,
            id: 'linked_lib',
            label: {en: 'Linked lib'}
        }
    }
};

export const mockTreeValueA: IRecordPropertyTree = {
    treeValue: {
        record: mockRecord,
        ancestors: [
            {
                record: mockRecordAncestor
            },
            {
                record: mockRecord
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
    settings: {label: 'my label', attribute: 'test'},
    uiElement: () => <div>{FormFieldTypes.TREE}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.TREE,
    attribute: {
        ...mockFormAttribute,
        ...mockAttributeTree,
        treeValuesList: {enable: false, allowFreeEntry: false, values: []}
    },
    values: [
        {...(mockTreeValueA as RECORD_FORM_recordForm_elements_values_TreeValue), metadata: null},
        {...(mockTreeValueB as RECORD_FORM_recordForm_elements_values_TreeValue), metadata: null}
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

export const mockCommonFormElementProps = {
    record: mockRecordWhoAmI,
    recordValues: {},
    onValueDelete: jest.fn(),
    onValueSubmit: jest.fn()
};

export const mockRecordForm: RECORD_FORM_recordForm = {
    id: 'edition_form',
    library: {
        id: 'test_lib'
    },
    recordId: '123456',
    elements: [{...mockFormElementInput, settings: [{key: 'my_settings', value: 'value'}]}]
};
