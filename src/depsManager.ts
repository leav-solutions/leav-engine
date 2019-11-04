import {
    asFunction,
    asValue,
    AwilixContainer,
    createContainer,
    InjectionMode,
    listModules,
    ModuleDescriptor
} from 'awilix';
import {config} from './config';

export async function init(): Promise<AwilixContainer> {
    const srcFolder = __dirname;

    const coreContainer = createContainer({
        injectionMode: InjectionMode.PROXY
    });

    // We only consider index files so that we explicity declare what we want to make available
    // in dependency injector. This allows to have some helper files kept private inside a module.
    const coreModulesList: ModuleDescriptor[] = listModules('+(app|domain|infra|interface|utils)/**/index.+(ts|js)', {
        cwd: srcFolder
    });

    for (const mod of coreModulesList) {
        const relativePath = mod.path.split(srcFolder + '/').join('');

        // Import module
        const importedMod = await import(mod.path);

        // Explode path, remove index file
        const pathParts = relativePath.split('/').filter(p => !p.match(/index\.(ts|js)/g));

        // Register module exports
        // Register default export by its parent folder name, register named exports by their actual name
        // This will give, for example: 'core.domain.value' or 'core.domain.permissions.record'
        for (const modExport of Object.keys(importedMod)) {
            const nameParts = ['core', ...pathParts];

            if (modExport !== 'default') {
                nameParts.push(modExport);
            }

            // Check if we must register function or a simple value.
            // Registering as class is not supported voluntarily. We don't want class.
            coreContainer.register({
                [nameParts.join('.')]:
                    typeof importedMod[modExport] === 'function'
                        ? asFunction(importedMod[modExport]).singleton()
                        : asValue(importedMod[modExport])
            });
        }
    }

    // Add a few extra dependencies
    coreContainer.register('config', asValue(await config));
    coreContainer.register('core.depsManager', asValue(coreContainer));

    return coreContainer;
}
