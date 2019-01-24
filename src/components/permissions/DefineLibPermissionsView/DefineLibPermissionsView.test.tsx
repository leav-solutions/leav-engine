import {render} from 'enzyme';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import DefineLibPermissionsView from './DefineLibPermissionsView';

describe('DefineLibPermissionsView', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProvider>
                <DefineLibPermissionsView applyTo="test_lib" />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
