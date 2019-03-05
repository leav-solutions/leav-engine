import {render} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';
import {Mockify} from '../../../_types//Mockify';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import DeleteLibrary from './DeleteLibrary';

describe('DeleteLibrary', () => {
    test('Disable button on system lib', async () => {
        const library: Mockify<GET_LIBRARIES_libraries> = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: true
        };
        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <DeleteLibrary library={library as GET_LIBRARIES_libraries} />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp.find('button.delete').prop('disabled')).toBe(true);
    });
});
