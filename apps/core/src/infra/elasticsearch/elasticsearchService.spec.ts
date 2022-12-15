// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Mock from '@elastic/elasticsearch-mock';
import {IConfig} from '_types/config';
// import Client from './elasticsearch';
import {Client} from '@elastic/elasticsearch';
import elasticsearchService from './elasticsearchService';

describe('ElasticsearchService', () => {
    const conf: Mockify<IConfig> = {
        elasticsearch: {
            url: 'http://fake.url'
        }
    };

    const mock = new Mock();

    const mockClient = new Client({
        node: conf.elasticsearch.url,
        Connection: mock.getConnection()
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

    test('indiceGetMapping', async () => {
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

    test('indiceExists', async () => {
        mock.add(
            {
                method: ['HEAD'],
                path: '/test_lib'
            },
            () => ({body: true})
        );

        const esService = elasticsearchService({'core.infra.elasticsearch': mockClient});
        const res = await esService.indiceExists('test_lib');

        expect(res).toBe(true);
    });

    test('index', async () => {
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

    test('update', async () => {
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

    test('delete', async () => {
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

    test('deleteDocument', async () => {
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
