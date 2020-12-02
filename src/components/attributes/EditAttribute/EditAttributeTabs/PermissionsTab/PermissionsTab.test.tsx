// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {wait} from '@apollo/react-testing';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType, PermissionsRelation, Treepermissions_confInput} from '../../../../../_gqlTypes/globalTypes';
import {mockAttrAdv, mockAttrSimple} from '../../../../../__mocks__/attributes';
import {attributesFragmentMatcher} from '../../../../../__mocks__/fragmentMatchers/attributesFragmentMatchers';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import PermissionsTab from './PermissionsTab';

jest.mock(
    './PermissionsContent',
    () =>
        function PermissionsContent() {
            return <div>Permissions</div>;
        }
);

describe('PermissionsTab', () => {
    const attribute: GET_ATTRIBUTES_attributes_list = {
        ...mockAttrSimple,
        label: {fr: 'Test 1', en: null}
    };

    test('Render content', async () => {
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
                            totalCount: 1,
                            list: [
                                {
                                    ...mockAttrAdv,
                                    __typename: 'Attribute',
                                    versions_conf: null
                                }
                            ]
                        }
                    }
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <PermissionsTab attribute={attribute} readonly={false} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('PermissionsContent')).toHaveLength(1);
    });

    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributesQuery,
                    variables: {id: 'test_attr'}
                },
                error: new Error('boom!')
            }
        ];

        let comp;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <PermissionsTab attribute={attribute} readonly={false} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('div.error')).toHaveLength(1);
    });

    test('Save data on submit', async () => {
        let saveQueryCalled = false;
        const permConfToSave: Treepermissions_confInput = {
            permissionTreeAttributes: ['tree1', 'tree2'],
            relation: PermissionsRelation.and
        };

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
                            totalCount: 1,
                            list: [
                                {
                                    ...mockAttrAdv,
                                    __typename: 'Attribute',
                                    versions_conf: null
                                }
                            ]
                        }
                    }
                }
            },
            {
                request: {
                    query: saveAttributeQuery,
                    variables: {
                        attrData: {id: attribute.id, permissions_conf: permConfToSave}
                    }
                },
                result: () => {
                    saveQueryCalled = true;
                    return {
                        data: {
                            saveAttribute: {
                                ...attribute,
                                __typename: 'Attribute',
                                versions_conf: null
                            }
                        }
                    };
                }
            }
        ];

        const mockCache = new InMemoryCache({fragmentMatcher: attributesFragmentMatcher});
        mockCache.writeQuery({
            query: getAttributesQuery,
            variables: {id: 'simple_attribute'},
            data: {
                attributes: {
                    __typename: 'AttributesList',
                    totalCount: 1,
                    list: [
                        {
                            ...mockAttrSimple,
                            __typename: 'Attribute',
                            versions_conf: null
                        }
                    ]
                }
            }
        });

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} cache={mockCache}>
                    <PermissionsTab attribute={attribute} readonly={false} />
                </MockedProviderWithFragments>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        const submitFunc: any = comp.find('PermissionsContent').prop('onSubmitSettings');
        if (!!submitFunc) {
            await act(async () => {
                await submitFunc({...permConfToSave});
                await wait(0);
            });
        }

        expect(saveQueryCalled).toBe(true);
    });
});
