// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {GetLibraryPreviewsSettingsDocument} from '_ui/_gqlTypes';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {GeneratePreviewsModal} from './GeneratePreviewsModal';

const libraryId = 'files';

const mockLibraryPreviewsSettings = {
    libraries: {
        list: [
            {
                id: libraryId,
                label: {fr: 'Fichiers', en: 'Files'},
                behavior: 'standard',
                previewsSettings: [
                    {
                        label: {fr: 'Aperçu système', en: 'System preview'},
                        description: null,
                        system: true,
                        versions: {
                            background: '#ffffff',
                            density: 72,
                            sizes: [
                                {name: 'small', size: 32},
                                {name: 'medium', size: 64},
                            ],
                        },
                    },
                ],
            },
        ],
    },
};

const mocks: MockedResponse[] = [
    {
        request: {
            query: GetLibraryPreviewsSettingsDocument,
            variables: {id: libraryId},
        },
        result: {
            data: mockLibraryPreviewsSettings,
        },
    },
];

beforeAll(() => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
});

describe('GeneratePreviewsModal', () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render tree with preview sizes when data is loaded', async () => {
        render(
            <GeneratePreviewsModal
                open={true}
                libraryId={libraryId}
                isGeneratingPreviews={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        const tree = await screen.findByRole('tree');
        expect(tree).toBeInTheDocument();

        // Tree is populated - root node (select all) is rendered
        expect(await screen.findByText('files.previews_generation_select_all')).toBeInTheDocument();
    });

    test('should show loading state', () => {
        const mocksWithDelay: MockedResponse[] = [
            {
                request: {
                    query: GetLibraryPreviewsSettingsDocument,
                    variables: {id: libraryId},
                },
                result: {data: mockLibraryPreviewsSettings},
                delay: 1_000,
            },
        ];

        render(
            <GeneratePreviewsModal
                open={true}
                libraryId={libraryId}
                isGeneratingPreviews={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks: mocksWithDelay},
        );

        expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    });

    test('should show error when query fails', async () => {
        const errorMocks: MockedResponse[] = [
            {
                request: {
                    query: GetLibraryPreviewsSettingsDocument,
                    variables: {id: libraryId},
                },
                error: new Error('Network error'),
            },
        ];

        render(
            <GeneratePreviewsModal
                open={true}
                libraryId={libraryId}
                isGeneratingPreviews={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks: errorMocks},
        );

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    test('should disable generate button when no preview size is selected', async () => {
        render(
            <GeneratePreviewsModal
                open={true}
                libraryId={libraryId}
                isGeneratingPreviews={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        await waitFor(() => {
            expect(screen.getByRole('tree')).toBeInTheDocument();
        });

        const generateButton = screen.getByRole('button', {name: /generate/i});
        expect(generateButton).toBeDisabled();
    });

    test('should call onConfirm with previewSizes and isFailedOnly when generate is clicked', async () => {
        render(
            <GeneratePreviewsModal
                open={true}
                libraryId={libraryId}
                isGeneratingPreviews={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        // Wait for tree to be populated (async data load)
        const rootNode = await screen.findByText('files.previews_generation_select_all');
        await userEvent.click(rootNode);

        const generateButton = screen.getByRole('button', {name: /generate/i});
        await waitFor(() => {
            expect(generateButton).not.toBeDisabled();
        });

        await userEvent.click(generateButton);

        expect(mockOnConfirm).toHaveBeenCalledWith(['small', 'medium'], false);
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('should call onConfirm with isFailedOnly true when switch is toggled', async () => {
        render(
            <GeneratePreviewsModal
                open={true}
                libraryId={libraryId}
                isGeneratingPreviews={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
            {mocks},
        );

        // Wait for tree to be populated (async data load)
        const rootNode = await screen.findByText('files.previews_generation_select_all');
        await userEvent.click(rootNode);

        const switchElement = screen.getByRole('switch');
        await userEvent.click(switchElement);

        const generateButton = screen.getByRole('button', {name: /generate/i});
        await userEvent.click(generateButton);

        expect(mockOnConfirm).toHaveBeenCalledWith(['small', 'medium'], true);
    });
});
