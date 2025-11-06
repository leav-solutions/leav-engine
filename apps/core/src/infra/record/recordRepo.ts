// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, type GeneratedAqlQuery, join, literal} from 'arangojs/aql';
import DataLoader from 'dataloader';
import {type GetConditionPart} from 'infra/attributeTypes/helpers/getConditionPart';
import {type IDbDocument, type IExecuteWithCount} from 'infra/db/_types';
import {type GetSearchQuery} from 'infra/indexation/helpers/getSearchQuery';
import {type IQueryInfos} from '_types/queryInfos';
import {
    CursorDirection,
    type ICursorPaginationParams,
    type IListWithCursor,
    type IPaginationCursors,
    type IPaginationParams,
} from '../../_types/list';
import {
    AttributeCondition,
    type IRecord,
    type IRecordFilterOption,
    type IRecordSort,
    Operator,
    TreeCondition,
} from '../../_types/record';
import {type IAttributeRepo} from '../attribute/attributeRepo';
import {type IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {type IFilterTypesHelper} from './helpers/filterTypes';
import {type GetSearchVariableName} from './helpers/getSearchVariableName';
import {type GetSearchVariablesQueryPart} from './helpers/getSearchVariablesQueryPart';
import {type IGetAccessPermissionsValue} from 'domain/record/helpers/getAccessPermissionFilters';
import {VALUES_LINKS_COLLECTION} from '../value/valueRepo';
import {getOrCreateDataLoaderInCtx} from '../../utils/dataloader';

export interface IFindRequestResult {
    initialVars: GeneratedAqlQuery[]; // Some "global" variables needed later on the query (eg. "classified in" subquery)
    queryPart: GeneratedAqlQuery;
}

export interface IRecordRepo {
    createRecord({
        libraryId,
        recordData,
        ctx,
    }: {
        libraryId: string;
        recordData: IRecord;
        ctx: IQueryInfos;
    }): Promise<IRecord>;
    updateRecord({
        libraryId,
        recordData,
        ctx,
    }: {
        libraryId: string;
        recordData: IRecord;
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
        accessPermissionFilters?: IGetAccessPermissionsValue[];
    }): Promise<IListWithCursor<IRecord>>;

    /**
     * get record by recordId, return null if record not found
     * NB: use internal dataloader to mutualize query when possible for a given ctx
     */
    getRecord(params: {libraryId: string; recordId: string; ctx: IQueryInfos}): Promise<IRecord | null>;
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

type GetRecordDataLoader = DataLoader<string, IRecord>;

export default function ({
    'core.infra.db.dbService': dbService,
    'core.infra.db.dbUtils': dbUtils,
    'core.infra.attributeTypes': attributeTypesRepo,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart,
    'core.infra.record.helpers.getSearchVariablesQueryPart': getSearchVariablesQueryPart,
    'core.infra.record.helpers.getSearchVariableName': getSearchVariableName,
    'core.infra.record.helpers.filterTypes': filterTypesHelper,
    'core.infra.indexation.helpers.getSearchQuery': getSearchQuery,
    'core.infra.attribute': attributeRepo,
}: IRecordRepoDeps): IRecordRepo {
    const _isOffsetPagination = (
        pagination: IPaginationParams | ICursorPaginationParams,
    ): pagination is IPaginationParams => 'offset' in pagination;

    const _isCursorPagination = (
        pagination: IPaginationParams | ICursorPaginationParams,
    ): pagination is ICursorPaginationParams => 'cursor' in pagination;

    const _generateCursor = (from: number, direction: CursorDirection): string =>
        Buffer.from(`${direction}:${from}`).toString('base64');

    const _parseCursor = (
        cursor: string,
    ): {
        direction: string;
        from: string;
    } => {
        const s = Buffer.from(cursor, 'base64').toString();
        const [direction, from] = s.split(':');

        return {
            direction,
            from,
        };
    };

    const computeGetRecordDataLoaderKey = (libraryId: string): string => `recordRepo.getRecord-${libraryId}`;

    const getRecordDataLoader = (libraryId: string, ctx: IQueryInfos): GetRecordDataLoader => {
        const dataLoaderKey = computeGetRecordDataLoaderKey(libraryId);
        return getOrCreateDataLoaderInCtx<GetRecordDataLoader>(
            ctx,
            dataLoaderKey,
            () =>
                new DataLoader<string, IRecord>(
                    async (recordIds: readonly string[]) =>
                        getRecords({
                            libraryId,
                            recordIds: recordIds as string[],
                            ctx,
                        }),
                    {
                        cache: false, // May be experiment later with caching
                    },
                ),
        );
    };

    const getRecords = async ({
        libraryId,
        recordIds,
        ctx,
    }: {
        libraryId: string;
        recordIds: string[];
        ctx: IQueryInfos;
    }): Promise<Array<IRecord | null>> => {
        const coll = dbService.db.collection(libraryId);
        const query = aql`FOR id IN ${recordIds}
                LET rec = DOCUMENT(${coll}, id)
                RETURN rec`;

        const records = await dbService.execute<IDbDocument[]>({
            query,
            ctx,
        });

        // Replace missing records with null to match input order
        const recordsById = new Map(records.map(r => [r?._key ?? r?._id, r]));
        return recordIds.map(id => {
            const rec = recordsById.get(id);
            return rec
                ? (dbUtils.cleanup({
                      ...rec,
                      library: libraryId,
                  }) as IRecord)
                : null;
        });
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
            accessPermissionFilters = [],
            ctx,
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
                    cleanFulltextSearch,
                );
            }

            const queryParts = [aql`FOR r IN (${fulltextSearchQuery ?? coll})`];

            let isFilteringOnActive = false;

            const aqlPartByOperator: Record<Operator, GeneratedAqlQuery> = {
                [Operator.AND]: aql`AND`,
                [Operator.OR]: aql`OR`,
                [Operator.OPEN_BRACKET]: aql`(`,
                [Operator.CLOSE_BRACKET]: aql`)`,
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
                                lastFilterAttribute,
                                true,
                            );
                            statement = aql`${countConditionPart}`;
                        } else {
                            // If multiple values or versionable attribute, apply filter on each value of the array
                            // Otherwise, apply filter on the first value of the array
                            const arrayConditionPart = getConditionPart(
                                'CURRENT',
                                filter.condition as AttributeCondition,
                                filter.value,
                                lastFilterAttribute,
                                false,
                            );

                            const standardConditionPart = getConditionPart(
                                variableName,
                                filter.condition as AttributeCondition,
                                filter.value,
                                lastFilterAttribute,
                                false,
                            );

                            statement = aql`IS_ARRAY(${variableNameAql}) ? LENGTH(${literal(
                                variableNameAql,
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

            if (accessPermissionFilters.length) {
                for (const accessPermissionFilter of accessPermissionFilters) {
                    //we get the tree node(s)
                    const libraryAccessDefinedVariable = `${libraryId + '_access_defined_' + accessPermissionFilter.attribute.id}`;
                    const libraryAccessVariable = `${libraryId + '_access_' + accessPermissionFilter.attribute.id}`;
                    const libraryAccessAuthorizedVariable = `${libraryId + '_access_authorized_' + accessPermissionFilter.attribute.id}`;

                    queryParts.push(aql`LET ${literal(libraryAccessDefinedVariable)}=
                        FLATTEN(
                        FOR rv, re IN 1 OUTBOUND r._id
                        ${VALUES_LINKS_COLLECTION}
                        FILTER re.attribute == ${accessPermissionFilter.attribute.id}
                        RETURN rv._key
                    )`);
                    //if none, we set 'null'
                    queryParts.push(aql`LET ${literal(libraryAccessVariable)} = 
                        LENGTH(${literal(libraryAccessDefinedVariable)}) == 0 
                        ? ['null'] 
                        : ${literal(libraryAccessDefinedVariable)}`);
                    // we get intersection between the list and the list of authorized ones
                    queryParts.push(aql`LET ${literal(libraryAccessAuthorizedVariable)} = 
                        INTERSECTION(${literal(libraryAccessVariable)}, ${accessPermissionFilter.permissions.true})`);
                    // we keep if there is an intersedction
                    queryParts.push(aql`FILTER LENGTH(${literal(libraryAccessAuthorizedVariable)}) > 0`);
                }
            }

            // If we have a full text search query and no specific sort, sorting by relevance is already handled.
            if (!fulltextSearchQuery && !sort?.length) {
                queryParts.push(aql`SORT ${literal('TO_NUMBER(r._key) DESC')}`);
            } else if (sort?.length) {
                const sortParts = sort.map(s => attributeTypesRepo.getTypeRepo(s.attributes[0]).sortQueryPart(s));

                queryParts.push(aql`SORT `, join(sortParts, ', '));
            }

            if (!retrieveInactive && !isFilteringOnActive) {
                queryParts.push(aql`FILTER r.active == true`);
            }

            if (pagination) {
                if (_isOffsetPagination(pagination)) {
                    queryParts.push(aql`LIMIT ${pagination.offset}, ${pagination.limit}`);
                } else if (_isCursorPagination(pagination)) {
                    const {direction, from} = _parseCursor(pagination.cursor);

                    // When looking for previous records, first sort in reverse order to get the last records
                    if (direction === CursorDirection.PREV) {
                        queryParts.push(aql`SORT ${literal('TO_NUMBER(r._key) ASC')}`);
                    }

                    const operator = direction === CursorDirection.NEXT ? '<' : '>';
                    queryParts.push(aql`FILTER r._key ${literal(operator)} ${from}`);
                    queryParts.push(aql`LIMIT ${pagination.limit}`);
                } else {
                    (pagination as IPaginationParams).offset = 0;
                }
            }

            queryParts.push(aql`RETURN MERGE(r, {library: ${libraryId}})`);

            const fullQuery = join(queryParts, '\n');
            const records = await dbService.execute<IExecuteWithCount | IDbDocument[]>({
                query: fullQuery,
                withTotalCount,
                ctx,
            });

            const list = withTotalCount ? (records as IExecuteWithCount).results : (records as IDbDocument[]);
            const totalCount = withTotalCount ? (records as IExecuteWithCount).totalCount : null;

            // TODO: detect if we reach end/beginning of the list and should not provide a cursor
            const cursor: IPaginationCursors = pagination
                ? {
                      prev: list.length ? _generateCursor(Number(list[0]._key), CursorDirection.PREV) : null,
                      next: list.length ? _generateCursor(Number(list.slice(-1)[0]._key), CursorDirection.NEXT) : null,
                  }
                : null;

            return {
                totalCount,
                list: list.map(dbUtils.cleanup),
                cursor,
            };
        },
        async createRecord({libraryId, recordData, ctx}): Promise<IRecord> {
            const collection = dbService.db.collection(libraryId);
            const {new: newRecord} = await collection.save(recordData, {returnNew: true});

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
                _key: recordId,
            };

            const [{old: oldRecord, new: updatedRecord}] = await dbService.execute<
                Array<{new: IDbDocument; old: IDbDocument}>
            >({
                query: aql`
                    UPDATE ${dbDocument} WITH ${dataToSave} IN ${collection}
                    OPTIONS { keepNull: false }
                    RETURN {old: OLD, new: NEW}
                `,
                ctx,
            });

            updatedRecord.library = libraryId;
            oldRecord.library = libraryId;

            return {old: dbUtils.cleanup(oldRecord), new: dbUtils.cleanup(updatedRecord)};
        },
        async getRecord({libraryId, recordId, ctx}): Promise<IRecord | null> {
            return getRecordDataLoader(libraryId, ctx).load(recordId);
        },
    };
}
