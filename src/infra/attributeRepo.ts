import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {IAttribute, AttributeTypes, AttributeFormats} from '../_types/attribute';
import {aql} from 'arangojs';
import {IValue} from '_types/value';

export interface IAttributeRepo {
    ATTRIB_COLLECTION_NAME?: string;
    getAttributes?(filters?: IAttributeFilterOptions): Promise<IAttribute[]>;
    updateAttribute?(attrData: IAttribute): Promise<IAttribute>;
    createAttribute?(attrData: IAttribute): Promise<IAttribute>;
    deleteAttribute?(id: string): Promise<IAttribute>;
}

/**
 * Define interface used for all attribute type specific files
 */
export interface IAttributeTypeRepo {
    /**
     * Create a new value
     *
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param {}
     */
    createValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Update an existing value. Field "id" is expected on the value
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param {}
     */
    updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Delete an existing value. Field "id" is expected on the value
     *
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param {}
     */
    deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Get all values for given record and attribute
     *
     * @param library
     * @param recordId
     * @param attribute
     * @return Array<{}>    Return an empty array if no value found
     */
    getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]>;

    /**
     * Return a specific value based on its ID. Field "id" is expect on the value
     *
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @return {}   Return null if no value found
     */
    getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;
}

/**
 * Accepted fields to filter attributes list
 */
export interface IAttributeFilterOptions {
    id?: string;
}

export const ATTRIB_COLLECTION_NAME = 'core_attributes';

export default function(dbService: IDbService, dbUtils: IDbUtils): IAttributeRepo {
    return {
        async getAttributes(filters?: IAttributeFilterOptions): Promise<IAttribute[]> {
            let query = `FOR a IN ${ATTRIB_COLLECTION_NAME}`;
            const bindVars = {};

            if (typeof filters !== 'undefined') {
                const dbFilters = dbUtils.convertToDoc(filters);
                const filtersKeys = Object.keys(dbFilters);
                for (let i = 0; i < filtersKeys.length; i++) {
                    query += ` FILTER a.@filterKey${i} LIKE @filterValue${i}`;
                    bindVars[`filterKey${i}`] = filtersKeys[i];
                    bindVars[`filterValue${i}`] = `%${dbFilters[filtersKeys[i]]}%`;
                }
            }

            query += ` RETURN a`;

            const res = await dbService.execute({query, bindVars});

            return res.map(dbUtils.cleanup);
        },
        async updateAttribute(attrData: IAttribute): Promise<IAttribute> {
            try {
                const defaultParams = {
                    _key: '',
                    system: false,
                    label: {fr: '', en: ''},
                    type: AttributeTypes.STANDARD,
                    format: AttributeFormats.TEXT
                };
                let docToInsert = dbUtils.convertToDoc(attrData);

                docToInsert = {...defaultParams, ...docToInsert};

                // Insert in libraries collection
                const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);
                const res = await dbService.execute(aql`UPDATE ${docToInsert} IN ${col} RETURN NEW`);

                return dbUtils.cleanup(res.pop());
            } catch (e) {
                throw new Error('Update attribute ' + e);
            }
        },
        async createAttribute(attrData: IAttribute): Promise<IAttribute> {
            try {
                const defaultParams = {
                    _key: '',
                    system: false,
                    label: {fr: '', en: ''},
                    type: AttributeTypes.STANDARD,
                    format: AttributeFormats.TEXT
                };
                let docToInsert = dbUtils.convertToDoc(attrData);

                docToInsert = {...defaultParams, ...docToInsert};

                // Insert in libraries collection
                const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);
                const res = await dbService.execute(aql`INSERT ${docToInsert} IN ${col} RETURN NEW`);

                return dbUtils.cleanup(res.pop());
            } catch (e) {
                throw new Error('Create attribute ' + e);
            }
        },
        async deleteAttribute(id: string): Promise<IAttribute> {
            try {
                // Delete attribute
                const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);
                const res = await dbService.execute(aql`REMOVE ${{_key: id}} IN ${col} RETURN OLD`);

                // Return deleted attribute
                return dbUtils.cleanup(res.pop());
            } catch (e) {
                throw new Error('Delete attribute ' + e);
            }
        }
    };
}
