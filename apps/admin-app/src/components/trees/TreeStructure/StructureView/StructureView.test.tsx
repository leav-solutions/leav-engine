// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {mockTree} from '__mocks__/trees';
import StructureView from './StructureView';

jest.mock('react-sortable-tree', () => {
    return {
        SortableTreeWithoutDndContext() {
            return <div>MOCK TestComponent</div>;
        }
    };
});

jest.mock('hooks/useLang');

describe('StructureView', () => {
    test('Render loading if no data', async () => {
        const onTreeChange = jest.fn();
        const onVisibilityToggle = jest.fn();
        const onMoveNode = jest.fn();
        const onDeleteNode = jest.fn();

        const comp = shallow(
            <StructureView
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
            <StructureView
                treeSettings={mockTree}
                readOnly={false}
                treeData={[{id: '1234', library: {id: 'test_lib'}}]}
                onTreeChange={onTreeChange}
                onVisibilityToggle={onVisibilityToggle}
                onMoveNode={onMoveNode}
                onDeleteNode={onDeleteNode}
            />
        );

        expect(comp.find('Loading')).toHaveLength(0);
        expect(comp.find('[data-test-id="sortable-tree"]')).toHaveLength(1);
    });
});
