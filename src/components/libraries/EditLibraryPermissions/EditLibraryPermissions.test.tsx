import {mount, render} from 'enzyme';
import * as React from 'react';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
import {PermissionsRelation} from 'src/_gqlTypes/globalTypes';
import {Mockify} from 'src/_types/Mockify';
import EditLibraryPermissions from './EditLibraryPermissions';

describe('EditLibraryPermissions', () => {
    test('Hide relation if 1 tree selected', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {
            id: 'test_lib',
            permissionsConf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'}],
                relation: PermissionsRelation.and
            }
        };

        const onSubmit = jest.fn();

        // TODO: replace render by shallow when bug with hooks fixed https://github.com/airbnb/enzyme/issues/1938
        const comp = render(
            <EditLibraryPermissions library={lib as GET_LIBRARIES_libraries} onSubmitSettings={onSubmit} />
        );

        expect(comp.find('input[name=relation]')).toHaveLength(0);
    });

    test('Show relation if more than 1 tree selected', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {
            id: 'test_lib',
            permissionsConf: {
                permissionTreeAttributes: [
                    {id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'},
                    {id: 'other_tree_attr', linked_tree: 'some_tree', label: 'Test'}
                ],
                relation: PermissionsRelation.and
            }
        };

        const onSubmit = jest.fn();

        const comp = render(
            <EditLibraryPermissions library={lib as GET_LIBRARIES_libraries} onSubmitSettings={onSubmit} />
        );

        expect(comp.find('input[name=relation]')).toHaveLength(2);
    });

    test('Call submit function on submit', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {
            id: 'test_lib',
            permissionsConf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'}],
                relation: PermissionsRelation.and
            }
        };

        const onSubmit = jest.fn();

        const comp = mount(
            <EditLibraryPermissions library={lib as GET_LIBRARIES_libraries} onSubmitSettings={onSubmit} />
        );
        comp.find('form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
