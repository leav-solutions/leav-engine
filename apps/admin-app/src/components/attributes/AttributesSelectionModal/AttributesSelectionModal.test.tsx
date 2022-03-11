// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from 'utils/testUtils';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {AttributeType} from '../../../_gqlTypes/globalTypes';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import AttributesSelectionModal from './AttributesSelectionModal';

jest.mock('./AttributesSelectionList', () => {
    return function AttributesSelectionList() {
        return <div>AttributesSelectionList</div>;
    };
});

describe('AttributesSelection', () => {
    test('Loading and success state', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributesQuery
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
        const onSubmit = jest.fn();
        const onClose = jest.fn();
        const selection = [];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <AttributesSelectionModal onSubmit={onSubmit} onClose={onClose} openModal selection={selection} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('AttributesSelectionList')).toHaveLength(1);
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
        const onSubmit = jest.fn();
        const onClose = jest.fn();
        const selection = [];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <AttributesSelectionModal onSubmit={onSubmit} onClose={onClose} openModal selection={selection} />
                </MockedProviderWithFragments>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('.error')).toHaveLength(1);
    });

    test('Apply filters', async () => {
        const filter = {
            type: [AttributeType.simple]
        };

        const mocks = [
            {
                request: {
                    query: getAttributesQuery,
                    variables: filter
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
        const onSubmit = jest.fn();
        const onClose = jest.fn();
        const selection = [];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks} addTypename>
                    <AttributesSelectionModal
                        onSubmit={onSubmit}
                        onClose={onClose}
                        openModal
                        selection={selection}
                        filter={filter}
                    />
                </MockedProviderWithFragments>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('AttributesSelectionList')).toHaveLength(1);
    });
});
