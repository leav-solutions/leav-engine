// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client, estypes} from '@elastic/elasticsearch';

// Complete definition of the Search response
interface IShardsResponse {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
}

interface IExplanation {
    value: number;
    description: string;
    details: IExplanation[];
}

interface ISearchResponse<T> {
    took: number;
    timed_out: boolean;
    _scroll_id?: string;
    _shards: IShardsResponse;
    hits: {
        total: {
            value: number;
            relation: string;
        };
        max_score: number;
        hits: Array<{
            _index: string;
            _type: string;
            _id: string;
            _score: number;
            _source: T;
            _version?: number;
            _explanation?: IExplanation;
            fields?: any;
            highlight?: any;
            inner_hits?: any;
            matched_queries?: string[];
            sort?: string[];
        }>;
    };
    aggregations?: any;
}

export interface IElasticsearchService {
    client?: Client;
    indiceGetMapping?(index: string): Promise<estypes.IndicesGetMappingResponse>;
    indiceUpdateMapping?(
        index: string,
        mappings: {[field: string]: {[type: string]: string}}
    ): Promise<estypes.IndicesPutMappingResponse>;
    indiceCreate?(
        index: string,
        mappings?: {[field: string]: {[type: string]: string}}
    ): Promise<estypes.IndicesCreateResponse>;
    indiceDelete?(index: string): Promise<estypes.IndicesDeleteResponse>;
    indiceExists?(index: string): Promise<estypes.IndicesExistsResponse>;
    indexData?(index: string, documentId: string, data: any): Promise<estypes.IndexResponse>;
    updateData?(index: string, documentId: string, data: any): Promise<estypes.UpdateResponse>;
    deleteData?(index: string, documentId: string, attributeId: string): Promise<estypes.DeleteResponse>;
    deleteDocument?(index: string, documentId: string): Promise<estypes.DeleteResponse>;
    wildcardSearch?(index: string, query: string, from?: number, size?: number): Promise<estypes.SearchResponse>;
}

interface IDeps {
    'core.infra.elasticsearch'?: Client;
}

export default function ({'core.infra.elasticsearch': client = null}: IDeps = {}): IElasticsearchService {
    return {
        client,
        async indiceGetMapping(index: string): Promise<estypes.IndicesGetMappingResponse> {
            return client.indices.getMapping({index});
        },
        async indiceUpdateMapping(
            index: string,
            mappings: {[field: string]: {[type: string]: string}}
        ): Promise<estypes.IndicesPutMappingResponse> {
            return client.indices.putMapping({index, properties: mappings});
        },
        async indiceExists(index: string): Promise<estypes.IndicesExistsResponse> {
            return client.indices.exists({index});
        },
        async indexData(index: string, documentId: string, data: any): Promise<estypes.IndexResponse> {
            return client.index({index, id: documentId, body: data, refresh: true});
        },
        async updateData(index: string, documentId: string, data: any): Promise<estypes.UpdateResponse> {
            return client.update({index, id: documentId, body: {doc: data}, refresh: true});
        },
        async deleteData(index: string, documentId: string, attributeId: string): Promise<estypes.DeleteResponse> {
            return client.update({
                index,
                id: documentId,
                body: {
                    script: {
                        source: 'ctx._source.remove(params.attribute)',
                        params: {attribute: attributeId}
                    }
                },
                refresh: true
            });
        },
        async indiceCreate(
            index: string,
            mappings?: {[field: string]: {[type: string]: string}}
        ): Promise<estypes.IndicesCreateResponse> {
            return client.indices.create({
                index,
                ...(!!mappings && {
                    mappings: {
                        properties: {
                            ...mappings
                        }
                    }
                })
            });
        },
        async indiceDelete(index: string): Promise<estypes.IndicesDeleteResponse> {
            return client.indices.delete({index});
        },
        async deleteDocument(index: string, documentId: string): Promise<estypes.DeleteResponse> {
            return client.delete({index, id: documentId, refresh: true});
        },
        async wildcardSearch(index: string, query, from?: number, size?: number): Promise<estypes.SearchResponse> {
            const mapping = await client.indices.getMapping({index});
            const fields = Object.keys(mapping[index]?.mappings?.properties);

            const words = query.length ? query.split(' ') : [];

            const response = await client.search({
                index,
                from,
                size,
                query: {
                    bool: {
                        must: {match_all: {}},
                        filter: {
                            bool: {
                                should: words.map(w => fields.map(f => ({wildcard: {[f]: {value: `*${w}*`}}}))).flat(),
                                minimum_should_match: 1
                            }
                        }
                    }
                }
            });

            return response;
        }
    };
}
