// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import * as Config from '_types/config';
import amqpService, {IAmqpService} from '../../infra/amqp/amqpService';
import filesManager from './filesManagerDomain';
import winston = require('winston');

const mockConfig: Mockify<Config.IConfig> = {
    amqp: {
        connOpt: {},
        type: 'direct',
        exchange: 'test_leav_core'
    },
    filesManager: {
        queues: {
            events: 'files_events',
            previewRequest: 'preview_request',
            previewResponse: 'preview_response'
        },
        routingKeys: {
            events: 'files.event',
            previewRequest: 'files.previewRequest',
            previewResponse: 'files.previewResponse'
        },
        rootKeys: {
            files1: 'files'
        },
        userId: '0'
    }
};

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn()
};

const mockAmqpService = amqpService({
    'core.infra.amqp': {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel},
    config: mockConfig as Config.IConfig
});

const logger: Mockify<winston.Winston> = {
    error: jest.fn((...args) => console.log(args)),
    warn: jest.fn((...args) => console.log(args))
};

describe('FilesManager', () => {
    test('Init', async () => {
        const files = filesManager({
            config: mockConfig as Config.IConfig,
            'core.utils.logger': logger as winston.Winston,
            'core.infra.amqp.amqpService': mockAmqpService as IAmqpService
        });

        await files.init();

        expect(mockAmqpChannel.consume).toBeCalled();
        expect(mockAmqpChannel.assertQueue).toBeCalled();
        expect(mockAmqpChannel.bindQueue).toBeCalled();
    });
});
