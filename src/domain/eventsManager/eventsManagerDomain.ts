import {IAmqpService} from 'infra/amqp/amqpService';
import * as Config from '_types/config';
import {Payload} from '../../_types/event';
import {IQueryInfos} from '_types/queryInfos';

export interface IEventsManagerDomain {
    send(payload: Payload, routingKey: string, ctx: IQueryInfos): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqp.amqpService'?: IAmqpService;
}

export default function({
    config = null,
    'core.infra.amqp.amqpService': amqpService = null
}: IDeps): IEventsManagerDomain {
    return {
        async send(payload: Payload, routingKey: string, ctx: IQueryInfos): Promise<void> {
            await amqpService.publish(routingKey, JSON.stringify({time: Date.now(), userId: ctx.userId, payload}));
        }
    };
}
