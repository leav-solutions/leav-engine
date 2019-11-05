import {ICorePluginsApp} from 'app/core/pluginsApp';
import {AwilixContainer} from 'awilix';
import * as fs from 'fs';
import {IAppModule, IExtensionPoints} from '_types/shared';

export const initPlugins = async (folder: string, depsManager: AwilixContainer) => {
    const pluginsApp: ICorePluginsApp = depsManager.cradle['core.app.core.plugins'];

    // Retrieve extensions points accross all core app files
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
        if (!fs.existsSync(pluginFullPath) || !fs.lstatSync(pluginFullPath).isDirectory()) {
            continue;
        }

        const importedPlugin = await import(folder + '/' + pluginName);
        const defaultExport = importedPlugin.default;

        // Default export must be a function that takes deps as the only parameter
        if (typeof defaultExport === 'function') {
            // Manually inject ours deps
            const injectedIndex = defaultExport(depsManager.cradle);
            await injectedIndex.init(extensionPoints);
        }

        // Read plugins informations in package.json to register it
        const packageInfos = await import(folder + '/' + pluginName + '/package.json');
        pluginsApp.registerPlugin({
            name: packageInfos.name,
            description: packageInfos.description,
            version: packageInfos.version,
            author: packageInfos.author
        });
    }
};
