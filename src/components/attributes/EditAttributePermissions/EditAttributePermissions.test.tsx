import {mount} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import sleep from 'sleep-promise';
import EditAttributePermissions from '.';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {AttributeType, PermissionsRelation} from '../../../_gqlTypes/globalTypes';
import {mockAttrSimple, mockAttrTree} from '../../../__mocks__/attributes';

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
                            ...mockAttrTree,
                            __typename: 'Attribute',
                            label: {
                                fr: 'Attr 1'
                            },
                            id: 'test_tree_attr',
                            linked_tree: 'some_tree',
                            versionsConf: {
                                ...mockAttrTree.versionsConf,
                                __typename: 'valuesVersionsConf'
                            }
                        },
                        {
                            ...mockAttrTree,
                            __typename: 'Attribute',
                            label: {
                                fr: 'Attr 2'
                            },
                            id: 'other_test_tree_attr',
                            linked_tree: 'some_other_tree',
                            versionsConf: {
                                ...mockAttrTree.versionsConf,
                                __typename: 'valuesVersionsConf'
                            }
                        }
                    ]
                }
            }
        }
    ];

    test('Hide relation if 1 tree selected', async () => {
        const attr = {
            ...mockAttrSimple,
            permissionsConf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'}],
                relation: PermissionsRelation.and
            }
        };
        const onSubmit = jest.fn();

        const comp = mount(
            <MockedProvider mocks={mocks} addTypename>
                <EditAttributePermissions readOnly={false} attribute={attr} onSubmitSettings={onSubmit} />
            </MockedProvider>
        );
        await sleep(0);
        comp.update();

        expect(comp.find('input[name="relation"]')).toHaveLength(0);
    });

    test('Show relation if more than 1 tree selected', async () => {
        const attr = {
            ...mockAttrSimple,
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
                <EditAttributePermissions readOnly={false} attribute={attr} onSubmitSettings={onSubmit} />
            </MockedProvider>
        );
        await sleep(0);
        comp.update();

        expect(comp.find('input[name="relation"]')).toHaveLength(2);
    });

    test('Call submit function on submit', async () => {
        const attr = {
            ...mockAttrSimple,
            permissionsConf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'}],
                relation: PermissionsRelation.and
            }
        };
        const onSubmit = jest.fn();

        const comp = mount(
            <MockedProvider mocks={mocks} addTypename>
                <EditAttributePermissions readOnly={false} attribute={attr} onSubmitSettings={onSubmit} />
            </MockedProvider>
        );
        await sleep(0);
        comp.update();

        comp.find('form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
