// import {MockedProvider} from '@apollo/client/testing';
// import {render} from 'enzyme';
// import React from 'react';
// import {act, create} from 'react-test-renderer';
// import {mockTree} from '../../../../../../__mocks__/trees';
// import TreeInfosForm from './InfosForm';

// vi.mock('../../../../../../utils', () => ({
// formatIDString: vi.fn().mockImplementation(s => s),
// localizedLabel: vi.fn().mockImplementation(l => l.fr),
// getFieldError: vi.fn().mockReturnValue(''),
// }));
// vi.mock('../../../../../../hooks/useLang');

// describe('TreeInfosForm', () => {
// const onSubmit = vi.fn();
// const onCheckIdExists = vi.fn().mockReturnValue(false);

// test('Render form for existing tree', async () => {
// const comp = render(
// <MockedProvider>
// <TreeInfosForm tree={mockTree} onSubmit={onSubmit} readonly={false} onCheckIdExists={onCheckIdExists} />
// </MockedProvider>,
// );
// expect(comp.find('input[name="id"]').prop('disabled')).toBe(true);
// });

// test('Render form for new tree', async () => {
// const comp = render(
// <MockedProvider>
// <TreeInfosForm tree={null} onSubmit={onSubmit} readonly={false} onCheckIdExists={onCheckIdExists} />
// </MockedProvider>,
// );
// expect(comp.find('input[name="id"]').prop('disabled')).toBe(false);
// });

// test('Autofill ID with label on new lib', async () => {
// let comp;
// await act(async () => {
// comp = create(
// <MockedProvider>
// <TreeInfosForm onSubmit={onSubmit} tree={null} readonly={false} onCheckIdExists={onCheckIdExists} />
// </MockedProvider>,
// );
// });

// act(() => {
// comp.root.findByProps({name: 'label.fr'}).props.onChange(null, {
// type: 'text',
// name: 'label.fr',
// value: 'labelfr',
// });
// });

// expect(comp.root.findByProps({name: 'id'}).props.value).toBe('labelfr');
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
