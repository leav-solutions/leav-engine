import {config} from '../../config';
import {init as initDI} from '../../depsManager';
import {Database} from 'arangojs';

export async function setup() {
    try {
        const conf: any = await config;

        // Init DB
        const db = new Database({
            url: conf.db.url
        });

        const databases = await db.listDatabases();
        const dbExists = databases.reduce((exists, d) => exists || d === conf.db.name, false);

        if (dbExists) {
            await db.dropDatabase(conf.db.name);
        }

        await db.createDatabase(conf.db.name);

        const container = await initDI();
        const dbUtils = container.cradle.dbUtils;

        await dbUtils.migrate(container);

        const server = container.cradle.server;
        await server.init();
    } catch (e) {
        console.error(e);
    }
}
