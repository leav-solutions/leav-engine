// import {shallow} from 'enzyme';
// import React from 'react';
// import {type GET_LIB_BY_ID_libraries_list} from '../../../_gqlTypes/GET_LIB_BY_ID';
// import {type Mockify} from '../../../_types//Mockify';
// import {mockAttrSimple} from '../../../__mocks__/attributes';
// import UnlinkLibAttribute from './UnlinkLibAttribute';

// describe('UnlinkLibAttribute', () => {
// test('Pass down unlink function', async () => {
// const library: Mockify<GET_LIB_BY_ID_libraries_list> = {
// id: 'test',
// label: {fr: 'Test', en: null},
// system: false,
// attributes: [
// {
// ...mockAttrSimple,
// },
// ],
// };
// const onUnlink = jest.fn();

// const comp = shallow(
// <UnlinkLibAttribute
// library={library as GET_LIB_BY_ID_libraries_list}
// attribute={library.attributes![0]}
// onUnlink={onUnlink}
// />,
// );

// expect(comp.find('ConfirmedButton').props().action).toBeDefined();
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
