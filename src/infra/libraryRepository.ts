import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {aql} from 'arangojs';
import {ILibrary} from 'domain/libraryDomain';

const COLLECTION_NAME = 'core_libraries';

export interface ILibraryFilterOptions {
    id?: string;
}

export interface ILibraryRepository {
    /**
     * Return libraries
     *
     * @param filters                   Filters libraries returned
     * @return Promise<Array<object>>   All libraries data
     */
    getLibraries?(filters?: ILibraryFilterOptions): Promise<[ILibrary]>;

    /**
     * Create new library
     *
     * @param libData
     * @return Promise<object>  New library data
     */
    createLibrary?(libData: ILibrary): Promise<ILibrary>;

    /**
     * Update existing library
     *
     * @param libData   Must contain "id" key to identify library to update
     * @return object   Updated library data
     */
    updateLibrary?(libData: ILibrary): Promise<ILibrary>;
}

export default function(dbService: IDbService, dbUtils: IDbUtils): ILibraryRepository {
    return {
        async getLibraries(filters?: ILibraryFilterOptions): Promise<[ILibrary]> {
            let query = `FOR l IN ${COLLECTION_NAME}`;
            const bindVars = {};

            if (typeof filters !== 'undefined') {
                const dbFilters = dbUtils.convertToDoc(filters);
                const filtersKeys = Object.keys(dbFilters);
                for (let i = 0; i < filtersKeys.length; i++) {
                    query += ` FILTER l.@filterKey${i} LIKE @filterValue${i}`;
                    bindVars[`filterKey${i}`] = filtersKeys[i];
                    bindVars[`filterValue${i}`] = `%${dbFilters[filtersKeys[i]]}%`;
                }
            }

            query += ` RETURN l`;

            const res = await dbService.execute({query, bindVars});

            return res.map(dbUtils.cleanup);
        },
        async createLibrary(libData: ILibrary): Promise<ILibrary> {
            try {
                const defaultParams = {
                    _key: '',
                    system: false
                };
                let docToInsert = dbUtils.convertToDoc(libData);

                docToInsert = {...defaultParams, ...docToInsert};

                // Insert in libraries collection
                const col = dbService.db.collection(COLLECTION_NAME);
                const res = await dbService.execute(aql`INSERT ${docToInsert} IN ${col} RETURN NEW`);

                // Create new collection for library
                await dbService.createCollection(docToInsert._key);

                return dbUtils.cleanup(res.pop());
            } catch (e) {
                throw new Error('Create library ' + e);
            }
        },
        async updateLibrary(libData: ILibrary): Promise<ILibrary> {
            try {
                const docToInsert = dbUtils.convertToDoc(libData);

                // Insert in libraries collection
                const col = dbService.db.collection(COLLECTION_NAME);
                const res = await dbService.execute(aql`UPDATE ${docToInsert} IN ${col} RETURN NEW`);

                return dbUtils.cleanup(res.pop());
            } catch (e) {
                throw new Error('Update library ' + e);
            }
        }
    };
}
