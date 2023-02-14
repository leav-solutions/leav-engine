// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getFileDataQuery, IFileDataElement} from 'graphQL/queries/records/getFileDataQuery';
import {act, fireEvent, render, screen, waitFor, within} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/record';
import FileModal from './FileModal';

describe('FileModal', () => {
    const mockFileData: IFileDataElement & {__typename: string} = {
        __typename: 'RecordLib',
        id: mockRecord.id,
        whoAmI: {
            ...mockRecord,
            preview: {
                ...mockRecord.preview,
                pdf: '/path/to/file.pdf'
            }
        },
        created_at: '2020-01-01T00:00:00.000Z',
        // @ts-ignore
        created_by: {__typename: 'RecordLib', id: '1', whoAmI: mockRecord},
        modified_at: '2020-01-02T00:00:00.000Z',
        // @ts-ignore
        modified_by: {__typename: 'RecordLib', id: '1', whoAmI: mockRecord},
        file_path: 'path/to/',
        file_name: 'my_file.jpg',
        file_type: 'image',
        previews_status: '{}',
        library: {
            behavior: 'files'
        }
    };

    const cacheSettings = {
        possibleTypes: {
            Record: ['RecordLib']
        }
    };
    test('Display file record properties', async () => {
        const mocks = [
            {
                request: {
                    query: getFileDataQuery('files'),
                    variables: {
                        fileId: mockRecord.id
                    }
                },
                result: {data: {files: {list: [mockFileData]}}}
            }
        ];
        render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
            apolloMocks: mocks,
            cacheSettings
        });

        await waitFor(() => screen.getByTestId('title-section'));
        const titleSection = screen.getByTestId('title-section');
        const sidebarSection = screen.getByTestId('sidebar-section');
        expect(within(titleSection).getByText(mockFileData.whoAmI.label)).toBeInTheDocument();
        expect(within(sidebarSection).getByText('/' + mockFileData.file_path)).toBeInTheDocument();
        expect(within(sidebarSection).getByText(new RegExp(mockFileData.created_at))).toBeInTheDocument();
        expect(within(sidebarSection).getByText(mockFileData.created_by.whoAmI.label)).toBeInTheDocument();
    });

    describe('Image file', () => {
        test('Display image file', async () => {
            const mocks = [
                {
                    request: {
                        query: getFileDataQuery('files'),
                        variables: {
                            fileId: mockRecord.id
                        }
                    },
                    result: {data: {files: {list: [mockFileData]}}}
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');

            const images = within(contentSection).getAllByRole('img', {hidden: true});
            // Load images
            await act(async () => {
                for (const image of images) {
                    fireEvent.load(image);
                }
            });

            expect(
                within(contentSection)
                    .getAllByRole('img')
                    .find(img => img.getAttribute('src') === mockFileData.whoAmI.preview.huge)
            ).toBeDefined();
        });

        test('Display fallback if image not available', async () => {
            const mocks = [
                {
                    request: {
                        query: getFileDataQuery('files'),
                        variables: {
                            fileId: mockRecord.id
                        }
                    },
                    result: {
                        data: {files: {list: [{...mockFileData, whoAmI: {...mockFileData.whoAmI, preview: null}}]}}
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByText(/no_preview/)).toBeInTheDocument();
        });
    });

    describe('Handle video file', () => {
        test('Display video player', async () => {
            const mocks = [
                {
                    request: {
                        query: getFileDataQuery('files'),
                        variables: {
                            fileId: mockRecord.id
                        }
                    },
                    result: {data: {files: {list: [{...mockFileData, file_type: 'video'}]}}}
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByTestId('video-player')).toBeInTheDocument();
        });

        test('Display fallback if video not available', async () => {
            const mocks = [
                {
                    request: {
                        query: getFileDataQuery('files'),
                        variables: {
                            fileId: mockRecord.id
                        }
                    },
                    result: {
                        data: {
                            files: {
                                list: [
                                    {
                                        ...mockFileData,
                                        file_type: 'video',
                                        whoAmI: {...mockFileData.whoAmI, preview: null}
                                    }
                                ]
                            }
                        }
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByText(/no_preview/)).toBeInTheDocument();
        });
    });

    describe('Handle audio file', () => {
        test('Display audio player', async () => {
            const mocks = [
                {
                    request: {
                        query: getFileDataQuery('files'),
                        variables: {
                            fileId: mockRecord.id
                        }
                    },
                    result: {data: {files: {list: [{...mockFileData, file_type: 'audio'}]}}}
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByTestId('audio-player')).toBeInTheDocument();
        });

        test('Display fallback if audio file is not available', async () => {
            const mocks = [
                {
                    request: {
                        query: getFileDataQuery('files'),
                        variables: {
                            fileId: mockRecord.id
                        }
                    },
                    result: {
                        data: {
                            files: {
                                list: [
                                    {
                                        ...mockFileData,
                                        file_type: 'audio',
                                        whoAmI: {...mockFileData.whoAmI, preview: null}
                                    }
                                ]
                            }
                        }
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByText(/no_preview/)).toBeInTheDocument();
        });
    });

    describe('Handle document file', () => {
        test('Display document viewer', async () => {
            const mocks = [
                {
                    request: {
                        query: getFileDataQuery('files'),
                        variables: {
                            fileId: mockRecord.id
                        }
                    },
                    result: {data: {files: {list: [{...mockFileData, file_type: 'document'}]}}}
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByTestId('document-viewer')).toBeInTheDocument();
        });

        test('Display fallback if document not available', async () => {
            const mocks = [
                {
                    request: {
                        query: getFileDataQuery('files'),
                        variables: {
                            fileId: mockRecord.id
                        }
                    },
                    result: {
                        data: {
                            files: {
                                list: [
                                    {
                                        ...mockFileData,
                                        file_type: 'document',
                                        whoAmI: {...mockFileData.whoAmI, preview: null}
                                    }
                                ]
                            }
                        }
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByText(/no_preview/)).toBeInTheDocument();
        });
    });

    describe('Handle unknown file', () => {
        test('Display generic view for unknown file', async () => {
            const mocks = [
                {
                    request: {
                        query: getFileDataQuery('files'),
                        variables: {
                            fileId: mockRecord.id
                        }
                    },
                    result: {data: {files: {list: [{...mockFileData, file_name: 'some_file.txt', file_type: 'other'}]}}}
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                apolloMocks: mocks,
                cacheSettings
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByText('TXT')).toBeInTheDocument();
        });
    });
});
