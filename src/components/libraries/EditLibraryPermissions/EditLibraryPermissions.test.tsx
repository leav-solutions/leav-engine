import {mount} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsRelation} from '../../../_gqlTypes/globalTypes';
import {Mockify} from '../../../_types//Mockify';
import EditLibraryPermissions from './EditLibraryPermissions';

describe('EditLibraryPermissions', () => {
    test('Hide relation if 1 tree selected', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {
            id: 'test_lib',
            permissions_conf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: {fr: 'Test'}}],
                relation: PermissionsRelation.and
            }
        };

        const onSubmit = jest.fn();

        const comp = mount(
            <MockedProvider>
                <EditLibraryPermissions
                    readOnly={false}
                    library={lib as GET_LIBRARIES_libraries}
                    onSubmitSettings={onSubmit}
                />
            </MockedProvider>
        );

        expect(comp.find('input[name="relation"]')).toHaveLength(0);
    });

    test('Show relation if more than 1 tree selected', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {
            id: 'test_lib',
            permissions_conf: {
                permissionTreeAttributes: [
                    {id: 'test_tree_attr', linked_tree: 'some_tree', label: {fr: 'Test'}},
                    {
                        id: 'other_tree_attr',
                        linked_tree: 'some_other_tree',
                        label: {fr: 'Test 2'}
                    }
                ],
                relation: PermissionsRelation.and
            }
        };

        const onSubmit = jest.fn();

        const comp = mount(
            <MockedProvider>
                <EditLibraryPermissions
                    readOnly={false}
                    library={lib as GET_LIBRARIES_libraries}
                    onSubmitSettings={onSubmit}
                />
            </MockedProvider>
        );

        expect(comp.find('input[name="relation"]')).toHaveLength(2);
    });

    test('Call submit function on submit', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {
            id: 'test_lib',
            permissions_conf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: {fr: 'Test'}}],
                relation: PermissionsRelation.and
            }
        };

        const onSubmit = jest.fn();

        const comp = mount(
            <MockedProvider>
                <EditLibraryPermissions
                    readOnly={false}
                    library={lib as GET_LIBRARIES_libraries}
                    onSubmitSettings={onSubmit}
                />
            </MockedProvider>
        );
        comp.find('form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
