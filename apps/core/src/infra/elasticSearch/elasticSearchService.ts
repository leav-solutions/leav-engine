// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client, estypes} from '@elastic/elasticsearch';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';

export interface IElasticSearchService {
    client: Client;
    search: (
        params: {
            index: string;
            offset?: number;
            limit?: number;
            sort?: {field: string; order: 'asc' | 'desc'};
            query?: estypes.QueryDslQueryContainer;
        },
        ctx: IQueryInfos
    ) => Promise<Array<Record<string, any>>>;
}

interface IDeps {
    'core.infra.elasticSearch.client'?: Client;
    config?: IConfig;
}

export default function ({config}: IDeps): IElasticSearchService {
    const client = new Client({
        node: config.elasticSearch.url
    });

    return {
        client,
        async search({index, offset, limit, sort, query}, ctx) {
            const response = await client.search({
                index,
                from: offset,
                size: limit,
                sort: {[sort.field]: sort.order},
                body: {
                    _source: true,
                    query: query ?? {
                        match_all: {}
                    }
                }
            });

            return response.hits.hits.map(h => h._source);
        }
    };
}
