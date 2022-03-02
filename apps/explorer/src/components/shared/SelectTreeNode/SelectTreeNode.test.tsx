// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act, render, screen, waitFor} from '_tests/testUtils';
import {mockTreeNodePermissions} from '__mocks__/common/treeElements';
import {treeContentQuery} from '../../../graphQL/queries/trees/getTreeContentQuery';
import SelectTreeNode from './SelectTreeNode';

describe('SelectTreeNode', () => {
    test('Render tree and navigate', async () => {
        const mocks = [
            {
                request: {
                    query: treeContentQuery,
                    variables: {
                        treeId: 'treeId',
                        startAt: null
                    }
                },
                result: {
                    data: {
                        treeContent: [
                            {
                                id: 'id1',
                                record: {
                                    id: 'id1',
                                    whoAmI: {
                                        id: 'id1',
                                        label: 'label1',
                                        color: null,
                                        library: {
                                            id: 'categories',
                                            label: {fr: 'Catégories'},
                                            gqlNames: {
                                                type: 'Categorie',
                                                query: 'categories',
                                                __typename: 'LibraryGraphqlNames'
                                            },
                                            __typename: 'Library'
                                        },
                                        preview: null,
                                        __typename: 'RecordIdentity'
                                    },
                                    __typename: 'Categorie'
                                },
                                childrenCount: 1,
                                permissions: mockTreeNodePermissions
                            }
                        ]
                    }
                }
            },
            {
                request: {
                    query: treeContentQuery,
                    variables: {
                        treeId: 'treeId',
                        startAt: 'id1'
                    }
                },
                result: {
                    data: {
                        treeContent: [
                            {
                                id: 'id2',
                                record: {
                                    id: 'id2',
                                    whoAmI: {
                                        __typename: 'RecordIdentity',
                                        id: 'id2',
                                        label: 'label2',
                                        color: null,
                                        library: {
                                            id: 'categories',
                                            label: {fr: 'Catégories'},
                                            gqlNames: {
                                                type: 'Categorie',
                                                query: 'categories',
                                                __typename: 'LibraryGraphqlNames'
                                            },
                                            __typename: 'Library'
                                        },
                                        preview: null
                                    },
                                    __typename: 'Categorie'
                                },
                                childrenCount: 0,
                                permissions: mockTreeNodePermissions,
                                __typename: 'TreeNode'
                            }
                        ]
                    }
                }
            }
        ];

        await act(async () => {
            render(<SelectTreeNode tree={{id: 'treeId', label: {fr: 'Tree Label'}}} onSelect={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings: {
                    possibleTypes: {
                        Record: ['Categorie']
                    }
                }
            });
        });

        await waitFor(() => screen.getByText('Tree Label'));
        expect(screen.getByText('Tree Label')).toBeInTheDocument();

        // Expand root => show first level element
        await act(async () => {
            userEvent.click(screen.getByRole('img', {name: 'toggle-children'}));
        });
        expect(screen.getByText('label1')).toBeInTheDocument();

        // Expand node => fetch children
        await act(async () => {
            userEvent.click(screen.getAllByRole('img', {name: 'toggle-children'}).pop());
        });
        expect(screen.getByText('label2')).toBeInTheDocument();
    });
});
