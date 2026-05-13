import {IPluginsRepo} from '../../infra/plugins/pluginsRepo';
import {IPluginInfos, IRegisteredPlugin} from '../../_types/plugin';
import {IQueryInfos} from '../../_types/queryInfos';
import {AdminPermissionsActions} from '../../_types/permissions';
import {type IPermissionDomain} from '../permission/permissionDomain';
import {type IAdminPermissionDomain} from '../permission/adminPermissionDomain';
import PermissionError from '../../errors/PermissionError';

interface IDeps {
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.infra.plugins': IPluginsRepo;
}

export interface IPluginsDomain {
    registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin;
    getRegisteredPlugins(ctx: IQueryInfos): Promise<IRegisteredPlugin[]>;
}

export default function ({
    'core.domain.permission.admin': adminPermissionDomain,
    'core.infra.plugins': pluginsRepo,
}: IDeps): IPluginsDomain {
    return {
        registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin {
            return pluginsRepo.registerPlugin(path, plugin);
        },
        async getRegisteredPlugins(ctx): Promise<IRegisteredPlugin[]> {
            const accessPluginsList = await adminPermissionDomain.getAdminPermission({
                action: AdminPermissionsActions.LIST_PLUGINS,
                ctx,
            });

            if (!accessPluginsList) {
                throw new PermissionError(AdminPermissionsActions.LIST_PLUGINS);
            }

            return pluginsRepo.getRegisteredPlugins();
        },
    };
}
