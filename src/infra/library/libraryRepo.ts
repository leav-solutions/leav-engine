import {aql} from 'arangojs';
import {difference} from 'lodash';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IAttribute} from '../../_types/attribute';
import {ILibrary} from '../../_types/library';
import {IList} from '../../_types/list';
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
    getLibraries(params?: IGetCoreEntitiesParams): Promise<IList<ILibrary>>;

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

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attribute'?: IAttributeRepo;
}

export default function({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attribute': attributeRepo = null
}: IDeps = {}): ILibraryRepo {
    return {
        async getLibraries(params?: IGetCoreEntitiesParams): Promise<IList<ILibrary>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };

            const initializedParams = {...defaultParams, ...params};
            return dbUtils.findCoreEntity<ILibrary>({...initializedParams, collectionName: LIB_COLLECTION_NAME});
        },
        async createLibrary(libData: ILibrary): Promise<ILibrary> {
            const docToInsert = dbUtils.convertToDoc(libData);

            // Create new collection for library
            await dbService.createCollection(docToInsert._key);

            // Insert in libraries collection
            const libCollc = dbService.db.collection(LIB_COLLECTION_NAME);
            const libRes = await dbService.execute(aql`INSERT ${docToInsert} IN ${libCollc} RETURN NEW`);

            return dbUtils.cleanup(libRes.pop());
        },
        async updateLibrary(libData: ILibrary): Promise<ILibrary> {
            const docToInsert = dbUtils.convertToDoc(libData);
            delete docToInsert.attributes; // Attributes have to be handled separately

            // Insert in libraries collection
            const col = dbService.db.collection(LIB_COLLECTION_NAME);
            const res = await dbService.execute(aql`UPDATE ${docToInsert} IN ${col} RETURN NEW`);

            return dbUtils.cleanup(res.pop());
        },
        async deleteLibrary(id: string): Promise<ILibrary> {
            // Delete attributes linked to this library
            const linkedAttributes = await attributeRepo.getAttributes({filters: {linked_library: id}});
            for (const linkedAttribute of linkedAttributes.list) {
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
            const deletedAttrs = difference(
                currentAttrs.filter(a => !a.system).map(a => a.id),
                attributes
            );

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
