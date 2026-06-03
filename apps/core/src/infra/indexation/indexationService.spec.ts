import type * as Config from '../../_types/config';
import {type IDbService} from '../db/dbService';
import indexationService, {CORE_INDEX_NGRAM_ANALYZER} from './indexationService';

const makeConfig = (): Config.IConfig => ({db: {name: 'testdb'}}) as Config.IConfig;

describe('indexationService.init', () => {
    test('Creates the ngram analyzer as a normalize-then-ngram pipeline', async () => {
        const mockDbService: Mockify<IDbService> = {
            analyzers: global.__mockPromise([]),
            createAnalyzer: global.__mockPromise({}),
        };

        const service = indexationService({
            config: makeConfig(),
            'core.infra.db.dbService': mockDbService as IDbService,
        });

        await service.init();

        const ngramCall = mockDbService.createAnalyzer.mock.calls.find(([name]) => name === CORE_INDEX_NGRAM_ANALYZER);
        expect(ngramCall).toBeDefined();

        const [, options] = ngramCall;
        expect(options.type).toBe('pipeline');
        expect(options.features).toEqual(expect.arrayContaining(['frequency', 'norm', 'position']));

        const steps = options.properties.pipeline;
        expect(steps).toHaveLength(2);
        expect(steps[0]).toMatchObject({
            type: 'norm',
            properties: {case: 'lower', accent: false},
        });
        expect(steps[1]).toMatchObject({
            type: 'ngram',
            properties: {min: 3, max: 3, preserveOriginal: false, streamType: 'utf8'},
        });
    });

    test('Skips ngram analyzer creation when it already exists', async () => {
        const config = makeConfig();
        const mockDbService: Mockify<IDbService> = {
            analyzers: global.__mockPromise([
                {name: `${config.db.name}::core_index`},
                {name: `${config.db.name}::core_index_input`},
                {name: `${config.db.name}::${CORE_INDEX_NGRAM_ANALYZER}`},
            ]),
            createAnalyzer: global.__mockPromise({}),
        };

        const service = indexationService({
            config,
            'core.infra.db.dbService': mockDbService as IDbService,
        });

        await service.init();

        const ngramCall = mockDbService.createAnalyzer.mock.calls.find(([name]) => name === CORE_INDEX_NGRAM_ANALYZER);
        expect(ngramCall).toBeUndefined();
    });
});
