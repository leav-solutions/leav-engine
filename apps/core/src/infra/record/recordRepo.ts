// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, GeneratedAqlQuery, join, literal} from 'arangojs/aql';
import {GetConditionPart} from 'infra/attributeTypes/helpers/getConditionPart';
import {IDbDocument, IExecuteWithCount} from 'infra/db/_types';
import {GetSearchQuery} from 'infra/indexation/helpers/getSearchQuery';
import {IQueryInfos} from '_types/queryInfos';
import {
    CursorDirection,
    ICursorPaginationParams,
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
import {IAttributeRepo} from '../attribute/attributeRepo';
import {IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
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
        mergeObjects?: boolean;
        ctx: IQueryInfos;
    }): Promise<{old: IRecord; new: IRecord}>;
    deleteRecord({libraryId, recordId, ctx}: {libraryId: string; recordId: string; ctx: IQueryInfos}): Promise<IRecord>;
    find(params: {
        libraryId: string;
        filters?: IRecordFilterOption[];
        sort?: IRecordSort[];
        pagination?: IPaginationParams | ICursorPaginationParams;
        withCount?: boolean;
        retrieveInactive?: boolean;
        fulltextSearch?: string;
        ctx: IQueryInfos;
    }): Promise<IListWithCursor<IRecord>>;
}

export interface IRecordRepoDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.db.dbUtils': IDbUtils;
    'core.infra.attributeTypes': IAttributeTypesRepo;
    'core.infra.attribute': IAttributeRepo;
    'core.infra.attributeTypes.helpers.getConditionPart': GetConditionPart;
    'core.infra.record.helpers.getSearchVariablesQueryPart': GetSearchVariablesQueryPart;
    'core.infra.record.helpers.getSearchVariableName': GetSearchVariableName;
    'core.infra.record.helpers.filterTypes': IFilterTypesHelper;
    'core.infra.indexation.helpers.getSearchQuery': GetSearchQuery;
}

