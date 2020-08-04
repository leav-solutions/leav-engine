import {Client} from '@elastic/elasticsearch';

// Define the type of the body for the search request
interface IMultiMatchQuery {
    multi_match: {
        query: string;
        fields?: string[];
        fuzziness?: string;
    };
}

interface ISearchBody {
    from: number;
    size: number;
    query: IMultiMatchQuery;
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
        async multiMatch<T extends any = any>(
            index: string,
            {query, fields = ['*'], fuzziness = 'AUTO'}: IMultiMatchQuery['multi_match'],
            from?: number,
            size?: number
        ): Promise<ISearchResponse<T>> {
            const response = await client.search<ISearchResponse<any>, ISearchBody>({
                index,
                body: {
                    from,
                    size,
                    query: {
                        multi_match: {
                            query,
                            fields,
                            fuzziness
                        }
                    }
                }
            });

            return response.body;
        }
    };
}
