// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {LibraryBehavior, TreeBehavior} from '_ui/_gqlTypes';
import {createDirectoryMutation} from '_ui/_queries/files/createDirectory';
import {doesFileExistAsChild} from '_ui/_queries/records/doesFileExistAsChild';
import {getTreeLibraries} from '_ui/_queries/trees/getTreeLibraries';
import {fireEvent, render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockTreeSimple} from '_ui/__mocks__/common/tree';
import CreateDirectory from './CreateDirectory';

jest.mock('uuid', () => ({
        v4: jest.fn(() => 'uid')
    }));

jest.mock('_ui/components/SelectTreeNode', () => ({
    SelectTreeNode: () => <div>SelectTreeNode</div>
}));

describe('UploadFiles', () => {
    const commonMocks = [
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
                                ...mockTreeSimple,
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
        }
    ];

    test('Should display create directory modal on first step', async () => {
        render(<CreateDirectory libraryId="files_directories" onClose={jest.fn()} />, {mocks: commonMocks});

        expect(screen.getByTestId('create-directory-modal')).toBeInTheDocument();
        expect(screen.getByTestId('select-tree-node')).toBeInTheDocument();
        expect(screen.getByTestId('next-btn')).toBeDisabled();
    });

    test('Should be on step 2 with default selected key', async () => {
        render(
            <CreateDirectory
                defaultSelectedKey="files_directories"
                libraryId="files_directories"
                onClose={jest.fn()}
            />,
            {mocks: commonMocks}
        );

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
                                    ...mockTreeSimple,
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

        render(<CreateDirectory defaultSelectedKey="files_tree" libraryId="files_directories" onClose={jest.fn()} />, {
            mocks
        });

        fireEvent.change(screen.getByTestId('directory-name-input'), {
            target: {
                value: 'dirname'
            }
        });

        const createBtn = screen.getByTestId('create-btn');

        await userEvent.click(createBtn);

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
                                    ...mockTreeSimple,
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

        render(<CreateDirectory defaultSelectedKey="files_tree" libraryId="files_directories" onClose={jest.fn()} />, {
            mocks
        });

        fireEvent.change(screen.getByTestId('directory-name-input'), {
            target: {
                value: 'dirname'
            }
        });

        userEvent.click(screen.getByTestId('create-btn'));

        await waitFor(() =>
            expect(screen.queryByTestId('create_directory.duplicate_modal.title')).not.toBeInTheDocument()
        );
    });
});
