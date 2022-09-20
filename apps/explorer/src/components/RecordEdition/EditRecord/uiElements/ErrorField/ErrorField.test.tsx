// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {render, screen} from '_tests/testUtils';
import ErrorField from './ErrorField';

describe('ErrorField', () => {
    test('Render test', async () => {
        const formElement = {
            id: 'some_field',
            containerId: '__root',
            type: FormElementTypes.layout,
            attribute: null,
            valueError: 'Boom!',
            values: null,
            settings: {
                label: 'Some field'
            },
            uiElement: null,
            uiElementType: null
        };
        render(<ErrorField element={formElement} onValueSubmit={jest.fn()} onValueDelete={jest.fn()} />);

        expect(screen.getByText('Some field')).toBeInTheDocument();
        expect(screen.getByText('Boom!')).toBeInTheDocument();
    });
});
