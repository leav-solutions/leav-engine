import * as amqp from 'amqplib';
import * as Config from '_types/config';
import amqpService, {IAmqpService} from '../../infra/amqp/amqpService';
import indexationManager from '././indexationManagerDomain';
import {IQueryInfos} from '_types/queryInfos';
import {EventType} from '../../_types/event';
import {getConfig} from '../../config';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IElasticsearchService} from 'infra/elasticsearch/elasticsearchService';

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    consume: jest.fn(),
    publish: jest.fn(),
    prefetch: jest.fn(),
    checkExchange: jest.fn(),
    waitForConfirms: jest.fn()
};

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'indexManagerDomainTest'
};

describe('Indexation Manager', () => {
    test('Init message listening', async () => {
        const conf = await getConfig();

        const amqpServ = amqpService({
            'core.infra.amqp': {connection: null, channel: mockAmqpChannel as amqp.ConfirmChannel},
            config: conf as Config.IConfig
        });

        const indexation = indexationManager({
            config: conf as Config.IConfig,
            'core.infra.amqp.amqpService': amqpServ as IAmqpService
        });

        await indexation.init();

        expect(mockAmqpChannel.consume).toBeCalledTimes(1);
    });

    test('index database', async () => {
        const conf = await getConfig();

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

        const mockLibraryRepo: Mockify<ILibraryRepo> = {
            getLibraries: global.__mockPromise({list: [{id: 'test'}], totalCount: 1}),
            getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
        };

        const indexation = indexationManager({
            config: conf as Config.IConfig,
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.infra.library': mockLibraryRepo as ILibraryRepo,
            'core.infra.elasticsearch.elasticsearchService': mockElasticsearchService as IElasticsearchService
        });

        await indexation.indexDatabase(ctx, 'test');
        await indexation.indexDatabase(ctx, 'test', ['1337']);

        expect(mockLibraryRepo.getLibraryFullTextAttributes).toBeCalledTimes(2);
        expect(mockRecordDomain.find).toBeCalledTimes(2);
        expect(mockRecordDomain.getRecordFieldValue).toBeCalledTimes(2);
        expect(mockElasticsearchService.index).toBeCalledWith('test', '1337', {id: '1337'});
    });
});
