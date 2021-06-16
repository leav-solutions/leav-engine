// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes, IFormDividerSettings, IFormTabsSettings, TabsDirection} from '@leav/types';
import {FormElement} from 'components/RecordEdition/EditRecord/_types';
import React from 'react';
import {GET_FORM_forms_list} from '_gqlTypes/GET_FORM';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {mockAttributeLink, mockFormAttribute} from './attribute';

export const mockForm: GET_FORM_forms_list = {
    id: 'edition_form',
    library: {
        id: 'test_lib'
    },
    dependencyAttributes: [],
    elements: [
        {
            dependencyValue: null,
            elements: [
                {
                    id: '12345',
                    containerId: '__root',
                    settings: [{key: 'attribute', value: 'test_attribute'}],
                    type: FormElementTypes.field,
                    uiElementType: 'input',
                    attribute: mockFormAttribute
                }
            ]
        }
    ]
};

const formElementBase = {
    type: FormElementTypes.layout,
    attribute: null,
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

export const mockFormElementLink: FormElement<{}> = {
    ...formElementBase,
    id: 'link_element',
    containerId: '__root',
    settings: {attribute: 'test_attribute'},
    uiElement: () => <div>{FormFieldTypes.LINK}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.LINK,
    attribute: {...mockAttributeLink, system: false}
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
