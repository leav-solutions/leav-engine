// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IAmqpService} from '@leav/message-broker';
import {EventAction, EventType} from '../../_types/event';
import eventsManager from './eventsManagerDomain';

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'eventsManagerDomainTest'
};

describe('Events Manager', () => {
    const conf: Mockify<IConfig> = {
        amqp: {
            exchange: 'test_exchange',
            connOpt: {
                protocol: 'amqp',
                hostname: 'localhost',
                username: 'user',
                password: 'user',
                port: 1234
            },
            type: 'direct'
        },
        eventsManager: {
            routingKeys: {
                events: 'test_routing_key'
            }
        }
    };

    test('send amqp message', async () => {
        const mockAmqpService: Mockify<IAmqpService> = {
            publish: jest.fn()
        };

        const events = eventsManager({
            config: conf as IConfig,
            'core.infra.amqpService': mockAmqpService as IAmqpService
        });

        await events.send([EventType.MESSAGE_BROKER], {type: EventAction.LIBRARY_SAVE, data: {new: {id: 'test'}}}, ctx);

        expect(mockAmqpService.publish).toBeCalledTimes(1);
    });
});
