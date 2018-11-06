import {aql} from 'arangojs';
import {AttributeFormats, AttributeTypes, IAttribute, IAttributeFilterOptions} from '../../_types/attribute';
import {ILibrary} from '../../_types/library';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {LIB_ATTRIB_COLLECTION_NAME} from '../library/libraryRepo';
import {IValueRepo} from '../value/valueRepo';

export interface IAttributeRepo {
    getAttributes(filters?: IAttributeFilterOptions, strictFilters?: boolean): Promise<IAttribute[]>;
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
    /**
     * Return the filter's conditions based on key and val supplied.
     *
     * @param filterKey
     * @param filterVal
     * @param bindVars
     * @param index
     * @param strictFilters
     */
    function _getFilterCondition(
        filterKey: string,
        filterVal: string | boolean | string[],
        bindVars: any,
        index: number | string,
        strictFilters: boolean
    ): any {
        const newBindVars = {...bindVars};
        let query;
        // If value is an array (types or formats for example),
        // we call this function recursively on array and join filters with an OR
        if (Array.isArray(filterVal)) {
            if (filterVal.length) {
                const filters = filterVal.map((val, i) =>
                    // We add a prefix to the index to avoid crashing with other filters
                    _getFilterCondition(filterKey, val, newBindVars, index + '0' + i, strictFilters)
                );
                query = filters.map(f => f.query).join(' OR ');
                Object.assign(newBindVars, ...filters.map(f => f.bindVars));
            }
        } else {
            if (filterKey === 'label') {
                // Search for label in any language
                query = `${config.lang.available
                    .map(l => `LIKE(a.label.${l}, @filterValue${index}, true)`)
                    .join(' OR ')}`;

                bindVars[`filterValue${index}`] = `%${filterVal}%`;
            } else {
                // Filter with a "like" on ID or exact value in other fields
                query =
                    filterKey === '_key' && !strictFilters
                        ? `LIKE(a.@filterKey${index}, @filterValue${index}, true)`
                        : `a.@filterKey${index} == @filterValue${index}`;

                newBindVars[`filterKey${index}`] = filterKey;
                newBindVars[`filterValue${index}`] =
                    filterKey === 'system'
                        ? filterVal // Boolean must not be converted to string
                        : filterKey === '_key' && !strictFilters
                            ? `%${filterVal}%`
                            : `${filterVal}`;
            }
        }

        return {query, bindVars: newBindVars};
    }

    return {
        async getAttributes(filters?: IAttributeFilterOptions, strictFilters: boolean = false): Promise<IAttribute[]> {
            let query = `FOR a IN ${ATTRIB_COLLECTION_NAME}`;
            let bindVars = {};

            if (typeof filters !== 'undefined') {
                const dbFilters = dbUtils.convertToDoc(filters);
                const filtersKeys = Object.keys(dbFilters);

                for (let i = 0; i < filtersKeys.length; i++) {
                    const queryFilter = _getFilterCondition(
                        filtersKeys[i],
                        dbFilters[filtersKeys[i]],
                        bindVars,
                        i,
                        strictFilters
                    );

                    query += queryFilter.query ? ' FILTER ' + queryFilter.query : '';
                    bindVars = {...bindVars, ...queryFilter.bindVars};
                }
            }

            query += ` RETURN a`;

            const res = await dbService.execute({query, bindVars});

            return res.map(dbUtils.cleanup);
        },
        async updateAttribute(attrData: IAttribute): Promise<IAttribute> {
            const defaultParams = {
                _key: '',
                system: false,
                label: {fr: '', en: ''},
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT
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
                format: AttributeFormats.TEXT
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
