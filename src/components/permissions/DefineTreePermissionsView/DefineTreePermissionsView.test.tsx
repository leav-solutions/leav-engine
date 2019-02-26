import {render} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {PermissionTypes} from '../../../_gqlTypes/globalTypes';
import DefineTreePermissionsView from './DefineTreePermissionsView';

describe('DefineTreePermissionsView', () => {
    test('Snapshot test', async () => {
        const mockTree = {
            id: 'test_tree_attr',
            linked_tree: 'test_tree',
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
