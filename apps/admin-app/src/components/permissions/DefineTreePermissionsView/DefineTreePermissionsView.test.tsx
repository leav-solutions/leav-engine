// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {render} from 'enzyme';
import React from 'react';
import {PermissionTypes} from '../../../_gqlTypes/globalTypes';
import DefineTreePermissionsView from './DefineTreePermissionsView';

jest.mock('../../../hooks/useLang');

describe('DefineTreePermissionsView', () => {
    test('Snapshot test', async () => {
        const mockTree = {
            id: 'test_tree_attr',
            linked_tree: {id: 'test_tree'},
            label: {fr: 'Test'}
        };

        const comp = render(
            <MockedProvider>
                <DefineTreePermissionsView
                    treeAttribute={mockTree}
                    permissionType={PermissionTypes.record}
                    applyTo="test_lib"
                />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
