// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import SortableTree from 'react-sortable-tree';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {Mockify} from '../../../../../_types/Mockify';
import {mockAttrAdv} from '../../../../../__mocks__/attributes';
import EmbeddedFieldsTab from './EmbeddedFieldsTab';

describe('EmbeddedFieldsTab', () => {
    test('should return something', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributesQuery,
                    variables: {id: 'test_attr'}
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

        const mockAttribute: Mockify<GET_ATTRIBUTES_attributes_list> = {};
        let comp;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks}>
                    <EmbeddedFieldsTab attribute={mockAttribute as GET_ATTRIBUTES_attributes_list} />
                </MockedProvider>
            );
        });

        expect(comp.find('div').exists()).toBeTruthy();
    });

    test('should use SortableTree', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributesQuery,
                    variables: {id: 'test_attr'}
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

        const mockAttribute: Mockify<GET_ATTRIBUTES_attributes_list> = {};
        let comp;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks}>
                    <EmbeddedFieldsTab attribute={mockAttribute as GET_ATTRIBUTES_attributes_list} />
                </MockedProvider>
            );
        });

        expect(comp.find(SortableTree).exists()).toBeTruthy();
    });
});
