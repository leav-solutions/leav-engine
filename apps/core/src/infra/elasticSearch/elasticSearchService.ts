// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client, type estypes} from '@elastic/elasticsearch';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';

export interface IElasticsearchServiceSearchResponse<T> {
    total: number;
    hits: T[];
}

interface IElasticsearchServiceSearchParams {
    index: string;
    offset?: number;
    limit?: number;
    sort?: {field: string; order: 'asc' | 'desc'};
    query?: estypes.QueryDslQueryContainer;
}

export interface IElasticSearchService {
    client: Client;
    search: <T>(
        params: IElasticsearchServiceSearchParams,
        ctx: IQueryInfos
    ) => Promise<IElasticsearchServiceSearchResponse<T>>;
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
        async search<T>(
            params: IElasticsearchServiceSearchParams,
            ctx: IQueryInfos
        ): Promise<IElasticsearchServiceSearchResponse<T>> {
            const {index, offset, limit, sort, query} = params;
            const response = await client.search<T>({
                index,
                from: offset,
                size: limit,
                sort: sort ? {[sort.field]: sort.order} : undefined,
                body: {
                    _source: true,
                    query: query ?? {
                        match_all: {}
                    }
                }
            });

            return {
                total: typeof response.hits.total === 'object' ? response.hits.total.value : response.hits.total,
                hits: response.hits.hits.map(h => h._source)
            };
        }
    };
}
