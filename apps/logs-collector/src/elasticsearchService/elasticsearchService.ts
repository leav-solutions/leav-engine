// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client} from '@elastic/elasticsearch';
import {type MappingProperty} from '@elastic/elasticsearch/lib/api/types';
import {type Log} from '@leav/utils';
import {type IConfig} from '_types/config';
import {type WritableMessage} from '_types/message';

export interface IElasticsearchService {
    writeData: (indexName: string, data: WritableMessage) => Promise<void>;
}

export const elasticsearchService = (config: IConfig): IElasticsearchService => {
    const esClient = new Client({
        node: config.elasticsearch.url
    });

    const _createILMPolicyIfNotExists = async (ilmPolicyName: string) => {
        const ilmPolicyExists = await esClient.ilm.getLifecycle({name: ilmPolicyName}).catch(() => null);
        if (!ilmPolicyExists || !ilmPolicyExists[ilmPolicyName]) {
            console.info(`Creating elasticsearch index lifecycle policy ${ilmPolicyName}`);
            await esClient.ilm.putLifecycle({
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
        const templateExists = await esClient.indices.existsIndexTemplate({name: templateName});
        if (!templateExists) {
            console.info(`Creating elasticsearch index template ${templateName} with ILM policy ${ilmPolicyName}`);
            await esClient.indices.putIndexTemplate({
                name: templateName,
                index_patterns: [`${config.elasticsearch.indexPrefix}*`],
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
        const indexExists = await esClient.indices.exists({index: indexName});
        if (!indexExists) {
            const ilmPolicyName = config.elasticsearch.ilmPolicyName;
            await _createILMPolicyIfNotExists(ilmPolicyName);

            const templateName = config.elasticsearch.templateName;
            await _createIndexTemplateIfNotExists(templateName, ilmPolicyName);

            console.info(`Creating elasticsearch index ${indexName}`);
            await esClient.indices.createDataStream({
                name: indexName
            });
        }
    };

    const writeData = async (indexName: string, data: WritableMessage) => {
        await _createIndexIfNotExists(indexName);

        await esClient.index({
            index: indexName,
            body: data
        });
    };

    return {
        writeData
    };
};
