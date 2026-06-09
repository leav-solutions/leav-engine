// import {shallow} from 'enzyme';
// import React from 'react';
// import AttributeCreationModal from './AttributeCreationModal';

// vi.mock(
// '../EditAttribute',
// () =>
// function EditAttribute() {
// return <div>Edit attribute</div>;
// },
// );

// describe('AttributeCreationModal', () => {
// const onClose = vi.fn();
// const onPostSave = vi.fn();
// test('Render edit attribute form with no attribute', async () => {
// const comp = shallow(<AttributeCreationModal open onClose={onClose} onPostSave={onPostSave} />);

// expect(comp.find('EditAttribute')).toHaveLength(1);
// expect(comp.find('EditAttribute').prop('attributeId')).toBe(null);
// });

// test('If not open, modal should not be open', async () => {
// const comp = shallow(<AttributeCreationModal open={false} onClose={onClose} onPostSave={onPostSave} />);

// expect(comp.find('Modal').prop('open')).toBe(false);
// });

// test('Calls onClose', async () => {
// const comp = shallow(<AttributeCreationModal open onClose={onClose} onPostSave={onPostSave} />);

// const onCloseFunc: () => void = comp.find('Modal').prop('onClose');

// if (!!onCloseFunc) {
// onCloseFunc();
// }

// expect(onClose).toHaveBeenCalled();
// });

// test('Calls onPostSave', async () => {
// const comp = shallow(<AttributeCreationModal open onClose={onClose} onPostSave={onPostSave} />);

// const onPostSaveFunc: () => void = comp.find('EditAttribute').prop('onPostSave');

// if (!!onPostSaveFunc) {
// onPostSaveFunc();
// }

// expect(onPostSave).toHaveBeenCalled();
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
