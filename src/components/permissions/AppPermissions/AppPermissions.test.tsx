import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import AppPermissions from './AppPermissions';

jest.mock('../../../hooks/useLang');

describe('AppPermissions', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <AppPermissions />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
