// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes} from '@leav/utils';
import {FormElementTypes} from '_ui/_gqlTypes';
import {mockFormElementContainer, mockFormElementInput, mockRecordForm} from '_ui/__mocks__/common/form';
import Container from '../../uiElements/Container';
import StandardField from '../../uiElements/StandardField';
import {extractFormElements} from './extractFormElements';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';

jest.mock(
    '../../uiElements/StandardField',
    () =>
        function MockStandardField() {
            return <div>StandardField</div>;
        }
);

describe('extractFormElements', () => {
    test('Return form elements grouped by container', async () => {
        const baseForm = {
            ...mockRecordForm,
            elements: [
                {
                    ...mockFormElementInput,
                    id: 'rootElem1',
                    containerId: '__root',
                    settings: [{key: 'foo', value: 'bar'}],
                    attribute: null,
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT
                },
                {
                    ...mockFormElementContainer,
                    id: 'rootElem2',
                    containerId: '__root',
                    settings: [],
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER
                },
                {
                    ...mockFormElementContainer,
                    id: 'containerElem1',
                    containerId: 'rootElem2',
                    settings: [],
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER
                },
                {
                    ...mockFormElementInput,
                    id: 'subContainerElem1',
                    containerId: 'containerElem1',
                    settings: [],
                    attribute: null,
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT
                }
            ]
        };

        const convertForm = extractFormElements(baseForm);

        const expectation = {
            __root: [
                {
                    ...mockFormElementInput,
                    id: 'rootElem1',
                    containerId: '__root',
                    settings: {foo: 'bar'},
                    attribute: null,
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT,
                    uiElement: StandardField
                },
                {
                    ...mockFormElementContainer,
                    id: 'rootElem2',
                    containerId: '__root',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
                    uiElement: Container
                }
            ],
            rootElem2: [
                {
                    ...mockFormElementContainer,
                    id: 'containerElem1',
                    containerId: 'rootElem2',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.layout,
                    uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
                    uiElement: Container
                }
            ],
            containerElem1: [
                {
                    ...mockFormElementInput,
                    id: 'subContainerElem1',
                    containerId: 'containerElem1',
                    settings: {},
                    attribute: null,
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT,
                    uiElement: StandardField
                }
            ]
        };

        // Test on stringified objext due to failure caused by some object references
        expect(convertForm).toEqual(expectation);
    });

    test('Return form label when element useAttributeLabel is false', async () => {
        const baseForm = {
            ...mockRecordForm,
            elements: [
                {
                    ...mockFormElementInput,
                    id: 'rootElem1',
                    containerId: '__root',
                    settings: [
                        {key: 'foo', value: 'bar'},
                        {key: 'useAttributeLabel', value: false},
                        {key: 'label', value: {en: 'element 1 label', fr: 'libellé 1 élément'}}
                    ],
                    attribute: {
                        ...mockFormAttribute,
                        label: {en: 'attribute label', fr: 'libellé attribut'}
                    },
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT
                },
                {
                    ...mockFormElementInput,
                    id: 'rootElem2',
                    containerId: '__root',
                    settings: [
                        {key: 'foo', value: 'bar'},
                        {key: 'useAttributeLabel', value: false},
                        {key: 'label', value: {en: 'element 2 label', fr: 'libellé élément 2'}}
                    ],
                    attribute: {
                        ...mockFormAttribute,
                        label: {en: 'attribute label 2', fr: 'libellé attribut 2'}
                    },
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT
                }
            ]
        };

        const convertForm = extractFormElements(baseForm);

        const expectation = {
            __root: [
                {
                    ...mockFormElementInput,
                    id: 'rootElem1',
                    containerId: '__root',
                    settings: {
                        foo: 'bar',
                        label: {en: 'element 1 label', fr: 'libellé 1 élément'},
                        useAttributeLabel: false
                    },
                    attribute: {
                        ...baseForm.elements[0].attribute
                    },
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT,
                    uiElement: StandardField
                },
                {
                    ...mockFormElementInput,
                    id: 'rootElem2',
                    containerId: '__root',
                    settings: {
                        foo: 'bar',
                        label: {en: 'element 2 label', fr: 'libellé élément 2'},
                        useAttributeLabel: false
                    },
                    attribute: {
                        ...baseForm.elements[1].attribute
                    },
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT,
                    uiElement: StandardField
                }
            ]
        };

        // Test on stringified objext due to failure caused by some object references
        expect(convertForm).toEqual(expectation);
    });

    test('Return attribute label when element useAttributeLabel is true', async () => {
        const baseForm = {
            ...mockRecordForm,
            elements: [
                {
                    ...mockFormElementInput,
                    id: 'rootElem1',
                    containerId: '__root',
                    settings: [
                        {key: 'foo', value: 'bar'},
                        {key: 'useAttributeLabel', value: true},
                        {key: 'label', value: {en: 'element 1 label', fr: 'libellé 1 élément'}}
                    ],
                    attribute: {
                        ...mockFormAttribute,
                        label: {en: 'attribute label', fr: 'libellé attribut'}
                    },
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT
                },
                {
                    ...mockFormElementInput,
                    id: 'rootElem2',
                    containerId: '__root',
                    settings: [
                        {key: 'foo', value: 'bar'},
                        {key: 'useAttributeLabel', value: true},
                        {key: 'label', value: {en: 'element 2 label', fr: 'libellé élément 2'}}
                    ],
                    attribute: {
                        ...mockFormAttribute,
                        label: {en: 'attribute label 2', fr: 'libellé attribut 2'}
                    },
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT
                }
            ]
        };

        const convertForm = extractFormElements(baseForm);

        const expectation = {
            __root: [
                {
                    ...mockFormElementInput,
                    id: 'rootElem1',
                    containerId: '__root',
                    settings: {
                        foo: 'bar',
                        label: {en: 'attribute label', fr: 'libellé attribut'},
                        useAttributeLabel: true
                    },
                    attribute: {
                        ...baseForm.elements[0].attribute
                    },
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT,
                    uiElement: StandardField
                },
                {
                    ...mockFormElementInput,
                    id: 'rootElem2',
                    containerId: '__root',
                    settings: {
                        foo: 'bar',
                        label: {en: 'attribute label 2', fr: 'libellé attribut 2'},
                        useAttributeLabel: true
                    },
                    attribute: {
                        ...baseForm.elements[1].attribute
                    },
                    type: FormElementTypes.field,
                    uiElementType: FormFieldTypes.TEXT_INPUT,
                    uiElement: StandardField
                }
            ]
        };

        // Test on stringified objext due to failure caused by some object references
        expect(convertForm).toEqual(expectation);
    });
});
