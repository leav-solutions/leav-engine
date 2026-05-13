// import {shallow} from 'enzyme';
// import React from 'react';
// import {type GET_VIEWS_views_list} from '../../../../_gqlTypes/GET_VIEWS';
// import ViewSelectorField from './ViewSelectorField';

// jest.mock('../../../../utils/utils', () => ({
// formatIDString: jest.fn().mockImplementation(s => s),
// localizedLabel: jest.fn().mockImplementation(l => l.fr),
// getSysTranslationQueryLanguage: jest.fn().mockReturnValue(v => ['fr', 'fr']),
// }));

// jest.mock('../../../../hooks/useLang');

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
