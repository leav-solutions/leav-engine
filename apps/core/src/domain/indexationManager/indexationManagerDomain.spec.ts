// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as amqp from 'amqplib';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IElasticsearchService} from 'infra/elasticsearch/elasticsearchService';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import amqpService, {IAmqpService} from '../../infra/amqp/amqpService';
import indexationManager from './indexationManagerDomain';

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    consume: jest.fn(),
    publish: jest.fn(),
    prefetch: jest.fn(),
    checkExchange: jest.fn(),
    waitForConfirms: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn()
};

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'indexManagerDomainTest'
};

describe('Indexation Manager', () => {
    const conf: Mockify<IConfig> = {
        indexationManager: {
            queues: {
                events: 'events_queue'
            }
        },
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

    test('Init message listening', async () => {
        const amqpServ = amqpService({
            'core.infra.amqp': {
                publisher: null,
                consumer: {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel}
            },
            config: conf as IConfig
        });

        const indexation = indexationManager({
            config: conf as IConfig,
            'core.infra.amqp.amqpService': amqpServ as IAmqpService
        });

        await indexation.init();

        expect(mockAmqpChannel.consume).toBeCalledTimes(1);
    });

    test('index database', async () => {
        const mockElasticsearchService: Mockify<IElasticsearchService> = {
            index: jest.fn()
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({
                list: [
                    {
                        id: '1337',
                        created_at: 1520931648,
                        modified_at: 1520931648
                    }
                ]
            }),
            getRecordFieldValue: global.__mockPromise({value: '1337'})
        };

        const mockAttributeDomain: Mockify<IAttributeDomain> = {
            getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
        };

        const mockLibraryDomain: Mockify<ILibraryDomain> = {
            getLibraries: global.__mockPromise({
                list: [{id: 'test'}],
                totalCount: 1
            })
        };

        const indexation = indexationManager({
            config: conf as IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
            'core.domain.library': mockLibraryDomain as ILibraryDomain,
            'core.infra.elasticsearch.elasticsearchService': mockElasticsearchService as IElasticsearchService
        });

        await indexation.indexDatabase(ctx, 'test');
        await indexation.indexDatabase(ctx, 'test', ['1337']);

        expect(mockAttributeDomain.getLibraryFullTextAttributes).toBeCalledTimes(2);
        expect(mockRecordDomain.find).toBeCalledTimes(2);
        expect(mockRecordDomain.getRecordFieldValue).toBeCalledTimes(2);
    });
});
