import {aql} from 'arangojs';
import {AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IQueryInfos} from '_types/queryInfos';
import {
    CursorDirection,
    ICursorPaginationParams,
    IListWithCursor,
    IList,
    IPaginationCursors,
    IPaginationParams
} from '../../_types/list';
import {IRecord, IRecordFilterOption, IRecordSort, Operator} from '../../_types/record';
import {IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';
import {IDbService, IExecuteWithCount} from '../db/dbService';
import {IElasticsearchService} from '../elasticsearch/elasticsearchService';
import {IDbUtils} from '../db/dbUtils';

export const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

export interface IRecordRepo {
    createRecord({
        libraryId,
        recordData,
        ctx
    }: {
        libraryId: string;
        recordData: IRecord;
        ctx: IQueryInfos;
    }): Promise<IRecord>;
    updateRecord({
        libraryId,
        recordData,
        ctx
    }: {
        libraryId: string;
        recordData: IRecord;
        ctx: IQueryInfos;
    }): Promise<IRecord>;
    deleteRecord({libraryId, recordId, ctx}: {libraryId: string; recordId: string; ctx: IQueryInfos}): Promise<IRecord>;
    find({
        libraryId,
        filters,
        sort,
        pagination,
        withCount,
        retrieveInactive,
        ctx
    }: {
        libraryId: string;
        filters?: IRecordFilterOption[];
        sort?: IRecordSort;
        pagination?: IPaginationParams | ICursorPaginationParams;
        withCount?: boolean;
        retrieveInactive?: boolean;
        ctx: IQueryInfos;
    }): Promise<IListWithCursor<IRecord>>;
    search(library: string, query: string, from?: number, size?: number): Promise<IList<IRecord>>;
}

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.elasticsearch.elasticsearchService'?: IElasticsearchService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes'?: IAttributeTypesRepo;
}

