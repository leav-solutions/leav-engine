import {aql} from 'arangojs';
import {
    CursorDirection,
    ICursorPaginationParams,
    IListWithCursor,
    IPaginationCursors,
    IPaginationParams
} from '../../_types/list';
import {IRecord, IRecordFilterOption} from '../../_types/record';
import {IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';
import {IDbService, IExecuteWithCount} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';

export const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

export interface IRecordRepo {
    /**
     * Create new record
     *
     * @param library       Library ID
     * @param recordData
     */
    createRecord(library: string, recordData: IRecord): Promise<IRecord>;

    updateRecord(library: string, recordData: IRecord): Promise<IRecord>;

    /**
     * Delete record
     *
     * @param library  Library ID
     * @param id       Record ID
     * @param recordData
     */
    deleteRecord(library: string, id: number): Promise<IRecord>;

    find(
        library: string,
        filters?: IRecordFilterOption[],
        pagination?: IPaginationParams | ICursorPaginationParams,
        withCount?: boolean,
        retrieveInactive?: boolean
    ): Promise<IListWithCursor<IRecord>>;
}

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes'?: IAttributeTypesRepo;
}

export default function({
    'core.infra.db.dbService': dbService = null,
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

    return {
        async find(
            library: string,
            filters?: IRecordFilterOption[],
            pagination?: IPaginationParams | ICursorPaginationParams,
            withCount: boolean = false,
            retrieveInactive: boolean = false
        ): Promise<IListWithCursor<IRecord>> {
            const queryParts = [];
            const withCursorPagination = !!pagination && !!(pagination as ICursorPaginationParams).cursor;
            // Force disbaling count on cursor pagination as it's pointless
            const countResults = withCount && !withCursorPagination;

            const coll = dbService.db.collection(library);
            queryParts.push(aql`FOR r IN ${coll}`);

            if (typeof filters !== 'undefined' && filters.length) {
                for (const [i, filter] of filters.entries()) {
                    const typeRepo = attributeTypesRepo.getTypeRepo(filter.attribute);
                    const filterQueryPart = typeRepo.filterQueryPart(filter.attribute.id, i, filter.value);
                    queryParts.push(filterQueryPart);
                }
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

            if (!retrieveInactive) {
                queryParts.push(aql`FILTER r.active == true`);
            }

            // Force sorting on ID
            queryParts.push(aql`SORT r._key ASC`);
            queryParts.push(aql`RETURN MERGE(r, {library: ${library}})`);

            const fullQuery = aql.join(queryParts, '\n');
            const records = await dbService.execute<IExecuteWithCount | any[]>(fullQuery, countResults);

            const list: any[] = countResults ? (records as IExecuteWithCount).results : (records as any[]);
            const totalCount = countResults ? (records as IExecuteWithCount).totalCount : null;

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
        async createRecord(library: string, recordData: IRecord): Promise<IRecord> {
            const collection = dbService.db.collection(library);
            let newRecord = await collection.save(recordData);
            newRecord = await collection.document(newRecord);

            newRecord.library = newRecord._id.split('/')[0];

            return dbUtils.cleanup(newRecord);
        },
        async deleteRecord(library: string, id: number): Promise<IRecord> {
            const collection = dbService.db.collection(library);
            const edgeCollection = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Delete record values
            const deleteValuesRes = await dbService.execute(aql`
                FOR l IN ${edgeCollection}
                    FILTER l._from == ${library + '/' + id} OR l._to == ${library + '/' + id}
                    REMOVE {_key: l._key} IN ${edgeCollection}
                    RETURN OLD
            `);

            // Delete record
            const deletedRecord = await collection.remove({_key: String(id)});

            deletedRecord.library = deletedRecord._id.split('/')[0];
            return dbUtils.cleanup(deletedRecord);
        },
        async updateRecord(library: string, recordData: IRecord): Promise<IRecord> {
            const collection = dbService.db.collection(library);
            const dataToSave = {...recordData};
            delete dataToSave.id; // Don't save ID

            const updateRes = await dbService.execute(aql`
                UPDATE {_key: ${recordData.id}} WITH ${dataToSave} IN ${collection}
                RETURN NEW
            `);

            const updatedRecord = dbUtils.cleanup(updateRes[0]);

            return updatedRecord;
        }
    };
}
