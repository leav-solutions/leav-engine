// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import * as amqp from 'amqplib';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import indexationManager from './indexationManagerDomain';
import {IIndexationService} from 'infra/indexation/indexationService';

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertExchange: jest.fn(),
    checkExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn(),
    waitForConfirms: jest.fn(),
    prefetch: jest.fn()
};

const mockAmqpConnection: Mockify<amqp.Connection> = {
    close: jest.fn(),
    createConfirmChannel: jest.fn().mockReturnValue(mockAmqpChannel)
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
            routingKeys: {data_events: 'test.data.events', pubsub_events: 'test.pubsub.events'},
            queues: {pubsub_events: 'test_pubsub_events'}
        }
    };

    test('Init message listening', async () => {
        const mockAmqpService: Mockify<IAmqpService> = {
            consume: jest.fn(),
            consumer: {
                connection: mockAmqpConnection as amqp.Connection,
                channel: mockAmqpChannel as amqp.ConfirmChannel
            }
        };

        const mockIndexationService: Mockify<IIndexationService> = {
            init: global.__mockPromise()
        };

        const indexation = indexationManager({
            config: conf as IConfig,
            'core.infra.amqpService': mockAmqpService as IAmqpService,
            'core.infra.indexation.indexationService': mockIndexationService as IIndexationService
        });

        await indexation.init();

        expect(mockAmqpService.consume).toBeCalledTimes(1);
        expect(mockIndexationService.init).toBeCalledTimes(1);
    });

    test('index database', async () => {
        const mockRecordRepo: Mockify<IRecordRepo> = {
            updateRecord: jest.fn()
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

        const mockIndexationService: Mockify<IIndexationService> = {
            isLibraryListed: global.__mockPromise(false),
            listLibrary: global.__mockPromise(),
            indexRecord: global.__mockPromise()
        };

        const indexation = indexationManager({
            config: conf as IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.infra.record': mockRecordRepo as IRecordRepo,
            'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
            'core.domain.library': mockLibraryDomain as ILibraryDomain,
            'core.infra.indexation.indexationService': mockIndexationService as IIndexationService
        });

        await indexation.indexDatabase(ctx, 'test');
        await indexation.indexDatabase(ctx, 'test', ['1337']);

        expect(mockIndexationService.isLibraryListed).toBeCalledTimes(2);
        expect(mockIndexationService.listLibrary).toBeCalledTimes(2);
        expect(mockAttributeDomain.getLibraryFullTextAttributes).toBeCalledTimes(2);
        expect(mockRecordDomain.find).toBeCalledTimes(2);
        expect(mockRecordDomain.getRecordFieldValue).toBeCalledTimes(2);
        expect(mockIndexationService.indexRecord).toBeCalledTimes(2);
    });
});
