// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction, IDbPayload} from '@leav/utils';
import {IApiKey} from './apiKey';
import {IApplication} from './application';
import {IAttribute} from './attribute';
import {IGlobalSettings} from './globalSettings';
import {ILibraryDbEvent} from './library';
import {IRecord} from './record';
import {IValue} from './value';
import {IVersionProfile} from './versionProfile';
import {IPermission} from './permissions';
import {ITree} from './tree';

/**
 * Maybe move all DBPayloadData types in @leav/utils type to allow event consumers outside core to use them
 * without having to redeclare them. For now before and after are any in @leav/utils
 */
export interface IDbPayloadInternal<DBPayloadAction extends EventAction> extends IDbPayload {
    action: DBPayloadAction;
    before?: IDBPayloadData<DBPayloadAction>; // Value before the event
    after?: IDBPayloadData<DBPayloadAction>; // Value after the event
}

interface IDBPayloadDataMap {
    [EventAction.VALUE_SAVE]: IValue;
    [EventAction.VALUE_DELETE]: IValue;
    [EventAction.ATTRIBUTE_SAVE]: IAttribute;
    [EventAction.ATTRIBUTE_DELETE]: IAttribute;
    [EventAction.RECORD_SAVE]: IRecord;
    [EventAction.RECORD_DELETE]: IRecord;
    [EventAction.API_KEY_SAVE]: IApiKey;
    [EventAction.API_KEY_DELETE]: IApiKey;
    [EventAction.APP_SAVE]: IApplication;
    [EventAction.APP_DELETE]: IApplication;
    [EventAction.GLOBAL_SETTINGS_SAVE]: IGlobalSettings;
    [EventAction.LIBRARY_SAVE]: ILibraryDbEvent;
    [EventAction.LIBRARY_DELETE]: ILibraryDbEvent;
    [EventAction.VERSION_PROFILE_SAVE]: IVersionProfile;
    [EventAction.VERSION_PROFILE_DELETE]: IVersionProfile;
    [EventAction.TREE_ADD_ELEMENT]: string;
    [EventAction.TREE_DELETE_ELEMENT]: string;
    [EventAction.TREE_MOVE_ELEMENT]: string;
    [EventAction.TREE_SAVE]: ITree;
    [EventAction.TREE_DELETE]: ITree;
    [EventAction.PERMISSION_SAVE]: IPermission;
}

type IDBPayloadData<DBPayloadAction extends EventAction> = DBPayloadAction extends keyof IDBPayloadDataMap
    ? IDBPayloadDataMap[DBPayloadAction]
    : never;
