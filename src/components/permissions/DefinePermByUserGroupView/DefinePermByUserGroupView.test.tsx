import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import {PermissionTypes} from '../../../_gqlTypes/globalTypes';
import DefinePermByUserGroupView from './DefinePermByUserGroupView';

jest.mock('../../../hooks/useLang');

describe('DefineAttrPermissionsView', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProvider>
                <DefinePermByUserGroupView type={PermissionTypes.attribute} applyTo="test_attr" readOnly={false} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
