import {IAmqpManager} from 'infra/amqpManager/amqpManager';
import {IRecordDomain} from './../record/recordDomain';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import winston from 'winston';
import {RoutingKeys} from '../../_types/amqp';
import {FileEvents, FilesAttributes, IFileEventData, IPreviewVersion} from '../../_types/filesManager';

export interface IIndexationManagerDomain {
    init(): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpManager'?: IAmqpManager;
    'core.utils.logger'?: winston.Winston;
    'core.domain.record'?: IRecordDomain;
    'core.utils'?: IUtils;
}

export default function({
    config = null,
    'core.infra.amqpManager': amqpManager = null,
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
            return amqpManager.consume(
                config.indexationManager.queue,
                RoutingKeys.INDEXATION_EVENT,
                _onMessage,
                config.indexationManager.prefetch
            );
        }
    };
}
