// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAmqpService} from '@leav/message-broker';
import type * as amqp from 'amqplib';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';
import {type ILibraryDomain} from 'domain/library/libraryDomain';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
import indexationManager, {type IIndexationManagerDomainDeps} from './indexationManagerDomain';
import {type IIndexationService} from 'infra/indexation/indexationService';
import {AttributeCondition} from '../../_types/record';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type ILogger} from '@leav/logger';
import {type ToAny} from 'utils/utils';

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertExchange: jest.fn(),
    checkExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn(),
    waitForConfirms: jest.fn(),
    prefetch: jest.fn(),
};

const mockAmqpConnection: Mockify<amqp.ChannelModel> = {
    close: jest.fn(),
    createConfirmChannel: jest.fn().mockReturnValue(mockAmqpChannel),
};

const mockEventsManager: Mockify<IEventsManagerDomain> = {
    sendPubSubEvent: global.__mockPromise(),
};

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'indexManagerDomainTest',
};

const mockLogger: Mockify<ILogger> = {
    info: jest.fn((...args) => console.log(args)), // eslint-disable-line no-restricted-syntax
};

const depsBase: ToAny<IIndexationManagerDomainDeps> = {
    'core.infra.amqpService': jest.fn(),
    'core.domain.record': jest.fn(),
    'core.domain.library': jest.fn(),
    'core.domain.attribute': jest.fn(),
    'core.infra.indexation.indexationService': jest.fn(),
    'core.domain.tasksManager': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.utils.logger': jest.fn(),
    'core.utils.getSystemQueryContext': jest.fn(),
    translator: {},
    config: {},
};

describe('Indexation Manager', () => {
    const conf: Mockify<IConfig> = {
        indexationManager: {
            queues: {
                events: 'events_queue',
            },
        },
        amqp: {
            exchange: 'test_exchange',
            connOpt: {
                protocol: 'amqp',
                hostname: 'localhost',
                username: 'user',
                password: 'user',
                port: 1234,
            },
            type: 'direct',
        },
        eventsManager: {
            routingKeys: {data_events: 'test.data.events', pubsub_events: 'test.pubsub.events'},
            queues: {pubsub_events_prefix: 'test_pubsub_events-'},
        },
    };

    test('Init message listening', async () => {
        const mockAmqpService: Mockify<IAmqpService> = {
            consume: jest.fn(),
            consumer: {
                connection: mockAmqpConnection as amqp.ChannelModel,
                channel: mockAmqpChannel as amqp.ConfirmChannel,
            },
        };

        const mockIndexationService: Mockify<IIndexationService> = {
            init: global.__mockPromise(),
        };

        const indexation = indexationManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.amqpService': mockAmqpService as IAmqpService,
            'core.utils.logger': mockLogger as ILogger,
            'core.infra.indexation.indexationService': mockIndexationService as IIndexationService,
        });

        await indexation.init();

        expect(mockAmqpService.consume).toBeCalledTimes(1);
        expect(mockIndexationService.init).toBeCalledTimes(1);
    });

    test('index database', async () => {
        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({
                list: [
                    {
                        id: '1337',
                        created_at: 1520931648,
                        modified_at: 1520931648,
                    },
                ],
            }),
            getRecordFieldValue: global.__mockPromise([{value: '1337'}]),
        };

        const mockAttributeDomain: Mockify<IAttributeDomain> = {
            getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            getLibraryAttributes: global.__mockPromise([{id: 'id'}]),
        };

        const mockLibraryDomain: Mockify<ILibraryDomain> = {
            getLibraries: global.__mockPromise({
                list: [{id: 'test'}],
                totalCount: 1,
            }),
        };

        const mockIndexationService: Mockify<IIndexationService> = {
            isLibraryListed: global.__mockPromise(false),
            listLibrary: global.__mockPromise(),
            indexRecord: global.__mockPromise(),
        };

        const indexation = indexationManager({
            ...depsBase,
            config: conf as IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
            'core.domain.library': mockLibraryDomain as ILibraryDomain,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
            'core.infra.indexation.indexationService': mockIndexationService as IIndexationService,
        });

        await indexation.indexDatabase({findRecordParams: {library: 'test'}, ctx}, {id: 'fakeTaskId'});
        await indexation.indexDatabase(
            {
                findRecordParams: {
                    library: 'test',
                    filters: [{field: 'id', value: '1337', condition: AttributeCondition.EQUAL}],
                },
                ctx,
            },
            {id: 'fakeTaskId'},
        );

        expect(mockIndexationService.isLibraryListed).toBeCalledTimes(2);
        expect(mockIndexationService.listLibrary).toBeCalledTimes(2);
        expect(mockAttributeDomain.getLibraryFullTextAttributes).toBeCalledTimes(2);
        expect(mockRecordDomain.find).toBeCalledTimes(2);
        expect(mockRecordDomain.getRecordFieldValue).toBeCalledTimes(2);
        expect(mockIndexationService.indexRecord).toBeCalledTimes(2);
    });
});
