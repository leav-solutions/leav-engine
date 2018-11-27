import {render} from 'enzyme';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import * as sleep from 'sleep-promise';
import {getTreeContentQuery} from 'src/queries/trees/treeContentQuery';
import TreeStructure from './TreeStructure';

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
                                record: {
                                    id: '12345',
                                    label: {fr: 'Test'},
                                    library: {
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
            <MockedProvider mocks={mocks} addTypename={false}>
                <TreeStructure treeId={'test_tree'} />
            </MockedProvider>
        );

        await sleep(0);

        expect(comp).toMatchSnapshot();
    });
});
