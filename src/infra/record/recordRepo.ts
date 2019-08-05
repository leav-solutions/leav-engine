import {aql} from 'arangojs';
import {IList, IPaginationParams} from '_types/list';
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

    find(library: string, filters?: IRecordFilterOption[], pagination?: IPaginationParams): Promise<IList<IRecord>>;
}

export default function(
    dbService: IDbService,
    dbUtils: IDbUtils,
    attributeTypesRepo: IAttributeTypesRepo | null = null
): IRecordRepo {
    return {
        async find(
            library: string,
            filters?: IRecordFilterOption[],
            pagination?: IPaginationParams
        ): Promise<IList<IRecord>> {
            const queryParts = [];

            const coll = dbService.db.collection(library);
            queryParts.push(aql`FOR r IN ${coll}`);

            if (typeof filters !== 'undefined' && filters.length) {
                for (const [i, filter] of filters.entries()) {
                    const typeRepo = attributeTypesRepo.getTypeRepo(filter.attribute);
                    const filterQueryPart = typeRepo.filterQueryPart(filter.attribute.id, i, filter.value);
                    queryParts.push(filterQueryPart);
                }
            }

            if (!!pagination) {
                queryParts.push(aql`LIMIT ${pagination.offset || 0}, ${pagination.limit}`);
            }

            queryParts.push(aql`RETURN MERGE(r, {library: ${library}})`);

            const records = await dbService.execute<IExecuteWithCount>(aql.join(queryParts, '\n'), true);

            return {
                totalCount: records.totalCount,
                list: records.results.map(dbUtils.cleanup)
            };
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

            const updateRes = await dbService.execute(aql`
                UPDATE {_key: ${recordData.id}} WITH ${recordData} IN ${collection}
                RETURN NEW
            `);

            const updatedRecord = dbUtils.cleanup(updateRes[0]);

            return updatedRecord;
        }
    };
}
