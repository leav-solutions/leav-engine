// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IActiveTree} from '../../graphQL/queries/cache/activeTree/getActiveTreeQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {useActiveTree} from './ActiveTreeHook';

describe('ActiveTreeHook', () => {
    const mockActiveTree: IActiveTree = {
        id: 'test',
        libraries: [{id: 'test'}],
        label: 'string',
        permissions: {
            access_tree: true,
            edit_children: true
        }
    };

    test('should get undefined if no activeTree set', async () => {
        let givenActiveTree: any;

        const ComponentUsingNotification = () => {
            const [activeTree] = useActiveTree();

            givenActiveTree = activeTree;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenActiveTree).toEqual(undefined);
    });

    test('should get activeTree', async () => {
        let givenActiveTree: any;

        const ComponentUsingNotification = () => {
            const [activeTree, updateActiveTree] = useActiveTree();

            updateActiveTree(mockActiveTree);

            givenActiveTree = activeTree;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenActiveTree).toEqual(mockActiveTree);
    });
});
