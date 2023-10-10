// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client} from '@elastic/elasticsearch';
import {IConfig} from '_types/config';
import {WritableMessage} from '_types/message';

export const initClient = async (config: IConfig) => {
    return new Client({
        node: config.elasticsearch.url
    });
};

export const writeData = async (indexName: string, data: WritableMessage, esClient: Client) => {
    await esClient.indices.create(
        {
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
        },
        {ignore: [400]} // To ignore errors if index already exists
    );

    await esClient.index({
        index: indexName,
        body: data
    });
};
