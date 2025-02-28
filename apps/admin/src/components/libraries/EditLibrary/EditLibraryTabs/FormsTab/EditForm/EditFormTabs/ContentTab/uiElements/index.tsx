// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    GET_ATTRIBUTE_BY_ID_attributes_list,
    GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute
} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {AttributeType} from '_gqlTypes/globalTypes';
import {ISettingsAttributeProps} from '../FormLayout/SettingsEdition/SettingsField/SettingsInput/SettingsAttribute';
import {ISettingsFieldSelectProps} from '../FormLayout/SettingsEdition/SettingsField/SettingsInput/SettingsSelect';
import {
    FieldTypes,
    FormElementSettingsInputTypes,
    IFormElementSettings,
    IUIElement,
    SettingsFieldSpecificProps,
    TabsDirection,
    UIElementTypes
} from '../_types';
import CheckboxField from './fields/CheckboxField';
import DateField from './fields/DateField';
import DropdownField from './fields/DropdownField';
import EncryptedField from './fields/EncryptedField';
import InputField from './fields/InputField';
import LinkField from './fields/LinkField';
import TreeField from './fields/TreeField';
import Container from './layout/Container';
import Tabs from './layout/Tabs';
import TextBlock from './layout/TextBlock';
import UiDivider from './layout/UiDivider';

const commonFieldSettings: IFormElementSettings[] = [
    {
        name: 'attribute',
        inputType: FormElementSettingsInputTypes.ATTRIBUTE_SELECTION
    },
    {
        name: 'label',
        inputType: FormElementSettingsInputTypes.TRANSLATED_INPUT
    },
    {
        name: 'useAttributeLabel',
        inputType: FormElementSettingsInputTypes.CHECKBOX
    }
];

export const layoutElements: {[type in UIElementTypes]: IUIElement} = {
    [UIElementTypes.FIELDS_CONTAINER]: {
        type: UIElementTypes.FIELDS_CONTAINER,
        component: <Container />,
        canDrop: () => true
    },
    [UIElementTypes.DIVIDER]: {
        type: UIElementTypes.DIVIDER,
        component: <UiDivider settings={{}} />,
        settings: [
            {
                name: 'title',
                inputType: FormElementSettingsInputTypes.INPUT
            }
        ],
        canDrop: () => false
    },
    [UIElementTypes.TEXT_BLOCK]: {
        type: UIElementTypes.TEXT_BLOCK,
        component: <TextBlock settings={{}} />,
        settings: [{name: 'content', inputType: FormElementSettingsInputTypes.RTE}],
        canDrop: () => false
    },
    [UIElementTypes.TABS]: {
        type: UIElementTypes.TABS,
        component: <Tabs settings={{}} />,
        settings: [
            {name: 'tabs', inputType: FormElementSettingsInputTypes.NONE},
            {
                name: 'direction',
                inputType: FormElementSettingsInputTypes.SELECT,
                getInputSettings: (): SettingsFieldSpecificProps<ISettingsFieldSelectProps> => ({
                    options: [TabsDirection.HORIZONTAL, TabsDirection.VERTICAL]
                })
            }
        ],
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
        settings: [...commonFieldSettings, {name: 'withTime', inputType: FormElementSettingsInputTypes.CHECKBOX}],
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
    },
    [FieldTypes.LINK]: {
        type: FieldTypes.LINK,
        component: <LinkField settings={{}} />,
        settings: [
            ...commonFieldSettings,
            {
                name: 'columns',
                inputType: FormElementSettingsInputTypes.ATTRIBUTE_SELECTION_MULTIPLE,
                getInputSettings: (
                    attributeProps: GET_ATTRIBUTE_BY_ID_attributes_list
                ): SettingsFieldSpecificProps<ISettingsAttributeProps> => ({
                    multiple: true,
                    filters: {
                        // Links and trees are forbidden due to technical issues on the front to handle them
                        type: [AttributeType.simple, AttributeType.advanced]
                    },
                    library: (attributeProps as GET_ATTRIBUTE_BY_ID_attributes_list_LinkAttribute).linked_library.id
                })
            },
            {
                name: 'displayRecordIdentity',
                inputType: FormElementSettingsInputTypes.CHECKBOX,
                defaultValue: true
            }
        ],
        canDrop: () => false
    },
    [FieldTypes.TREE]: {
        type: FieldTypes.TREE,
        component: <TreeField settings={{}} />,
        settings: [...commonFieldSettings],
        canDrop: () => false
    }
};
