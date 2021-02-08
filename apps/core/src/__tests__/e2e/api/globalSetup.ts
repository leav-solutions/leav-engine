// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {Database} from 'arangojs';
import {promises as fs} from 'fs';
import path from 'path';
import {getConfig} from '../../../config';
import {init as initDI} from '../../../depsManager';
import i18nextInit from '../../../i18nextInit';
import {initAmqp} from '../../../infra/amqp';
import {initPlugins} from '../../../pluginsLoader';

const _setupFakePlugin = async () => {
    // Copy fake plugin to appropriate folder
    const pluginsFolder = path.resolve(appRootPath + '/src/plugins/');
    const fakePluginSrc = `${__dirname}/_fixtures/fakeplugin`;
    const fakePluginDest = `${pluginsFolder}/fakeplugin`;
    const relativePath = path.relative(pluginsFolder, fakePluginSrc);

    try {
        await fs.symlink(relativePath, fakePluginDest);
    } catch (e) {
        // It's ok, already exists
    }
};

export async function setup() {
    try {
        await _setupFakePlugin();

        const conf = await getConfig();

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

        // Init i18next
        const translator = await i18nextInit(conf);

        // Init AMQP
        const amqpConn = await initAmqp({config: conf});

        const {coreContainer, pluginsContainer} = await initDI({translator, 'core.infra.amqp': amqpConn});
        const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

        await initPlugins(coreContainer.cradle.pluginsFolder, pluginsContainer);

        await dbUtils.migrate(coreContainer);

        const server = coreContainer.cradle['core.interface.server'];
        await server.init();
    } catch (e) {
        console.error(e);
    }
}
