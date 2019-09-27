import React from 'react';
import {shallow, mount} from 'enzyme';

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
        let comp: any;
        comp = mount(
            <MockedLangContextProvider>
                <Navigator />
            </MockedLangContextProvider>
        );
        expect(comp.find('RootSelector')).toHaveLength(1);
    });
    test('it shows MainPanel if single restrictToRoot', () => {
        let comp: any;
        comp = mount(
            <MockedLangContextProvider>
                <Navigator restrictToRoots={['test']} />
            </MockedLangContextProvider>
        );
        const mainPanel = comp.find('MainPanel');
        expect(mainPanel).toHaveLength(1);
    });
    test('it shows RootSelector if multiple restrictToRoot', () => {
        const roots = ['test', 'test2'];
        let comp: any;
        comp = mount(
            <MockedLangContextProvider>
                <Navigator restrictToRoots={roots} />
            </MockedLangContextProvider>
        );
        const rootSelector = comp.find('RootSelector');
        expect(rootSelector).toHaveLength(1);
        expect(rootSelector.props().restrictToRoots).toEqual(roots);
    });
});
