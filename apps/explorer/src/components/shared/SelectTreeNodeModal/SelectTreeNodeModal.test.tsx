// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen, waitForElement} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {getTreeContentQuery} from '../../../graphQL/queries/trees/getTreeContentQuery';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import SelectTreeNodeModal from './SelectTreeNodeModal';

describe('SelectTreeNodeModal', () => {
    test('Should render', async () => {
        const mocks = [
            {
                request: {
                    query: getTreeContentQuery(100),
                    variables: {
                        treeId: 'treeId'
                    }
                },
                result: {
                    data: {
                        treeContent: [
                            {
                                __typename: 'TreeNode',
                                record: {
                                    __typename: 'Categorie',
                                    id: 'id1',
                                    whoAmI: {
                                        __typename: 'RecordIdentity',
                                        id: 'id1',
                                        label: 'label1',
                                        color: null,
                                        preview: null,
                                        library: {
                                            __typename: 'Library',
                                            id: 'categories',
                                            label: {fr: 'Catégories'},
                                            gqlNames: {
                                                type: 'Categorie',
                                                query: 'categories',
                                                __typename: 'LibraryGraphqlNames'
                                            }
                                        }
                                    }
                                },
                                children: [
                                    {
                                        __typename: 'TreeNode',
                                        record: {
                                            __typename: 'Categorie',
                                            id: 'id2',
                                            whoAmI: {
                                                __typename: 'RecordIdentity',
                                                id: 'id2',
                                                label: 'label2',
                                                color: null,
                                                preview: null,
                                                library: {
                                                    __typename: 'Library',
                                                    id: 'categories',
                                                    label: {fr: 'Catégories'},
                                                    gqlNames: {
                                                        type: 'Categorie',
                                                        query: 'categories',
                                                        __typename: 'LibraryGraphqlNames'
                                                    }
                                                }
                                            }
                                        },
                                        children: []
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        ];

        const onSubmit = jest.fn();

        render(
            <MockedProviderWithFragments mocks={mocks}>
                <SelectTreeNodeModal
                    tree={{id: 'treeId', label: {fr: 'tree'}}}
                    visible={true}
                    onSubmit={onSubmit}
                    onClose={jest.fn()}
                />
            </MockedProviderWithFragments>
        );

        await waitForElement(() => screen.getByText('tree'));

        const root = screen.getByText('tree');
        const applyBtn = screen.getByRole('button', {name: 'global.apply'});

        expect(root).toBeInTheDocument();
        expect(applyBtn).toBeInTheDocument();

        await act(async () => {
            userEvent.click(root);
        });

        userEvent.click(applyBtn);

        expect(onSubmit).toBeCalledWith(
            expect.objectContaining({
                key: 'treeId',
                title: 'tree',
                children: [
                    {
                        children: [{children: [], key: 'categories/id2', title: 'label2'}],
                        key: 'categories/id1',
                        title: 'label1'
                    }
                ]
            })
        );
    });
});
