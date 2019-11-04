import {AwilixContainer} from 'awilix';
import * as fs from 'fs';
import {IAppModule, IExtensionPoints} from '_types/shared';

export const initPlugins = async (folder: string, pluginsDepsManager: AwilixContainer) => {
    // Retrieve extensions points accross all core app files
    // They will be passed to each plugin in init function
    const appModules: IAppModule[] = Object.keys(pluginsDepsManager.registrations)
        .filter(modName => modName.match(/^core\.app\./))
        .map(modName => pluginsDepsManager.cradle[modName]);

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
            const injectedIndex = defaultExport(pluginsDepsManager.cradle);
            injectedIndex.init(extensionPoints);
        }
    }
};
