// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {join} from 'arangojs/aql';
import {IUtils} from 'utils/utils';
import {ILibrary} from '_types/library';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IAttribute, IGetCoreAttributesParams} from '../../_types/attribute';
import {IGetCoreEntitiesParams} from '../../_types/shared';
import {IDbService} from '../db/dbService';
import {CustomFilterConditionsFunc, IDbUtils} from '../db/dbUtils';
import {LIB_ATTRIB_COLLECTION_NAME, LIB_COLLECTION_NAME} from '../library/libraryRepo';
import {IValueRepo} from '../value/valueRepo';

export interface IAttributeRepo {
    getAttributes({params, ctx}: {params?: IGetCoreAttributesParams; ctx: IQueryInfos}): Promise<IList<IAttribute>>;
    updateAttribute({attrData, ctx}: {attrData: IAttributeForRepo; ctx: IQueryInfos}): Promise<IAttribute>;
    createAttribute({attrData, ctx}: {attrData: IAttributeForRepo; ctx: IQueryInfos}): Promise<IAttribute>;
    deleteAttribute({attrData, ctx}: {attrData: IAttribute; ctx: IQueryInfos}): Promise<IAttribute>;

    /**
     * Retrieve attributes linked to library
     */
    getLibraryAttributes({libraryId, ctx}: {libraryId: string; ctx: IQueryInfos}): Promise<IAttribute[]>;
    getLibraryFullTextAttributes({libraryId, ctx}: {libraryId: string; ctx: IQueryInfos}): Promise<IAttribute[]>;

    /**
     * Retrieve libraries linked to attribute
     */
    getAttributeLibraries(params: {attributeId: string; ctx: IQueryInfos}): Promise<ILibrary[]>;
}

export const ATTRIB_COLLECTION_NAME = 'core_attributes';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.value'?: IValueRepo;
    'core.utils'?: IUtils;
}

export interface IAttributeForRepo extends IAttribute {
    multiple_values: boolean;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.value': valueRepo = null,
    'core.utils': utils = null
}: IDeps = {}): IAttributeRepo {
    return {
        async getLibraryAttributes({libraryId, ctx}): Promise<IAttribute[]> {
            const query = aql`
                FOR v
                IN 1 OUTBOUND ${`${LIB_COLLECTION_NAME}/${libraryId}`}
                ${LIB_ATTRIB_COLLECTION_NAME}
                RETURN v
            `;

            const res = await dbService.execute({query, ctx});

            return res.map(a => dbUtils.cleanup<IAttribute>(a));
        },
        async getAttributeLibraries({attributeId, ctx}): Promise<ILibrary[]> {
            const query = aql`
                FOR lib IN 1 INBOUND ${`${ATTRIB_COLLECTION_NAME}/${attributeId}`}
                ${LIB_ATTRIB_COLLECTION_NAME}
                RETURN lib
            `;

            const res = await dbService.execute({query, ctx});

            return res.map(library => dbUtils.cleanup<ILibrary>(library));
        },
        async getLibraryFullTextAttributes({libraryId, ctx}): Promise<IAttribute[]> {
            const libAttributesCollec = dbService.db.collection(LIB_ATTRIB_COLLECTION_NAME);
            const attributesCollec = dbService.db.collection(ATTRIB_COLLECTION_NAME);

            const attrs = await dbService.execute({
                query: aql`LET fullTextAttrs = (
                            FOR e IN ${libAttributesCollec}
                                FILTER e._from == ${LIB_COLLECTION_NAME + '/' + libraryId}
                                FILTER e.full_text_search == true
                            RETURN LAST(SPLIT(e._to, '/'))
                        )
                        FOR a IN ${attributesCollec}
                            FILTER POSITION(fullTextAttrs, a._key)
                        RETURN a
                    `,
                ctx
            });

            return attrs.map(a => dbUtils.cleanup<IAttribute>(a));
        },
        async getAttributes({
            params,
            ctx
        }: {
            params?: IGetCoreAttributesParams;
            ctx: IQueryInfos;
        }): Promise<IList<IAttribute>> {
            // Will retrieve attributes that are linked to given libraries
            const _generateLibrariesFilterConds = (filterKey: string, filterVal: string | boolean | string[]) => {
                if (typeof filterVal === 'boolean') {
                    return aql``;
                }

                if (!filterVal) {
                    return null;
                }

                const libs = utils.forceArray(filterVal);

                const valParts = libs.map(l => aql`v._key == ${l}`);
                const libKeyCond = join(valParts, ' OR ');

                // Check if there is links between given libraries and attribute
                return aql`LENGTH(
                    FOR v IN 1 INBOUND el
                    core_edge_libraries_attributes
                    FILTER ${libKeyCond}
                    RETURN v._key
                ) > 0`;
            };

            // Will retrieve attributes that are **not** linked to given libraries
            const _generateLibrariesExcludedFilterConds = (
                filterKey: string,
                filterVal: string | boolean | string[]
            ) => {
                if (typeof filterVal === 'boolean') {
                    return aql``;
                }

                if (!filterVal) {
                    return null;
                }

                const libs = utils.forceArray(filterVal);

                const valParts = libs.map(l => aql`v._key == ${l}`);
                const libKeyCond = join(valParts, ' OR ');

                // Check if there is there is no links between given libraries and attribute
                return aql`LENGTH(
                    FOR v IN 1 INBOUND el
                    core_edge_libraries_attributes
                    FILTER ${libKeyCond}
                    RETURN v._key
                ) == 0`;
            };

            const _generateVersionableFilterConds: CustomFilterConditionsFunc = (filterKey, filterVal) => {
                const filterValBool = !!filterVal; // Ensure we're dealing with a boolean

                // Check if there is links between given libraries and attribute
                return aql`el.versions_conf.${filterKey} == ${filterValBool}`;
            };

            const _generateMetadataFilterConds: CustomFilterConditionsFunc = (filterKey, filterVal) => {
                if (!filterVal) {
                    return null;
                }

                return aql`LENGTH(
                    INTERSECTION(
                        el.${filterKey},
                        ${utils.forceArray(filterVal)}
                    )
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
                customFilterConditions: {
                    libraries: _generateLibrariesFilterConds,
                    librariesExcluded: _generateLibrariesExcludedFilterConds,
                    versionable: _generateVersionableFilterConds,
                    metadata_fields: _generateMetadataFilterConds
                },
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
            const libAttributesCollec = dbService.db.collection(LIB_ATTRIB_COLLECTION_NAME);

            // Delete all values
            await valueRepo.clearAllValues({attribute: attrData, ctx});

            await dbService.execute({
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
        }
    };
}
