// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen} from '_tests/testUtils';
import {getTreeByIdQuery} from '../../../queries/trees/getTreeById';
import {TreeBehavior} from '../../../_gqlTypes/globalTypes';
import SelectTreeNodeModal from './SelectTreeNodeModal';

jest.mock(
    '../../trees/TreeExplorer',
    () =>
        function TreeExplorer() {
            return <div>Tree Explorer</div>;
        }
);

describe('SelectTreeNodeModal', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const mocks = [
        {
            request: {
                query: getTreeByIdQuery,
                variables: {id: ['test_tree']}
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
                                    fr: 'TestTree'
                                },
                                behavior: TreeBehavior.standard,
                                libraries: [
                                    {
                                        __typename: 'TreeLibrary',
                                        library: {
                                            id: 'test_lib',
                                            label: {fr: 'My Lib'},
                                            attributes: [],
                                            __typename: 'Library'
                                        },
                                        settings: {
                                            __typename: 'TreeLibrarySettings',
                                            allowMultiplePositions: true,
                                            allowedAtRoot: true,
                                            allowedChildren: ['__all__']
                                        }
                                    }
                                ],
                                permissions_conf: null
                            }
                        ]
                    }
                }
            }
        }
    ];
    test('Load tree settings', async () => {
        render(<SelectTreeNodeModal tree="test_tree" onSelect={onSelect} open onClose={onClose} />, {
            apolloMocks: mocks
        });

        expect(screen.getByText(/loading/)).toBeInTheDocument();
        expect(await screen.findByText('Tree Explorer')).toBeInTheDocument();
    });

    test('Calls onClose', async () => {
        render(<SelectTreeNodeModal tree="test_tree" onSelect={onSelect} open onClose={onClose} />, {
            apolloMocks: mocks
        });

        userEvent.click(await screen.findByTestId('select_tree_node_close_btn'));

        expect(onClose).toBeCalled();
    });
});
