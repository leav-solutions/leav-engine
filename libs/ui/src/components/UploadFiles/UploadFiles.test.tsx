import userEvent from '@testing-library/user-event';
import {LibraryBehavior, TreeBehavior, UploadUpdateDocument} from '_ui/_gqlTypes';
import * as gqlTypes from '_ui/_gqlTypes';
import {doesFileExistAsChild} from '_ui/_queries/records/doesFileExistAsChild';
import {getTreeLibraries} from '_ui/_queries/trees/getTreeLibraries';
import {fireEvent, render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockTreeSimple} from '_ui/__mocks__/common/tree';
import UploadFiles from './UploadFiles';

vi.mock('_ui/components/SelectTreeNode', () => ({
    SelectTreeNode: () => <div>SelectTreeNode</div>,
}));

describe('UploadFiles', () => {
    const commonMocks = [
        {
            request: {
                query: getTreeLibraries,
                variables: {
                    library: 'files',
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
                query: UploadUpdateDocument,
                variables: {filters: {userId: '123'}},
            },
            result: {
                data: {
                    upload: {
                        userId: '123',
                        progress: {
                            length: 42,
                            transferred: 0,
                            speed: 0,
                            runtime: 0,
                            remaining: 0,
                            percentage: 0,
                            eta: 0,
                            delta: 0,
                        },
                        uid: '123456',
                    },
                },
            },
        },
    ];

    test('Should display upload modal on first step', async () => {
        render(<UploadFiles libraryId="files" onClose={vi.fn()} />, {mocks: commonMocks});

        expect(screen.getByTestId('upload-modal')).toBeInTheDocument();
        expect(screen.getByTestId('select-tree-node')).toBeInTheDocument();
        expect(screen.getByTestId('next-btn')).toBeDisabled();
    });

    test('Should be on step 2 with default selected key', async () => {
        render(<UploadFiles defaultSelectedNode={{id: 'files_tree'}} libraryId="files" onClose={vi.fn()} />, {
            mocks: commonMocks,
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

        const uploadResult = {
            data: {
                upload: [{uid: 'uid', record: {__typename: 'RecordLib', id: '1', whoAmI: mockRecord}}],
            },
        };
        vi.spyOn(gqlTypes, 'useUploadMutation').mockImplementation(options => {
            const runUploadMock = vi.fn().mockImplementation(async () => {
                options?.onCompleted?.(uploadResult.data);
                return uploadResult;
            });
            return [runUploadMock, {loading: false} as any] as any;
        });

        const mocks = [
            ...commonMocks,
            {
                request: {
                    query: doesFileExistAsChild,
                    variables: {
                        treeId: 'files_tree',
                        parentNode: null,
                        filename: 'chucknorris.png',
                    },
                },
                result: {
                    data: {
                        doesFileExistAsChild: true,
                    },
                },
            },
        ];

        render(<UploadFiles defaultSelectedNode={{id: 'files_tree'}} libraryId="files" onClose={vi.fn()} />, {mocks});

        fireEvent.drop(screen.getByTestId('dragger'), {
            dataTransfer: {
                files: [mockFile],
            },
        });

        await userEvent.click(screen.getByTestId('upload-btn'));

        // Since antd 6, confirm modals render their title twice (modal header + confirm body),
        // so a plain getByText matches multiple elements. Target the confirm body one.
        await waitFor(() =>
            expect(
                screen.getByText('upload.replace_modal.title', {selector: '.ant-modal-confirm-title'}),
            ).toBeInTheDocument(),
        );

        const replaceBtn = screen.getByText('upload.replace_modal.replaceBtn');
        const keepBtn = screen.getByText('upload.replace_modal.keepBtn');

        expect(replaceBtn).toBeInTheDocument();
        expect(keepBtn).toBeInTheDocument();

        await userEvent.click(keepBtn);

        await waitFor(() => expect(screen.queryByTestId('upload-btn')).not.toBeInTheDocument());

        expect(await screen.findByTestId('close-btn')).toBeInTheDocument();
    });
});
