// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockPlugin} from '../../__tests__/mocks/plugins';
import pluginsRepo from './pluginsRepo';

describe('PluginsRepo', () => {
    test('Register and returns plugins', async () => {
        const plugin = {...mockPlugin};

        const plugins = pluginsRepo();

        const registeredPlugin = plugins.registerPlugin('/fake/path', plugin);

        expect(registeredPlugin).toEqual({path: '/fake/path', infos: plugin});
        expect(plugins.getRegisteredPlugins()).toEqual([{path: '/fake/path', infos: plugin}]);
    });
});
