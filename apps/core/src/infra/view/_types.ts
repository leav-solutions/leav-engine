// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {IList} from '_types/list';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IQueryInfos} from '../../_types/queryInfos';

export const VIEWS_COLLECTION_NAME = 'core_views';

export interface IViewRepo {
    createView(view: IView, ctx: IQueryInfos): Promise<IView>;
    updateView(view: IView, ctx: IQueryInfos): Promise<IView>;
    getViews(params: IGetCoreEntitiesParams, ctx: IQueryInfos): Promise<IList<IView>>;
    deleteView(viewId: string, ctx: IQueryInfos): Promise<IView>;
}

export interface IViewRepoDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.db.dbUtils': IDbUtils;
}
