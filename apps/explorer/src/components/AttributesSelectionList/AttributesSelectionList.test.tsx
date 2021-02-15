// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {getAttributesByLibQuery} from '../../queries/attributes/getAttributesByLib';
import {AttributeType} from '../../_gqlTypes/globalTypes';
import {AttributeFormat} from '../../_types/types';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import AttributesSelectionList from './AttributesSelectionList';

describe('AttributesSelectionList', () => {
    test('Should render', () => {
        //TODO write better tests when UI refactoring is done
        const mocks = [
            {
                request: {
                    query: getAttributesByLibQuery,
                    variables: {
                        library: 'test_lib'
                    }
                },
                result: {
                    data: {
                        libraries: {
                            __typename: 'LibrariesList',
                            list: [
                                {
                                    __typename: 'Library',
                                    id: 'test_lib',
                                    system: false,
                                    label: {},
                                    attributes: {
                                        __typename: 'Attribute',
                                        id: 'string',
                                        type: AttributeType.simple,
                                        format: AttributeFormat.text,
                                        label: {fr: 'test attribute'}
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const comp = render(
            <MockedProviderWithFragments mocks={mocks}>
                <AttributesSelectionList selectedAttributes={[]} library="test_lib" onSelectionChange={jest.fn()} />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
