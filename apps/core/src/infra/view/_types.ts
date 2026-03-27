// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {type IList} from '../../_types/list';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IView} from '../../_types/views';

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
