import {render} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {PermissionsRelation, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import DefineTreePermissions from './DefineTreePermissions';

describe('DefineTreePermissions', () => {
    test('Snapshot test', async () => {
        const mockConf = {
            permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'}],
            relation: PermissionsRelation.and
        };
        const comp = render(
            <MockedProvider>
                <DefineTreePermissions
                    permissions_conf={mockConf}
                    applyTo="test_lib"
                    permissionType={PermissionTypes.record}
                />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
