// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {getTreeContentQuery} from '../../../queries/trees/treeContentQuery';
import {mockTree} from '../../../__mocks__/trees';
import TreeStructure from './TreeStructure';

jest.mock('../../../hooks/useLang');

jest.mock('./StructureView', () => {
    return function StructureView() {
        return <div>StructureView</div>;
    };
});

describe('EditTreeStructure', () => {
    test('Render tree structure', async () => {
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

        render(<TreeStructure tree={mockTree} />, {
            apolloMocks: mocks,
            cacheSettings: {possibleTypes: {Record: ['UsersGroup']}}
        });

        expect(screen.getByText('StructureView')).toBeInTheDocument();
    });
});
