// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {wait} from 'utils/testUtils';
import {act} from '_tests/testUtils';
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
                variables: {id: 'test_tree'}
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
        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <SelectTreeNodeModal tree="test_tree" onSelect={onSelect} open onClose={onClose} />
                </MockedProvider>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('Modal').prop('open')).toBe(true);
        expect(comp.find('TreeExplorer')).toHaveLength(1);
    });

    test('Calls onClose', async () => {
        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <SelectTreeNodeModal tree="test_tree" onSelect={onSelect} open onClose={onClose} />
                </MockedProvider>
            );
            await wait(0);
            comp.update();
        });

        act(() => {
            comp.find('[data-test-id="select_tree_node_close_btn"]').first().simulate('click');
        });
        await wait(0);

        expect(onClose).toBeCalled();
    });
});
