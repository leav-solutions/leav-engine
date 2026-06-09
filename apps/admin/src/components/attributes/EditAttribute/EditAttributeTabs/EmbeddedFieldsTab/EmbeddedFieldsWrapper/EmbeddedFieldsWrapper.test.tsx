// import {mount} from 'enzyme';
// import React from 'react';
// import EmbeddedFieldsDisplay from '../EmbeddedFieldsDisplay';
// import EmbeddedFieldsForm from '../EmbeddedFieldsForm';
// import EmbeddedFieldsWrapper from './EmbeddedFieldsWrapper';

// vi.mock('../../../../../../hooks/useLang');

// describe('EmbeddedFieldsWrapper', () => {
// const handleSave = vi.fn();
// test('should return something', () => {
// const mockAttributes = {
// id: 'test',
// label: {
// fr: 'testFr',
// en: 'testEn',
// },
// format: 'text',
// };

// const mockValues = [];

// const mockSetValues = vi.fn();

// const comp = mount(
// <EmbeddedFieldsWrapper
// attribute={mockAttributes}
// displayForm
// formValues={mockValues}
// setFormValues={mockSetValues}
// save={handleSave}
// />,
// );

// expect(comp.find('div')).toBeTruthy();
// });

// test('should return EmbeddedFieldsForm', () => {
// const mockAttributes = {
// id: 'test',
// label: {
// fr: 'testFr',
// en: 'testEn',
// },
// format: 'testFormat',
// };

// const mockValues = [];

// const mockSetValues = vi.fn();

// const comp = mount(
// <EmbeddedFieldsWrapper
// attribute={mockAttributes}
// displayForm
// formValues={mockValues}
// setFormValues={mockSetValues}
// save={handleSave}
// />,
// );

// expect(comp.find(EmbeddedFieldsForm)).toHaveLength(1);
// });

// test('should return EmbeddedFieldsDisplay', () => {
// const mockAttributes = {
// id: 'test',
// label: {
// fr: 'testFr',
// en: 'testEn',
// },
// format: 'text',
// };

// const mockValues = [];

// const mockSetValues = vi.fn();

// const comp = mount(
// <EmbeddedFieldsWrapper
// attribute={mockAttributes}
// displayForm={false}
// formValues={mockValues}
// setFormValues={mockSetValues}
// save={handleSave}
// />,
// );

// expect(comp.find(EmbeddedFieldsDisplay)).toHaveLength(1);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
