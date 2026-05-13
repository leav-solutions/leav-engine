import {TreeNodeList} from './TreeNodeList';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {render, screen} from '@testing-library/react';
import {type RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';

jest.mock('./TreeNodeItem', () => ({
    __esModule: true,
    default: () => <div data-testid="tree-node-item">TreeNodeItem</div>,
}));

const mockRemoveTreeNode = jest.fn();

const createMockBackendValues = (count: number) =>
    Array(count)
        .fill(null)
        .map((_, index) => ({
            treeValue: {
                record: {
                    whoAmI: {
                        color: `color-${index}`,
                        label: `label-${index}`,
                    },
                },
                ancestors: [],
            },
        })) as RecordFormElementsValueTreeValue[];

describe('TreeNodeList', () => {
    it('should render zero TreeNodeItem when backendValues is empty', () => {
        render(
            <TreeNodeList
                attribute={mockFormAttribute}
                backendValues={[]}
                removeTreeNode={mockRemoveTreeNode}
                isReadOnly={false}
            />,
        );

        expect(screen.queryAllByTestId('tree-node-item')).toHaveLength(0);
    });

    it('should render five TreeNodeItems when backendValues has five items', () => {
        const mockBackendValues = createMockBackendValues(5);

        render(
            <TreeNodeList
                attribute={mockFormAttribute}
                backendValues={mockBackendValues}
                removeTreeNode={mockRemoveTreeNode}
                isReadOnly={false}
            />,
        );

        expect(screen.queryAllByTestId('tree-node-item')).toHaveLength(5);
    });
});
