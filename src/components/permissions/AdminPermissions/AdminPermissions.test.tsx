import {render} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';
import AdminPermissions from './AdminPermissions';

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
