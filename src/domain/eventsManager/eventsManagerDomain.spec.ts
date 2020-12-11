// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {getConfig} from '../../config';
import * as Config from '_types/config';
import amqpService, {IAmqpService} from '../../infra/amqp/amqpService';
import eventsManager from '././eventsManagerDomain';
import {IQueryInfos} from '_types/queryInfos';
import {EventType} from '../../_types/event';

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
    test('send amqp message', async () => {
        const conf = await getConfig();

        const amqpServ = amqpService({
            'core.infra.amqp': {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel},
            config: conf as Config.IConfig
        });

        const events = eventsManager({
            config: conf as Config.IConfig,
            'core.infra.amqp.amqpService': amqpServ as IAmqpService
        });

        await events.send({type: EventType.LIBRARY_SAVE, data: {new: {id: 'test'}}}, ctx);

        expect(mockAmqpChannel.publish).toBeCalledTimes(1);
    });
});
