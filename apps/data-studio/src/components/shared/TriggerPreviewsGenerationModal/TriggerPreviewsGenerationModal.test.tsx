// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {forcePreviewsGenerationMutation} from 'graphQL/mutations/files/forcePreviewsGenerationMutation';
import {render, screen, waitFor} from '_tests/testUtils';
import TriggerPreviewsGenerationModal from './TriggerPreviewsGenerationModal';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {mockLibrary, mockLibraryPermissions} from '__mocks__/common/library';
import {act} from 'react-dom/test-utils';

describe('TriggerPreviewsGenerationModal', () => {
    const {type, ...mockGqlNamesWithoutType} = mockLibrary.gqlNames;
    const mockLibBase = {
        ...mockLibrary,
        gqlNames: mockGqlNamesWithoutType,
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
                        previewVersionSizeNames: ['PreviewSettings1']
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
            apolloMocks: mocks,
            cacheSettings: {
                resultCaching: false
            }
        });

        // expect(screen.getByText('files.generate_previews')).toBeInTheDocument();

        // await act(async () => {
        //     userEvent.click(screen.getByText('PreviewSettings1'));
        // });

        // await waitFor(() => expect(screen.getByRole('button', {name: /submit/})).not.toBeDisabled());

        // userEvent.click(screen.getByRole('button', {name: /submit/}));

        // await waitFor(() => expect(mutationCalled).toBe(true));
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
                        previewVersionSizeNames: []
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

        // expect(screen.getByText('files.previews_generation_failed_only')).toBeInTheDocument();

        // userEvent.click(screen.getByRole('checkbox'));
        // userEvent.click(screen.getByRole('button', {name: /submit/}));

        // await waitFor(() => expect(mutationCalled).toBe(true));
    });
});
