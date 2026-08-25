import userEvent from '@testing-library/user-event';
import {
    CreateDirectoryDocument,
    DoesFileExistAsChildDocument,
    GetTreeLibrariesDocument,
    LibraryBehavior,
    TreeBehavior,
} from '_ui/_gqlTypes';
import {fireEvent, render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockTreeSimple} from '_ui/__mocks__/common/tree';
import CreateDirectory from './CreateDirectory';

vi.mock('_ui/components/SelectTreeNode', () => ({
    SelectTreeNode: () => <div>SelectTreeNode</div>,
}));

describe('UploadFiles', () => {
    const commonMocks = [
        {
            request: {
                query: GetTreeLibrariesDocument,
                variables: {
                    library: 'files_directories',
                },
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
                                            behavior: LibraryBehavior.directories,
                                        },
                                        settings: {
                                            allowMultiplePositions: false,
                                            allowedAtRoot: true,
                                            allowedChildren: ['files', 'files_directories'],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        },
    ];

    test('Should display create directory modal on first step', async () => {
        render(<CreateDirectory libraryId="files_directories" onClose={vi.fn()} />, {mocks: commonMocks});

        expect(screen.getByTestId('create-directory-modal')).toBeInTheDocument();
        expect(screen.getByTestId('select-tree-node')).toBeInTheDocument();
        expect(screen.getByTestId('next-btn')).toBeDisabled();
    });

    test('Should be on step 2 with default selected key', async () => {
        render(
            <CreateDirectory defaultSelectedKey="files_directories" libraryId="files_directories" onClose={vi.fn()} />,
            {mocks: commonMocks},
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
                    query: DoesFileExistAsChildDocument,
                    variables: {
                        treeId: 'files_tree',
                        parentNode: null,
                        filename: 'dirname',
                    },
                },
                result: {
                    data: {
                        doesFileExistAsChild: true,
                    },
                },
            },
            {
                request: {
                    query: GetTreeLibrariesDocument,
                    variables: {
                        library: 'files_directories',
                    },
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
                                                behavior: LibraryBehavior.directories,
                                            },
                                            settings: {
                                                allowMultiplePositions: false,
                                                allowedAtRoot: true,
                                                allowedChildren: ['files', 'files_directories'],
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
            {
                request: {
                    query: CreateDirectoryDocument,
                    variables: {
                        library: 'files_directories',
                        nodeId: 'files_tree',
                        name: 'dirname',
                    },
                },
                result: {
                    data: {
                        upload: {
                            __typename: 'RecordLib',
                            id: '1',
                            whoAmI: mockRecord,
                        },
                    },
                },
            },
        ];

        render(<CreateDirectory defaultSelectedKey="files_tree" libraryId="files_directories" onClose={vi.fn()} />, {
            mocks,
        });

        fireEvent.change(screen.getByTestId('directory-name-input'), {
            target: {
                value: 'dirname',
            },
        });

        const createBtn = screen.getByTestId('create-btn');

        await userEvent.click(createBtn);

        // Since antd 6, confirm modals render their title twice (modal header + confirm body),
        // so a plain getByText matches multiple elements. Target the confirm body one.
        await waitFor(() =>
            expect(
                screen.getByText('create_directory.duplicate_modal.title', {selector: '.ant-modal-confirm-title'}),
            ).toBeInTheDocument(),
        );
    });

    test('Directory name exists', async () => {
        const mocks = [
            {
                request: {
                    query: DoesFileExistAsChildDocument,
                    variables: {
                        treeId: 'files_tree',
                        parentNode: null,
                        filename: 'dirname',
                    },
                },
                result: {
                    data: {
                        doesFileExistAsChild: false,
                    },
                },
            },
            {
                request: {
                    query: GetTreeLibrariesDocument,
                    variables: {
                        library: 'files_directories',
                    },
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
                                                behavior: LibraryBehavior.directories,
                                            },
                                            settings: {
                                                allowMultiplePositions: false,
                                                allowedAtRoot: true,
                                                allowedChildren: ['files', 'files_directories'],
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
            {
                request: {
                    query: CreateDirectoryDocument,
                    variables: {
                        library: 'files_directories',
                        nodeId: 'files_tree',
                        name: 'dirname',
                    },
                },
                result: {
                    data: {
                        upload: {
                            __typename: 'RecordLib',
                            id: '1',
                            whoAmI: mockRecord,
                        },
                    },
                },
            },
        ];

        render(<CreateDirectory defaultSelectedKey="files_tree" libraryId="files_directories" onClose={vi.fn()} />, {
            mocks,
        });

        fireEvent.change(screen.getByTestId('directory-name-input'), {
            target: {
                value: 'dirname',
            },
        });

        userEvent.click(screen.getByTestId('create-btn'));

        await waitFor(() =>
            expect(screen.queryByTestId('create_directory.duplicate_modal.title')).not.toBeInTheDocument(),
        );
    });
});
