// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {Database} from 'arangojs';
import fs from 'fs';
import path from 'path';
import {getConfig} from '../../../config';
import {init as initDI} from '../../../depsManager';
import i18nextInit from '../../../i18nextInit';
import {initAmqp} from '../../../infra/amqp';
import {initPlugins} from '../../../pluginsLoader';
import {IConfig} from '../../../_types/config';

const _setupFakePlugin = async () => {
    // Copy fake plugin to appropriate folder
    const pluginsFolder = path.resolve('./src/plugins/');
    const fakePluginSrc = `${__dirname}/_fixtures/fakeplugin`;
    const fakePluginDest = `${pluginsFolder}/fakeplugin`;
    const relativePath = path.relative(pluginsFolder, fakePluginSrc);

    try {
        await fs.promises.symlink(relativePath, fakePluginDest);
    } catch (e) {
        // It's ok, already exists
        if (e.code === 'EEXIST') {
            return;
        }

        console.error(e);
    }
};

export const init = async (conf: IConfig): Promise<any> => {
    // Init i18next
    const translator = await i18nextInit(conf);

    // Init AMQP
    const amqpConn = await initAmqp({config: conf});

    const {coreContainer, pluginsContainer} = await initDI({translator, 'core.infra.amqp': amqpConn});
    const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

    await initPlugins(coreContainer.cradle.pluginsFolder, pluginsContainer);

    return {coreContainer, dbUtils};
};

const _createRequiredDirectories = async conf => {
    if (!fs.existsSync(conf.import.directory)) {
        await fs.promises.mkdir(conf.import.directory);
    }

    if (!fs.existsSync(conf.diskCache.directory)) {
        await fs.promises.mkdir(conf.diskCache.directory);
    }
};

export async function setup() {
    try {
        await _setupFakePlugin();

        const conf = await getConfig();

        await _createRequiredDirectories(conf);

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

        const {coreContainer, dbUtils} = await init(conf);

        await dbUtils.migrate(coreContainer);

        const server = coreContainer.cradle['core.interface.server'];
        await server.init();
    } catch (e) {
        console.error(e);
    }
}
