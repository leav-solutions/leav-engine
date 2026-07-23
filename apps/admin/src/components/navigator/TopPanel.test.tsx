// import React from 'react';
// import {mount} from 'enzyme';

// import TopPanel from './TopPanel';
// import {initialState, ActionTypes} from './NavigatorReducer';

// const lang = ['fr', 'fr'];
// describe('<TopPanel />', () => {
// test('can trigger change root', async () => {
// const mockDispatch = vi.fn(() => undefined);
// const state = {
// ...initialState,
// selectedRoot: 'test',
// lang,
// };
// let wrapper;
// await act(async () => {
// wrapper = mount(<TopPanel state={state} dispatch={mockDispatch} />);
// });
// wrapper.update();
// wrapper.find('button[data-testid="clear_root"]').simulate('click');
// expect(mockDispatch.mock.calls.length).toBe(1);
// const mockCall = mockDispatch.mock.calls[0];
// expect(mockCall.length).toBe(1);
// const firstArg = mockCall[0];
// expect(firstArg).toHaveProperty('type');
// expect(firstArg.type).toBe(ActionTypes.SET_SELECTED_ROOT);
// expect(firstArg).toHaveProperty('data');
// expect(firstArg.data).toBe(null);
// });
// test('can trigger toggle filters', async () => {
// const mockDispatch = vi.fn(() => undefined);
// const state = {
// ...initialState,
// selectedRoot: 'test',
// lang,
// };
// let wrapper;
// await act(async () => {
// wrapper = mount(<TopPanel state={state} dispatch={mockDispatch} />);
// });
// wrapper.update();
// wrapper.find('button[data-testid="toggle_filters"]').simulate('click');
// expect(mockDispatch.mock.calls.length).toBe(1);
// const mockCall = mockDispatch.mock.calls[0];
// expect(mockCall.length).toBe(1);
// const firstArg = mockCall[0];
// expect(firstArg).toHaveProperty('type');
// expect(firstArg.type).toBe(ActionTypes.TOGGLE_FILTERS);
// });
// });

it.todo('Tests commented - migrate to react-testing-library');
