// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount, shallow} from 'enzyme';
import React from 'react';
import Navigator from '.';
import MockedLangContextProvider from '../../__mocks__/MockedLangContextProvider';

jest.mock('./MainPanel', () => {
    return function MainPanel() {
        return <>MainPanel MOCKED</>;
    };
});
jest.mock('./RootSelector', () => {
    return function RootSelector() {
        return <>ROOT SELECTOR MOCKED</>;
    };
});

describe('Navigator', () => {
    test('it mounts', () => {
        const comp = shallow(
            <MockedLangContextProvider>
                <Navigator />
            </MockedLangContextProvider>
        );
        expect(comp).toBeDefined();
    });
    test('it shows RootSelector if restrictToRoot is not defined', () => {
        const comp = mount(
            <MockedLangContextProvider>
                <Navigator />
            </MockedLangContextProvider>
        );
        expect(comp.find('RootSelector')).toHaveLength(1);
    });
    test('it shows MainPanel if single restrictToRoot', () => {
        const comp = mount(
            <MockedLangContextProvider>
                <Navigator restrictToRoots={['test']} />
            </MockedLangContextProvider>
        );
        const mainPanel = comp.find('MainPanel');
        expect(mainPanel).toHaveLength(1);
    });
    test('it shows RootSelector if multiple restrictToRoot', () => {
        const roots = ['test', 'test2'];
        const comp = mount(
            <MockedLangContextProvider>
                <Navigator restrictToRoots={roots} />
            </MockedLangContextProvider>
        );
        const rootSelector = comp.find('RootSelector');
        expect(rootSelector).toHaveLength(1);
        expect(rootSelector.prop('restrictToRoots')).toEqual(roots);
    });
});
