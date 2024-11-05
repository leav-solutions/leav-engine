// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {mockLibraryWithDetails} from '_ui/__mocks__/common/library';
import {forcePreviewsGenerationMutation} from '../../_queries/files/forcePreviewsGenerationMutation';
import {getLibraryPreviewsSettingsQuery} from '../../_queries/libraries/getLibraryPreviewsSettingsQuery';
import {act, render, screen, waitFor} from '../../_tests/testUtils';
import TriggerPreviewsGenerationModal from './TriggerPreviewsGenerationModal';

describe('TriggerPreviewsGenerationModal', () => {
    const mockLibBase = {
        ...mockLibraryWithDetails,
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

        const mocks: MockedResponse[] = [
            {
                request: {
                    query: getLibraryPreviewsSettingsQuery,
                    variables: {
                        id: 'files'
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

        render(<TriggerPreviewsGenerationModal libraryId="files" recordIds={['123456']} onClose={jest.fn()} />, {
            mocks
        });

        expect(screen.getByText('files.generate_previews')).toBeInTheDocument();

        const settingsElem = await screen.findByText('PreviewSettings1');
        await userEvent.click(settingsElem);

        const submitButton = screen.getByRole('button', {name: /submit/});
        expect(submitButton).not.toBeDisabled();

        await userEvent.click(submitButton);

        expect(mutationCalled).toBe(true);
    });

    test('Can choose to generate only failed previews', async () => {
        let mutationCalled = false;
        const mocks = [
            {
                request: {
                    query: getLibraryPreviewsSettingsQuery,
                    variables: {id: 'files'}
                },
                result: () => ({
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
                })
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
            mocks
        });

        expect(await screen.findByText('files.previews_generation_failed_only')).toBeInTheDocument();

        const settingsElem = await screen.findByText('PreviewSettings1');
        userEvent.click(settingsElem);

        const checkboxElem = await screen.findByRole('checkbox', {name: /failed-only/});
        userEvent.click(checkboxElem);

        await waitFor(() => expect(screen.getByRole('button', {name: /submit/})).not.toBeDisabled());
        userEvent.click(screen.getByRole('button', {name: /submit/}));

        await waitFor(() => expect(mutationCalled).toBe(true));
    });
});
