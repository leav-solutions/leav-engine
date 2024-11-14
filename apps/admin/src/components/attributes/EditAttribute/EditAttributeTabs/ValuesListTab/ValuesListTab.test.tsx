// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from 'utils/testUtils';
import {getAttributeValuesListQuery} from '../../../../../queries/attributes/getAttributeValuesListQuery';
import {mockAttrSimple} from '../../../../../__mocks__/attributes';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import ValuesListTab from './ValuesListTab';

jest.mock(
    './ValuesListForm',
    () =>
        function ValuesListForm() {
            return <div>ValuesListForm</div>;
        }
);

describe('ValuesListTab', () => {
    test('Loading and success state', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributeValuesListQuery,
                    variables: {attrId: 'test_attr'}
                },
                result: {
                    data: {
                        attributes: {
                            __typename: 'AttributesList',
                            totalCount: 1,
                            list: [
                                {
                                    ...mockAttrSimple,
                                    id: 'simple_attribute_with_values_list',
                                    values_list: {
                                        __typename: 'ValuesListConf',
                                        enable: true,
                                        allowFreeEntry: false,
                                        allowListUpdate: false,
                                        values: ['value 1', 'value 2']
                                    },
                                    __typename: 'Attribute'
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
                    <ValuesListTab attributeId="test_attr" />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('ValuesListForm')).toHaveLength(1);
    });

    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributeValuesListQuery,
                    variables: {attrId: 'test_attr'}
                },
                error: new Error('boom!')
            }
        ];

        let comp;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <ValuesListTab attributeId="test_attr" />
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
});
