// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import {History, Location} from 'history';
import React from 'react';
import {Mockify} from '../../../_types//Mockify';
import MockedLangContextProvider from '../../../__mocks__/MockedLangContextProvider';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import EditTree from './EditTree';

describe('EditTree', () => {
    test('Snapshot test', async () => {
        const mockMatch: any = {params: {id: 'test'}};
        const mockHistory: Mockify<History> = {};
        const mockLocation: Mockify<Location> = {};

        const comp = render(
            <MockedProvider>
                <MockedLangContextProvider>
                    <MockedUserContextProvider>
                        <EditTree
                            match={mockMatch}
                            history={mockHistory as History}
                            location={mockLocation as Location}
                        />
                    </MockedUserContextProvider>
                </MockedLangContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
