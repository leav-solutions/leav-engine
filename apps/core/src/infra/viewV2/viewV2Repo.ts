// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import {type IViewV2} from '../../_types/viewsV2';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';

export const VIEWS_V2_COLLECTION_NAME = 'core_views_v2';

export type IViewV2FilterOptionsInRepo = ICoreEntityFilterOptions & {
    created_by?: string;
    library?: string;
};

export type IGetViewV2Params = IGetCoreEntitiesParams & {
    filters?: IViewV2FilterOptionsInRepo;
};

/**
 * Repo create payload: full stored entity minus `id` (ArangoDB will generate the `_key`).
 * `id` stays optional for callers that need a deterministic key (tests, seeding).
 */
export type IViewV2CreateInRepo = Omit<IViewV2, 'id'> & {id?: string};

/**
 * Repo update payload: `id` and `modified_at` are mandatory; every other field is optional
 * and only the provided ones are persisted (UPDATE with `keepNull: false`).
 */
export type IViewV2UpdateInRepo = {id: string; modified_at: number} & Partial<Omit<IViewV2, 'id' | 'modified_at'>>;

export interface IViewV2Repo {
    createViewV2(view: IViewV2CreateInRepo, ctx: IQueryInfos): Promise<IViewV2>;
    updateViewV2(view: IViewV2UpdateInRepo, ctx: IQueryInfos): Promise<IViewV2>;
    getViewsV2(params: IGetViewV2Params, ctx: IQueryInfos): Promise<IList<IViewV2>>;
    deleteViewV2(viewId: string, ctx: IQueryInfos): Promise<IViewV2>;
}

export interface IViewV2RepoDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.db.dbUtils': IDbUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
}: IViewV2RepoDeps): IViewV2Repo {
    return {
        async createViewV2(view: IViewV2CreateInRepo, ctx: IQueryInfos): Promise<IViewV2> {
            const collec = dbService.db.collection(VIEWS_V2_COLLECTION_NAME);
            const docToInsert = dbUtils.convertToDoc(view);

            const newView = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${collec} RETURN NEW`,
                ctx,
            });

            return dbUtils.cleanup(newView[0]);
        },
        async updateViewV2(view: IViewV2UpdateInRepo, ctx: IQueryInfos): Promise<IViewV2> {
            const collec = dbService.db.collection(VIEWS_V2_COLLECTION_NAME);
            const docToInsert = dbUtils.convertToDoc(view);

            const updatedView = await dbService.execute({
                query: aql`
                    UPDATE ${docToInsert} IN ${collec}
                    OPTIONS {mergeObjects: false, keepNull: false}
                    RETURN NEW`,
                ctx,
            });

            return dbUtils.cleanup(updatedView[0]);
        },
        async getViewsV2(params: IGetViewV2Params, ctx: IQueryInfos): Promise<IList<IViewV2>> {
            const defaultParams: IGetViewV2Params = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null,
            };
            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<IViewV2>({
                ...initializedParams,
                collectionName: VIEWS_V2_COLLECTION_NAME,
                customFilterConditions: {
                    created_by: (filterKey, filterVal) => aql`el.${filterKey} == ${filterVal} OR el.shared == true`,
                },
                ctx,
            });
        },
        async deleteViewV2(viewId: string, ctx: IQueryInfos): Promise<IViewV2> {
            const collec = dbService.db.collection(VIEWS_V2_COLLECTION_NAME);

            const deletedView = await dbService.execute({
                query: aql`REMOVE ${{_key: viewId}} IN ${collec} RETURN OLD`,
                ctx,
            });

            return dbUtils.cleanup(deletedView[0]);
        },
    };
}
