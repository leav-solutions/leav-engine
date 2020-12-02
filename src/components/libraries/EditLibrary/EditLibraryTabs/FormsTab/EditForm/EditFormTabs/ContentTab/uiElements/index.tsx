// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {FieldTypes, IUIElement, UIElementTypes} from '../_types';
import CheckboxField from './fields/CheckboxField';
import DateField from './fields/DateField';
import DropdownField from './fields/DropdownField';
import EncryptedField from './fields/EncryptedField';
import InputField from './fields/InputField';
import Container from './layout/Container';
import Tabs from './layout/Tabs';
import TextBlock from './layout/TextBlock';
import UiDivider from './layout/UiDivider';

const commonFieldSettings = ['attribute', 'label'];

export const layoutElements: {[type in UIElementTypes]: IUIElement} = {
    [UIElementTypes.FIELDS_CONTAINER]: {
        type: UIElementTypes.FIELDS_CONTAINER,
        component: <Container />,
        canDrop: () => true
    },
    [UIElementTypes.DIVIDER]: {
        type: UIElementTypes.DIVIDER,
        component: <UiDivider settings={{}} />,
        settings: ['title'],
        canDrop: () => false
    },
    [UIElementTypes.TEXT_BLOCK]: {
        type: UIElementTypes.TEXT_BLOCK,
        component: <TextBlock settings={{}} />,
        settings: ['content'],
        canDrop: () => false
    },
    [UIElementTypes.TABS]: {
        type: UIElementTypes.TABS,
        component: <Tabs settings={{}} />,
        settings: ['tabs'],
        canDrop: () => false
    }
};

export const formElements: {[type in FieldTypes]: IUIElement} = {
    [FieldTypes.TEXT_INPUT]: {
        type: FieldTypes.TEXT_INPUT,
        component: <InputField settings={{}} />,
        settings: [...commonFieldSettings],
        canDrop: () => false
    },
    [FieldTypes.CHECKBOX]: {
        type: FieldTypes.CHECKBOX,
        component: <CheckboxField settings={{}} />,
        settings: [...commonFieldSettings],
        canDrop: () => false
    },
    [FieldTypes.DATE]: {
        type: FieldTypes.DATE,
        component: <DateField settings={{}} />,
        settings: [...commonFieldSettings, 'withTime'],
        canDrop: () => false
    },
    [FieldTypes.ENCRYPTED]: {
        type: FieldTypes.ENCRYPTED,
        component: <EncryptedField settings={{}} />,
        settings: [...commonFieldSettings],
        canDrop: () => false
    },
    [FieldTypes.DROPDOWN]: {
        type: FieldTypes.DROPDOWN,
        component: <DropdownField settings={{}} />,
        settings: [...commonFieldSettings],
        canDrop: () => false
    }
};
