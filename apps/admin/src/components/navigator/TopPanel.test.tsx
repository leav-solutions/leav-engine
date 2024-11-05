// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';

import TopPanel from './TopPanel';
import {initialState, ActionTypes} from './NavigatorReducer';

const lang = ['fr', 'fr'];
describe('<TopPanel />', () => {
    test('can trigger change root', async () => {
        const mockDispatch = jest.fn(() => undefined);
        const state = {
            ...initialState,
            selectedRoot: 'test',
            lang
        };
        let wrapper;
        await act(async () => {
            wrapper = mount(<TopPanel state={state} dispatch={mockDispatch} />);
        });
        wrapper.update();
        wrapper.find('button[data-testid="clear_root"]').simulate('click');
        expect(mockDispatch.mock.calls.length).toBe(1);
        const mockCall = mockDispatch.mock.calls[0];
        expect(mockCall.length).toBe(1);
        // @ts-ignore : mockCall may be empty, handled on previous expect
        const firstArg = mockCall[0];
        expect(firstArg).toHaveProperty('type');
        // @ts-ignore : firstArg may not have type property, handled on previous expect
        expect(firstArg.type).toBe(ActionTypes.SET_SELECTED_ROOT);
        expect(firstArg).toHaveProperty('data');
        // @ts-ignore : firstArg may not have data property, handled on previous expect
        expect(firstArg.data).toBe(null);
    });
    test('can trigger toggle filters', async () => {
        const mockDispatch = jest.fn(() => undefined);
        const state = {
            ...initialState,
            selectedRoot: 'test',
            lang
        };
        let wrapper;
        await act(async () => {
            wrapper = mount(<TopPanel state={state} dispatch={mockDispatch} />);
        });
        wrapper.update();
        wrapper.find('button[data-testid="toggle_filters"]').simulate('click');
        expect(mockDispatch.mock.calls.length).toBe(1);
        const mockCall = mockDispatch.mock.calls[0];
        expect(mockCall.length).toBe(1);
        // @ts-ignore : mockCall may be empty, handled on previous expect
        const firstArg = mockCall[0];
        expect(firstArg).toHaveProperty('type');
        // @ts-ignore : firstArg may not have type property, handled on previous expect
        expect(firstArg.type).toBe(ActionTypes.TOGGLE_FILTERS);
    });
});
