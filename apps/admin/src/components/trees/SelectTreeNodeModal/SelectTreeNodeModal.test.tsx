import userEvent from '@testing-library/user-event';
import {render, screen} from '../../../_tests/testUtils';
import {TreeBehavior, GetTreeByIdDocument} from '../../../_gqlTypes';
import SelectTreeNodeModal from './SelectTreeNodeModal';

vi.mock('../../trees/TreeExplorer', () => ({
    default: function TreeExplorer() {
        return <div>Tree Explorer</div>;
    },
}));

describe('SelectTreeNodeModal', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    const mocks = [
        {
            request: {
                query: GetTreeByIdDocument,
                variables: {id: ['test_tree']},
            },
            result: {
                data: {
                    trees: {
                        __typename: 'TreesList',
                        totalCount: 1,
                        list: [
                            {
                                __typename: 'Tree',
                                id: 'test_tree',
                                system: false,
                                label: {
                                    en: 'TestTree',
                                    fr: 'TestTree',
                                },
                                behavior: TreeBehavior.standard,
                                libraries: [
                                    {
                                        __typename: 'TreeLibrary',
                                        library: {
                                            id: 'test_lib',
                                            label: {fr: 'My Lib'},
                                            attributes: [],
                                            __typename: 'Library',
                                        },
                                        settings: {
                                            __typename: 'TreeLibrarySettings',
                                            allowMultiplePositions: true,
                                            allowedAtRoot: true,
                                            allowedChildren: ['__all__'],
                                        },
                                    },
                                ],
                                permissions_conf: null,
                            },
                        ],
                    },
                },
            },
        },
    ];
    test('Load tree settings', async () => {
        render(<SelectTreeNodeModal tree="test_tree" onSelect={onSelect} open onClose={onClose} />, {
            apolloMocks: mocks,
        });

        expect(screen.getByText(/loading/)).toBeInTheDocument();
        expect(await screen.findByText('Tree Explorer')).toBeInTheDocument();
    });

    test('Calls onClose', async () => {
        render(<SelectTreeNodeModal tree="test_tree" onSelect={onSelect} open onClose={onClose} />, {
            apolloMocks: mocks,
        });

        await userEvent.click(await screen.findByTestId('select_tree_node_close_btn'));

        expect(onClose).toHaveBeenCalled();
    });
});
