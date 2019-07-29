import {aql} from 'arangojs';
import {IList, IPaginationParams} from '_types/list';
import {AttributeFormats, AttributeTypes, IAttribute, IAttributeFilterOptions} from '../../_types/attribute';
import {ILibrary} from '../../_types/library';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {LIB_ATTRIB_COLLECTION_NAME} from '../library/libraryRepo';
import {IValueRepo} from '../value/valueRepo';

export interface IAttributeRepo {
    getAttributes(
        filters?: IAttributeFilterOptions,
        strictFilters?: boolean,
        withCount?: boolean,
        pagination?: IPaginationParams
    ): Promise<IList<IAttribute>>;
    updateAttribute(attrData: IAttribute): Promise<IAttribute>;
    createAttribute(attrData: IAttribute): Promise<IAttribute>;
    deleteAttribute(attrData: IAttribute): Promise<IAttribute>;

    /**
     * Get all libraries for which this attribute is enabled
     *
     * @param attribute
     */
    getLibrariesUsingAttribute?(attribute: IAttribute): Promise<ILibrary[]>;
}

export const ATTRIB_COLLECTION_NAME = 'core_attributes';

export default function(
    dbService: IDbService | null = null,
    dbUtils: IDbUtils | null = null,
    valueRepo: IValueRepo | null = null,
    config = null
): IAttributeRepo {
    return {
        async getAttributes(
            filters?: IAttributeFilterOptions,
            strictFilters: boolean = false,
            withCount: boolean = false,
            pagination?: IPaginationParams
        ): Promise<IList<IAttribute>> {
            return dbUtils.findCoreEntity<IAttribute>(
                ATTRIB_COLLECTION_NAME,
                filters,
                strictFilters,
                withCount,
                pagination
            );
        },
        async updateAttribute(attrData: IAttribute): Promise<IAttribute> {
            const defaultParams = {
                _key: '',
                system: false,
                label: {fr: '', en: ''},
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                multiple_values: false
            };
            let docToInsert = dbUtils.convertToDoc(attrData);

            docToInsert = {...defaultParams, ...docToInsert};

            // Insert in libraries collection
            const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);
            const res = await dbService.execute(aql`UPDATE ${docToInsert} IN ${col} RETURN NEW`);

            return dbUtils.cleanup(res.pop());
        },
        async createAttribute(attrData: IAttribute): Promise<IAttribute> {
            const defaultParams = {
                _key: '',
                system: false,
                label: {fr: '', en: ''},
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                multiple_values: false
            };
            let docToInsert = dbUtils.convertToDoc(attrData);

            docToInsert = {...defaultParams, ...docToInsert};

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
