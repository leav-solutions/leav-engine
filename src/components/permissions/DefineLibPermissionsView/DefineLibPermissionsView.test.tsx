import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import DefineLibPermissionsView from './DefineLibPermissionsView';

jest.mock('../../../hooks/useLang');

describe('DefineLibPermissionsView', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProvider>
                <DefineLibPermissionsView applyTo="test_lib" readOnly={false} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
