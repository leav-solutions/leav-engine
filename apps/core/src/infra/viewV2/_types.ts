// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {type IList} from '../../_types/list';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IViewV2} from '../../_types/viewsV2';

export const VIEWS_V2_COLLECTION_NAME = 'core_views_v2';

export interface IViewV2Repo {
    createViewV2(view: IViewV2, ctx: IQueryInfos): Promise<IViewV2>;
    updateViewV2(view: IViewV2, ctx: IQueryInfos): Promise<IViewV2>;
    getViewsV2(params: IGetCoreEntitiesParams, ctx: IQueryInfos): Promise<IList<IViewV2>>;
    deleteViewV2(viewId: string, ctx: IQueryInfos): Promise<IViewV2>;
}

export interface IViewV2RepoDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.db.dbUtils': IDbUtils;
}
