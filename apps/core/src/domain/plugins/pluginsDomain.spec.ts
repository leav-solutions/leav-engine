// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPluginsRepo} from 'infra/plugins/pluginsRepo';
import {mockPlugin} from '../../__tests__/mocks/plugins';
import pluginsDomain from './pluginsDomain';

describe('PluginsDomain', () => {
    const mockPluginsRepo: Mockify<IPluginsRepo> = {
        registerPlugin: jest.fn().mockImplementation((path, infos) => ({path, infos})),
        getRegisteredPlugins: jest.fn().mockReturnValue([{path: '/fake/path', infos: {...mockPlugin}}])
    };
    const plugins = pluginsDomain({'core.infra.plugins': mockPluginsRepo as IPluginsRepo});

    test('Register plugin', async () => {
        const pluginToRegister = {...mockPlugin};

        const registeredPlugin = plugins.registerPlugin('/fake/path', pluginToRegister);

        expect(registeredPlugin.path).toBe('/fake/path');
        expect(registeredPlugin.infos).toEqual(pluginToRegister);
        expect(mockPluginsRepo.registerPlugin).toHaveBeenCalled();
    });

    test('Get registered plugins', async () => {
        const registeredPlugins = plugins.getRegisteredPlugins();

        expect(registeredPlugins).toHaveLength(1);
        expect(registeredPlugins[0].path).toBe('/fake/path');
        expect(registeredPlugins[0].infos).toEqual(mockPlugin);
        expect(mockPluginsRepo.getRegisteredPlugins).toHaveBeenCalled();
    });
});
