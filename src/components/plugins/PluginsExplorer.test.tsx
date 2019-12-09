import React from 'react';
import {mount} from 'enzyme';
import PluginsExplorer from './PluginsExplorer';
import {BrowserRouter as Router} from 'react-router-dom';
import {MockedProvider} from '@apollo/react-testing';
import {Mockify} from '../../_types//Mockify';
import MockedLangContextProvider from '../../__mocks__/MockedLangContextProvider';
import MockedUserContextProvider from '../../__mocks__/MockedUserContextProvider';
import {getPluginsQuery} from '../../queries/plugins/getPluginsQuery';
import {act} from 'react-dom/test-utils';

const wait = () => {
    return new Promise((res, rej) => {
        setTimeout(res, 0);
    });
};

jest.mock('./PluginsList', () => {
    return function PluginsList(props) {
        return <div>MOCK PluginsList</div>;
    };
});

const pluginData = {
    author: '',
    description: '',
    name: 'plugin',
    version: '0.0.1',
    __typename: 'Plugin'
};

const mocks = [
    {
        request: {
            query: getPluginsQuery
        },
        result: {
            data: {
                plugins: [pluginData]
            }
        }
    }
];

describe('PluginsExplorer', () => {
    test('Renders without crashing', async () => {
        const mockHistory: Mockify<History> = {};

        let comp;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks}>
                    <MockedLangContextProvider>
                        <MockedUserContextProvider>
                            <Router>
                                <PluginsExplorer history={mockHistory as History} />
                            </Router>
                        </MockedUserContextProvider>
                    </MockedLangContextProvider>
                </MockedProvider>
            );
        });

        await act(async () => {
            await wait();
        });

        comp.update();
        const pluginsList = comp.find('PluginsList');
        expect(pluginsList.length).toBe(1);
    });

    test('renders a plugin from querty', async () => {
        const mockHistory: Mockify<History> = {};

        let comp;

        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks}>
                    <MockedLangContextProvider>
                        <MockedUserContextProvider>
                            <Router>
                                <PluginsExplorer history={mockHistory as History} />
                            </Router>
                        </MockedUserContextProvider>
                    </MockedLangContextProvider>
                </MockedProvider>
            );
        });

        await act(async () => {
            await wait();
        });

        comp.update();

        const pluginsList = comp.find('PluginsList');
        const pluginsProps = pluginsList.prop('plugins');
        expect(pluginsProps[0]).toEqual(pluginData);
    });
});
