// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICorePluginsApp} from 'app/core/pluginsApp';
import {asValue, AwilixContainer} from 'awilix';
import * as fs from 'fs';
import {IExtensionPoints} from '_types/extensionPoints';
import {IAppModule} from '_types/shared';
import {getConfig} from './config';

export const initPlugins = async (folder: string, depsManager: AwilixContainer) => {
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
    const plugins = await fs.promises.readdir(folder);
    for (const pluginName of plugins) {
        // Ignore files (like .gitignore or any other files)
        const pluginFullPath = folder + '/' + pluginName;

        if (
            !fs.existsSync(pluginFullPath) ||
            (!fs.lstatSync(pluginFullPath).isDirectory() && !fs.lstatSync(pluginFullPath).isSymbolicLink())
        ) {
            continue;
        }

        const importedPlugin = await import(folder + '/' + pluginName);
        const defaultExport = importedPlugin.default;

        // Load plugin config
        const pluginConf = await getConfig(`${folder}/${pluginName}`);
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
        const pluginPath = folder + '/' + pluginName;
        const packageInfos = await import(pluginPath + '/package.json');
        pluginsApp.registerPlugin(pluginPath, {
            name: packageInfos.name,
            description: packageInfos.description,
            version: packageInfos.version,
            author: packageInfos.author
        });
    }
};
