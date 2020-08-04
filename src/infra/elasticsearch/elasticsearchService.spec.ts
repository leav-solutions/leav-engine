import Client from './elasticsearch';
import elasticsearchService from './elasticsearchService';
import Mock from '@elastic/elasticsearch-mock';
import {getConfig} from '../../config';

describe('ElasticsearchService', () => {
    describe('multiMatch', () => {
        test('Should run multimatch_search', async () => {
            const mock = new Mock();
            const conf = await getConfig();

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
    });
});
