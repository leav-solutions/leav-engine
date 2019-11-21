import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import AdminPermissions from './AdminPermissions';

jest.mock('../../../hooks/useLang');

describe('AdminPermissions', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <AdminPermissions />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
