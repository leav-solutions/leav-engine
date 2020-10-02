import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import DefineTreePermissionsView from './DefineTreePermissionsView';

jest.mock('../../../hooks/useLang');

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
                    actions={[PermissionsActions.access]}
                />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
