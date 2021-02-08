// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Mock from '@elastic/elasticsearch-mock';
import {IConfig} from '_types/config';
import Client from './elasticsearch';
import elasticsearchService from './elasticsearchService';

describe('ElasticsearchService', () => {
    const conf: Mockify<IConfig> = {
        elasticsearch: {
            url: 'http://fake.url'
        }
    };
    test('Should run multimatch_search', async () => {
        const mock = new Mock();

        const client = Client({
            config: {
                elasticsearch: {
                    url: conf.elasticsearch.url,
                    connection: mock.getConnection()
                }
            }
        });

        mock.add(
            {
                method: ['POST'],
                path: '/test_lib/_search'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': client});
        const res = await esService.multiMatch('test_lib', {query: 'query'});

        expect(res).toMatchObject({status: 'pass'});
    });

    test('indiceGetMapping', async () => {
        const mock = new Mock();

        const client = Client({
            config: {
                elasticsearch: {
                    url: conf.elasticsearch.url,
                    connection: mock.getConnection()
                }
            }
        });

        mock.add(
            {
                method: ['GET'],
                path: '/test_lib/_mapping'
            },
            () => ({test_lib: {mappings: {properties: {id: {}}}}})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': client});
        const res = await esService.indiceGetMapping('test_lib');

        expect(res).toEqual(['id']);
    });

    test('indiceExists', async () => {
        const mock = new Mock();

        const client = Client({
            config: {
                elasticsearch: {
                    url: conf.elasticsearch.url,
                    connection: mock.getConnection()
                }
            }
        });

        mock.add(
            {
                method: ['HEAD'],
                path: '/test_lib'
            },
            () => ({body: true})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': client});
        const res = await esService.indiceExists('test_lib');

        expect(res).toBe(true);
    });

    test('index', async () => {
        const mock = new Mock();

        const client = Client({
            config: {
                elasticsearch: {
                    url: conf.elasticsearch.url,
                    connection: mock.getConnection()
                }
            }
        });

        mock.add(
            {
                method: ['PUT'],
                path: '/test_lib/_doc/1'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': client});

        await esService.index('test_lib', '1', {});
    });

    test('update', async () => {
        const mock = new Mock();

        const client = Client({
            config: {
                elasticsearch: {
                    url: conf.elasticsearch.url,
                    connection: mock.getConnection()
                }
            }
        });

        mock.add(
            {
                method: ['POST'],
                path: '/test_lib/_update/1'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': client});

        await esService.update('test_lib', '1', {});
    });

    test('delete', async () => {
        const mock = new Mock();

        const client = Client({
            config: {
                elasticsearch: {
                    url: conf.elasticsearch.url,
                    connection: mock.getConnection()
                }
            }
        });

        mock.add(
            {
                method: ['POST'],
                path: '/test_lib/_update/1'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': client});

        await esService.delete('test_lib', '1', 'id');
    });

    test('indiceDelete', async () => {
        const mock = new Mock();

        const client = Client({
            config: {
                elasticsearch: {
                    url: conf.elasticsearch.url,
                    connection: mock.getConnection()
                }
            }
        });

        mock.add(
            {
                method: ['DELETE'],
                path: '/test_lib'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': client});

        await esService.indiceDelete('test_lib');
    });

    test('deleteDocument', async () => {
        const mock = new Mock();

        const client = Client({
            config: {
                elasticsearch: {
                    url: conf.elasticsearch.url,
                    connection: mock.getConnection()
                }
            }
        });

        mock.add(
            {
                method: ['DELETE'],
                path: '/test_lib/_doc/1'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': client});

        await esService.deleteDocument('test_lib', '1');
    });
});
