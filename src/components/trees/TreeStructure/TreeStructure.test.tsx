import {MockedProvider} from '@apollo/react-testing';
import {InMemoryCache, IntrospectionFragmentMatcher} from 'apollo-cache-inmemory';
import {render} from 'enzyme';
import React from 'react';
import sleep from 'sleep-promise';
import {getTreeContentQuery} from '../../../queries/trees/treeContentQuery';
import TreeStructure from './TreeStructure';

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
                                children: []
                            }
                        ]
                    }
                }
            }
        ];

        const comp = render(
            <MockedProvider mocks={mocks} addTypename cache={new InMemoryCache({fragmentMatcher})}>
                <TreeStructure treeId={'test_tree'} />
            </MockedProvider>
        );

        await sleep(0);

        expect(comp).toMatchSnapshot();
    });
});
