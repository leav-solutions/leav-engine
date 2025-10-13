// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client, type estypes} from '@elastic/elasticsearch';
import {type IConfig} from '_types/config';
import {logger} from '@leav/logger';
import {type Log} from '@leav/utils';
import {type MappingProperty} from '@elastic/elasticsearch/lib/api/types';

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
    search: <T>(params: IElasticsearchServiceSearchParams) => Promise<IElasticsearchServiceSearchResponse<T>>;
    writeData: (indexName: string, data: Log) => Promise<void>;
}

export interface IElasticSearchServiceDeps {
    'core.infra.elasticSearch.client'?: Client;
    config?: IConfig;
}

export default function ({config}: IElasticSearchServiceDeps): IElasticSearchService {
    const client = new Client({
        node: config.elasticSearch.url
    });

    const _createILMPolicyIfNotExists = async (ilmPolicyName: string) => {
        const ilmPolicyExists = await client.ilm.getLifecycle({name: ilmPolicyName}).catch(() => null);
        if (!ilmPolicyExists || !ilmPolicyExists[ilmPolicyName]) {
            logger.info(`Creating elasticsearch index lifecycle policy ${ilmPolicyName}`);

            await client.ilm.putLifecycle({
                name: ilmPolicyName,
                policy: {
                    phases: {
                        // Only at creation, update done manually by admin for now
                        hot: {
                            min_age: '0ms',
                            actions: {
                                set_priority: {
                                    priority: 100
                                },
                                // Create new index when index is 50gb or 30 days old
                                rollover: {
                                    max_age: '30d',
                                    max_primary_shard_size: '50gb'
                                }
                            }
                        },
                        warm: {
                            min_age: '1d', // Our usage is append only, so we can move to warm phase quickly
                            actions: {
                                set_priority: {
                                    priority: 50
                                },
                                readonly: {}
                            }
                        }
                    }
                }
            });
        }
    };

    const _createIndexTemplateIfNotExists = async (templateName: string, ilmPolicyName: string) => {
        const templateExists = await client.indices.existsIndexTemplate({name: templateName});
        if (!templateExists) {
            logger.info(`Creating elasticsearch index template ${templateName} with ILM policy ${ilmPolicyName}`);

            await client.indices.putIndexTemplate({
                name: templateName,
                index_patterns: [`${config.elasticSearch.indexPrefix}*`],
                data_stream: {},
                priority: 100,
                template: {
                    settings: {
                        'index.lifecycle.name': ilmPolicyName
                    },
                    mappings: {
                        properties: {
                            '@timestamp': {type: 'date'}, // Required for data streams
                            time: {type: 'date'},
                            userId: {type: 'keyword'},
                            queryId: {type: 'keyword'},
                            instanceId: {type: 'constant_keyword'},
                            action: {type: 'keyword'},
                            trigger: {type: 'keyword'},
                            topic: {type: 'object'},
                            before: {type: 'flattened'},
                            after: {type: 'flattened'},
                            metadata: {type: 'flattened'}
                        } satisfies Record<keyof Log | '@timestamp', MappingProperty>
                    }
                }
            });
        }
    };

    const _createIndexIfNotExists = async (indexName: string) => {
        const indexExists = await client.indices.exists({index: indexName});
        if (!indexExists) {
            const ilmPolicyName = config.elasticSearch.ilmPolicyName;
            await _createILMPolicyIfNotExists(ilmPolicyName);

            const templateName = config.elasticSearch.templateName;
            await _createIndexTemplateIfNotExists(templateName, ilmPolicyName);

            logger.info(`Creating elasticsearch index ${indexName}`);
            await client.indices.createDataStream({
                name: indexName
            });
        }
    };

    return {
        client,
        async search<T>(params: IElasticsearchServiceSearchParams): Promise<IElasticsearchServiceSearchResponse<T>> {
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
        },
        async writeData(indexName: string, data: Log): Promise<void> {
            await _createIndexIfNotExists(indexName);

            await client.index({
                index: indexName,
                body: data
            });
        }
    };
}
