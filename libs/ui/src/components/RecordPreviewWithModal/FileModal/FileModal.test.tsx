// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPreviewScalar} from '@leav/utils';
import {mockApplication} from '_ui/__mocks__/common/application';
import {mockRecord} from '_ui/__mocks__/common/record';
import {themeVars} from '../../../antdTheme';
import {GetFileDataDocument, GetFileDataQueryVariables, LibraryBehavior} from '../../../_gqlTypes';
import {act, fireEvent, render, screen, waitFor, within} from '../../../_tests/testUtils';
import FileModal from './FileModal';

describe('FileModal', () => {
    const mockFileData = {
        __typename: 'Record',
        id: mockRecord.id,
        whoAmI: {
            __typename: 'RecordIdentity',
            ...mockRecord,
            preview: {
                ...mockRecord.preview,
                pdf: '/path/to/file.pdf'
            }
        },
        created_at: [{value: '2020-01-01T00:00:00.000Z', __typename: 'Value'}],
        created_by: [{value: {id: '1', whoAmI: mockRecord, __typename: 'Record'}, __typename: 'LinkValue'}],
        modified_at: [{value: '2020-01-02T00:00:00.000Z', __typename: 'Value'}],
        modified_by: [{value: {id: '1', whoAmI: mockRecord, __typename: 'Record'}, __typename: 'LinkValue'}],
        file_path: [{value: 'path/to/', __typename: 'Value'}],
        file_name: [{__typename: 'Value', value: 'my_file.jpg'}],
        previews_status: [
            {
                value:
                    '{"big":{"message":"preview create","status":0},"huge":{"message":"preview create","status":0},"medium":{"message":"preview create","status":0},"small":{"message":"preview create","status":0},"tiny":{"message":"preview create","status":0}}',
                __typename: 'Value'
            }
        ],
        library: {
            behavior: LibraryBehavior.files,
            __typename: 'Library'
        }
    };

    const mockVariables: GetFileDataQueryVariables = {
        library: 'files',
        fileId: mockRecord.id,
        previewsStatusAttribute: 'files_previews_status'
    };

    test('Display file record properties', async () => {
        const mocks = [
            {
                request: {
                    query: GetFileDataDocument,
                    variables: mockVariables
                },
                result: {data: {records: {list: [mockFileData]}}}
            }
        ];
        render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
            mocks
        });

        await waitFor(() => screen.getByTestId('title-section'));
        const titleSection = screen.getByTestId('title-section');
        const sidebarSection = screen.getByTestId('sidebar-section');
        expect(within(titleSection).getByText(mockFileData.whoAmI.label)).toBeInTheDocument();
        expect(within(sidebarSection).getByText('/' + mockFileData.file_path[0].value)).toBeInTheDocument();
        expect(within(sidebarSection).getByText(new RegExp(mockFileData.created_at[0].value))).toBeInTheDocument();
        expect(within(sidebarSection).getByText(mockFileData.created_by[0].value.whoAmI.label)).toBeInTheDocument();
    });

    describe('Image file', () => {
        test('Display image file', async () => {
            const mocks = [
                {
                    request: {
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {data: {records: {list: [mockFileData]}}}
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks
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
                    .find(img => img.getAttribute('src') === (mockFileData.whoAmI.preview as IPreviewScalar).huge)
            ).toBeDefined();
        });

        test('Display fallback if image not available', async () => {
            const mocks = [
                {
                    request: {
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {
                        data: {records: {list: [{...mockFileData, whoAmI: {...mockFileData.whoAmI, preview: null}}]}}
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByText(/no_preview/)).toBeInTheDocument();
        });

        test('Show checkerboard if app is in transparency mode', async () => {
            const mocks = [
                {
                    request: {
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {data: {records: {list: [mockFileData]}}}
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks,
                currentApp: {...mockApplication, settings: {showTransparency: true}}
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

            expect(screen.getByAltText('record preview')).toHaveStyle(`background: ${themeVars.checkerBoard}`);
        });
    });

    describe('Handle video file', () => {
        test('Display video player', async () => {
            const mocks = [
                {
                    request: {
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {
                        data: {
                            records: {
                                list: [{...mockFileData, file_name: [{__typename: 'Value', value: 'some_file.mp4'}]}]
                            }
                        }
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByTestId('video-player')).toBeInTheDocument();
        });

        test('Display fallback if video not available', async () => {
            const mocks = [
                {
                    request: {
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {
                        data: {
                            records: {
                                list: [
                                    {
                                        ...mockFileData,
                                        file_name: [{__typename: 'Value', value: 'some_file.mp4'}],
                                        whoAmI: {...mockFileData.whoAmI, preview: null}
                                    }
                                ]
                            }
                        }
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks
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
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {
                        data: {
                            records: {
                                list: [{...mockFileData, file_name: [{__typename: 'Value', value: 'some_file.mp3'}]}]
                            }
                        }
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByTestId('audio-player')).toBeInTheDocument();
        });

        test('Display fallback if audio file is not available', async () => {
            const mocks = [
                {
                    request: {
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {
                        data: {
                            records: {
                                list: [
                                    {
                                        ...mockFileData,
                                        file_name: [{__typename: 'Value', value: 'some_file.mp4'}],
                                        whoAmI: {...mockFileData.whoAmI, preview: null}
                                    }
                                ]
                            }
                        }
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks
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
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {
                        data: {
                            records: {
                                list: [{...mockFileData, file_name: [{__typename: 'Value', value: 'some_file.pdf'}]}]
                            }
                        }
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(await within(contentSection).findByTestId('document-viewer')).toBeInTheDocument();
        });

        test('Display fallback if document not available', async () => {
            const mocks = [
                {
                    request: {
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {
                        data: {
                            records: {
                                list: [
                                    {
                                        ...mockFileData,
                                        file_name: [{__typename: 'Value', value: 'some_file.pdf'}],
                                        whoAmI: {...mockFileData.whoAmI, preview: null}
                                    }
                                ]
                            }
                        }
                    }
                }
            ];

            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks
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
                        query: GetFileDataDocument,
                        variables: mockVariables
                    },
                    result: {
                        data: {
                            records: {
                                list: [{...mockFileData, file_name: [{__typename: 'Value', value: 'some_file.txt'}]}]
                            }
                        }
                    }
                }
            ];
            render(<FileModal fileId={mockRecord.id} libraryId="files" open onClose={jest.fn()} />, {
                mocks
            });

            await waitFor(() => screen.getByTestId('content-section'));
            const contentSection = screen.getByTestId('content-section');
            expect(within(contentSection).getByText('TXT')).toBeInTheDocument();
        });
    });
});
