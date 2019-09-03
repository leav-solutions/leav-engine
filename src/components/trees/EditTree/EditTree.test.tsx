import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import {History} from 'history';
import React from 'react';
import {Mockify} from '../../../_types//Mockify';
import MockedLangContextProvider from '../../../__mocks__/MockedLangContextProvider';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import EditTree from './EditTree';

describe('EditTree', () => {
    test('Snapshot test', async () => {
        const mockMatch: any = {params: {id: 'test'}};
        const mockHistory: Mockify<History> = {};

        const comp = render(
            <MockedProvider>
                <MockedLangContextProvider>
                    <MockedUserContextProvider>
                        <EditTree match={mockMatch} history={mockHistory as History} />
                    </MockedUserContextProvider>
                </MockedLangContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
