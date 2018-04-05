import {IDbService} from './db/dbService';
import {IDbUtils} from './db/dbUtils';
import {IRecord, IRecordFilterOption} from '_types/record';
import {aql} from 'arangojs';
import {UserError} from 'graphql-errors';
import {IAttributeTypesRepo} from './attributeTypesRepo';

const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

export interface IRecordRepo {
    /**
     * Create new record
     *
     * @param library       Library ID
     * @param recordData
     */
    createRecord(library: string, recordData: IRecord): Promise<IRecord>;

    /**
     * Delete record
     *
     * @param library  Library ID
     * @param id       Record ID
     * @param recordData
     */
    deleteRecord(library: string, id: number): Promise<IRecord>;

    find(library: string, filters?: IRecordFilterOption[]): Promise<IRecord[]>;
}

export default function(
    dbService: IDbService | any,
    dbUtils: IDbUtils,
    attributeTypesRepo: IAttributeTypesRepo | null = null
): IRecordRepo {
    return {
        async find(library: string, filters?: IRecordFilterOption[]): Promise<IRecord[]> {
            const queryParts = [];
            let bindVars = {};

            queryParts.push('FOR r IN @@collection');
            bindVars['@collection'] = library;

            if (typeof filters !== 'undefined' && filters.length) {
                let i = 0;
                for (const filter of filters) {
                    const typeRepo = attributeTypesRepo.getTypeRepo(filter.attribute);
                    const filterQueryPart = typeRepo.filterQueryPart(filter.attribute.id, i, filter.value);
                    queryParts.push(filterQueryPart.query);
                    bindVars = {...bindVars, ...filterQueryPart.bindVars};
                    i++;
                }
            }

            queryParts.push('RETURN r');

            const records = await dbService.execute({query: queryParts.join(' '), bindVars});

            return records.map(dbUtils.cleanup);
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
            const deletedRecord = await collection.remove({_key: id});

            deletedRecord.library = deletedRecord._id.split('/')[0];
            return dbUtils.cleanup(deletedRecord);
        }
    };
}
