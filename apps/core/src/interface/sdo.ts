import {logger} from '@leav/logger';
import {type IConfig} from '../_types/config';
import {type ISDOImportApp} from '../app/sdo/importApp';
import {type IExportApp} from '../app/sdo/exportApp';
import {type IRabbitMQ} from '../infra/sdo/sdoRabbitMQ';
import {type GetSystemQueryContext} from '../utils/helpers/getSystemQueryContext';

export interface ISDOInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.app.sdo.import': ISDOImportApp;
    'core.app.sdo.export': IExportApp;
    'core.infra.sdo.rabbitMQ': IRabbitMQ;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
    config: IConfig;
}

export default function ({
    'core.app.sdo.import': importApp,
    'core.app.sdo.export': exportApp,
    'core.infra.sdo.rabbitMQ': rabbitMQService,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
    config,
}: IDeps): ISDOInterface {
    return {
        async init(): Promise<void> {
            if (config.sdo.import.enable) {
                const importChannel = await rabbitMQService.getSDOImportChannel();
                await importChannel.consume(config.sdo.import.queue, importApp.onSDOEvent);
                logger.info(`SDO Import ready, waiting on queue ${config.sdo.import.queue}... 👀`);
            } else {
                logger.info('SDO Import is disabled');
            }

            if (config.sdo.export.enable) {
                const dataEventChannel = await rabbitMQService.getLeavDataEventChannel();
                await dataEventChannel.consume(config.sdo.export.dataEventsQueue, exportApp.onDataEvent);
                logger.info(`SDO Export ready, waiting on queue ${config.sdo.export.dataEventsQueue}... 👀`);
            } else {
                logger.info('SDO Export is disabled');
            }
        },
    };
}
