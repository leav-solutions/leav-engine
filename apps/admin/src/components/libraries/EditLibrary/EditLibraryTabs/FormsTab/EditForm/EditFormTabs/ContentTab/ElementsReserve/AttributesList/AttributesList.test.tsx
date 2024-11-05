// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from 'utils/testUtils';
import {getAttributesQuery} from '../../../../../../../../../../queries/attributes/getAttributesQuery';
import {mockAttrSimple} from '../../../../../../../../../../__mocks__/attributes';
import MockedProviderWithFragments from '../../../../../../../../../../__mocks__/MockedProviderWithFragments';
import AttributesList from './AttributesList';

jest.mock('./ReserveAttribute', () => function ReserveAttribute() {
        return <div>ReserveAttribute</div>;
    });

jest.mock('../../formBuilderReducer/hook/useFormBuilderReducer');

describe('AttributesList', () => {
    test('Snapshot test', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributesQuery,
                    variables: {libraries: ['ubs']}
                },
                result: {
                    data: {
                        attributes: {
                            __typename: 'AttributesList',
                            totalCount: 0,
                            list: [
                                {
                                    ...mockAttrSimple,
                                    __typename: 'Attribute',
                                    label: {
                                        fr: 'Attr 1'
                                    },
                                    id: 'test_tree_attr',
                                    versions_conf: null
                                },
                                {
                                    ...mockAttrSimple,
                                    __typename: 'Attribute',
                                    label: {
                                        fr: 'Attr 2'
                                    },
                                    id: 'other_test_tree_attr',
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
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <AttributesList />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('ReserveAttribute')).toHaveLength(2);
    });
});
