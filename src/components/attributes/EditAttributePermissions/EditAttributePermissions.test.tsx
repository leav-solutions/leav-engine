import {mount} from 'enzyme';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import * as sleep from 'sleep-promise';
import {getAttributesQuery} from 'src/queries/attributes/getAttributesQuery';
import {AttributeFormat, AttributeType, PermissionsRelation} from 'src/_gqlTypes/globalTypes';
import EditAttributePermissions from '.';

describe('EditAttributePermissions', () => {
    const mocks = [
        {
            request: {
                query: getAttributesQuery,
                variables: {type: [AttributeType.tree]}
            },
            result: {
                data: {
                    attributes: [
                        {
                            __typename: 'Attribute',
                            id: 'test_tree_attr',
                            type: AttributeType.tree,
                            format: null,
                            system: false,
                            label: {fr: 'Test tree', en: null},
                            linked_tree: 'some_tree',
                            permissionsConf: null
                        },
                        {
                            __typename: 'Attribute',
                            id: 'other_test_tree_attr',
                            type: AttributeType.tree,
                            format: null,
                            system: false,
                            label: {fr: 'Test tree 2', en: null},
                            linked_tree: 'some_other_tree',
                            permissionsConf: null
                        }
                    ]
                }
            }
        }
    ];

    test('Hide relation if 1 tree selected', async () => {
        const attr = {
            id: 'attr1',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 1', en: null},
            linked_tree: null,
            permissionsConf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'}],
                relation: PermissionsRelation.and
            }
        };
        const onSubmit = jest.fn();

        const comp = mount(
            <MockedProvider mocks={mocks} addTypename>
                <EditAttributePermissions attribute={attr} onSubmitSettings={onSubmit} />
            </MockedProvider>
        );
        await sleep(0);
        comp.update();

        expect(comp.find('input[name="relation"]')).toHaveLength(0);
    });

    test('Show relation if more than 1 tree selected', async () => {
        const attr = {
            id: 'attr1',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 1', en: null},
            linked_tree: null,
            permissionsConf: {
                permissionTreeAttributes: [
                    {id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'},
                    {id: 'other_test_tree_attr', linked_tree: 'some_other_tree', label: 'Test'}
                ],
                relation: PermissionsRelation.and
            }
        };
        const onSubmit = jest.fn();

        const comp = mount(
            <MockedProvider mocks={mocks} addTypename>
                <EditAttributePermissions attribute={attr} onSubmitSettings={onSubmit} />
            </MockedProvider>
        );
        await sleep(0);
        comp.update();

        expect(comp.find('input[name="relation"]')).toHaveLength(2);
    });

    test('Call submit function on submit', async () => {
        const attr = {
            id: 'attr1',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 1', en: null},
            linked_tree: null,
            permissionsConf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'}],
                relation: PermissionsRelation.and
            }
        };
        const onSubmit = jest.fn();

        const comp = mount(
            <MockedProvider mocks={mocks} addTypename>
                <EditAttributePermissions attribute={attr} onSubmitSettings={onSubmit} />
            </MockedProvider>
        );
        await sleep(0);
        comp.update();

        comp.find('form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
