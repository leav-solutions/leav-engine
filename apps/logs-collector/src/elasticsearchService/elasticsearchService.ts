// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client} from '@elastic/elasticsearch';
import {IConfig} from '_types/config';
import {WritableMessage} from '_types/message';

export interface IElasticsearchService {
    writeData: (indexName: string, data: WritableMessage) => Promise<void>;
}

export const ElasticsearchService = (config: IConfig): IElasticsearchService => {
    const esClient = new Client({
        node: config.elasticsearch.url
    });

    const _createIndexIfNotExists = async (indexName: string) => {
        const indexExists = await esClient.indices.exists({index: indexName});
        if (!indexExists) {
            console.info(`Creating elasticsearch index ${indexName}`);
            await esClient.indices.create({
                index: indexName,
                body: {
                    mappings: {
                        properties: {
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
                        }
                    }
                }
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
