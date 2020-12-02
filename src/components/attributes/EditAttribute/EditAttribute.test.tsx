// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {mockAttrAdv} from '../../../__mocks__/attributes';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import EditAttribute from './EditAttribute';

jest.mock(
    './EditAttributeTabs',
    () =>
        function EditAttributeTabs() {
            return <div>Edit attribute tabs</div>;
        }
);

describe('EditAttribute', () => {
    test('Loading and success state', async () => {
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

        let comp;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <EditAttribute attributeId="test_attr" />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('EditAttributeTabs')).toHaveLength(1);
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
                    <EditAttribute attributeId="test_attr" />
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

    test('Unknown attribute', async () => {
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
                            totalCount: 0,
                            list: []
                        }
                    }
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <EditAttribute attributeId="test_attr" />
                </MockedProviderWithFragments>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('div.unknown')).toHaveLength(1);
    });

    test('If no ID provided, display tabs directly (new attribute)', async () => {
        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <EditAttribute />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('EditAttributeTabs')).toHaveLength(1);
    });
});
