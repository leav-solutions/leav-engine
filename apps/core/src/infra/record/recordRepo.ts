// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {estypes} from '@elastic/elasticsearch';
import {aql} from 'arangojs';
import {GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {GetConditionPart} from 'infra/attributeTypes/helpers/getConditionPart';
import {IDbDocument, IExecuteWithCount} from 'infra/db/_types';
import {IQueryInfos} from '_types/queryInfos';
import {
    CursorDirection,
    ICursorPaginationParams,
    IList,
    IListWithCursor,
    IPaginationCursors,
    IPaginationParams
} from '../../_types/list';
import {
    AttributeCondition,
    IRecord,
    IRecordFilterOption,
    IRecordSort,
    Operator,
    TreeCondition
} from '../../_types/record';
import {IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {IElasticsearchService} from '../elasticsearch/elasticsearchService';
import {IFilterTypesHelper} from './helpers/filterTypes';
import {GetSearchVariableName} from './helpers/getSearchVariableName';
import {GetSearchVariablesQueryPart} from './helpers/getSearchVariablesQueryPart';

export interface IFindRequestResult {
    initialVars: GeneratedAqlQuery[]; // Some "global" variables needed later on the query (eg. "classified in" subquery)
    queryPart: GeneratedAqlQuery;
}

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
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.infra.record.helpers.getSearchVariablesQueryPart'?: GetSearchVariablesQueryPart;
    'core.infra.record.helpers.getSearchVariableName'?: GetSearchVariableName;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.elasticsearch.elasticsearchService': elasticsearchService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes': attributeTypesRepo = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.infra.record.helpers.getSearchVariablesQueryPart': getSearchVariablesQueryPart = null,
    'core.infra.record.helpers.getSearchVariableName': getSearchVariableName = null,
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null
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

    return {
        async search(library: string, query: string, from?: number, size?: number): Promise<IList<IRecord>> {
            const result = await elasticsearchService.wildcardSearch(library, query, from, size);

            const records = result.hits.hits.map(h => ({id: h._id, library, ...(h._source as IRecord)}));

            return {
                totalCount: (result.hits.total as estypes.SearchTotalHits).value,
                list: records
            };
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
            // Force disabling count on cursor  pagination as it's pointless
            const withTotalCount = withCount && !withCursorPagination;
            const coll = dbService.db.collection(libraryId);

            const queryParts = [aql`FOR r IN ${coll}`];
            let isFilteringOnActive = false;

            const aqlPartByOperator: Record<Operator, GeneratedAqlQuery> = {
                [Operator.AND]: aql`AND`,
                [Operator.OR]: aql`OR`,
                [Operator.OPEN_BRACKET]: aql`(`,
                [Operator.CLOSE_BRACKET]: aql`)`
            };

            if (typeof filters !== 'undefined' && filters.length) {
                // Get all variables definitions
                const variablesDeclarations = getSearchVariablesQueryPart(filters);

                const filterStatements: GeneratedAqlQuery[] = [aql`FILTER (`];
                for (const filter of filters) {
                    if (filter.operator) {
                        filterStatements.push(aqlPartByOperator[filter.operator]);
                    } else if (filterTypesHelper.isAttributeFilter(filter)) {
                        isFilteringOnActive = isFilteringOnActive || filter.attributes[0].id === 'active';
                        const variableName = getSearchVariableName(filter);
                        const lastFilterAttribute = filter.attributes.slice(-1)[0];

                        const variableNameAql = aql.literal(variableName);
                        let statement: GeneratedAqlQuery;

                        if (filterTypesHelper.isCountFilter(filter)) {
                            // For count filters, variable only contains the number of values
                            let conditionApplied: AttributeCondition;
                            let valueToCheck = filter.value;
                            switch (filter.condition) {
                                case AttributeCondition.VALUES_COUNT_EQUAL:
                                    conditionApplied = AttributeCondition.EQUAL;
                                    break;
                                case AttributeCondition.VALUES_COUNT_GREATER_THAN:
                                    conditionApplied = AttributeCondition.GREATER_THAN;
                                    break;
                                case AttributeCondition.VALUES_COUNT_LOWER_THAN:
                                    conditionApplied = AttributeCondition.LESS_THAN;
                                    break;
                                case AttributeCondition.IS_EMPTY:
                                    conditionApplied = AttributeCondition.EQUAL;
                                    valueToCheck = 0;
                                    break;
                                case AttributeCondition.IS_NOT_EMPTY:
                                    conditionApplied = AttributeCondition.GREATER_THAN;
                                    valueToCheck = 0;
                            }
                            const countConditionPart = getConditionPart(
                                variableName,
                                conditionApplied,
                                valueToCheck,
                                lastFilterAttribute
                            );
                            statement = aql`${countConditionPart}`;
                        } else {
                            // If multiple values or versionable attribute, apply filter on each value of the array
                            // Otherwise, apply filter on the first value of the array
                            const arrayConditionPart = getConditionPart(
                                'CURRENT',
                                filter.condition as AttributeCondition,
                                filter.value,
                                lastFilterAttribute
                            );

                            const standardConditionPart = getConditionPart(
                                variableName,
                                filter.condition as AttributeCondition,
                                filter.value,
                                lastFilterAttribute
                            );

                            statement = aql`IS_ARRAY(${variableNameAql}) ? LENGTH(${aql.literal(
                                variableNameAql
                            )}[* FILTER ${arrayConditionPart}]) : ${standardConditionPart}`;
                        }

                        filterStatements.push(aql.join([aql`(`, statement, aql`)`]));
                    } else if (filterTypesHelper.isClassifyingFilter(filter)) {
                        const variableName = getSearchVariableName(filter);
                        const classifyingCondition = filter.condition === TreeCondition.CLASSIFIED_IN ? 'IN' : 'NOT IN';
                        filterStatements.push(
                            aql`r._id ${aql.literal(classifyingCondition)} ${aql.literal(variableName)}`
                        );
                    }
                }

                filterStatements.push(aql`)`);

                queryParts.push(aql.join(variablesDeclarations, '\n'));
                queryParts.push(aql.join(filterStatements, '\n'));
            }

            const sortQueryPart = sort
                ? attributeTypesRepo.getTypeRepo(sort.attributes[0]).sortQueryPart(sort)
                : aql`SORT r._key ASC`;

            queryParts.push(sortQueryPart as GeneratedAqlQuery);

            if (!retrieveInactive && !isFilteringOnActive) {
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

            const records = await dbService.execute<IExecuteWithCount | IDbDocument[]>({
                query: fullQuery,
                withTotalCount,
                ctx
            });

            const list = withTotalCount ? (records as IExecuteWithCount).results : (records as IDbDocument[]);
            const totalCount = withTotalCount ? (records as IExecuteWithCount).totalCount : null;

            // TODO: detect if we reach end/begining of the list and should not provide a cursor
            const cursor: IPaginationCursors = pagination
                ? {
                      prev: list.length ? _generateCursor(Number(list[0]._key), CursorDirection.PREV) : null,
                      next: list.length ? _generateCursor(Number(list.slice(-1)[0]._key), CursorDirection.NEXT) : null
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

            // Delete record
            const deletedRecord = await collection.remove({_key: String(recordId)}, {returnOld: true});

            deletedRecord.library = deletedRecord._id.split('/')[0];
            deletedRecord.old = dbUtils.cleanup(deletedRecord.old);

            return dbUtils.cleanup(deletedRecord);
        },
        async updateRecord({libraryId, recordData, ctx}): Promise<IRecord> {
            const collection = dbService.db.collection(libraryId);
            const dataToSave = {...recordData};
            const recordId = dataToSave.id;
            delete dataToSave.id; // Don't save ID

            const updatedRecord = await collection.update({_key: String(recordId)}, dataToSave, {returnOld: true});

            updatedRecord.library = updatedRecord._id.split('/')[0];

            return dbUtils.cleanup(updatedRecord);
        }
    };
}
