import {aql} from 'arangojs';
import {IUtils} from 'utils/utils';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IAttribute} from '../../_types/attribute';
import {ILibrary} from '../../_types/library';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {LIB_ATTRIB_COLLECTION_NAME} from '../library/libraryRepo';
import {IValueRepo} from '../value/valueRepo';

export interface IAttributeRepo {
    getAttributes({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<IAttribute>>;
    updateAttribute({attrData, ctx}: {attrData: IAttributeForRepo; ctx: IQueryInfos}): Promise<IAttribute>;
    createAttribute({attrData, ctx}: {attrData: IAttributeForRepo; ctx: IQueryInfos}): Promise<IAttribute>;
    deleteAttribute({attrData, ctx}: {attrData: IAttribute; ctx: IQueryInfos}): Promise<IAttribute>;

    /**
     * Get all libraries for which this attribute is enabled
     */
    getLibrariesUsingAttribute?({attribute, ctx}: {attribute: IAttribute; ctx: IQueryInfos}): Promise<ILibrary[]>;
}

export const ATTRIB_COLLECTION_NAME = 'core_attributes';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.value'?: IValueRepo;
    'core.utils'?: IUtils;
}

interface IAttributeForRepo extends IAttribute {
    multiple_values: boolean;
}

export default function({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.value': valueRepo = null,
    'core.utils': utils = null
}: IDeps = {}): IAttributeRepo {
    return {
        async getAttributes({params, ctx}): Promise<IList<IAttribute>> {
            const _generateLibrariesFilterConds = (filterKey: string, filterVal: string | boolean | string[]) => {
                if (typeof filterVal === 'boolean') {
                    return aql``;
                }

                const libs = utils.forceArray(filterVal);

                const valParts = libs.map(l => aql`v._key == ${l}`);
                const libKeyCond = aql.join(valParts, ' OR ');

                // Check if there is links between given libraries and attribute
                return aql`LENGTH(
                    FOR v IN 1 INBOUND el
                    core_edge_libraries_attributes
                    FILTER ${libKeyCond}
                    RETURN v._key
                ) > 0`;
            };

            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };
            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<IAttribute>({
                ...initializedParams,
                collectionName: ATTRIB_COLLECTION_NAME,
                customFilterConditions: {libraries: _generateLibrariesFilterConds},
                ctx
            });
        },
        async updateAttribute({attrData, ctx}): Promise<IAttribute> {
            const docToInsert = dbUtils.convertToDoc(attrData);

            // Insert in libraries collection
            const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`UPDATE ${docToInsert} IN ${col} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(res.pop());
        },
        async createAttribute({attrData, ctx}): Promise<IAttribute> {
            const docToInsert = dbUtils.convertToDoc(attrData);
            // Insert in libraries collection
            const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${col} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(res.pop());
        },
        async deleteAttribute({attrData, ctx}): Promise<IAttribute> {
            // Delete links library<->attribute
            const libAttributesCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // Delete all values
            await valueRepo.clearAllValues({attribute: attrData, ctx});

            const resDelEdges = await dbService.execute({
                query: aql`
                    FOR e IN ${libAttributesCollec}
                        FILTER e._to == ${'core_attributes/' + attrData.id}
                        REMOVE e IN ${libAttributesCollec}
                    `,
                ctx
            });

            // Delete attribute
            const col = dbService.db.collection(ATTRIB_COLLECTION_NAME);

            const res = await dbService.execute({
                query: aql`REMOVE ${{_key: attrData.id}} IN ${col} RETURN OLD`,
                ctx
            });

            // Return deleted attribute
            return dbUtils.cleanup(res.pop());
        },
        async getLibrariesUsingAttribute({attribute, ctx}): Promise<ILibrary[]> {
            const libAttribCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // TODO: use aql template tag, and find out why it doesn't work :)
            const query = `
                FOR v
                IN 1 INBOUND '${ATTRIB_COLLECTION_NAME}/${attribute.id}'
                ${LIB_ATTRIB_COLLECTION_NAME}
                RETURN v
            `;

            const res = await dbService.execute({query, ctx});

            return res.map(dbUtils.cleanup);
        }
    };
}
