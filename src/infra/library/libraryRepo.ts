import {aql} from 'arangojs';
import {difference} from 'lodash';
import {IAttribute} from '../../_types/attribute';
import {ILibrary, ILibraryFilterOptions} from '../../_types/library';
import {IAttributeRepo} from '../attribute/attributeRepo';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';

const LIB_COLLECTION_NAME = 'core_libraries';
export const LIB_ATTRIB_COLLECTION_NAME = 'core_edge_libraries_attributes';

export interface ILibraryRepo {
    /**
     * Return libraries
     *
     * @param filters                   Filters libraries returned
     * @return Promise<Array<object>>   All libraries data
     */
    getLibraries(filters?: ILibraryFilterOptions, strictFilters?: boolean): Promise<ILibrary[]>;

    /**
     * Create new library
     *
     * @param libData
     * @return Promise<object>  New library data
     */
    createLibrary(libData: ILibrary): Promise<ILibrary>;

    /**
     * Update existing library
     *
     * @param libData   Must contain "id" key to identify library to update
     * @return object   Updated library data
     */
    updateLibrary(libData: ILibrary): Promise<ILibrary>;

    /**
     * Delete library
     * @param id
     * @return {}   Deleted library data
     */
    deleteLibrary(id: string): Promise<ILibrary>;

    /**
     * Link attributes to library
     *
     * @param libId
     * @param attributes Array of attributes IDs
     * @return array     List of linked attributes
     */
    saveLibraryAttributes(libId: string, attributes: string[] | IAttribute[]): Promise<string[]>;

    getLibraryAttributes(libId: string): Promise<IAttribute[]>;
}

export default function(
    dbService: IDbService | null = null,
    dbUtils: IDbUtils | null = null,
    attributeRepo: IAttributeRepo | null = null,
    config = null
): ILibraryRepo {
    return {
        async getLibraries(filters?: ILibraryFilterOptions, strictFilters: boolean = false): Promise<ILibrary[]> {
            return dbUtils.findCoreEntity<ILibrary>(LIB_COLLECTION_NAME, filters, strictFilters);
        },
        async createLibrary(libData: ILibrary): Promise<ILibrary> {
            const defaultParams = {_key: '', system: false, label: {fr: '', en: ''}};
            let docToInsert = dbUtils.convertToDoc(libData);

            docToInsert = {...defaultParams, ...docToInsert};

            const libAttributes = docToInsert.attributes;
            delete docToInsert.attributes; // Attributes has to be handled separately

            // Create new collection for library
            await dbService.createCollection(docToInsert._key);

            // Insert in libraries collection
            const libCollc = dbService.db.collection(LIB_COLLECTION_NAME);
            const libRes = await dbService.execute(aql`INSERT ${docToInsert} IN ${libCollc} RETURN NEW`);

            return dbUtils.cleanup(libRes.pop());
        },
        async updateLibrary(libData: ILibrary): Promise<ILibrary> {
            const docToInsert = dbUtils.convertToDoc(libData);

            // Insert in libraries collection
            const col = dbService.db.collection(LIB_COLLECTION_NAME);
            const res = await dbService.execute(aql`UPDATE ${docToInsert} IN ${col} RETURN NEW`);

            return dbUtils.cleanup(res.pop());
        },
        async deleteLibrary(id: string): Promise<ILibrary> {
            // Delete attributes linked to this library
            const linkedAttributes = await attributeRepo.getAttributes({linked_library: id});
            for (const linkedAttribute of linkedAttributes) {
                attributeRepo.deleteAttribute(linkedAttribute);
            }

            // Delete library
            const col = dbService.db.collection(LIB_COLLECTION_NAME);
            const res = await dbService.execute(aql`REMOVE ${{_key: id}} IN ${col} RETURN OLD`);

            // Delete library's collection
            await dbService.dropCollection(id);

            // Return deleted library
            return dbUtils.cleanup(res.pop());
        },
        async saveLibraryAttributes(libId: string, attributes: string[]): Promise<string[]> {
            // TODO: in CONCAT, query will fail is using constant instead of hard coding 'core_attributes'
            const libAttribCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // Get current library attributes
            const currentAttrs = await this.getLibraryAttributes(libId);
            const deletedAttrs = difference(currentAttrs.map(a => a.id), attributes);

            // Unlink attributes not used anymore
            if (deletedAttrs.length) {
                const delLibAttribRes = await dbService.execute(aql`
                    FOR attr IN ${deletedAttrs}
                        FOR l in ${libAttribCollec}
                            FILTER
                                l._from == ${LIB_COLLECTION_NAME + '/' + libId}
                                AND l._to == CONCAT('core_attributes/', attr)
                            REMOVE l
                            IN ${libAttribCollec}
                            RETURN OLD
                `);
            }

            // Save new ones
            const libAttribRes = await dbService.execute(aql`
                FOR attr IN ${attributes}
                    LET attrToInsert = {
                        _from: ${LIB_COLLECTION_NAME + '/' + libId},
                        _to: CONCAT('core_attributes/', attr)
                    }
                    UPSERT {
                        _from: ${LIB_COLLECTION_NAME + '/' + libId},
                        _to: CONCAT('core_attributes/', attr)
                    }
                    INSERT attrToInsert
                    UPDATE attrToInsert
                    IN ${libAttribCollec}
                    RETURN NEW
            `);

            return libAttribRes.map(res => res._to.split('/')[1]);
        },
        async getLibraryAttributes(libId: string): Promise<IAttribute[]> {
            const col = dbService.db.collection(LIB_COLLECTION_NAME);
            const libAttribCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // TODO: use aql template tag, and find out why it doesn't work :)
            const query = `
                FOR v
                IN 1 OUTBOUND '${LIB_COLLECTION_NAME}/${libId}'
                ${LIB_ATTRIB_COLLECTION_NAME}
                RETURN v
            `;

            const res = await dbService.execute(query);

            return res.map(dbUtils.cleanup);
        }
    };
}
