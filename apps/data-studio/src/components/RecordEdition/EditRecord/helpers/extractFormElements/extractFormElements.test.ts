// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes} from '@leav/utils';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {mockFormElementContainer, mockFormElementInput, mockRecordForm} from '__mocks__/common/form';
import Container from '../../uiElements/Container';
import StandardField from '../../uiElements/StandardField';
import {extractFormElements} from './extractFormElements';

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
});
