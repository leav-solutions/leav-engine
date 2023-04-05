// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {uploadMutation} from 'graphQL/mutations/upload/uploadMutation';
import {doesFileExistAsChild} from 'graphQL/queries/records/doesFileExistAsChild';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {BrowserRouter} from 'react-router-dom';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';
import {act, fireEvent, render, screen, waitFor} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/record';
import {mockTree} from '__mocks__/common/tree';
import UploadFiles from './UploadFiles';

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
    test('Should display upload modal on first step', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <UploadFiles libraryId="files" onClose={jest.fn()} />
                </BrowserRouter>
            );
        });

        expect(screen.getByTestId('upload-modal')).toBeInTheDocument();
        expect(screen.getByTestId('select-tree-node')).toBeInTheDocument();
        expect(screen.getByTestId('next-btn')).toBeDisabled();
    });

    test('Should be on step 2 with default selected key', async () => {
        const mocks = [
            {
                request: {
                    query: getTreeLibraries,
                    variables: {
                        library: 'files'
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
            }
        ];

        await act(async () => {
            render(
                <BrowserRouter>
                    <UploadFiles defaultSelectedNode={{id: 'files_tree'}} libraryId="files" onClose={jest.fn()} />
                </BrowserRouter>,
                {
                    apolloMocks: mocks
                }
            );
        });

        expect(screen.getByTestId('upload-modal')).toBeInTheDocument();
        expect(screen.getByTestId('dragger')).toBeInTheDocument();
        expect(screen.getByTestId('prev-btn')).toBeEnabled();
        expect(screen.getByTestId('upload-btn')).toBeDisabled();
    });

    test('Should add file on drop', async () => {
        const mockFile = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});

        (mockFile as any).uid = 'uid';
        (mockFile as any).replace = false;

        const mocks = [
            {
                request: {
                    query: doesFileExistAsChild,
                    variables: {
                        treeId: 'files_tree',
                        parentNode: null,
                        filename: 'chucknorris.png'
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
                        library: 'files'
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
                    query: uploadMutation,
                    variables: {
                        library: 'files',
                        nodeId: 'files_tree',
                        files: [
                            {
                                data: mockFile,
                                uid: 'uid',
                                size: 12,
                                replace: false
                            }
                        ]
                    }
                },
                result: {
                    data: {
                        upload: {
                            uid: 'uid',
                            record: {__typename: 'RecordLib', id: '1', whoAmI: mockRecord}
                        }
                    }
                }
            }
        ];

        let ctn;

        await act(async () => {
            const {container} = render(
                <BrowserRouter>
                    <UploadFiles defaultSelectedNode={{id: 'files_tree'}} libraryId="files" onClose={jest.fn()} />
                </BrowserRouter>,
                {apolloMocks: mocks}
            );

            ctn = container;
        });

        await act(async () => {
            fireEvent.drop(screen.getByTestId('dragger'), {
                dataTransfer: {
                    files: [mockFile]
                }
            });
        });

        await act(async () => {
            userEvent.click(screen.getByTestId('upload-btn'));
        });

        await waitFor(() => expect(screen.getByText('upload.replace_modal.title')).toBeInTheDocument());

        const replaceBtn = screen.getByText('upload.replace_modal.replaceBtn');
        const keepBtn = screen.getByText('upload.replace_modal.keepBtn');

        expect(replaceBtn).toBeInTheDocument();
        expect(keepBtn).toBeInTheDocument();

        await act(async () => {
            userEvent.click(keepBtn);
        });

        await waitFor(() => expect(screen.queryByTestId('upload-btn')).not.toBeInTheDocument());

        expect(await screen.findByTestId('close-btn')).toBeInTheDocument();
    });
});
