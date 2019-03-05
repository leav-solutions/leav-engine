import {render} from 'enzyme';
import {History} from 'history';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {match} from 'react-router';
import {Mockify} from '../../../_types//Mockify';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import EditAttribute, {IEditAttributeMatchParams} from './EditAttribute';

describe('EditAttribute', () => {
    test('Snapshot test', async () => {
        const mockMatch: Mockify<match<IEditAttributeMatchParams>> = {params: {id: 'test_attr'}};
        const mockHistory: Mockify<History> = {};

        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <EditAttribute
                        match={mockMatch as match<IEditAttributeMatchParams>}
                        history={mockHistory as History}
                    />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
