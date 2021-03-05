// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes, IFormDividerSettings, IFormTabsSettings, TabsDirection} from '@leav/types';
import {FormElement} from 'components/RecordEdition/EditRecord/_types';
import React from 'react';
import {GET_FORM_forms_list} from '_gqlTypes/GET_FORM';
import {FormElementTypes} from '_gqlTypes/globalTypes';

export const mockForm: GET_FORM_forms_list = {
    id: 'edition_form',
    dependencyAttributes: [],
    elements: [
        {
            dependencyValue: null,
            elements: [
                {
                    id: '12345',
                    containerId: '__root',
                    settings: [],
                    type: FormElementTypes.field,
                    uiElementType: 'input'
                }
            ]
        }
    ]
};

export const mockFormElementContainer: FormElement<{}> = {
    id: 'container',
    containerId: '__root',
    settings: {},
    uiElement: () => <div>{FormUIElementTypes.FIELDS_CONTAINER}</div>,
    type: FormElementTypes.layout,
    uiElementType: FormUIElementTypes.FIELDS_CONTAINER
};

export const mockFormElementInput: FormElement<{}> = {
    id: 'input_element',
    containerId: '__root',
    settings: {},
    uiElement: () => <div>{FormFieldTypes.TEXT_INPUT}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.TEXT_INPUT
};

export const mockFormElementDate: FormElement<{}> = {
    id: 'date_element',
    containerId: '__root',
    settings: {},
    uiElement: () => <div>{FormFieldTypes.DATE}</div>,
    type: FormElementTypes.field,
    uiElementType: FormFieldTypes.DATE
};

export const mockFormElementTextBlock: FormElement<{}> = {
    id: 'text_block',
    containerId: '__root',
    settings: {
        content: '**text content**'
    },
    uiElement: () => <div>{FormUIElementTypes.TEXT_BLOCK}</div>,
    type: FormElementTypes.layout,
    uiElementType: FormUIElementTypes.TEXT_BLOCK
};

export const mockFormElementDivider: FormElement<IFormDividerSettings> = {
    id: 'divider',
    containerId: '__root',
    settings: {},
    uiElement: () => <div>{FormUIElementTypes.DIVIDER}</div>,
    type: FormElementTypes.layout,
    uiElementType: FormUIElementTypes.DIVIDER
};

export const mockFormElementTabs: FormElement<IFormTabsSettings> = {
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
    type: FormElementTypes.layout,
    uiElementType: FormUIElementTypes.TABS
};
