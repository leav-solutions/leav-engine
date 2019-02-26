import {render} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {GET_PERMISSIONSVariables} from '../../../_gqlTypes/GET_PERMISSIONS';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import EditPermissions from './EditPermissions';

describe('EditPermissions', () => {
    test('Snapshot test', async () => {
        const permParams: GET_PERMISSIONSVariables = {
            type: PermissionTypes.admin,
            actions: [PermissionsActions.create_library, PermissionsActions.edit_library],
            usersGroup: '1234567'
        };

        const comp = render(
            <MockedProvider>
                <EditPermissions permParams={permParams} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
