import {IRecordRepo} from 'infra/recordRepo';
import * as moment from 'moment';

export interface IRecord {
    id?: number;
    library?: string;
    created_at?: number;
    modified_at?: number;
}

export interface IRecordDomain {
    /**
     * Create new record
     *
     * @param library       Library ID
     * @param recordData
     */
    createRecord?(library: string): Promise<IRecord>;

    /**
     * Delete record
     *
     * @param library    Library ID
     * @param id         Record ID
     * @param recordData
     */
    deleteRecord?(library: string, id: number): Promise<IRecord>;
}

export default function(recordRepo: IRecordRepo): IRecordDomain {
    return {
        async createRecord(library: string): Promise<IRecord> {
            const recordData = {created_at: moment().unix(), modified_at: moment().unix()};

            return recordRepo.createRecord(library, recordData);
        },
        async deleteRecord(library: string, id: number): Promise<IRecord> {
            try {
                // Get library
                // const lib = await this.getLibraries({id});

                // // Check if exists and can delete
                // if (!lib.length) {
                //     throw new Error('Unknown library');
                // }

                // if (lib.pop().system) {
                //     throw new Error('Cannot delete system library');
                // }

                return recordRepo.deleteRecord(library, id);
            } catch (e) {
                throw new Error('Delete record ' + e);
            }
        }
    };
}
