import {render} from 'enzyme';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import DeleteLibrary from './DeleteLibrary';

describe('DeleteLibrary', () => {
    test('Disable button on system lib', async () => {
        const library = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: true,
            attributes: []
        };
        const comp = render(
            <MockedProvider>
                <DeleteLibrary library={library} />
            </MockedProvider>
        );

        expect(comp.find('button.delete').prop('disabled')).toBe(true);
    });
});
