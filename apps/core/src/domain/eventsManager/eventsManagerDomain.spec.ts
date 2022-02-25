// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import amqpService, {IAmqpService} from '../../infra/amqp/amqpService';
import {EventType} from '../../_types/event';
import eventsManager from './eventsManagerDomain';

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    consume: jest.fn(),
    publish: jest.fn(),
    prefetch: jest.fn(),
    checkExchange: jest.fn(),
    waitForConfirms: jest.fn()
};

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
        const amqpServ = amqpService({
            'core.infra.amqp': {
                publisher: {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel},
                consumer: null
            },
            config: conf as IConfig
        });

        const events = eventsManager({
            config: conf as IConfig,
            'core.infra.amqp.amqpService': amqpServ as IAmqpService
        });

        await events.send({type: EventType.LIBRARY_SAVE, data: {new: {id: 'test'}}}, ctx);

        expect(mockAmqpChannel.publish).toBeCalledTimes(1);
    });
});
