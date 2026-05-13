import {aql} from 'arangojs';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {type IAttribute} from '../../_types/attribute';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import {type IGetCoreVersionProfileParams, type IVersionProfile} from '../../_types/versionProfile';
import {ATTRIB_COLLECTION_NAME} from '../../infra/attribute/attributeRepo';

export const VERSION_PROFILE_COLLECTION_NAME = 'core_version_profiles';

export interface IVersionProfileRepo {
    getVersionProfiles: (params: {
        params?: IGetCoreVersionProfileParams;
        ctx: IQueryInfos;
    }) => Promise<IList<IVersionProfile>>;
    createVersionProfile: (params: {profileData: IVersionProfile; ctx: IQueryInfos}) => Promise<IVersionProfile>;
    updateVersionProfile: (params: {profileData: IVersionProfile; ctx: IQueryInfos}) => Promise<IVersionProfile>;
    deleteVersionProfile: (params: {id: string; ctx: IQueryInfos}) => Promise<IVersionProfile>;
    getAttributesUsingProfile(params: {id: string; ctx: IQueryInfos}): Promise<IAttribute[]>;
}

interface IDeps {
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.db.dbService'?: IDbService;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
}: IDeps = {}): IVersionProfileRepo {
    return {
        async getVersionProfiles({params, ctx}) {
            const _generateTreesFilterConds = (
                filterKey: string,
                filterVal: string | boolean | string[] | Record<string, unknown>,
            ) => {
                if (typeof filterVal !== 'string') {
                    return aql``;
                }

                if (!filterVal) {
                    return null;
                }

                return aql`${filterVal} IN el.${filterKey}`;
            };

            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null,
            };

            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<IVersionProfile>({
                ...initializedParams,
                collectionName: VERSION_PROFILE_COLLECTION_NAME,
                customFilterConditions: {trees: _generateTreesFilterConds},
                ctx,
            });
        },
        async createVersionProfile({profileData, ctx}) {
            const docToInsert = dbUtils.convertToDoc(profileData);
            // Insert in libraries collection
            const col = dbService.db.collection(VERSION_PROFILE_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${col} RETURN NEW`,
                ctx,
            });

            return dbUtils.cleanup(res.pop());
        },
        async updateVersionProfile({profileData, ctx}) {
            const docToUpdate = dbUtils.convertToDoc(profileData);

            // Insert in libraries collection
            const col = dbService.db.collection(VERSION_PROFILE_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`UPDATE ${docToUpdate} IN ${col} RETURN NEW`,
                ctx,
            });

            return dbUtils.cleanup(res.pop());
        },
        async deleteVersionProfile({id, ctx}) {
            const col = dbService.db.collection(VERSION_PROFILE_COLLECTION_NAME);

            const res = await dbService.execute({
                query: aql`REMOVE ${{_key: id}} IN ${col} RETURN OLD`,
                ctx,
            });

            // Return deleted attribute
            return dbUtils.cleanup(res.pop());
        },
        async getAttributesUsingProfile({id, ctx}) {
            const collection = dbService.db.collection(ATTRIB_COLLECTION_NAME);

            const res = await dbService.execute({
                query: aql`
                    FOR attrib IN ${collection}
                        FILTER attrib.versions_conf.profile == ${id}
                        RETURN attrib
                `,
                ctx,
            });

            return res.map(attribute => dbUtils.cleanup(attribute));
        },
    };
}
