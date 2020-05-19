import {
    asFunction,
    asValue,
    AwilixContainer,
    createContainer,
    InjectionMode,
    listModules,
    ModuleDescriptor
} from 'awilix';
import {realpathSync} from 'fs';
import {getConfig} from './config';

const _registerModules = async (
    container: AwilixContainer,
    folder: string,
    glob: string,
    prefix: string = ''
): Promise<AwilixContainer> => {
    // We only consider index files so that we explicity declare what we want to make available
    // in dependency injector. This allows to have some helper files kept private inside a module.
    const coreModulesList: ModuleDescriptor[] = listModules(glob, {
        cwd: folder
    });

    for (const mod of coreModulesList) {
        const relativePath = mod.path.split(folder + '/').join('');

        // Import module
        const importedMod = await import(mod.path);

        // Explode path, remove index file
        const pathParts = relativePath.split('/').filter(p => !p.match(/index\.(ts|js)/g));

        // Register module exports
        // Register default export by its parent folder name, register named exports by their actual name
        // This will give, for example: 'core.domain.value' or 'core.domain.permissions.record'
        for (const modExport of Object.keys(importedMod)) {
            const prefixedNamePart = prefix ? [prefix] : [];
            const nameParts = [...prefixedNamePart, ...pathParts];

            if (modExport !== 'default') {
                nameParts.push(modExport);
            }

            // Check if we must register function or a simple value.
            // Registering as class is not supported voluntarily. We don't want class.
            container.register({
                [nameParts.join('.')]:
                    typeof importedMod[modExport] === 'function'
                        ? asFunction(importedMod[modExport]).singleton()
                        : asValue(importedMod[modExport])
            });
        }
    }

    return container;
};

export async function init(additionalModulesToRegister?: {
    [registerKey: string]: any;
}): Promise<{coreContainer: AwilixContainer; pluginsContainer: AwilixContainer}> {
    const srcFolder = __dirname;
    const pluginsFolder = realpathSync(__dirname + '/plugins');
    const modulesGlob = '+(app|domain|infra|interface|utils)/**/index.+(ts|js)';
    const pluginsModulesGlob = `!(core)/${modulesGlob}`;

    /*** CORE ***/
    const coreContainer = createContainer({
        injectionMode: InjectionMode.PROXY
    });

    await _registerModules(coreContainer, srcFolder, modulesGlob, 'core');

    // Add a few extra dependencies
    coreContainer.register('config', asValue(await getConfig()));
    coreContainer.register('pluginsFolder', asValue(pluginsFolder));

    for (const [modKey, mod] of Object.entries(additionalModulesToRegister)) {
        coreContainer.register(modKey, asValue(mod));
    }

    /*** PLUGINS ***/
    const pluginsContainer = coreContainer.createScope();

    await _registerModules(pluginsContainer, pluginsFolder, pluginsModulesGlob);

    // Register this at the very end because we don't plugins to access the deps manager
    coreContainer.register('core.depsManager', asValue(coreContainer));

    return {coreContainer, pluginsContainer};
}
