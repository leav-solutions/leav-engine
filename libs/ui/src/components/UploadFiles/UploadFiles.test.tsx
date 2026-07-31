import userEvent from '@testing-library/user-event';
import {GetDirectoryDataDocument, LibraryBehavior, TreeBehavior, UploadUpdateDocument} from '_ui/_gqlTypes';
import * as gqlTypes from '_ui/_gqlTypes';
import {doesFileExistAsChild} from '_ui/_queries/records/doesFileExistAsChild';
import {getTreeLibraries} from '_ui/_queries/trees/getTreeLibraries';
import {fireEvent, render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockTreeSimple} from '_ui/__mocks__/common/tree';
import UploadFiles from './UploadFiles';

vi.mock('_ui/components/SelectTreeNode', () => ({
    SelectTreeNode: ({onSelect}: {onSelect: (node: any, selected: boolean) => void}) => (
        <>
            <button onClick={() => onSelect({id: 'node1', record: {id: 'dir1'}}, true)}>select dir1</button>
            <button onClick={() => onSelect({id: 'node2', record: {id: 'dir2'}}, true)}>select dir2</button>
        </>
    ),
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

    const directoryDataMock = (directoryId: string, path: string, name: string) => ({
        request: {
            query: GetDirectoryDataDocument,
            variables: {library: 'files_directories', directoryId},
        },
        result: {
            data: {
                records: {
                    __typename: 'RecordsList',
                    list: [
                        {
                            __typename: 'Record',
                            id: directoryId,
                            whoAmI: {__typename: 'RecordIdentity', ...mockRecord},
                            created_at: [{__typename: 'Value', value: '2020-01-01T00:00:00.000Z'}],
                            created_by: [
                                {
                                    __typename: 'LinkValue',
                                    value: {__typename: 'Record', id: '1', whoAmI: mockRecord},
                                },
                            ],
                            modified_at: [{__typename: 'Value', value: '2020-01-02T00:00:00.000Z'}],
                            modified_by: [
                                {
                                    __typename: 'LinkValue',
                                    value: {__typename: 'Record', id: '1', whoAmI: mockRecord},
                                },
                            ],
                            file_name: [{__typename: 'Value', value: name}],
                            file_path: [{__typename: 'Value', value: path}],
                            library: {__typename: 'Library', behavior: LibraryBehavior.directories},
                        },
                    ],
                },
            },
        },
    });

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

    test('Should display the selected directory path without crashing', async () => {
        render(
            <UploadFiles defaultSelectedNode={{id: 'node1', recordId: 'dir1'}} libraryId="files" onClose={vi.fn()} />,
            {mocks: [...commonMocks, directoryDataMock('dir1', 'path/to', 'my_dir')]},
        );

        expect(await screen.findByText('path/to/my_dir')).toBeInTheDocument();
        expect(screen.getByTestId('dragger')).toBeInTheDocument();
    });

    test('Should refresh the displayed path when another directory is selected', async () => {
        const user = userEvent.setup();
        render(<UploadFiles libraryId="files" onClose={vi.fn()} />, {
            mocks: [
                ...commonMocks,
                directoryDataMock('dir1', 'path/to', 'first_dir'),
                directoryDataMock('dir2', 'path/to', 'second_dir'),
            ],
        });

        await user.click(await screen.findByText('select dir1'));
        expect(await screen.findByText('path/to/first_dir')).toBeInTheDocument();

        await user.click(screen.getByText('select dir2'));
        expect(await screen.findByText('path/to/second_dir')).toBeInTheDocument();
        expect(screen.queryByText('path/to/first_dir')).not.toBeInTheDocument();
    });
});
