// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import {type IViewV2Repo, type IViewV2RepoDeps, VIEWS_V2_COLLECTION_NAME} from './_types';
import {type IViewV2} from '../../_types/viewsV2';

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
}: IViewV2RepoDeps): IViewV2Repo {
    return {
        async updateViewV2(view: IViewV2, ctx: IQueryInfos): Promise<IViewV2> {
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
        async createViewV2(view: IViewV2, ctx: IQueryInfos): Promise<IViewV2> {
            const collec = dbService.db.collection(VIEWS_V2_COLLECTION_NAME);
            const docToInsert = dbUtils.convertToDoc(view);

            const newView = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${collec} RETURN NEW`,
                ctx,
            });

            return dbUtils.cleanup(newView[0]);
        },
        async getViewsV2(params: IGetCoreEntitiesParams, ctx: IQueryInfos): Promise<IList<IViewV2>> {
            const defaultParams: IGetCoreEntitiesParams = {
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
