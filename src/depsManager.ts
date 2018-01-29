import {asFunction, asValue, AwilixContainer, createContainer, Lifetime, listModules, ModuleDescriptor} from 'awilix';
import * as path from 'path';
import {config} from './config';

let container: AwilixContainer;

export async function init(): Promise<AwilixContainer> {
    if (typeof container === 'undefined') {
        container = createContainer();

        container.register('config', asValue(await config));

        const modulesList: ModuleDescriptor[] = listModules([ '+(app|domain|infra|interface)/**/!(*.spec).+(js|ts)' ], {
            cwd: __dirname
        });

        for (const mod of modulesList) {
            let importedMod = await import(mod.path);
            importedMod = importedMod.default;
            container.register(mod.name, asFunction(importedMod).singleton());
        }
    }

    return container;
}
