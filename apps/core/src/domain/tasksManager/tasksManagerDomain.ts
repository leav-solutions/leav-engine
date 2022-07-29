// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as Config from '_types/config';
import {IAmqpService} from '@leav/message-broker';
import {IQueryInfos} from '_types/queryInfos';
import {v4 as uuidv4} from 'uuid';

export interface ITasksManagerDomain {
    init(): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
}

export default function ({config = null, 'core.infra.amqpService': amqpService = null}: IDeps): ITasksManagerDomain {
    const _validateMsg = (msg: any /* IEvent */) => {
        return;
        // const msgBodySchema = Joi.object().keys({
        //     time: Joi.number().required(),
        //     userId: Joi.string().required(),
        //     payload: Joi.object()
        //         .keys({
        //             type: Joi.string()
        //                 .valid(...Object.values(EventType))
        //                 .required(),
        //             data: Joi.object().required()
        //         })
        //         .required()
        // });

        // const isValid = msgBodySchema.validate(msg);

        // if (!!isValid.error) {
        //     const errorMsg = isValid.error.details.map(e => e.message).join(', ');
        //     throw new Error(errorMsg);
        // }
    };

    const _onMessage = async (msg: string): Promise<void> => {
        const event: any /* IEvent */ = JSON.parse(msg);

        // const ctx: IQueryInfos = {
        //     userId: '1',
        //     queryId: uuidv4()
        // };

        try {
            _validateMsg(event);
        } catch (e) {
            console.error(e);
        }
    };

    return {
        async init(): Promise<void> {
            await amqpService.consumer.channel.assertQueue(config.tasksManager.queues.orders);
            await amqpService.consumer.channel.bindQueue(
                config.tasksManager.queues.orders,
                config.amqp.exchange,
                config.tasksManager.routingKeys.orders
            );

            return amqpService.consume(
                config.tasksManager.queues.orders,
                config.tasksManager.routingKeys.orders,
                _onMessage
            );
        }
    };
}
