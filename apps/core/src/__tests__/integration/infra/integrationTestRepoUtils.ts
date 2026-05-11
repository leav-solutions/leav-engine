// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs/aql';
import {getCoreDep} from '../integrationTestUtils';
import {type ILibraryRepo} from '../../../infra/library/libraryRepo';
import {type IPermissionRepo} from '../../../infra/permission/permissionRepo';
import {type INotificationRepo} from '../../../infra/notification/notificationRepo';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ITreeRepo} from '../../../infra/tree/treeRepo';
import {type IAutomationRuleRepo} from '../../../infra/automation/automationRuleRepo';
import {type IViewV2Repo} from '../../../infra/viewV2/viewV2Repo';
import {type IDbService} from '../../../infra/db/dbService';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {systemUserId} from '../../../_constants/users';

export const getLibraryRepo = (): ILibraryRepo => getCoreDep<ILibraryRepo>('core.infra.library');

export const getRecordRepo = (): IRecordRepo => getCoreDep<IRecordRepo>('core.infra.record');

export const getTreeRepo = (): ITreeRepo => getCoreDep<ITreeRepo>('core.infra.tree');

export const getPermissionRepo = (): IPermissionRepo => getCoreDep<IPermissionRepo>('core.infra.permission');

export const getNotificationRepo = (): INotificationRepo => getCoreDep<INotificationRepo>('core.infra.notification');

export const getAutomationRuleRepo = (): IAutomationRuleRepo =>
    getCoreDep<IAutomationRuleRepo>('core.infra.automation.rule');

export const getViewV2Repo = (): IViewV2Repo => getCoreDep<IViewV2Repo>('core.infra.viewV2');

export const clearAllCollectionDocuments = async (collectionName: string): Promise<void> => {
    const dbService = getCoreDep<IDbService>('core.infra.db.dbService');
    const collection = dbService.db.collection(collectionName);

    await dbService.execute({
        query: aql`FOR doc IN ${collection} REMOVE doc IN ${collection}`,
        ctx: {userId: systemUserId} as IQueryInfos,
    });
};

export * from '../integrationTestUtils';
