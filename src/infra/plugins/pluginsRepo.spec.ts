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
