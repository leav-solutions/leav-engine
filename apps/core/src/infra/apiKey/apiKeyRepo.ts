// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {IApiKey, IGetCoreApiKeysParams} from '_types/apiKey';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';

export const API_KEY_COLLECTION_NAME = 'core_api_keys';

export interface IApiKeyRepo {
    getApiKeys: (params: {params?: IGetCoreApiKeysParams; ctx: IQueryInfos}) => Promise<IList<IApiKey>>;
    createApiKey: (params: {keyData: IApiKey; ctx: IQueryInfos}) => Promise<IApiKey>;
    updateApiKey: (params: {keyData: IApiKey; ctx: IQueryInfos}) => Promise<IApiKey>;
    deleteApiKey: (params: {id: string; ctx: IQueryInfos}) => Promise<IApiKey>;
}

export interface IApiKeyRepoDeps {
    'core.infra.db.dbUtils': IDbUtils;
    'core.infra.db.dbService': IDbService;
}

export default function ({
    'core.infra.db.dbService': dbService,
    'core.infra.db.dbUtils': dbUtils
}: IApiKeyRepoDeps): IApiKeyRepo {
    return {
        async getApiKeys({params, ctx}) {
            const defaultParams: IGetCoreApiKeysParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };

            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<IApiKey>({
                ...initializedParams,
                collectionName: API_KEY_COLLECTION_NAME,
                ctx
            });
        },
        async createApiKey({keyData, ctx}) {
            const docToInsert = dbUtils.convertToDoc(keyData);
            // Insert in libraries collection
            const col = dbService.db.collection(API_KEY_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${col} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(res.pop());
        },
        async updateApiKey({keyData, ctx}) {
            const docToUpdate = dbUtils.convertToDoc(keyData);

            // Insert in libraries collection
            const col = dbService.db.collection(API_KEY_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`UPDATE ${docToUpdate} IN ${col} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(res.pop());
        },
        async deleteApiKey({id, ctx}) {
            const col = dbService.db.collection(API_KEY_COLLECTION_NAME);

            const res = await dbService.execute({
                query: aql`REMOVE ${{_key: id}} IN ${col} RETURN OLD`,
                ctx
            });

            // Return deleted attribute
            return dbUtils.cleanup(res.pop());
        }
    };
}
