// import {render} from 'enzyme';
// import {DndProvider} from 'react-dnd';
// import {TestBackend} from 'react-dnd-test-backend';
// import ALCCard from './ALCCard';

// jest.mock('../../../../../../hooks/useLang');

// jest.mock('react-dnd', () => ({
// useDrag: () => {
// const isDragging = false;
// const drag = () => true;
// const preview = () => true;
// return [{isDragging}, drag, preview];
// },
// useDrop: sth => {
// const isOver = false;
// const drop = () => true;
// return [{isOver}, drop];
// },
// DndProvider: ({backend, children}) => children,
// }));

// describe('ALCCard', () => {
// test('it shows the correct action name', async () => {
// const comp = render(
// <DndProvider backend={TestBackend}>
// <ALCCard
// id="0"
// action={{
// id: 'action',
// list_id: 0,
// name: 'action',
// description: 'action',
// input_types: [],
// output_types: [],
// params: [],
// isSystem: false,
// }}
// origin="ALCList"
// colorTypeDictionnary={{int: []}}
// />
// </DndProvider>,
// );
// const header = comp.find('h3');
// expect(header.text()).toBe('action');
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
