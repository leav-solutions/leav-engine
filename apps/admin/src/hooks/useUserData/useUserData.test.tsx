// import {mount} from 'enzyme';
// import React from 'react';
// import useUserData from '.';
// import MockedUserContextProvider from '../../__mocks__/MockedUserContextProvider';

// describe('useUserData', () => {
// const CompWithUserData = () => {
// const userData = useUserData();

// return <div className="userId">{userData.id}</div>;
// };

// test('Return user data from context', async () => {
// const comp = mount(
// <MockedUserContextProvider>
// <CompWithUserData />
// </MockedUserContextProvider>,
// );

// expect(comp.find('div.userId').text()).toBe('1');
// });

// test('Throw if no context provided', async () => {
// Prevent Error about a missing context type from appearing in the console.
// const errorLogger = console.error;
// console.error = jest.fn();
// expect(() => mount(<CompWithUserData />)).toThrow();

// console.error = errorLogger;
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
