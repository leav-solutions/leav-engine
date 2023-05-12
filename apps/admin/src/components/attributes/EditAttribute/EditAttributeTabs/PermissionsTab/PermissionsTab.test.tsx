// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from 'utils/testUtils';
import {render, screen} from '_tests/testUtils';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {AttributeType, PermissionsRelation, Treepermissions_confInput} from '../../../../../_gqlTypes/globalTypes';
import {mockAttrAdv, mockAttrSimple} from '../../../../../__mocks__/attributes';
import {attributesPossibleTypes} from '../../../../../__mocks__/fragmentMatchers/attributesFragmentMatchers';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import PermissionsTab from './PermissionsTab';

jest.mock(
    './PermissionsContent',
    () =>
        function PermissionsContent() {
            return <div>PermissionsContent</div>;
        }
);

describe('PermissionsTab', () => {
    const attribute = {
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

        render(
            <MockedProviderWithFragments mocks={mocks}>
                <PermissionsTab attribute={attribute} readonly={false} />
            </MockedProviderWithFragments>,
            {apolloMocks: mocks}
        );

        expect(screen.getByText('PermissionsContent')).toBeInTheDocument();
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

        const mockCache = new InMemoryCache({possibleTypes: attributesPossibleTypes});
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
