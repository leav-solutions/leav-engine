import {
    GET_FORM_forms_list,
    GET_FORM_forms_list_elements_elements
} from '../../../../../../../../../../_gqlTypes/GET_FORM';
import {FormElementTypes} from '../../../../../../../../../../_gqlTypes/globalTypes';
import {formElements, layoutElements} from '../../uiElements/__mocks__';
import {FieldTypes, IFormElement, UIElementTypes} from '../../_types';
import {defaultContainerId, defaultDepAttribute, defaultDepValue, IFormBuilderState} from '../formBuilderReducer';

const commonFieldData1 = {
    id: '987654',
    order: 0,
    type: FormElementTypes.field,
    containerId: '123456'
};
export const field1: GET_FORM_forms_list_elements_elements = {
    ...commonFieldData1,
    settings: [
        {key: 'label', value: 'My Field'},
        {key: 'attribute', value: 'price'}
    ],
    uiElementType: FieldTypes.TEXT_INPUT
};
export const formElem1: IFormElement = {
    ...commonFieldData1,
    settings: {
        label: 'My Field',
        attribute: 'price'
    },
    uiElement: formElements[field1.uiElementType]
};

const commonFieldData2 = {
    id: '987653',
    order: 0,
    type: FormElementTypes.field,
    containerId: '123457'
};
export const field2: GET_FORM_forms_list_elements_elements = {
    ...commonFieldData2,
    uiElementType: FieldTypes.TEXT_INPUT,
    settings: [
        {key: 'label', value: 'Other Field'},
        {key: 'attribute', value: 'label'}
    ]
};
export const formElem2: IFormElement = {
    ...commonFieldData2,
    settings: {
        label: 'Other Field',
        attribute: 'label'
    },
    uiElement: formElements[field2.uiElementType]
};

const commonFieldData3 = {
    id: '987652',
    order: 3,
    type: FormElementTypes.field,
    containerId: '123456'
};
export const field3: GET_FORM_forms_list_elements_elements = {
    ...commonFieldData3,
    settings: [
        {key: 'label', value: 'My Field for categ'},
        {key: 'attribute', value: 'price'}
    ],
    uiElementType: FieldTypes.TEXT_INPUT
};
export const formElem3: IFormElement = {
    ...commonFieldData3,
    settings: {
        label: 'My Field for categ',
        attribute: 'price'
    },
    uiElement: formElements[field3.uiElementType]
};

const commonFieldData4 = {
    id: '987652',
    order: 1,
    type: FormElementTypes.field,
    containerId: '123456'
};
export const field4: GET_FORM_forms_list_elements_elements = {
    ...commonFieldData4,
    settings: [
        {key: 'label', value: 'My Field for categ 2'},
        {key: 'attribute', value: 'price'}
    ],
    uiElementType: FieldTypes.TEXT_INPUT
};
export const formElem4: IFormElement = {
    ...commonFieldData4,
    settings: {
        label: 'My Field for categ 2',
        attribute: 'price'
    },
    uiElement: formElements[field4.uiElementType]
};

export const formData: GET_FORM_forms_list = {
    id: 'edition_form',
    system: false,
    dependencyAttributes: [{id: 'category', label: {fr: 'Category'}, linked_tree: 'categories'}],
    label: {
        en: 'OK!',
        fr: 'Formulaire édition'
    },
    elements: [
        {
            dependencyValue: null,
            elements: [
                {
                    id: '123',
                    order: 0,
                    type: FormElementTypes.layout,
                    uiElementType: UIElementTypes.FIELDS_CONTAINER,
                    containerId: defaultContainerId,
                    settings: []
                },
                {
                    id: '456',
                    order: 1,
                    type: FormElementTypes.layout,
                    uiElementType: UIElementTypes.DIVIDER,
                    containerId: defaultContainerId,
                    settings: [
                        {
                            key: 'title',
                            value: 'divide'
                        }
                    ]
                },
                {
                    id: '789',
                    order: 2,
                    type: FormElementTypes.layout,
                    uiElementType: UIElementTypes.FIELDS_CONTAINER,
                    containerId: defaultContainerId,
                    settings: []
                },
                {
                    ...field1
                },
                {
                    ...field2
                }
            ]
        },
        {
            dependencyValue: {attribute: 'category', value: {id: '12345', library: 'category'}},
            elements: [
                {
                    ...field3
                }
            ]
        }
    ]
};

export const formDataWithTypename = {
    id: 'edition',
    label: {fr: 'Edition'},
    system: false,
    elements: [
        {
            dependencyValue: null,
            elements: [
                {
                    id: '0947521a-a352-4fd1-a459-4039e04a10fa',
                    containerId: '__root',
                    order: 0,
                    type: 'layout',
                    uiElementType: 'divider',
                    settings: [],
                    __typename: 'FormElement'
                },
                {
                    id: 'd0a785a2-ff60-40fe-86b0-cfd13c51d567',
                    containerId: '__root',
                    order: 1,
                    type: 'field',
                    uiElementType: 'checkbox',
                    settings: [
                        {key: 'attribute', value: 'active', __typename: 'FormElementSettings'},
                        {key: 'label', value: 'Actif', __typename: 'FormElementSettings'}
                    ],
                    __typename: 'FormElement'
                }
            ],
            __typename: 'FormElementsByDeps'
        }
    ],
    dependencyAttributes: [
        {id: 'category', label: {fr: 'Catégorie'}, linked_tree: 'categories', __typename: 'TreeAttribute'}
    ],
    __typename: 'Form'
};

export const initialState: IFormBuilderState = {
    form: formData,
    library: 'ubs',
    activeDependency: null,
    openSettings: false,
    elementInSettings: null,
    elements: {
        [defaultDepAttribute]: {
            [defaultDepValue]: {
                [defaultContainerId]: [
                    {
                        id: '123456',
                        containerId: defaultContainerId,
                        type: FormElementTypes.layout,
                        order: 0,
                        settings: {},
                        uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                    },
                    {
                        id: '456',
                        containerId: defaultContainerId,
                        type: FormElementTypes.layout,
                        order: 1,
                        settings: {
                            title: 'divide'
                        },
                        uiElement: layoutElements[UIElementTypes.DIVIDER]
                    },
                    {
                        id: '123457',
                        containerId: defaultContainerId,
                        type: FormElementTypes.layout,
                        order: 2,
                        settings: {},
                        uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
                    }
                ],
                '123456': [
                    {
                        ...formElem1
                    },
                    {
                        ...formElem4
                    }
                ],
                '123457': [
                    {
                        ...formElem2
                    }
                ]
            }
        },
        category: {
            'category/12345': {
                '123456': [
                    {
                        ...formElem3
                    }
                ]
            }
        }
    },
    activeElements: {
        [defaultContainerId]: [
            {
                id: '123456',
                containerId: defaultContainerId,
                type: FormElementTypes.layout,
                order: 0,
                settings: {},
                uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
            },
            {
                id: '456',
                containerId: defaultContainerId,
                type: FormElementTypes.layout,
                order: 1,
                settings: {
                    title: 'divide'
                },
                uiElement: layoutElements[UIElementTypes.DIVIDER]
            },
            {
                id: '123457',
                containerId: defaultContainerId,
                type: FormElementTypes.layout,
                order: 2,
                settings: {},
                uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
            }
        ],
        '123456': [
            {
                ...formElem1,
                herited: false
            },
            {
                ...formElem4,
                herited: false
            }
        ],
        '123457': [
            {
                ...formElem2,
                herited: false
            }
        ]
    }
};
