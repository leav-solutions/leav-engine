import {act, render} from '../../_tests/testUtils';
import {mockActiveTree} from '../../__mocks__/common/activeTree';
import {useActiveTree} from './useActiveTree';

describe('useActiveTree', () => {
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
