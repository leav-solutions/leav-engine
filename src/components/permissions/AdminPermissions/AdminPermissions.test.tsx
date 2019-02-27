import {render} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import AdminPermissions from './AdminPermissions';

describe('AdminPermissions', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProvider>
                <AdminPermissions />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
