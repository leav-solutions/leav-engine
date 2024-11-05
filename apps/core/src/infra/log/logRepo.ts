// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLogsIndexName, Log} from '@leav/utils';
import {IElasticSearchService} from 'infra/elasticSearch/elasticSearchService';
import {IConfig} from '_types/config';
import {ILogFilters, ILogPagination, ILogSort} from '_types/log';
import {IQueryInfos} from '_types/queryInfos';

export interface ILogRepo {
    getLogs(
        params: {filters?: ILogFilters; sort?: ILogSort; pagination?: ILogPagination},
        ctx: IQueryInfos
    ): Promise<Log[]>;
}

interface IDeps {
    'core.infra.elasticSearch.service'?: IElasticSearchService;
    config?: IConfig;
}

type SearchQueryType = Parameters<IElasticSearchService['search']>[0]['query'];

export default function ({'core.infra.elasticSearch.service': esService, config}: IDeps): ILogRepo {
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

            const indexName = getLogsIndexName(config.instanceId);
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
                                    lte: value.to ? new Date(value.to).toISOString() : null
                                }
                            }
                        });
                        break;
                    case 'actions':
                        acc.push({
                            terms: {
                                action: value
                            }
                        });
                        break;
                    case 'userId':
                    case 'queryId':
                    case 'instanceId':
                        acc.push({
                            match: {
                                [field]: value
                            }
                        });
                        break;
                    case 'trigger':
                        acc.push({
                            wildcard: {
                                trigger: `*${value}*`
                            }
                        });
                        break;
                    case 'topic':
                        const res = _flattenTopicFilter({topic: value});
                        acc = [...acc, ...res];
                        break;
                }

                return acc;
            }, []);

            const logs = (await esService.search(
                {
                    index: indexName,
                    limit: pagination?.limit,
                    offset: pagination?.offset,
                    sort,
                    query: {
                        bool: {
                            must: queryParts
                        }
                    }
                },
                ctx
            )) as Log[];

            return logs;
        }
    };
}
