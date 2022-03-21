// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getTreeNodeChildrenQuery} from 'queries/trees/treeNodeChildrenQuery';
import React from 'react';
import {render, screen} from '_tests/testUtils';
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
                    query: getTreeNodeChildrenQuery,
                    variables: {
                        treeId: 'test_tree',
                        node: null
                    }
                },
                result: {
                    data: {
                        treeNodeChildren: [
                            {
                                __typename: 'TreeNodeLight',
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
                                }
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
