import {IAmqpService} from 'infra/amqp/amqpService';
import {IRecordDomain} from './../record/recordDomain';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import winston from 'winston';
import {FileEvents, IFileEventData} from '../../_types/filesManager';
import * as Joi from '@hapi/joi';

export interface IIndexationManagerDomain {
    init(): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqp.amqpService'?: IAmqpService;
    'core.utils.logger'?: winston.Winston;
    'core.domain.record'?: IRecordDomain;
    'core.utils'?: IUtils;
}

export default function({
    config = null,
    'core.infra.amqp.amqpService': amqpService = null,
    'core.utils.logger': logger = null,
    'core.domain.record': recordDomain = null,
    'core.utils': utils = null
}: IDeps): IIndexationManagerDomain {
    const _onMessage = async (msg: string): Promise<void> => {
        return;
    };

    const _validateMsg = (msg: IFileEventData): void => {
        const msgBodySchema = Joi.object().keys({
            event: Joi.string()
                .equal(...Object.keys(FileEvents))
                .required(),
            time: Joi.number().required(),
            pathBefore: Joi.string().allow(null),
            pathAfter: Joi.string().allow(null),
            inode: Joi.number().required(),
            rootKey: Joi.string().required(),
            isDirectory: Joi.boolean().required(),
            hash: Joi.string()
        });

        const isValid = msgBodySchema.validate(msg);

        if (!!isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    return {
        async init(): Promise<void> {
            return amqpService.consume(
                config.indexationManager.queues.events,
                config.indexationManager.routingKeys.events,
                _onMessage,
                config.indexationManager.prefetch
            );
        }
    };
}
