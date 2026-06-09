// import {shallow} from 'enzyme';
// import React from 'react';
// import {mockLibrary} from '../../../__mocks__/libraries';
// import LibrariesSelectorField from './LibrariesSelectorField';

// vi.mock('../../../utils/utils', () => ({
// formatIDString: vi.fn().mockImplementation(s => s),
// localizedLabel: vi.fn().mockImplementation(l => l.fr),
// getSysTranslationQueryLanguage: vi.fn().mockReturnValue(v => ['fr', 'fr']),
// }));

// vi.mock('../../../hooks/useLang');

// describe('LibrariesSelectorField', () => {
// test('Snapshot test', async () => {
// const libraries = [
// {
// ...mockLibrary,
// id: 'lib1',
// label: {fr: 'Lib'},
// },
// {
// ...mockLibrary,
// id: 'lib2',
// label: {fr: 'Lib'},
// },
// ];

// const comp = shallow(<LibrariesSelectorField libraries={libraries} />);

// expect(comp.find('FormDropdown').prop('options')).toHaveLength(2);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
