// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import * as Config from '_types/config';
import {EventType, Payload} from '../../_types/event';
import {IQueryInfos} from '_types/queryInfos';
import {PubSub} from 'graphql-subscriptions';

export interface IEventsManagerDomain {
    pubsub: PubSub;
    send(eventType: EventType[], payload: Payload | any, ctx: IQueryInfos): Promise<void>;
    suscribe(events: string[]): AsyncIterator<any>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
}

export default function ({config = null, 'core.infra.amqpService': amqpService = null}: IDeps): IEventsManagerDomain {
    const pubsub = new PubSub();

    return {
        pubsub,
        async send(eventTypes: EventType[], payload: Payload | any /* FIXME: any */, ctx: IQueryInfos): Promise<void> {
            if (eventTypes.includes(EventType.MESSAGE_BROKER)) {
                await amqpService.publish(
                    config.amqp.exchange,
                    config.eventsManager.routingKeys.events,
                    JSON.stringify({time: Date.now(), userId: ctx.userId, payload})
                );
            }

            // if (eventTypes.includes(EventType.PUBSUB)) {
            //     console.debug('sending event');
            //     await pubsub.publish('TASK_PROGRESS', {
            //         taskProgress: 55
            //     });
            // }
        },
        suscribe(events: string[]): AsyncIterator<any> {
            return pubsub.asyncIterator(events);
        }
    };
}
