import {render} from 'enzyme';
import {History} from 'history';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {Mockify} from '../../../_types//Mockify';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import EditLibrary from './EditLibrary';

describe('EditLibrary', () => {
    test('Snapshot test', async () => {
        const mockMatch: any = {params: {id: 'test'}};
        const mockHistory: Mockify<History> = {};

        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <EditLibrary match={mockMatch} history={mockHistory as History} />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