export default function ({
    'core.infra.db.dbService': dbService,
    'core.infra.db.dbUtils': dbUtils,
    'core.infra.attributeTypes': attributeTypesRepo,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart,
    'core.infra.record.helpers.getSearchVariablesQueryPart': getSearchVariablesQueryPart,
    'core.infra.record.helpers.getSearchVariableName': getSearchVariableName,
    'core.infra.record.helpers.filterTypes': filterTypesHelper,
    'core.infra.indexation.helpers.getSearchQuery': getSearchQuery,
    'core.infra.attribute': attributeRepo
}: IRecordRepoDeps): IRecordRepo {
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
        async find({
            libraryId,
            filters,
            sort,
            pagination,
            withCount,
            fulltextSearch,
            retrieveInactive = false,
            ctx
        }): Promise<IListWithCursor<IRecord>> {
            const withCursorPagination = !!pagination && !!(pagination as ICursorPaginationParams).cursor;
            // Force disabling count on cursor  pagination as it's pointless
            const withTotalCount = withCount && !withCursorPagination;
            const coll = dbService.db.collection(libraryId);
            let fulltextSearchQuery: GeneratedAqlQuery;

            if (typeof fulltextSearch !== 'undefined' && fulltextSearch !== '') {
                // format search query
                const cleanFulltextSearch = fulltextSearch?.replace(/\s+/g, ' ').trim();
                const fullTextAttributes = await attributeRepo.getLibraryFullTextAttributes({libraryId, ctx});

                fulltextSearchQuery = getSearchQuery(
                    libraryId,
                    fullTextAttributes.map(a => a.id),
                    cleanFulltextSearch
                );
            }

            const queryParts = [aql`FOR r IN (${fulltextSearchQuery ?? coll})`];

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

                        const variableNameAql = literal(variableName);
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

                            statement = aql`IS_ARRAY(${variableNameAql}) ? LENGTH(${literal(
                                variableNameAql
                            )}[* FILTER ${arrayConditionPart}]) : ${standardConditionPart}`;
                        }

                        filterStatements.push(join([aql`(`, statement, aql`)`]));
                    } else if (filterTypesHelper.isClassifyingFilter(filter)) {
                        const variableName = getSearchVariableName(filter);
                        const classifyingCondition = filter.condition === TreeCondition.CLASSIFIED_IN ? 'IN' : 'NOT IN';
                        filterStatements.push(aql`r._id ${literal(classifyingCondition)} ${literal(variableName)}`);
                    }
                }

                filterStatements.push(aql`)`);

                queryParts.push(join(variablesDeclarations, '\n'));
                queryParts.push(join(filterStatements, '\n'));
            }

            // If we have a full text search query and no specific sort, sorting by relevance is already handled.
            if (!fulltextSearchQuery && !sort) {
                queryParts.push(aql`SORT ${literal('TO_NUMBER(r._key) DESC')}`);
            } else if (sort?.length) {
                queryParts.push(
                    aql`SORT `,
                    ...sort.map(s => attributeTypesRepo.getTypeRepo(s.attributes[0]).sortQueryPart(s))
                );
            }

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

                    // When looking for previous records, first sort in reverse order to get the last records
                    if (direction === CursorDirection.PREV) {
                        queryParts.push(aql`SORT r.created_at ASC, r._key ASC`);
                    }

                    const operator = direction === CursorDirection.NEXT ? '<' : '>';
                    queryParts.push(aql`FILTER r._key ${literal(operator)} ${from}`);
                    queryParts.push(aql`LIMIT ${pagination.limit}`);
                }
            }

            queryParts.push(aql`RETURN MERGE(r, {library: ${libraryId}})`);

            const fullQuery = join(queryParts, '\n');

            const records = await dbService.execute<IExecuteWithCount | IDbDocument[]>({
                query: fullQuery,
                withTotalCount,
                ctx
            });

            const list = withTotalCount ? (records as IExecuteWithCount).results : (records as IDbDocument[]);
            const totalCount = withTotalCount ? (records as IExecuteWithCount).totalCount : null;

            // TODO: detect if we reach end/beginning of the list and should not provide a cursor
            const cursor: IPaginationCursors = pagination
                ? {
                      prev: list.length ? _generateCursor(Number(list[0]._key), CursorDirection.PREV) : null,
                      next: list.length ? _generateCursor(Number(list.slice(-1)[0]._key), CursorDirection.NEXT) : null
                  }
                : null;

            return {
                totalCount,
                list: list.map(dbUtils.cleanup),
                cursor
            };
        },
        async createRecord({libraryId, recordData, ctx}): Promise<IRecord> {
            const collection = dbService.db.collection(libraryId);
            let newRecord = await collection.save(recordData);
            newRecord = await collection.document(newRecord);

            (newRecord as IRecord).library = newRecord._id.split('/')[0];

            return dbUtils.cleanup(newRecord);
        },
        async deleteRecord({libraryId, recordId, ctx}): Promise<IRecord> {
            const collection = dbService.db.collection(libraryId);

            // Delete record
            const deletedRecord: IRecord = await collection.remove({_key: String(recordId)}, {returnOld: true});

            deletedRecord.library = deletedRecord._id.split('/')[0];
            deletedRecord.old = dbUtils.cleanup(deletedRecord.old);

            return dbUtils.cleanup(deletedRecord);
        },
        async updateRecord({libraryId, recordData, ctx}) {
            const collection = dbService.db.collection<IRecord>(libraryId);
            const dataToSave = {...recordData};
            const recordId = dataToSave.id;
            delete dataToSave.id; // Don't save ID

            const dbDocument = {
                _id: `${libraryId}/${recordId}`,
                _key: recordId
            };

            const [{old: oldRecord, new: updatedRecord}] = await dbService.execute<
                Array<{new: IDbDocument; old: IDbDocument}>
            >({
                query: aql`
                    UPDATE ${dbDocument} WITH ${dataToSave} IN ${collection}
                    RETURN {old: OLD, new: NEW}
                `,
                ctx
            });

            updatedRecord.library = libraryId;
            oldRecord.library = libraryId;

            return {old: dbUtils.cleanup(oldRecord), new: dbUtils.cleanup(updatedRecord)};
        }
    };
}
