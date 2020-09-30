import {Client} from '@elastic/elasticsearch';

interface IMultiMatchQuery {
    multi_match: {
        query: string;
        fields?: string[];
        fuzziness?: string;
    };
}

interface IFilterQuery {
    term?: {
        active?: boolean;
    };
}

interface ISearchBody {
    from: number;
    size: number;
    query: {
        bool: {
            must: {
                should: IMultiMatchQuery[];
            };
            filter?: IFilterQuery;
        };
    };
}

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
    indiceGetMapping?(index: string): Promise<string[]>;
    indiceDelete?(index: string): Promise<void>;
    indiceExists?(index: string): Promise<boolean>;
    index?(index: string, documentId: string, data: any): Promise<void>;
    update?(index: string, documentId: string, data: any): Promise<void>;
    delete?(index: string, documentId: string, attributeId: string): Promise<void>;
    deleteDocument?(index: string, documentId: string): Promise<void>;
    multiMatch?<T extends any = any>(
        index: string,
        {query, fields, fuzziness}: IMultiMatchQuery['multi_match'],
        from?: number,
        size?: number
    ): Promise<ISearchResponse<T>>;
}

interface IDeps {
    'core.infra.elasticsearch'?: Client;
}

export default function({'core.infra.elasticsearch': client = null}: IDeps = {}): IElasticsearchService {
    return {
        client,
        async indiceGetMapping(index: string): Promise<string[]> {
            const res = await client.indices.getMapping({index});
            return Object.keys(res.body[index].mappings.properties);
        },
        async indiceExists(index: string): Promise<boolean> {
            const res = await client.indices.exists({index});
            return (res.body as unknown) as boolean;
        },
        async index(index: string, documentId: string, data: any): Promise<void> {
            await client.index({index, id: documentId, body: data, refresh: 'true'});
        },
        async update(index: string, documentId: string, data: any): Promise<void> {
            await client.update({index, id: documentId, body: {doc: data}, refresh: 'true'});
        },
        async delete(index: string, documentId: string, attributeId: string): Promise<void> {
            await client.update({
                index,
                id: documentId,
                body: {
                    script: {
                        source: 'ctx._source.remove(params.attribute)',
                        params: {attribute: attributeId}
                    }
                },
                refresh: 'true'
            });
        },
        async indiceDelete(index: string): Promise<void> {
            await client.indices.delete({index});
        },
        async deleteDocument(index: string, documentId: string): Promise<void> {
            await client.delete({index, id: documentId, refresh: 'true'});
        },
        async multiMatch<T extends any = any>(
            index: string,
            {query, fields = ['*'], fuzziness = 'AUTO'}: IMultiMatchQuery['multi_match'],
            from?: number,
            size?: number
        ): Promise<ISearchResponse<T>> {
            const response = await client.search<ISearchResponse<any>, any>({
                index,
                body: {
                    from,
                    size,
                    query: {
                        multi_match: {
                            query,
                            fields,
                            fuzziness,
                            lenient: true,
                            analyzer: 'standard'
                        }
                    }
                }
            });

            return response.body;
        }
    };
}
