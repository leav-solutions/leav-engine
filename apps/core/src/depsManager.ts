// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    asFunction,
    asValue,
    AwilixContainer,
    createContainer,
    InjectionMode,
    listModules,
    ModuleDescriptor
} from 'awilix';
import {getConfig} from './config';
import path from 'path';
import {existsSync} from 'fs';

const _registerModules = async (
    container: AwilixContainer,
    folder: string,
    glob: string,
    prefix = ''
): Promise<AwilixContainer> => {
    // We only consider index files so that we explicity declare what we want to make available
    // in dependency injector. This allows to have some helper files kept private inside a module.
    const modulesList: ModuleDescriptor[] = listModules(glob, {
        cwd: folder
    });

    for (const mod of modulesList) {
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

export async function initDI(additionalModulesToRegister?: {
    [registerKey: string]: any;
}): Promise<{coreContainer: AwilixContainer; pluginsContainer: AwilixContainer}> {
    const srcFolder = __dirname;
    // Add a few extra dependencies
    const coreConf = await getConfig();

    const pluginsFolder: string[] = (coreConf.pluginsPath ?? [])
        .map(pluginPath => path.resolve(__dirname + '/' + pluginPath))
        .filter(existsSync);

    const modulesGlob = '+(app|domain|infra|interface|utils)/**/index.+(ts|js)';

    /*** CORE ***/
    const coreContainer = createContainer({
        injectionMode: InjectionMode.PROXY
    });

    await _registerModules(coreContainer, srcFolder, modulesGlob, 'core');

    coreContainer.register('config', asValue(coreConf));

    for (const [modKey, mod] of Object.entries(additionalModulesToRegister)) {
        coreContainer.register(modKey, asValue(mod));
    }

    /*** PLUGINS ***/
    const pluginsContainer = coreContainer.createScope();

    await Promise.all(
        pluginsFolder.map(pluginFolder =>
            _registerModules(pluginsContainer, pluginFolder, modulesGlob, path.basename(pluginFolder))
        )
    );

    // Register this at the very end because we don't want plugins to access the deps manager
    coreContainer.register('core.depsManager', asValue(coreContainer));

    return {coreContainer, pluginsContainer};
}
