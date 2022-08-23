// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {saveTreeQuery} from 'queries/trees/saveTreeMutation';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {GET_TREES_trees_list} from '_gqlTypes/GET_TREES';
import {act, render, screen, waitFor, within} from '_tests/testUtils';
import {mockAttrTree} from '__mocks__/attributes';
import {mockTree} from '__mocks__/trees';
import TreeStructure from './TreeStructure';

describe('TreeStructure', () => {
    const _renderTreeStructure = (tree: GET_TREES_trees_list, readOnly: boolean = false, mocks?: MockedResponse[]) => {
        render(
            <DndProvider backend={TestBackend}>
                <TreeStructure tree={tree} readOnly={readOnly} />
            </DndProvider>,
            {apolloMocks: mocks}
        );
    };

    const tree = {
        ...mockTree,
        libraries: [
            {
                library: {id: 'test_lib', label: {fr: 'Test Lib'}, attributes: [{...mockAttrTree}]},
                settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: ['__all__']}
            },
            {
                library: {id: 'test_lib2', label: {fr: 'Test Lib 2'}, attributes: [{...mockAttrTree}]},
                settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: ['test_lib3']}
            },
            {
                library: {id: 'test_lib3', label: {fr: 'Test Lib 3'}, attributes: [{...mockAttrTree}]},
                settings: {allowMultiplePositions: false, allowedAtRoot: false, allowedChildren: []}
            }
        ]
    };

    test('Render tree structure with tree libraries and dependencies', async () => {
        _renderTreeStructure(tree);

        const librariesList = screen.getByTestId('libraries-list');
        const dependenciesEditor = screen.getByTestId('dependencies-editor');

        // All libraries must be present in the list
        for (const treeLibrary of tree.libraries) {
            expect(within(librariesList).getByText(treeLibrary.library.label.fr)).toBeInTheDocument();
        }

        // Root libraries must be present in the dependencies editor
        expect(within(dependenciesEditor).getByText('Test Lib')).toBeInTheDocument();
        expect(within(dependenciesEditor).getByText('Test Lib 2')).toBeInTheDocument();
        expect(within(dependenciesEditor).queryByText('Test Lib 3')).not.toBeInTheDocument();

        // Expend "Test Lib" dependencies to see all libraries
        const testLibLabel = within(dependenciesEditor).getByText('Test Lib');
        userEvent.click(testLibLabel);

        const testLibWrapper = screen.getAllByTestId('dependencies-library-item-test_lib')[0];
        const testLibAllowedChildren = within(testLibWrapper).getByTestId('allowed-children');
        for (const treeLibrary of tree.libraries) {
            expect(within(testLibAllowedChildren).getByText(treeLibrary.library.label.fr)).toBeInTheDocument();
        }
        userEvent.click(testLibLabel); // Collapse "Test Lib" dependencies

        // Expand "Test Lib 2" dependencies to see "Test Lib 3"
        userEvent.click(within(dependenciesEditor).getByText('Test Lib 2'));
        expect(within(dependenciesEditor).getByText('Test Lib 3')).toBeInTheDocument();

        // Expend "Test Lib 3" dependencies to see "no children allowed"
        userEvent.click(within(dependenciesEditor).getByText('Test Lib 3'));
        expect(within(dependenciesEditor).getByText(/no_children_allowed/)).toBeInTheDocument();
    });

    test('Can remove a library from dependencies by clicking on "remove"', async () => {
        let saveCalled = false;

        const mocks = [
            {
                request: {
                    query: saveTreeQuery,
                    variables: {
                        treeData: {
                            id: 'test_tree',
                            libraries: [
                                {
                                    library: 'test_lib',
                                    settings: {
                                        allowMultiplePositions: false,
                                        allowedAtRoot: true,
                                        allowedChildren: ['__all__']
                                    }
                                },
                                {
                                    library: 'test_lib2',
                                    settings: {
                                        allowMultiplePositions: false,
                                        allowedAtRoot: false,
                                        allowedChildren: ['test_lib3']
                                    }
                                },
                                {
                                    library: 'test_lib3',
                                    settings: {allowMultiplePositions: false, allowedAtRoot: false, allowedChildren: []}
                                }
                            ]
                        }
                    }
                },
                result: () => {
                    saveCalled = true;
                    return {
                        data: {
                            saveTree: {
                                ...tree,
                                libraries: [
                                    {
                                        library: {
                                            id: 'test_lib',
                                            label: {
                                                fr: 'test_lib!'
                                            },
                                            attributes: [],
                                            __typename: 'Library'
                                        },
                                        settings: {
                                            allowMultiplePositions: false,
                                            allowedAtRoot: true,
                                            allowedChildren: ['__all__']
                                        },
                                        __typename: 'TreeLibrary'
                                    },
                                    {
                                        library: {
                                            id: 'test_lib2',
                                            label: {
                                                en: '',
                                                fr: 'test_lib2'
                                            },
                                            attributes: [],
                                            __typename: 'Library'
                                        },
                                        settings: {
                                            allowMultiplePositions: false,
                                            allowedAtRoot: false,
                                            allowedChildren: ['test_lib3']
                                        },
                                        __typename: 'TreeLibrary'
                                    },
                                    {
                                        library: {
                                            id: 'test_lib3',
                                            label: {
                                                en: '',
                                                fr: 'test_lib3'
                                            },
                                            attributes: [],
                                            __typename: 'Library'
                                        },
                                        settings: {
                                            allowMultiplePositions: false,
                                            allowedAtRoot: false,
                                            allowedChildren: []
                                        },
                                        __typename: 'TreeLibrary'
                                    }
                                ],
                                __typename: 'Tree'
                            }
                        }
                    };
                }
            }
        ];

        _renderTreeStructure(tree, false, mocks);

        const dependenciesEditor = screen.getByTestId('dependencies-editor');
        const depsItemTestLib2 = within(dependenciesEditor).getByTestId('dependencies-library-item-test_lib2');

        await act(async () => {
            userEvent.click(within(depsItemTestLib2).getByRole('button', {name: /remove/}));
        });

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Can add a library by clicking on "plus"', async () => {
        let saveCalled = false;

        const mocks = [
            {
                request: {
                    query: saveTreeQuery,
                    variables: {
                        treeData: {
                            id: 'test_tree',
                            libraries: [
                                {
                                    library: 'test_lib',
                                    settings: {
                                        allowMultiplePositions: false,
                                        allowedAtRoot: true,
                                        allowedChildren: ['__all__']
                                    }
                                },
                                {
                                    library: 'test_lib2',
                                    settings: {
                                        allowMultiplePositions: false,
                                        allowedAtRoot: true,
                                        allowedChildren: ['test_lib3']
                                    }
                                },
                                {
                                    library: 'test_lib3',
                                    settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: []}
                                }
                            ]
                        }
                    }
                },
                result: () => {
                    saveCalled = true;
                    return {
                        data: {
                            saveTree: {
                                ...tree,
                                libraries: [
                                    {
                                        library: {
                                            id: 'test_lib',
                                            label: {
                                                fr: 'test_lib!'
                                            },
                                            attributes: [],
                                            __typename: 'Library'
                                        },
                                        settings: {
                                            allowMultiplePositions: false,
                                            allowedAtRoot: true,
                                            allowedChildren: ['__all__']
                                        },
                                        __typename: 'TreeLibrary'
                                    },
                                    {
                                        library: {
                                            id: 'test_lib2',
                                            label: {
                                                en: '',
                                                fr: 'test_lib2'
                                            },
                                            attributes: [],
                                            __typename: 'Library'
                                        },
                                        settings: {
                                            allowMultiplePositions: false,
                                            allowedAtRoot: true,
                                            allowedChildren: ['test_lib3']
                                        },
                                        __typename: 'TreeLibrary'
                                    },
                                    {
                                        library: {
                                            id: 'test_lib3',
                                            label: {
                                                en: '',
                                                fr: 'test_lib3'
                                            },
                                            attributes: [],
                                            __typename: 'Library'
                                        },
                                        settings: {
                                            allowMultiplePositions: false,
                                            allowedAtRoot: true,
                                            allowedChildren: []
                                        },
                                        __typename: 'TreeLibrary'
                                    }
                                ],
                                __typename: 'Tree'
                            }
                        }
                    };
                }
            }
        ];

        _renderTreeStructure(tree, false, mocks);

        const librariesList = screen.getByTestId('libraries-list');
        const libItemTestLib3 = within(librariesList).getByTestId('library-item-test_lib3');

        await act(async () => {
            userEvent.click(within(libItemTestLib3).getByRole('button', {name: /add/}));
        });

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('If read only, cannot do anything', async () => {
        _renderTreeStructure(tree, true);

        const librariesList = screen.getByTestId('libraries-list');
        const libItemTestLib3 = within(librariesList).getByTestId('library-item-test_lib3');
        expect(within(libItemTestLib3).queryByRole('button', {name: /add/})).not.toBeInTheDocument();

        const dependenciesEditor = screen.getByTestId('dependencies-editor');
        const depsItemTestLib2 = within(dependenciesEditor).getByTestId('dependencies-library-item-test_lib2');
        expect(within(depsItemTestLib2).queryByRole('button', {name: /remove/})).not.toBeInTheDocument();
    });
});
