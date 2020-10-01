import {wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {AttributeType} from '../../../_gqlTypes/globalTypes';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import AttributeSelector from './AttributeSelector';

jest.mock('./AttributeSelectorField', () => {
    return function AttributeSelectorField() {
        return <div>AttributeSelectorField</div>;
    };
});

describe('AttributeSelector', () => {
    test('Loading and success state', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributesQuery,
                    variables: {
                        type: [AttributeType.tree]
                    }
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
                    <AttributeSelector filters={{type: [AttributeType.tree]}} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('AttributeSelectorField')).toHaveLength(1);
    });

    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributesQuery
                },
                error: new Error('Boom!')
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <AttributeSelector />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('[data-test-id="error"]')).toHaveLength(1);
    });
});
