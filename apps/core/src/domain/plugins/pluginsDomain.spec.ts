// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPluginsRepo} from '../../infra/plugins/pluginsRepo';
import {mockPlugin} from '../../__tests__/mocks/plugins';
import pluginsDomain from './pluginsDomain';
import {mockCtx} from '../../__tests__/mocks/shared';
import {systemUserId} from '../../_constants/users';
import type {IAdminPermissionDomain} from '../permission/adminPermissionDomain';
import {IGetAdminPermissionParams} from '../permission/_types';

describe('PluginsDomain', () => {
    const mockPluginsRepo: Mockify<IPluginsRepo> = {
        registerPlugin: vi.fn().mockImplementation((path, infos) => ({path, infos})),
        getRegisteredPlugins: vi.fn().mockReturnValue([{path: '/fake/path', infos: {...mockPlugin}}]),
    };

    const mockAdminPermissionDomain: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(true),
    };

    const plugins = pluginsDomain({
        'core.infra.plugins': mockPluginsRepo as IPluginsRepo,
        'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
    });

    test('Register plugin', async () => {
        const pluginToRegister = {...mockPlugin};

        const registeredPlugin = plugins.registerPlugin('/fake/path', pluginToRegister);

        expect(registeredPlugin.path).toBe('/fake/path');
        expect(registeredPlugin.infos).toEqual(pluginToRegister);
        expect(mockPluginsRepo.registerPlugin).toHaveBeenCalled();
    });

    test('Get registered plugins', async () => {
        const registeredPlugins = await plugins.getRegisteredPlugins({userId: systemUserId});

        expect(registeredPlugins).toHaveLength(1);
        expect(registeredPlugins[0].path).toBe('/fake/path');
        expect(registeredPlugins[0].infos).toEqual(mockPlugin);
        expect(mockPluginsRepo.getRegisteredPlugins).toHaveBeenCalled();
    });
});
