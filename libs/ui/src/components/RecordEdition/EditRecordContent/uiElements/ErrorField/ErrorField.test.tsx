// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormElementTypes} from '_ui/_gqlTypes';
import {render, screen} from '_ui/_tests/testUtils';
import ErrorField from './ErrorField';
import {MockedLangContextProvider} from '_ui/testing';

describe('ErrorField', () => {
    test('Render test with fr label', async () => {
        const formElement = {
            id: 'some_field',
            containerId: '__root',
            type: FormElementTypes.layout,
            attribute: null,
            valueError: 'Boom!',
            values: null,
            settings: {
                label: {fr: 'Un champ', en: 'Some field'}
            },
            uiElement: null,
            uiElementType: null
        };
        render(
            <MockedLangContextProvider>
                <ErrorField
                    element={formElement}
                    onValueSubmit={jest.fn()}
                    onValueDelete={jest.fn()}
                    onDeleteMultipleValues={jest.fn()}
                />
            </MockedLangContextProvider>
        );

        expect(screen.getByText('Un champ')).toBeInTheDocument();
        expect(screen.getByText('Boom!')).toBeInTheDocument();
    });
    test('Render test with fallback lang label', async () => {
        const formElement = {
            id: 'some_field',
            containerId: '__root',
            type: FormElementTypes.layout,
            attribute: null,
            valueError: 'Boom!',
            values: null,
            settings: {
                label: {en: 'Some field'}
            },
            uiElement: null,
            uiElementType: null
        };
        render(
            <MockedLangContextProvider>
                <ErrorField
                    element={formElement}
                    onValueSubmit={jest.fn()}
                    onValueDelete={jest.fn()}
                    onDeleteMultipleValues={jest.fn()}
                />
            </MockedLangContextProvider>
        );

        expect(screen.getByText('Some field')).toBeInTheDocument();
        expect(screen.getByText('Boom!')).toBeInTheDocument();
    });
});
