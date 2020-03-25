import {aql} from 'arangojs';
import {IList} from '_types/list';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IAttribute} from '../../_types/attribute';
import {ILibrary} from '../../_types/library';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {LIB_ATTRIB_COLLECTION_NAME} from '../library/libraryRepo';
import {IValueRepo} from '../value/valueRepo';

export interface IAttributeRepo {
    getAttributes(params?: IGetCoreEntitiesParams): Promise<IList<IAttribute>>;
    updateAttribute(attrData: IAttributeForRepo): Promise<IAttribute>;
    createAttribute(attrData: IAttributeForRepo): Promise<IAttribute>;
    deleteAttribute(attrData: IAttribute): Promise<IAttribute>;

    /**
     * Get all libraries for which this attribute is enabled
     *
     * @param attribute
     */
    getLibrariesUsingAttribute?(attribute: IAttribute): Promise<ILibrary[]>;
}

export const ATTRIB_COLLECTION_NAME = 'core_attributes';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.value'?: IValueRepo;
}

interface IAttributeForRepo extends IAttribute {
    multiple_values: boolean;
}

export default function({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.value': valueRepo = null
}: IDeps = {}): IAttributeRepo {
    return {
        async getAttributes(params: IGetCoreEntitiesParams): Promise<IList<IAttribute>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };
            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<IAttribute>({...initializedParams, collectionName: ATTRIB_COLLECTION_NAME});
        },
        async updateAttribute(attrData: IAttributeForRepo): Promise<IAttribute> {
            const docToInsert = dbUtils.convertToDoc(attrData);

            // Insert in libraries collection
            const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);
            const res = await dbService.execute(aql`UPDATE ${docToInsert} IN ${col} RETURN NEW`);

            return dbUtils.cleanup(res.pop());
        },
        async createAttribute(attrData: IAttributeForRepo): Promise<IAttribute> {
            const docToInsert = dbUtils.convertToDoc(attrData);
            // Insert in libraries collection
            const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);
            const res = await dbService.execute(aql`INSERT ${docToInsert} IN ${col} RETURN NEW`);

            return dbUtils.cleanup(res.pop());
        },
        async deleteAttribute(attrData: IAttribute): Promise<IAttribute> {
            // Delete links library<->attribute
            const libAttributesCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // Delete all values
            await valueRepo.clearAllValues(attrData);

            const resDelEdges = await dbService.execute(aql`
                    FOR e IN ${libAttributesCollec}
                        FILTER e._to == ${'core_attributes/' + attrData.id}
                        REMOVE e IN ${libAttributesCollec}
                    `);

            // Delete attribute
            const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);

            const res = await dbService.execute(aql`REMOVE ${{_key: attrData.id}} IN ${col} RETURN OLD`);

            // Return deleted attribute
            return dbUtils.cleanup(res.pop());
        },
        async getLibrariesUsingAttribute(attribute: IAttribute): Promise<ILibrary[]> {
            const libAttribCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // TODO: use aql template tag, and find out why it doesn't work :)
            const query = `
                FOR v
                IN 1 INBOUND '${ATTRIB_COLLECTION_NAME}/${attribute.id}'
                ${LIB_ATTRIB_COLLECTION_NAME}
                RETURN v
            `;

            const res = await dbService.execute(query);

            return res.map(dbUtils.cleanup);
        }
    };
}
