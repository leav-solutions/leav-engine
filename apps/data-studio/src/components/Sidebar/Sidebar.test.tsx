// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {MemoryRouter} from 'react-router-dom';
import {act, render, screen} from '_tests/testUtils';
import {mockLibrary} from '__mocks__/common/library';
import {mockTree} from '__mocks__/common/tree';
import {FAVORITE_LIBRARIES_KEY, FAVORITE_TREES_KEY} from '../../constants';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
    test('Sidebar', async () => {
        const mocks = [
            {
                request: {
                    query: getUserDataQuery,
                    variables: {
                        keys: [FAVORITE_LIBRARIES_KEY, FAVORITE_TREES_KEY]
                    }
                },
                result: {
                    data: {
                        userData: {
                            global: false,
                            data: []
                        }
                    }
                }
            },
            {
                request: {
                    query: getTreeListQuery,
                    variables: {filters: {id: ['treeA', 'treeB']}}
                },
                result: {
                    data: {
                        trees: {
                            list: [
                                {
                                    ...mockTree,
                                    id: 'treeA'
                                },
                                {
                                    ...mockTree,
                                    id: 'treeB'
                                }
                            ]
                        }
                    }
                }
            },
            {
                request: {
                    query: getLibrariesListQuery,
                    variables: {filters: {id: ['libA', 'libB']}}
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'libA'
                                },
                                {
                                    ...mockLibrary,
                                    id: 'libB'
                                }
                            ]
                        }
                    }
                }
            }
        ];
        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>,
            {apolloMocks: mocks}
        );

        await act(async () => {
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        expect(screen.getByRole('menuitem', {name: /library/})).toBeInTheDocument();
        expect(screen.getByRole('menuitem', {name: /tree/})).toBeInTheDocument();
    });
});
