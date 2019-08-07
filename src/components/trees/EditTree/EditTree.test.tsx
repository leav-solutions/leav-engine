import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import {History} from 'history';
import React from 'react';
import {Mockify} from '../../../_types//Mockify';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import EditTree from './EditTree';

describe('EditTree', () => {
    test('Snapshot test', async () => {
        const mockMatch: any = {params: {id: 'test'}};
        const mockHistory: Mockify<History> = {};

        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <EditTree match={mockMatch} history={mockHistory as History} />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
