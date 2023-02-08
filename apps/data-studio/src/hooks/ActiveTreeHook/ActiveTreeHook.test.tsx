// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render} from '_tests/testUtils';
import {IActiveTree} from '../../graphQL/queries/cache/activeTree/getActiveTreeQuery';
import {useActiveTree} from './ActiveTreeHook';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {TreeBehavior} from '_gqlTypes/globalTypes';

describe('ActiveTreeHook', () => {
    const mockActiveTree: IActiveTree = {
        id: 'test',
        libraries: [{id: 'test'}],
        behavior: TreeBehavior.standard,
        label: 'string',
        permissions: {
            access_tree: true,
            edit_children: true
        }
    };

    test('should get undefined if no activeTree set', async () => {
        let givenActiveTree;

        const ComponentUsingInfo = () => {
            const [activeTree] = useActiveTree();

            givenActiveTree = activeTree;
            return <></>;
        };

        await act(async () => {
            render(<ComponentUsingInfo />);
        });

        expect(givenActiveTree).toEqual(undefined);
    });

    test('should get activeTree', async () => {
        let givenActiveTree: any;

        const ComponentUsingInfo = () => {
            const [activeTree, updateActiveTree] = useActiveTree();

            updateActiveTree(mockActiveTree);

            givenActiveTree = activeTree;
            return <></>;
        };

        await act(async () => {
            render(<ComponentUsingInfo />);
        });

        expect(givenActiveTree).toEqual(mockActiveTree);
    });
});
