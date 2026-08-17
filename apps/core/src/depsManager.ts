import {
    asFunction,
    asValue,
    type AwilixContainer,
    createContainer,
    InjectionMode,
    // eslint-disable-next-line import/named
    listModules,
    type ModuleDescriptor,
} from 'awilix';

import {getConfig} from './config';
import path from 'path';
import {existsSync} from 'fs';
import {appRootPath} from './rootPath';
import {isTscCjsDoubleWrap} from './utils/helpers/isTscCjsDoubleWrap';
import {type ICoreDepsList} from './depsList';

export type IDepsManager = AwilixContainer<ICoreDepsList>;

export const registerModules = async (
    container: AwilixContainer,
    folder: string,
    glob: string,
    prefix = '',
): Promise<AwilixContainer> => {
    // We only consider index files so that we explicity declare what we want to make available
    // in dependency injector. This allows to have some helper files kept private inside a module.
    const modulesList: ModuleDescriptor[] = listModules(glob, {
        cwd: folder,
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
            let exportValue = importedMod[modExport];

            if (modExport === 'default' && isTscCjsDoubleWrap(exportValue)) {
                // Unwrap one level; if there's no real default underneath (named-exports-only
                // module), there's nothing to register for this key.
                if (typeof exportValue.default === 'undefined') {
                    continue;
                }
                exportValue = exportValue.default;
            }

            if (modExport === '__esModule' || modExport === 'module.exports') {
                // Both are artifacts Node's native import() adds when loading a tsc-compiled CJS
                // module (the __esModule interop marker, and a self-reference back to the whole
                // exports object) - never real exports of the source file, so never real modules
                // to register here.
                continue;
            }

            const prefixedNamePart = prefix ? [prefix] : [];
            const nameParts = [...prefixedNamePart, ...pathParts];

            if (modExport !== 'default') {
                nameParts.push(modExport);
            }

            // Check if we must register function or a simple value.
            // Registering as class is not supported voluntarily. We don't want class.
            container.register({
                [nameParts.join('.')]:
                    typeof exportValue === 'function' ? asFunction(exportValue).singleton() : asValue(exportValue),
            });
        }
    }

    return container;
};

export async function initDI(additionalModulesToRegister?: {
    [registerKey: string]: any;
}): Promise<{coreContainer: IDepsManager; pluginsContainer: IDepsManager}> {
    const srcFolder = __dirname;
    // Add a few extra dependencies
    const coreConf = await getConfig();

    const pluginsFolder: string[] = (coreConf.pluginsPath ?? [])
        .map(pluginPath => path.join(appRootPath, pluginPath))
        .filter(existsSync);

    const modulesGlob = '+(app|domain|infra|interface|utils)/**/index.+(ts|js)';

    /*** CORE ***/
    const coreContainer = createContainer<ICoreDepsList>({
        injectionMode: InjectionMode.PROXY,
    });

    await registerModules(coreContainer, srcFolder, modulesGlob, 'core');

    coreContainer.register('config', asValue(coreConf));

    for (const [modKey, mod] of Object.entries(additionalModulesToRegister)) {
        coreContainer.register(modKey, asValue(mod));
    }

    /*** PLUGINS ***/
    const pluginsContainer = coreContainer.createScope();

    await Promise.all(
        pluginsFolder.map(pluginFolder =>
            registerModules(pluginsContainer, pluginFolder, modulesGlob, path.basename(pluginFolder)),
        ),
    );

    // Register this at the very end because we don't want plugins to access the deps manager
    coreContainer.register('core.depsManager', asValue(pluginsContainer));

    return {coreContainer, pluginsContainer};
}
