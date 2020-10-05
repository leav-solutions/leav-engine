import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import {GET_PERMISSIONSVariables} from '../../../_gqlTypes/GET_PERMISSIONS';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import EditPermissions from './EditPermissions';

describe('EditPermissions', () => {
    test('Snapshot test', async () => {
        const permParams: GET_PERMISSIONSVariables = {
            type: PermissionTypes.app,
            actions: [PermissionsActions.app_create_library, PermissionsActions.app_edit_library],
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
