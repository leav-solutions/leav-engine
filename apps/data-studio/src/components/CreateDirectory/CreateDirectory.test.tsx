// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {createDirectoryMutation} from 'graphQL/mutations/directories/createDirectory';
import {uploadMutation} from 'graphQL/mutations/upload/uploadMutation';
import {doesFileExistAsChild} from 'graphQL/queries/records/doesFileExistAsChild';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {BrowserRouter} from 'react-router-dom';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';
import {act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/record';
import {mockTree} from '__mocks__/common/tree';
import CreateDirectory from './CreateDirectory';

jest.mock('uuid', () => {
    return {
        v4: jest.fn(() => 'uid')
    };
});

jest.mock('../shared/SelectTreeNode', () => {
    return function SelectTreeNode() {
        return <div>SelectTreeNode</div>;
    };
});

describe('UploadFiles', () => {
    test('Should display create directory modal on first step', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <CreateDirectory libraryId="files_directories" onClose={jest.fn()} />
                </BrowserRouter>
            );
        });

        expect(screen.getByTestId('create-directory-modal')).toBeInTheDocument();
        expect(screen.getByTestId('select-tree-node')).toBeInTheDocument();
        expect(screen.getByTestId('next-btn')).toBeDisabled();
    });

    test('Should be on step 2 with default selected key', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <CreateDirectory
                        defaultSelectedKey="files_directories"
                        libraryId="files_directories"
                        onClose={jest.fn()}
                    />
                </BrowserRouter>
            );
        });

        expect(screen.getByTestId('create-directory-modal')).toBeInTheDocument();
        expect(screen.getByTestId('directory-name-input')).toBeInTheDocument();
        expect(screen.getByTestId('prev-btn')).toBeEnabled();
        expect(screen.getByTestId('create-btn')).toBeDisabled();
    });

    test('Directory name exists', async () => {
        const mocks = [
            {
                request: {
                    query: doesFileExistAsChild,
                    variables: {
                        treeId: 'files_tree',
                        parentNode: null,
                        filename: 'dirname'
                    }
                },
                result: {
                    data: {
                        doesFileExistAsChild: true
                    }
                }
            },
            {
                request: {
                    query: getTreeLibraries,
                    variables: {
                        library: 'files_directories'
                    }
                },
                result: {
                    data: {
                        trees: {
                            totalCount: 1,
                            list: [
                                {
                                    ...mockTree,
                                    id: 'files_tree',
                                    system: true,
                                    behavior: TreeBehavior.files,
                                    libraries: [
                                        {
                                            library: {
                                                id: 'files_directories',
                                                label: 'files_directories',
                                                system: true,
                                                behavior: LibraryBehavior.directories
                                            },
                                            settings: {
                                                allowMultiplePositions: false,
                                                allowedAtRoot: true,
                                                allowedChildren: ['files', 'files_directories']
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
            {
                request: {
                    query: createDirectoryMutation,
                    variables: {
                        library: 'files_directories',
                        nodeId: 'files_tree',
                        name: 'dirname'
                    }
                },
                result: {
                    data: {
                        upload: {
                            __typename: 'RecordLib',
                            id: '1',
                            whoAmI: mockRecord
                        }
                    }
                }
            }
        ];

        let ctn;

        await act(async () => {
            const {container} = render(
                <BrowserRouter>
                    <CreateDirectory
                        defaultSelectedKey="files_tree"
                        libraryId="files_directories"
                        onClose={jest.fn()}
                    />
                </BrowserRouter>,
                {apolloMocks: mocks}
            );

            ctn = container;
        });

        await act(async () => {
            fireEvent.change(screen.getByTestId('directory-name-input'), {
                target: {
                    value: 'dirname'
                }
            });
        });

        const createBtn = screen.getByTestId('create-btn');

        await act(async () => {
            userEvent.click(createBtn);
        });

        await waitFor(() => expect(screen.getByText('create_directory.duplicate_modal.title')).toBeInTheDocument());
    });

    test('Directory name exists', async () => {
        const mocks = [
            {
                request: {
                    query: doesFileExistAsChild,
                    variables: {
                        treeId: 'files_tree',
                        parentNode: null,
                        filename: 'dirname'
                    }
                },
                result: {
                    data: {
                        doesFileExistAsChild: false
                    }
                }
            },
            {
                request: {
                    query: getTreeLibraries,
                    variables: {
                        library: 'files_directories'
                    }
                },
                result: {
                    data: {
                        trees: {
                            totalCount: 1,
                            list: [
                                {
                                    ...mockTree,
                                    id: 'files_tree',
                                    system: true,
                                    behavior: TreeBehavior.files,
                                    libraries: [
                                        {
                                            library: {
                                                id: 'files_directories',
                                                label: 'files_directories',
                                                system: true,
                                                behavior: LibraryBehavior.directories
                                            },
                                            settings: {
                                                allowMultiplePositions: false,
                                                allowedAtRoot: true,
                                                allowedChildren: ['files', 'files_directories']
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
            {
                request: {
                    query: createDirectoryMutation,
                    variables: {
                        library: 'files_directories',
                        nodeId: 'files_tree',
                        name: 'dirname'
                    }
                },
                result: {
                    data: {
                        upload: {
                            __typename: 'RecordLib',
                            id: '1',
                            whoAmI: mockRecord
                        }
                    }
                }
            }
        ];

        let ctn;

        await act(async () => {
            const {container} = render(
                <BrowserRouter>
                    <CreateDirectory
                        defaultSelectedKey="files_tree"
                        libraryId="files_directories"
                        onClose={jest.fn()}
                    />
                </BrowserRouter>,
                {apolloMocks: mocks}
            );

            ctn = container;
        });

        await act(async () => {
            fireEvent.change(screen.getByTestId('directory-name-input'), {
                target: {
                    value: 'dirname'
                }
            });
        });

        await act(async () => {
            userEvent.click(screen.getByTestId('create-btn'));
        });

        await waitFor(() =>
            expect(screen.queryByTestId('create_directory.duplicate_modal.title')).not.toBeInTheDocument()
        );
    });
});
