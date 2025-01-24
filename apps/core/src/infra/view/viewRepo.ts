// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IViewRepo, IViewRepoDeps, VIEWS_COLLECTION_NAME} from './_types';
import {IView} from '_types/views';

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null
}: IViewRepoDeps): IViewRepo {
    return {
        async updateView(view: IView, ctx: IQueryInfos): Promise<IView> {
            const collec = dbService.db.collection(VIEWS_COLLECTION_NAME);
            const docToInsert = dbUtils.convertToDoc(view);

            const updatedView = await dbService.execute({
                query: aql`
                    UPDATE ${docToInsert} IN ${collec}
                    OPTIONS {mergeObjects: false, keepNull: false}
                    RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(updatedView[0]);
        },
        async createView(view: IView, ctx: IQueryInfos): Promise<IView> {
            const collec = dbService.db.collection(VIEWS_COLLECTION_NAME);
            const docToInsert = dbUtils.convertToDoc(view);

            const newView = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${collec} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(newView[0]);
        },
        async getViews(params: IGetCoreEntitiesParams, ctx: IQueryInfos): Promise<IList<IView>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };
            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<IView>({
                ...initializedParams,
                collectionName: VIEWS_COLLECTION_NAME,
                customFilterConditions: {
                    created_by: (filterKey, filterVal) => aql`el.${filterKey} == ${filterVal} OR el.shared == true`
                },
                ctx
            });
        },
        async deleteView(viewId: string, ctx: IQueryInfos): Promise<IView> {
            const collec = dbService.db.collection(VIEWS_COLLECTION_NAME);

            const deletedView = await dbService.execute({
                query: aql`REMOVE ${{_key: viewId}} IN ${collec} RETURN OLD`,
                ctx
            });

            return dbUtils.cleanup(deletedView[0]);
        }
    };
}
