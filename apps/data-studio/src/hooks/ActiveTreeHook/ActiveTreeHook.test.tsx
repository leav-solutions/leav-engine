// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render} from '_tests/testUtils';
import {mockActiveTree} from '__mocks__/common/activeTree';
import {useActiveTree} from './ActiveTreeHook';

describe('ActiveTreeHook', () => {
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
