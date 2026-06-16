import {render, screen, waitFor, fireEvent} from '_ui/_tests/testUtils';
import {ExportProfileSelectionModal} from './ExportProfileSelectionModal';
import {LibraryExportProfilesDocument} from '_ui/_gqlTypes';

// Mock the root element for modal
beforeAll(() => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
});

describe('ExportProfileSelectionModal', () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();
    const libraryId = 'test_library';

    const validExportProfiles = {
        libraries: {
            list: [
                {
                    id: libraryId,
                    exportProfiles: {
                        defaultProfile: 'Profile 1',
                        profiles: [
                            {
                                label: 'Profile 1',
                                columns: [
                                    {columnLabel: 'Name', attribute: 'name'},
                                    {columnLabel: 'Email', attribute: 'email'},
                                ],
                            },
                            {
                                label: 'Profile 2',
                                columns: [
                                    {columnLabel: 'Title', attribute: 'title'},
                                    {columnLabel: 'Description', attribute: 'description'},
                                ],
                            },
                            {
                                label: 'Profile broken',
                                columns: [],
                                error: {message: 'This profile is broken'},
                            },
                        ],
                    },
                },
            ],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render modal with profiles', async () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            expect(screen.getByText('Profile 1')).toBeInTheDocument();
            expect(screen.getByText('Profile 2')).toBeInTheDocument();
        });
    });

    test('should select default profile by default', async () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            const radio = screen.getByDisplayValue('Profile 1');
            expect(radio).toBeChecked();
        });
    });

    test('should show loading state', () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
                delay: 1000,
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        // Verify that profiles are not yet loaded (loading state)
        expect(screen.queryByText('Profile 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Profile 2')).not.toBeInTheDocument();
    });

    test('should call onConfirm with selected profile', async () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            expect(screen.getByText('Profile 2')).toBeInTheDocument();
        });

        // Select Profile 2
        const profile2Radio = screen.getByDisplayValue('Profile 2');
        fireEvent.click(profile2Radio);

        // Click export button
        const exportButton = screen.getByRole('button', {name: /export/i});
        fireEvent.click(exportButton);

        expect(mockOnConfirm).toHaveBeenCalledWith('Profile 2');
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('should call onClose when cancel button is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            expect(screen.getByText('Profile 1')).toBeInTheDocument();
        });

        const cancelButton = screen.getByRole('button', {name: /cancel/i});
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
        expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    test('should filter profiles based on search term', async () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            expect(screen.getByText('Profile 1')).toBeInTheDocument();
            expect(screen.getByText('Profile 2')).toBeInTheDocument();
        });

        // Search for "Profile 1"
        const searchInput = screen.getByPlaceholderText(/search/i);
        fireEvent.change(searchInput, {target: {value: 'Profile 1'}});

        await waitFor(() => {
            expect(screen.getByText('Profile 1')).toBeInTheDocument();
            expect(screen.queryByText('Profile 2')).not.toBeInTheDocument();
        });
    });

    test('should display column preview for selected profile', async () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            expect(screen.getByText('Profile 1')).toBeInTheDocument();
        });

        // By default, Profile 1 should be selected
        await waitFor(() => {
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('Email')).toBeInTheDocument();
        });

        // Select Profile 2
        const profile2Radio = screen.getByDisplayValue('Profile 2');
        fireEvent.click(profile2Radio);

        // Profile 2 columns should be displayed
        await waitFor(() => {
            expect(screen.getByText('Title')).toBeInTheDocument();
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.queryByText('Name')).not.toBeInTheDocument();
            expect(screen.queryByText('Email')).not.toBeInTheDocument();
        });
    });

    test('should show error state when no profiles are available', async () => {
        const emptyProfiles = {
            libraries: {
                list: [
                    {
                        id: libraryId,
                        exportProfiles: null,
                    },
                ],
            },
        };

        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: emptyProfiles,
                },
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
        });

        // Should disable export button in error state
        expect(screen.queryByRole('button', {name: /export/i})).toBeDisabled();
    });

    test('should show error state when no profile has error', async () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            expect(screen.getByText('Profile broken')).toBeInTheDocument();
        });

        // Select Profile broken
        const profileBrokenRadio = screen.getByDisplayValue('Profile broken');
        fireEvent.click(profileBrokenRadio);

        // Profile broken columns should be displayed
        await waitFor(() => {
            expect(screen.getByText('This profile is broken')).toBeVisible();
        });

        // Should disable export button in error state
        expect(screen.queryByRole('button', {name: /export/i})).toBeDisabled();
    });

    test('should disable export button when isLoading is true', async () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
            },
        ];

        render(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                isLoading={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            expect(screen.getByText('Profile 1')).toBeInTheDocument();
        });

        const exportButton = screen.getByRole('button', {name: /export/i});
        expect(exportButton).toBeDisabled();
    });

    test('should not skip query when modal is open', async () => {
        const mocks = [
            {
                request: {
                    query: LibraryExportProfilesDocument,
                    variables: {libraryId: [libraryId]},
                },
                result: {
                    data: validExportProfiles,
                },
            },
        ];

        const {rerender} = render(
            <ExportProfileSelectionModal
                open={false}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        // Modal is closed, query should be skipped
        expect(screen.queryByText('Profile 1')).not.toBeInTheDocument();

        // Open the modal
        rerender(
            <ExportProfileSelectionModal
                open={true}
                libraryId={libraryId}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
        );

        await waitFor(() => {
            expect(screen.getByText('Profile 1')).toBeInTheDocument();
        });
    });
});
