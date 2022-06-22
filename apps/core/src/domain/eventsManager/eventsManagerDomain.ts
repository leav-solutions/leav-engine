// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import * as Config from '_types/config';
import {Payload} from '../../_types/event';
import {IQueryInfos} from '_types/queryInfos';

export interface IEventsManagerDomain {
    send(payload: Payload, ctx: IQueryInfos): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
}

export default function ({config = null, 'core.infra.amqpService': amqpService = null}: IDeps): IEventsManagerDomain {
    return {
        async send(payload: Payload, ctx: IQueryInfos): Promise<void> {
            await amqpService.publish(
                config.amqp.exchange,
                config.eventsManager.routingKeys.events,
                JSON.stringify({time: Date.now(), userId: ctx.userId, payload})
            );
        }
    };
}
