// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLogsIndexName} from '@leav/utils';
import {type IElasticsearchService} from 'infra/elasticsearch/elasticsearchService';
import {type IConfig} from '_types/config';
import {type ILogFilters, type ILogPagination, type ILogResponse, type ILogSort, type Log} from '_types/log';
import {type IQueryInfos} from '_types/queryInfos';

export interface ILogRepo {
    getLogs(
        params: {filters?: ILogFilters; sort?: ILogSort; pagination?: ILogPagination},
        ctx: IQueryInfos,
    ): Promise<ILogResponse>;
}

interface IDeps {
    'core.infra.elasticsearch.service'?: IElasticsearchService;
    config?: IConfig;
}

type SearchQueryType = Parameters<IElasticsearchService['search']>[0]['query'];

export default function ({'core.infra.elasticsearch.service': esService, config}: IDeps): ILogRepo {
    return {
        async getLogs({filters, sort, pagination}, ctx) {
            /**
             * Topic filters received are a nested object, we need to flatten it to be able to use them in ES.
             * eg. {topic: {library: 'my_lib', attribute: 'my_attribute', record: {library: 'my_lib', id: '123456'}}}
             *      => [
             *             {match: {'topic.library': 'my_lib'}},
             *             {match: {'topic.attribute': 'my_attribute'}},
             *             {match: {'topic.record.library': 'my_lib'}},
             *             {match: {'topic.record.id': '123456'}}
             *         ]
             */
            const _flattenTopicFilter = (obj: Record<string, any>, parentKey = '') => {
                let result: SearchQueryType[] = [];

                for (const [key, value] of Object.entries(obj)) {
                    const newKey = parentKey ? `${parentKey}.${key}` : key;

                    if (typeof value === 'object' && !Array.isArray(value)) {
                        const nested = _flattenTopicFilter(value, newKey);
                        result = [...result, ...nested];
                    } else {
                        result.push({match: {[newKey]: value}});
                    }
                }

                return result;
            };

            const indexName = getLogsIndexName(config.elasticsearch.indexPrefix, config.instanceId);
            const queryParts: SearchQueryType[] = Object.entries(filters ?? {}).reduce((acc, [field, value]) => {
                if (value === null || typeof value === 'undefined') {
                    return acc;
                }

                switch (field) {
                    case 'time':
                        acc.push({
                            range: {
                                time: {
                                    gte: value.from ? new Date(value.from).toISOString() : null,
                                    lte: value.to ? new Date(value.to).toISOString() : null,
                                },
                            },
                        });
                        break;
                    case 'actions':
                        acc.push({
                            terms: {
                                action: value,
                            },
                        });
                        break;
                    case 'userId':
                    case 'queryId':
                    case 'instanceId':
                        acc.push({
                            match: {
                                [field]: value,
                            },
                        });
                        break;
                    case 'trigger':
                        acc.push({
                            wildcard: {
                                trigger: `*${value}*`,
                            },
                        });
                        break;
                    case 'topic':
                        const res = _flattenTopicFilter({topic: value});
                        acc = [...acc, ...res];
                        break;
                }

                return acc;
            }, []);

            const response = await esService.search<Log>({
                index: indexName,
                limit: pagination?.limit,
                offset: pagination?.offset,
                sort,
                query: {
                    bool: {
                        must: queryParts,
                    },
                },
            });

            return {
                logs: response.hits,
                total: response.total,
            };
        },
    };
}
