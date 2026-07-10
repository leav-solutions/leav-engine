import './pluginsModuleResolver';
import {logger} from '@leav/logger';
import {type ICorePluginsApp} from './app/core/pluginsApp';
import {asValue, type AwilixContainer} from 'awilix';
import * as fs from 'fs';
import {type IExtensionPoints} from './_types/extensionPoints';
import {type IAppModule} from './_types/shared';
import {getConfig} from './config';
import path from 'path';
import {type IUtils} from './utils/utils';
import {appRootPath} from './rootPath';

export const initPlugins = async (pluginsPath: string[], depsManager: AwilixContainer) => {
    if (!pluginsPath.length) {
        return;
    }

    const pluginsApp: ICorePluginsApp = depsManager.cradle['core.app.core.plugins'];

    // Retrieve extensions points across all core app files
    // They will be passed to each plugin in init function
    const appModules: IAppModule[] = Object.keys(depsManager.registrations)
        .filter(modName => modName.match(/^core\.app\./))
        .map(modName => depsManager.cradle[modName]);

    const extensionPoints: IExtensionPoints = appModules.reduce(
        (allExtPoints: IExtensionPoints, mod: IAppModule): IExtensionPoints => {
            if (typeof mod.extensionPoints !== 'undefined') {
                return {...allExtPoints, ...mod.extensionPoints};
            }

            return allExtPoints;
        },
        {},
    );

    const utils: IUtils = depsManager.cradle['core.utils'];

    logger.verbose(`Plugins to load: ${pluginsPath.join(', ')}`);
    // Init plugins
    for (const pluginPath of pluginsPath) {
        // Ignore files (like .gitignore or any other files)
        const pluginFullPath = path.join(appRootPath, pluginPath);
        const pluginName = path.basename(pluginPath);

        if (
            !(await utils.fileExists(pluginFullPath)) ||
            (!(await fs.promises.lstat(pluginFullPath)).isDirectory() &&
                !(await fs.promises.lstat(pluginFullPath)).isSymbolicLink())
        ) {
            continue;
        }

        const importedPlugin = await import(pluginFullPath);
        const defaultExport = importedPlugin.default;

        // Load plugin config
        const pluginConf = await getConfig(pluginFullPath);
        const newConf = {
            ...depsManager.cradle.config,
            plugins: {
                ...depsManager.cradle.config.plugins,
                [pluginName]: pluginConf,
            },
        };

        depsManager.register('config', asValue(newConf));

        // Default export must be a function that takes deps as the only parameter
        if (typeof defaultExport === 'function') {
            // Manually inject ours deps
            const injectedIndex = defaultExport(depsManager.cradle);
            await injectedIndex.init(extensionPoints);
        }

        // Read plugins information in package.json to register it
        const packageJsonContent = await fs.promises.readFile(`${pluginFullPath}/package.json`, 'utf8');
        const packageInfos = JSON.parse(packageJsonContent);

        pluginsApp.registerPlugin(pluginFullPath, {
            name: packageInfos.name,
            description: packageInfos.description,
            version: packageInfos.version,
            author: packageInfos.author,
        });
    }
};
