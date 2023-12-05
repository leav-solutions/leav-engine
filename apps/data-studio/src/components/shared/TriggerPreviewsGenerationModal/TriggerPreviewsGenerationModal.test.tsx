// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {forcePreviewsGenerationMutation} from 'graphQL/mutations/files/forcePreviewsGenerationMutation';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {act} from 'react-dom/test-utils';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockLibrary, mockLibraryPermissions} from '__mocks__/common/library';
import TriggerPreviewsGenerationModal from './TriggerPreviewsGenerationModal';

describe('TriggerPreviewsGenerationModal', () => {
    const mockLibBase = {
        ...mockLibrary,
        permissions: mockLibraryPermissions,
        previewsSettings: [
            {
                description: null,
                system: true,
                label: {fr: 'PreviewSettings1', en: 'PreviewSettings1'},
                versions: {
                    background: 'background',
                    density: 1,
                    sizes: [
                        {
                            name: 'PreviewSettings1ChildName',
                            size: 'PreviewSettings1ChildSize'
                        }
                    ]
                }
            }
        ]
    };

    test('Display confirm message and trigger mutation', async () => {
        let mutationCalled;

        const mocks = [
            {
                request: {
                    query: getLibrariesListQuery,
                    variables: {
                        filters: {
                            id: ['files']
                        }
                    }
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    ...mockLibBase,
                                    id: 'files'
                                }
                            ]
                        }
                    }
                }
            },
            {
                request: {
                    query: forcePreviewsGenerationMutation,
                    variables: {
                        libraryId: 'files',
                        recordIds: ['123456'],
                        filters: null,
                        failedOnly: false,
                        previewVersionSizeNames: ['PreviewSettings1ChildName']
                    }
                },
                result: () => {
                    mutationCalled = true;

                    return {
                        data: {
                            forcePreviewsGeneration: true
                        }
                    };
                }
            }
        ];

        render(<TriggerPreviewsGenerationModal libraryId={'files'} recordIds={['123456']} onClose={jest.fn()} />, {
            apolloMocks: mocks
        });

        expect(screen.getByText('files.generate_previews')).toBeInTheDocument();

        const settingsElem = await screen.findByText('PreviewSettings1');
        await act(async () => {
            userEvent.click(settingsElem);
        });

        await waitFor(() => expect(screen.getByRole('button', {name: /submit/})).not.toBeDisabled());

        userEvent.click(screen.getByRole('button', {name: /submit/}));

        await waitFor(() => expect(mutationCalled).toBe(true));
    });

    test('Can choose to generate only failed previews', async () => {
        let mutationCalled = false;
        const mocks = [
            {
                request: {
                    query: getLibrariesListQuery,
                    variables: {
                        filters: {
                            id: ['files']
                        }
                    }
                },
                result: () => {
                    return {
                        data: {
                            libraries: {
                                list: [
                                    {
                                        ...mockLibBase,
                                        id: 'files'
                                    }
                                ]
                            }
                        }
                    };
                }
            },
            {
                request: {
                    query: forcePreviewsGenerationMutation,
                    variables: {
                        libraryId: 'files',
                        recordIds: ['123456'],
                        filters: null,
                        failedOnly: true,
                        previewVersionSizeNames: ['PreviewSettings1ChildName']
                    }
                },
                result: () => {
                    mutationCalled = true;
                    return {
                        data: {
                            forcePreviewsGeneration: true
                        }
                    };
                }
            }
        ];

        render(<TriggerPreviewsGenerationModal libraryId="files" recordIds={['123456']} onClose={jest.fn()} />, {
            apolloMocks: mocks
        });

        expect(await screen.findByText('files.previews_generation_failed_only')).toBeInTheDocument();

        const settingsElem = await screen.findByText('PreviewSettings1');
        await act(async () => {
            userEvent.click(settingsElem);
        });

        const checkboxElem = await screen.findByRole('checkbox', {name: /failed-only/});
        userEvent.click(checkboxElem);

        await waitFor(() => expect(screen.getByRole('button', {name: /submit/})).not.toBeDisabled());
        userEvent.click(screen.getByRole('button', {name: /submit/}));

        await waitFor(() => expect(mutationCalled).toBe(true));
    });
});
