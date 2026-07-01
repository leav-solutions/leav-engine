import userEvent from '@testing-library/user-event';
import * as apolloClient from '@apollo/client';
import * as gqlTypes from '_ui/_gqlTypes';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {SelectTreeNode} from './SelectTreeNode';

describe('SelectTreeNode', () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    test('Render tree and navigate', async () => {
        const mockTreeContent: Array<
            gqlTypes.TreeContentDataQueryQuery['treeContent'][number] & {
                children?: Array<gqlTypes.TreeContentDataQueryQuery['treeContent'][number]>;
            }
        > = [
            {
                id: 'id1',
                record: {
                    id: 'id1',
                    whoAmI: {
                        id: 'id1',
                        label: 'label1',
                        library: {
                            id: 'categories',
                        },
                    },
                },
                childrenCount: 1,
                children: [
                    {
                        id: 'id2',
                        record: {
                            id: 'id2',
                            whoAmI: {
                                id: 'id2',
                                label: 'label2',
                                library: {
                                    id: 'categories',
                                },
                            },
                        },
                        childrenCount: 0,
                    },
                ],
            },
        ];

        vi.spyOn(gqlTypes, 'useTreeDataQueryQuery').mockReturnValue({
            data: {
                trees: {
                    list: [{id: 'treeId', label: {fr: 'Tree Label'}}],
                },
            },
            called: true,
            loading: false,
            error: null,
        } as gqlTypes.TreeDataQueryQueryHookResult);

        vi.spyOn(apolloClient, 'useLazyQuery').mockReturnValue([
            vi.fn().mockResolvedValue({
                data: {
                    treeContent: mockTreeContent,
                },
            }),
            {} as apolloClient.QueryResult,
        ] as unknown as ReturnType<typeof apolloClient.useLazyQuery>);

        render(<SelectTreeNode treeId="treeId" onSelect={vi.fn()} />);

        await waitFor(() => screen.getByText('Tree Label'));
        expect(screen.getByText('Tree Label')).toBeInTheDocument();

        // First level loaded
        expect(await screen.findByText('label1')).toBeInTheDocument();

        // Expand node => fetch children
        await userEvent.click(screen.getByRole('img', {name: 'Ouvrir'}));
        await waitFor(() => expect(screen.getByText('label2')).toBeInTheDocument());
    });
});
