import {MockedProvider} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
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
                    attributes: {
                        __typename: 'AttributesList',
                        totalCount: 2,
                        list: [
                            {
                                ...mockAttrTree,
                                __typename: 'Attribute',
                                label: {
                                    fr: 'Attr 1'
                                },
                                id: 'test_tree_attr',
                                linked_tree: 'some_tree',
                                versions_conf: {
                                    ...mockAttrTree.versions_conf,
                                    __typename: 'valuesversions_conf'
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
                                versions_conf: {
                                    ...mockAttrTree.versions_conf,
                                    __typename: 'valuesversions_conf'
                                }
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('Hide relation if 1 tree selected', async () => {
        const attr = {
            ...mockAttrSimple,
            permissions_conf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'}],
                relation: PermissionsRelation.and
            }
        };
        const onSubmit = jest.fn();

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <EditAttributePermissions readOnly={false} attribute={attr} onSubmitSettings={onSubmit} />
                </MockedProvider>
            );
        });

        act(() => {
            comp.update();
        });

        expect(comp.find('input[name="relation"]')).toHaveLength(0);
    });

    test('Show relation if more than 1 tree selected', async () => {
        const attr = {
            ...mockAttrSimple,
            permissions_conf: {
                permissionTreeAttributes: [
                    {id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'},
                    {id: 'other_test_tree_attr', linked_tree: 'some_other_tree', label: 'Test'}
                ],
                relation: PermissionsRelation.and
            }
        };
        const onSubmit = jest.fn();

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <EditAttributePermissions readOnly={false} attribute={attr} onSubmitSettings={onSubmit} />
                </MockedProvider>
            );
        });
        await sleep(0);
        comp.update();

        expect(comp.find('input[name="relation"]')).toHaveLength(2);
    });

    test('Call submit function on submit', async () => {
        const attr = {
            ...mockAttrSimple,
            permissions_conf: {
                permissionTreeAttributes: [{id: 'test_tree_attr', linked_tree: 'some_tree', label: 'Test'}],
                relation: PermissionsRelation.and
            }
        };
        const onSubmit = jest.fn();

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <EditAttributePermissions readOnly={false} attribute={attr} onSubmitSettings={onSubmit} />
                </MockedProvider>
            );
        });
        await sleep(0);
        comp.update();

        comp.find('form').simulate('submit');

        expect(onSubmit).toBeCalled();
    });
});
