// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
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
