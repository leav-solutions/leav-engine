// import {mount} from 'enzyme';
// import React from 'react';
// import {act} from 'react-dom/test-utils';
// import {wait} from '../../../utils/testUtils';
// import EditRecordModal from './EditRecordModal';

// vi.mock(
// '../EditRecord/EditRecord',
// () =>
// function EditRecordComp() {
// return <div>Edit record</div>;
// },
// );

// describe('EditRecordModal', () => {
// const onClose = vi.fn();
// test('Open and close modal', async () => {
// const comp = mount(<EditRecordModal open library="test_lib" onClose={onClose} />);

// expect(comp.find('Modal').prop('open')).toBe(true);

// act(() => {
// comp.find('Button.close-button').simulate('click');
// });

// await wait(0);

// expect(onClose).toHaveBeenCalled();
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