export default function({
    'core.infra.db.dbService': dbService = null,
    'core.infra.elasticsearch.elasticsearchService': elasticsearchService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes': attributeTypesRepo = null
}: IDeps = {}): IRecordRepo {
    const _generateCursor = (from: number, direction: CursorDirection): string =>
        Buffer.from(`${direction}:${from}`).toString('base64');

    const _parseCursor = (
        cursor: string
    ): {
        direction: string;
        from: string;
    } => {
        const s = Buffer.from(cursor, 'base64').toString();
        const [direction, from] = s.split(':');

        return {
            direction,
            from
        };
    };

    const _toReversePolishNotation = (filters: IRecordFilterOption[]): IRecordFilterOption[] => {
        const stack = [];
        const output = [];

        for (const f of filters) {
            if (typeof f.value !== 'undefined') {
                output.push(f);
            } else if (f.operator !== Operator.CLOSE_BRACKET) {
                stack.push(f);
            } else {
                let e: IRecordFilterOption = stack.pop();
                while (e && e.operator !== Operator.OPEN_BRACKET) {
                    output.push(e);
                    e = stack.pop();
                }
            }
        }

        return output.concat(stack.reverse());
    };

    const _findRequest = async (libraryId: string, filter?: IRecordFilterOption, index?: number): Promise<AqlQuery> => {
        const queryParts = [];
        const coll = dbService.db.collection(libraryId);
        queryParts.push(aql`(FOR r IN ${coll}`);

        if (typeof filter !== 'undefined') {
            const filterQueryPart = attributeTypesRepo
                .getTypeRepo(filter.attributes[0])
                .filterQueryPart(
                    filter.attributes,
                    attributeTypesRepo.getQueryPart(filter.value, filter.condition),
                    index
                );

            queryParts.push(filterQueryPart);
        }

        queryParts.push(aql`RETURN r)`);
        return aql.join(queryParts);
    };

    return {
        async search(library: string, query: string, from?: number, size?: number): Promise<IList<IRecord>> {
            const result = await elasticsearchService.multiMatch(library, {query}, from, size);
            const records = result.hits.hits.map(h => ({id: h._id, library, ...h._source}));

            return {totalCount: result.hits.total.value, list: records};
        },
        async find({
            libraryId,
            filters,
            sort,
            pagination,
            withCount,
            retrieveInactive = false,
            ctx
        }): Promise<IListWithCursor<IRecord>> {
            const withCursorPagination = !!pagination && !!(pagination as ICursorPaginationParams).cursor;
            // Force disbaling count on cursor pagination as it's pointless
            const withTotalCount = withCount && !withCursorPagination;
            const coll = dbService.db.collection(libraryId);
            let queryParts = [!filters.length ? aql`FOR r IN ${coll}` : aql`FOR r IN`];

            if (typeof filters !== 'undefined' && filters.length) {
                const rpn: IRecordFilterOption[] = _toReversePolishNotation(filters);

                const stack = [];
                for (const [i, filter] of rpn.entries()) {
                    if (filter.attributes) {
                        stack.push(filter);
                    } else {
                        let [f0, f1] = [stack.pop(), stack.pop()].reverse();
                        const operator = filter.operator;

                        if (f0.attributes) {
                            f0 = await _findRequest(libraryId, f0, i);
                        }
                        if (f1.attributes) {
                            f1 = await _findRequest(libraryId, f1, i);
                        }

                        const res =
                            operator === Operator.AND
                                ? aql`INTERSECTION(${f0}, ${f1})`
                                : aql`APPEND(${f0}, ${f1}, true)`;

                        stack.push(res);
                    }
                }

                if (stack[0].attributes) {
                    stack[0] = await _findRequest(libraryId, stack[0], 0);
                }

                queryParts = queryParts.concat([].concat.apply([], stack));
            }

            const sortQueryPart = sort
                ? attributeTypesRepo.getTypeRepo(sort.attributes[0]).sortQueryPart(sort)
                : aql`SORT r._key ASC`;

            queryParts.push(sortQueryPart as GeneratedAqlQuery);

            if (!retrieveInactive) {
                queryParts.push(aql`FILTER r.active == true`);
            }

            if (pagination) {
                if (!(pagination as IPaginationParams).offset && !(pagination as ICursorPaginationParams).cursor) {
                    (pagination as IPaginationParams).offset = 0;
                }

                if (typeof (pagination as IPaginationParams).offset !== 'undefined') {
                    queryParts.push(aql`LIMIT ${(pagination as IPaginationParams).offset}, ${pagination.limit}`);
                } else if ((pagination as ICursorPaginationParams).cursor) {
                    const {direction, from} = _parseCursor((pagination as ICursorPaginationParams).cursor);
                    const operator = direction === CursorDirection.NEXT ? '>' : '<';

                    // When looking for previous records, first sort in reverse order to get the last records
                    if (direction === CursorDirection.PREV) {
                        queryParts.push(aql`SORT r._key DESC`);
                    }

                    queryParts.push(aql`FILTER r._key ${aql.literal(operator)} ${from}`);
                    queryParts.push(aql`LIMIT ${pagination.limit}`);
                }
            }

            queryParts.push(aql`RETURN MERGE(r, {library: ${libraryId}})`);

            const fullQuery = aql.join(queryParts, '\n');

            const records = await dbService.execute<IExecuteWithCount | any[]>({
                query: fullQuery,
                withTotalCount,
                ctx
            });

            const list: any[] = withTotalCount ? (records as IExecuteWithCount).results : (records as any[]);
            const totalCount = withTotalCount ? (records as IExecuteWithCount).totalCount : null;

            // TODO: detect if we reach end/begining of the list and should not provide a cursor
            const cursor: IPaginationCursors = pagination
                ? {
                      prev: list.length ? _generateCursor(list[0]._key, CursorDirection.PREV) : null,
                      next: list.length ? _generateCursor(list.slice(-1)[0]._key, CursorDirection.NEXT) : null
                  }
                : null;

            const returnVal = {
                totalCount,
                list: list.map(dbUtils.cleanup),
                cursor
            };

            return returnVal;
        },
        async createRecord({libraryId, recordData, ctx}): Promise<IRecord> {
            const collection = dbService.db.collection(libraryId);
            let newRecord = await collection.save(recordData);
            newRecord = await collection.document(newRecord);

            newRecord.library = newRecord._id.split('/')[0];

            return dbUtils.cleanup(newRecord);
        },
        async deleteRecord({libraryId, recordId, ctx}): Promise<IRecord> {
            const collection = dbService.db.collection(libraryId);
            const edgeCollection = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Delete record values
            const deleteValuesRes = await dbService.execute({
                query: aql`
                    FOR l IN ${edgeCollection}
                        FILTER l._from == ${libraryId + '/' + recordId} OR l._to == ${libraryId + '/' + recordId}
                        REMOVE {_key: l._key} IN ${edgeCollection}
                        RETURN OLD
                `,
                ctx
            });

            // Delete record
            const deletedRecord = await collection.remove({_key: String(recordId)});

            deletedRecord.library = deletedRecord._id.split('/')[0];
            return dbUtils.cleanup(deletedRecord);
        },
        async updateRecord({libraryId, recordData, ctx}): Promise<IRecord> {
            const collection = dbService.db.collection(libraryId);
            const dataToSave = {...recordData};
            delete dataToSave.id; // Don't save ID

            const updateRes = await dbService.execute({
                query: aql`
                    UPDATE {_key: ${recordData.id}} WITH ${dataToSave} IN ${collection}
                    RETURN NEW
                `,
                ctx
            });

            const updatedRecord = dbUtils.cleanup(updateRes[0]);

            return updatedRecord;
        }
    };
}
