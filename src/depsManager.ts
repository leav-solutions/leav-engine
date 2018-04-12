import {
    asFunction,
    asValue,
    AwilixContainer,
    createContainer,
    InjectionMode,
    ModuleDescriptor,
    Lifetime,
    listModules
} from 'awilix';
import * as path from 'path';
import {config} from './config';

export async function init(): Promise<AwilixContainer> {
    const container = createContainer({
        injectionMode: InjectionMode.CLASSIC
    });

    container.register('config', asValue(await config));

    const excludedFolders = ['_types', '__tests__', 'migrations', 'errors', 'index.ts'];

    const modulesList: ModuleDescriptor[] = listModules('**/!(*.spec).+(js|ts)', {
        cwd: __dirname
    }).filter(mod => mod.path.match(excludedFolders.join('|')) === null);

    for (const mod of modulesList) {
        let importedMod = await import(mod.path);
        importedMod = importedMod.default;

        if (typeof importedMod === 'function') {
            container.register(mod.name, asFunction(importedMod).singleton());
        }
    }

    container.register('depsManager', asValue(container));

    return container;
}
