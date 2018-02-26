import {IDbService} from './db/dbService';
import {IDbUtils} from './db/dbUtils';
import {IRecord} from 'domain/recordDomain';

export interface IRecordRepo {
    /**
     * Create new record
     *
     * @param library       Library ID
     * @param recordData
     */
    createRecord?(library: string, recordData: IRecord): Promise<IRecord>;

    /**
     * Delete record
     *
     * @param library  Library ID
     * @param id       Record ID
     * @param recordData
     */
    deleteRecord?(library: string, id: number): Promise<IRecord>;
}

export default function(dbService: IDbService | any, dbUtils: IDbUtils): IRecordRepo {
    return {
        async createRecord(library: string, recordData: IRecord): Promise<IRecord> {
            const collection = dbService.db.collection(library);
            let newRecord = await collection.save(recordData);
            newRecord = await collection.document(newRecord);

            newRecord.library = newRecord._id.split('/')[0];

            return dbUtils.cleanup(newRecord);
        },
        async deleteRecord(library: string, id: number): Promise<IRecord> {
            const collection = dbService.db.collection(library);
            const deletedRecord = await collection.remove({_key: id});

            return dbUtils.cleanup(deletedRecord);
        }
    };
}
