// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {Mockify} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import * as gqlTypes from '_ui/_gqlTypes';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import SelectTreeNode from './SelectTreeNode';

describe('SelectTreeNode', () => {
    test('Render tree and navigate', async () => {
        const mockResultFromRoot = {
            treeNodeChildren: {
                totalCount: 1,
                list: [
                    {
                        id: 'id1',
                        record: {
                            id: 'id1',
                            active: true,
                            whoAmI: {
                                id: 'id1',
                                label: 'label1',
                                color: null,
                                library: {
                                    id: 'categories',
                                    label: {fr: 'Catégories'},
                                    behavior: gqlTypes.LibraryBehavior.standard,
                                    __typename: 'Library'
                                },
                                preview: null,
                                __typename: 'RecordIdentity'
                            },
                            __typename: 'Categorie'
                        },
                        childrenCount: 1
                    }
                ]
            }
        };

        const mockResultFromChild = {
            treeNodeChildren: {
                totalCount: 1,
                list: [
                    {
                        id: 'id2',
                        record: {
                            id: 'id2',
                            active: true,
                            whoAmI: {
                                __typename: 'RecordIdentity',
                                id: 'id2',
                                label: 'label2',
                                color: null,
                                library: {
                                    id: 'categories',
                                    label: {fr: 'Catégories'},
                                    behavior: gqlTypes.LibraryBehavior.standard,
                                    __typename: 'Library'
                                },
                                preview: null
                            },
                            __typename: 'Categorie'
                        },
                        childrenCount: 0,
                        __typename: 'TreeNode'
                    }
                ]
            }
        };

        const mockResult: Mockify<
            QueryResult<gqlTypes.TreeNodeChildrenQuery, gqlTypes.TreeNodeChildrenQueryVariables>
        > = {
            called: true,
            loading: false,
            error: null
        };

        const spy = jest
            .spyOn(gqlTypes, 'useTreeNodeChildrenLazyQuery')
            .mockReturnValue([
                jest
                    .fn()
                    .mockImplementation(({variables}) =>
                        variables.node === null ? {data: mockResultFromRoot} : {data: mockResultFromChild}
                    ),
                mockResult as QueryResult<gqlTypes.TreeNodeChildrenQuery, gqlTypes.TreeNodeChildrenQueryVariables>
            ]);

        render(<SelectTreeNode tree={{id: 'treeId', label: {fr: 'Tree Label'}}} onSelect={jest.fn()} />);

        await waitFor(() => screen.getByText('Tree Label'));
        expect(screen.getByText('Tree Label')).toBeInTheDocument();

        // First level loaded
        expect(await screen.findByText('label1')).toBeInTheDocument();

        // Expand node => fetch children
        await userEvent.click(screen.getAllByRole('img', {name: 'plus-square'}).pop());
        await waitFor(() => expect(screen.getByText('label2')).toBeInTheDocument());

        spy.mockRestore();
    });
});
