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

    const mock = new Mock();

    const mockClient = Client({
        config: {
            elasticsearch: {
                url: conf.elasticsearch.url,
                connection: mock.getConnection()
            }
        }
    });

    afterEach(() => {
        mock.clearAll();
    });

    test('Should run wildcard search', async () => {
        mock.add(
            {
                method: ['GET'],
                path: '/test_lib/_mapping'
            },
            () => ({test_lib: {mappings: {properties: {id: {type: 'wildcard'}}}}})
        );

        mock.add(
            {
                method: ['POST'],
                path: '/test_lib/_search'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});
        const res = await esService.wildcardSearch('test_lib', 'query');

        expect(res).toMatchObject({status: 'pass'});
    });

    test('indice update mapping', async () => {
        mock.add(
            {
                method: ['PUT'],
                path: '/test_lib/_mapping'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});
        const res = await esService.indiceUpdateMapping('test_lib', {id: {type: 'wildcard'}});

        expect(res).toMatchObject({status: 'pass'});
    });

    test('indice get mapping', async () => {
        mock.add(
            {
                method: ['GET'],
                path: '/test_lib/_mapping'
            },
            () => ({test_lib: {mappings: {properties: {id: {type: 'wildcard'}}}}})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});
        const res = await esService.indiceGetMapping('test_lib');

        expect(res).toMatchObject({test_lib: {mappings: {properties: {id: {type: 'wildcard'}}}}});
    });

    test('indice create', async () => {
        mock.add(
            {
                method: ['PUT'],
                path: '/test_lib'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});
        const res = await esService.indiceCreate('test_lib');

        expect(res).toMatchObject({status: 'pass'});
    });

    test('indice delete', async () => {
        mock.add(
            {
                method: ['DELETE'],
                path: '/test_lib'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});
        const res = await esService.indiceDelete('test_lib');

        expect(res).toMatchObject({status: 'pass'});
    });

    test('indiceExists', async () => {
        mock.add(
            {
                method: ['HEAD'],
                path: '/test_lib'
            },
            () => ''
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});
        const res = await esService.indiceExists('test_lib');

        expect(res).toBe(true);
    });

    test('index data', async () => {
        mock.add(
            {
                method: ['PUT'],
                path: '/test_lib/_doc/1'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});

        await esService.indexData('test_lib', '1', {});
    });

    test('update data', async () => {
        mock.add(
            {
                method: ['POST'],
                path: '/test_lib/_update/1'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});

        await esService.updateData('test_lib', '1', {});
    });

    test('delete data', async () => {
        mock.add(
            {
                method: ['POST'],
                path: '/test_lib/_update/1'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});

        await esService.deleteData('test_lib', '1', 'id');
    });

    test('indiceDelete', async () => {
        mock.add(
            {
                method: ['DELETE'],
                path: '/test_lib'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});

        await esService.indiceDelete('test_lib');
    });

    test('delete document', async () => {
        mock.add(
            {
                method: ['DELETE'],
                path: '/test_lib/_doc/1'
            },
            () => ({status: 'pass'})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});

        await esService.deleteDocument('test_lib', '1');
    });
});
