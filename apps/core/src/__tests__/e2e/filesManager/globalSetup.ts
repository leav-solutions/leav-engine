// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getConfig} from '../../../config';
import {initDI} from '../../../depsManager';
import i18nextInit from '../../../i18nextInit';
import {amqpService} from '@leav/message-broker';
import {initDb} from '../../../infra/db/db';

export async function setup() {
    try {
        const conf = await getConfig();

        await initDb(conf);

        // Init i18next
        const translator = await i18nextInit(conf);

        // Init AMQP
        const amqp = await amqpService({config: conf.amqp});

        const {coreContainer} = await initDI({translator, 'core.infra.amqpService': amqp});
        const dbUtils = coreContainer.cradle['core.infra.db.dbUtils'];

        await dbUtils.migrate(coreContainer);

        const server = coreContainer.cradle['core.interface.server'];
        const filesManager = coreContainer.cradle['core.interface.filesManager'];

        await server.init();
        await filesManager.init();
    } catch (e) {
        console.error(e);
    }
}
