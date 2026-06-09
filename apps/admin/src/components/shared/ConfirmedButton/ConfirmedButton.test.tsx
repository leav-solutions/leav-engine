// import {mount, shallow} from 'enzyme';
// import React from 'react';
// import {type Mockify} from '../../../_types//Mockify';
// import ConfirmedButton from './ConfirmedButton';

// describe('ConfirmedButton', () => {
// const mockEvent: Mockify<React.SyntheticEvent> = {
// preventDefault: vi.fn(),
// stopPropagation: vi.fn(),
// };

// test('Render child', async () => {
// const action = vi.fn();

// const comp = shallow(
// <ConfirmedButton action={action} confirmMessage="Test">
// <div className="my_child" />
// </ConfirmedButton>,
// );
// expect(comp.find('.my_child')).toHaveLength(1);
// });

// test('Open modal when click on button', async () => {
// const action = vi.fn();

// const comp = mount(
// <ConfirmedButton action={action} confirmMessage="Test">
// <div className="my_child" />
// </ConfirmedButton>,
// );
// comp.find('.my_child').simulate('click', mockEvent as React.SyntheticEvent);

// expect(comp.find('Modal').props().open).toBe(true);
// expect(comp.find('Modal .content').text()).toEqual('Test');
// });

// test('Call action when validate and close modal', async () => {
// const action = vi.fn();

// const comp = mount(
// <ConfirmedButton action={action} confirmMessage="Test">
// <div className="my_child" />
// </ConfirmedButton>,
// );
// comp.find('.my_child').simulate('click', mockEvent as React.SyntheticEvent);
// comp.find('Modal button.primary').simulate('click', mockEvent as React.SyntheticEvent);

// expect(action).toHaveBeenCalled();
// expect(comp.find('Modal').props().open).toBe(false);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
