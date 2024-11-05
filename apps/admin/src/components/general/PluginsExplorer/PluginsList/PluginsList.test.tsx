// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import PluginsList from './PluginsList';

const wait = () => new Promise((res, rej) => {
        setTimeout(res, 0);
    });

const pluginsProp = [
    {
        author: '',
        description: '',
        name: 'plugin',
        version: '0.0.1',
        __typename: 'Plugin'
    }
];

describe('PluginsList', () => {
    test('Renders without crashing', async () => {
        let comp;
        await act(async () => {
            comp = mount(<PluginsList />);
        });

        await act(async () => {
            await wait();
        });

        comp.update();
        const table = comp.find('Table');
        expect(table.length).toBe(1);
    });

    test('renders the plugin in the table', async () => {
        let comp;
        await act(async () => {
            comp = mount(<PluginsList plugins={pluginsProp} />);
        });

        await act(async () => {
            await wait();
        });

        comp.update();
        const rows = comp.find('Table').find('tr');
        expect(rows.at(1).contains('plugin')).toBe(true);
    });
});
