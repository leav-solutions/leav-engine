// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FieldTypes, IUIElement, UIElementTypes} from '../../_types';
import FakeComp from './FakeComp';

const baseMock = {
    component: <FakeComp />,
    canDrop: jest.fn(),
    settings: []
};

export const layoutElements: {[type in UIElementTypes]: IUIElement} = {
    [UIElementTypes.FIELDS_CONTAINER]: {
        ...baseMock,
        type: UIElementTypes.FIELDS_CONTAINER
    },
    [UIElementTypes.DIVIDER]: {
        ...baseMock,
        type: UIElementTypes.DIVIDER
    },
    [UIElementTypes.TEXT_BLOCK]: {
        ...baseMock,
        type: UIElementTypes.TEXT_BLOCK
    },
    [UIElementTypes.TABS]: {
        ...baseMock,
        type: UIElementTypes.TABS
    },
    [UIElementTypes.FRAME]: {
        ...baseMock,
        type: UIElementTypes.FRAME
    }
};

export const formElements: {[type in FieldTypes]: IUIElement} = {
    [FieldTypes.TEXT_INPUT]: {
        ...baseMock,
        type: FieldTypes.TEXT_INPUT
    },
    [FieldTypes.DATE]: {
        ...baseMock,
        type: FieldTypes.DATE
    },
    [FieldTypes.CHECKBOX]: {
        ...baseMock,
        type: FieldTypes.CHECKBOX
    },
    [FieldTypes.ENCRYPTED]: {
        ...baseMock,
        type: FieldTypes.ENCRYPTED
    },
    [FieldTypes.DROPDOWN]: {
        ...baseMock,
        type: FieldTypes.DROPDOWN
    },
    [FieldTypes.LINK]: {
        ...baseMock,
        type: FieldTypes.LINK
    },
    [FieldTypes.TREE]: {
        ...baseMock,
        type: FieldTypes.TREE
    }
};
