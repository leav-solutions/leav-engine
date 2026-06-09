// import {shallow} from 'enzyme';
// import React from 'react';
// import {type GET_VIEWS_views_list} from '../../../../_gqlTypes/GET_VIEWS';
// import ViewSelectorField from './ViewSelectorField';

// vi.mock('../../../../utils/utils', () => ({
// formatIDString: vi.fn().mockImplementation(s => s),
// localizedLabel: vi.fn().mockImplementation(l => l.fr),
// getSysTranslationQueryLanguage: vi.fn().mockReturnValue(v => ['fr', 'fr']),
// }));

// vi.mock('../../../../hooks/useLang');

// describe('AttributesSelectorField', () => {
// test('Render dropdown with attributes', async () => {
// const views: GET_VIEWS_views_list[] = [
// {
// id: '123456',
// label: {fr: 'Test View'},
// },
// {
// id: '123457',
// label: {fr: 'Test View 2'},
// },
// ];

// const comp = shallow(<ViewSelectorField views={views} />);

// expect(comp.find('FormDropdown').prop('options')).toHaveLength(3);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
