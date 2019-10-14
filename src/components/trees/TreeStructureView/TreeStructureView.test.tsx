import {shallow} from 'enzyme';
import React from 'react';
import {mockTree} from '../../../__mocks__/trees';
import TreeStructureView from './TreeStructureView';

jest.mock('react-sortable-tree', () => {
    return function SortableTree() {
        return <div>MOCK TestComponent</div>;
    };
});

describe('TreeStructureView', () => {
    test('Render loading if no data', async () => {
        const onTreeChange = jest.fn();
        const onVisibilityToggle = jest.fn();
        const onMoveNode = jest.fn();
        const onDeleteNode = jest.fn();

        const comp = shallow(
            <TreeStructureView
                treeSettings={mockTree}
                readOnly={false}
                treeData={[]}
                onTreeChange={onTreeChange}
                onVisibilityToggle={onVisibilityToggle}
                onMoveNode={onMoveNode}
                onDeleteNode={onDeleteNode}
            />
        );

        expect(comp.find('Loading')).toHaveLength(1);
        expect(comp.find('SortableTree')).toHaveLength(0);
    });

    test('Render tree', async () => {
        const onTreeChange = jest.fn();
        const onVisibilityToggle = jest.fn();
        const onMoveNode = jest.fn();
        const onDeleteNode = jest.fn();

        const comp = shallow(
            <TreeStructureView
                treeSettings={mockTree}
                readOnly={false}
                treeData={[{id: 1234, library: {id: 'test_lib'}}]}
                onTreeChange={onTreeChange}
                onVisibilityToggle={onVisibilityToggle}
                onMoveNode={onMoveNode}
                onDeleteNode={onDeleteNode}
            />
        );

        expect(comp.find('Loading')).toHaveLength(0);
        expect(comp.find('SortableTree')).toHaveLength(1);
    });
});
