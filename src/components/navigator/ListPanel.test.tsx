// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from '../../utils/testUtils';
import MockedLangContextProvider from '../../__mocks__/MockedLangContextProvider';
import ListPanel from './ListPanel';
import {initialState} from './NavigatorReducer';

const lang = ['fr'];

const getTests = (range = 1) => {
    const returnArr: any[] = [];
    let id = 1391560;

    for (let i = 0; i < range; i++) {
        id++;
        returnArr.push({
            whoAmI: {
                id: id.toString(),
                label: null,
                color: null,
                preview: null,
                library: {
                    id: 'tests',
                    label: {fr: 'tests', en: 'tests'}
                }
            }
        });
    }
    return returnArr;
};

describe('<ListPanel />', () => {
    const tests = getTests(56);

    const state = {
        ...initialState,
        selectedRoot: 'tests',
        restrictToRoots: ['tests'],
        availableOffsets: [5, 10, 20],
        execSearch: false,
        lang,
        list: tests,
        totalCount: tests.length,
        selectedOffset: 5
    };

    test('pagination and select call dispatch', async () => {
        let wrapper;
        const mockDispatch = jest.fn(() => undefined);
        await act(async () => {
            wrapper = mount(
                <MockedLangContextProvider>
                    <ListPanel state={state} dispatch={mockDispatch} />
                </MockedLangContextProvider>
            );
        });

        await act(async () => {
            wrapper.update();
        });
        await act(async () => {
            await wait(1);
        });

        const pagination = wrapper.find('Pagination');
        const selector = wrapper.find('Select');

        expect(pagination.props().totalPages).toBe(12);

        pagination.props().onPageChange(undefined, {activePage: 2});
        selector.props().onChange(undefined, {value: 20});

        expect(mockDispatch.mock.calls.length).toBe(2);
    });
});
