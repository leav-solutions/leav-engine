// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getCoreDep} from '../integrationTestUtils';
import {type ILibraryRepo} from 'infra/library/libraryRepo';
import {type IPermissionRepo} from 'infra/permission/permissionRepo';
import {type INotificationRepo} from 'infra/notification/notificationRepo';
import {type IRecordRepo} from 'infra/record/recordRepo';
import {type ITreeRepo} from 'infra/tree/treeRepo';

export const getLibraryRepo = (): ILibraryRepo => getCoreDep<ILibraryRepo>('core.infra.library');

export const getRecordRepo = (): IRecordRepo => getCoreDep<IRecordRepo>('core.infra.record');

export const getTreeRepo = (): ITreeRepo => getCoreDep<ITreeRepo>('core.infra.tree');

export const getPermissionRepo = (): IPermissionRepo => getCoreDep<IPermissionRepo>('core.infra.permission');

export const getNotificationRepo = (): INotificationRepo => getCoreDep<INotificationRepo>('core.infra.notification');

export * from '../integrationTestUtils';
