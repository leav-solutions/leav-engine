// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/react-testing';
import {InMemoryCache, IntrospectionFragmentMatcher} from 'apollo-cache-inmemory';
import {render} from 'enzyme';
import React from 'react';
import sleep from 'sleep-promise';
import {getTreeContentQuery} from '../../../queries/trees/treeContentQuery';
import {mockTree} from '../../../__mocks__/trees';
import TreeStructure from './TreeStructure';

jest.mock('../../../hooks/useLang');

const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: {
        __schema: {
            types: [
                {
                    kind: 'INTERFACE',
                    name: 'Record',
                    possibleTypes: [
                        {
                            name: 'UsersGroup'
                        }
                    ]
                }
            ]
        }
    }
});

describe('EditTreeStructure', () => {
    test('Snapshot test', async () => {
        const mocks = [
            {
                request: {
                    query: getTreeContentQuery,
                    variables: {
                        treeId: 'test_tree',
                        startAt: null
                    }
                },
                result: {
                    data: {
                        treeContent: [
                            {
                                __typename: 'TreeNode',
                                id: '12345',
                                order: 0,
                                record: {
                                    __typename: 'UsersGroups',
                                    id: '12345',
                                    label: {fr: 'Test'},
                                    library: {
                                        __typename: 'Library',
                                        id: 'test_lib',
                                        label: {fr: 'Test'}
                                    }
                                },
                                children: [],
                                ancestors: []
                            }
                        ]
                    }
                }
            }
        ];

        const comp = render(
            <MockedProvider mocks={mocks} addTypename cache={new InMemoryCache({fragmentMatcher})}>
                <TreeStructure tree={mockTree} />
            </MockedProvider>
        );

        await sleep(0);

        expect(comp).toMatchSnapshot();
    });
});
