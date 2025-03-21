// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useDisplayTreeNode} from './useDisplayTreeNode';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {render, screen, renderHook} from '@testing-library/react';
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';

jest.mock('./TreeNodeItem', () => ({
    __esModule: true,
    default: () => <div data-testid="tree-node-item">TreeNodeItem</div>
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
                        label: `label-${index}`
                    }
                },
                ancestors: []
            }
        })) as RecordFormElementsValueTreeValue[];

describe('useDisplayTreeNode', () => {
    it('should render zero TreeNodeItem when backendValues is empty', () => {
        const {result} = renderHook(() =>
            useDisplayTreeNode({
                attribute: mockFormAttribute,
                backendValues: [],
                removeTreeNode: mockRemoveTreeNode
            })
        );

        render(result.current.TreeNodeList);

        expect(screen.queryAllByTestId('tree-node-item')).toHaveLength(0);
    });

    it('should render five TreeNodeItems when backendValues has five items', () => {
        const mockBackendValues = createMockBackendValues(5);

        const {result} = renderHook(() =>
            useDisplayTreeNode({
                attribute: mockFormAttribute,
                backendValues: mockBackendValues,
                removeTreeNode: mockRemoveTreeNode
            })
        );

        render(result.current.TreeNodeList);

        expect(screen.queryAllByTestId('tree-node-item')).toHaveLength(5);
    });
});
