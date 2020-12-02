// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider, wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';
import {TreeBehavior} from '../../../_gqlTypes/globalTypes';
import SelectTreeNodeModal from './SelectTreeNodeModal';

jest.mock(
    '../../trees/TreeStructure',
    () =>
        function TreeStructure() {
            return <div>Tree Structure</div>;
        }
);

describe('SelectTreeNodeModal', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const mocks = [
        {
            request: {
                query: getTreesQuery,
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
                                libraries: [{id: 'test_lib', label: {fr: 'My Lib'}, __typename: 'Library'}]
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
        expect(comp.find('TreeStructure')).toHaveLength(1);
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
            comp.find('[data-test-id="select_tree_node_close_btn"]')
                .first()
                .simulate('click');
        });
        await wait(0);

        expect(onClose).toBeCalled();
    });
});
