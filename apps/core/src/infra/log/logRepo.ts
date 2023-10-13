import {getLogsIndexName} from '@leav/utils';
import {IElasticSearchService} from 'infra/elasticSearch/elasticSearchService';
import {IConfig} from '_types/config';
import {ILogFilters, ILogPagination, ILogSort, Log} from '_types/log';
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

export default function({'core.infra.elasticSearch.service': esService, config}: IDeps): ILogRepo {
    return {
        async getLogs({filters, sort, pagination}, ctx) {
            const _flattenObject = (obj: Record<string, any>, parentKey: string = '') => {
                let result: SearchQueryType[] = [];

                for (const [key, value] of Object.entries(obj)) {
                    const newKey = parentKey ? `${parentKey}.${key}` : key;

                    if (typeof value === 'object' && !Array.isArray(value)) {
                        const nested = _flattenObject(value, newKey);
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

                //TODO: handle multiple fields on same query
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
                    case 'action':
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
                        const res = _flattenObject({topic: value});
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
