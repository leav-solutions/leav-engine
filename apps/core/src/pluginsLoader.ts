// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICorePluginsApp} from 'app/core/pluginsApp';
import {asValue, AwilixContainer} from 'awilix';
import * as fs from 'fs';
import {IExtensionPoints} from '_types/extensionPoints';
import {IAppModule} from '_types/shared';
import {getConfig} from './config';
import path from 'path';

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
        {}
    );

    // Init plugins
    for (const pluginPath of pluginsPath) {
        // Ignore files (like .gitignore or any other files)
        const pluginFullPath = path.resolve(__dirname + '/' + pluginPath);
        const pluginName = path.basename(pluginPath);

        if (
            !fs.existsSync(pluginFullPath) ||
            (!fs.lstatSync(pluginFullPath).isDirectory() && !fs.lstatSync(pluginFullPath).isSymbolicLink())
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
                [pluginName]: pluginConf
            }
        };

        depsManager.register('config', asValue(newConf));

        // Default export must be a function that takes deps as the only parameter
        if (typeof defaultExport === 'function') {
            // Manually inject ours deps
            const injectedIndex = defaultExport(depsManager.cradle);
            await injectedIndex.init(extensionPoints);
        }

        // Read plugins information in package.json to register it
        const packageInfos = await import(pluginFullPath + '/package.json');

        pluginsApp.registerPlugin(pluginFullPath, {
            name: packageInfos.name,
            description: packageInfos.description,
            version: packageInfos.version,
            author: packageInfos.author
        });
    }
};
