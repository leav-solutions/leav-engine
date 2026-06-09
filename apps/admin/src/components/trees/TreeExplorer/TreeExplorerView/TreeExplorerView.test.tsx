// import {shallow} from 'enzyme';
// import React from 'react';
// import {mockTree} from '../../../../__mocks__/trees';
// import TreeExplorerView from './TreeExplorerView';

// vi.mock('@nosferatu500/react-sortable-tree', () => ({
// SortableTreeWithoutDndContext() {
// return <div>MOCK TestComponent</div>;
// },
// }));

// vi.mock('../../../../hooks/useLang');

// describe('StructureView', () => {
// test('Render loading if no data', async () => {
// const onTreeChange = vi.fn();
// const onVisibilityToggle = vi.fn();
// const onMoveNode = vi.fn();
// const onDeleteNode = vi.fn();

// const comp = shallow(
// <TreeExplorerView
// treeSettings={mockTree}
// readOnly={false}
// treeData={[]}
// onTreeChange={onTreeChange}
// onVisibilityToggle={onVisibilityToggle}
// onMoveNode={onMoveNode}
// onDeleteNode={onDeleteNode}
// />,
// );

// expect(comp.find('Loading')).toHaveLength(1);
// expect(comp.find('SortableTree')).toHaveLength(0);
// });

// test('Render tree', async () => {
// const onTreeChange = vi.fn();
// const onVisibilityToggle = vi.fn();
// const onMoveNode = vi.fn();
// const onDeleteNode = vi.fn();

// const comp = shallow(
// <TreeExplorerView
// treeSettings={mockTree}
// readOnly={false}
// treeData={[{id: '1234', library: {id: 'test_lib'}}]}
// onTreeChange={onTreeChange}
// onVisibilityToggle={onVisibilityToggle}
// onMoveNode={onMoveNode}
// onDeleteNode={onDeleteNode}
// />,
// );

// expect(comp.find('Loading')).toHaveLength(0);
// expect(comp.find('[data-test-id="sortable-tree"]')).toHaveLength(1);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
