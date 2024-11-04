// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import TreesSelector from '.';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';
import {TreeBehavior} from '../../../_gqlTypes/globalTypes';

jest.mock('../../../hooks/useLang');

describe('TreesSelector', () => {
    test('Snapshot test', async () => {
        const mocks = [
            {
                request: {
                    query: getTreesQuery
                },
                result: {
                    data: {
                        trees: {
                            __typename: 'TreesList',
                            totalCount: 1,
                            list: [
                                {
                                    __typename: 'Tree',
                                    id: 'test_tree',
                                    system: false,
                                    label: {
                                        en: 'TestTree',
                                        fr: 'TestTree'
                                    },
                                    behavior: TreeBehavior.standard,
                                    libraries: [
                                        {
                                            __typename: 'TreeLibrary',
                                            library: {
                                                id: 'test_lib',
                                                label: {fr: 'My Lib'},
                                                attributes: [],
                                                __typename: 'Library'
                                            },
                                            settings: {
                                                __typename: 'TreeLibrarySettings',
                                                allowMultiplePositions: true,
                                                allowedAtRoot: true,
                                                allowedChildren: ['__all__']
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        ];

        await act(async () => {
            render(<TreesSelector />, {apolloMocks: mocks});
        });

        expect(await screen.findByText('TestTree')).toBeInTheDocument();
    });
});
