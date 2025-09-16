// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAmqpService} from '@leav/message-broker';
import {type UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {type ILibraryDomain} from 'domain/library/libraryDomain';
import {type SendRecordUpdateEventHelper} from 'domain/record/helpers/sendRecordUpdateEvent';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type ITreeDomain} from 'domain/tree/treeDomain';
import {type IValueDomain} from 'domain/value/valueDomain';
import {type IFilesManagerRepo} from 'infra/filesManager/filesManagerRepo';
import {type IRecordRepo} from 'infra/record/recordRepo';
import {type IUtils} from 'utils/utils';
import {type ILogger} from '@leav/logger';
import {type IConfig} from '_types/config';
import {type IFileEventData} from '_types/filesManager';
import {type IQueryInfos} from '_types/queryInfos';

export interface IHandleFileSystemEventDeps {
    libraryDomain: ILibraryDomain;
    recordDomain: IRecordDomain;
    valueDomain: IValueDomain;
    treeDomain: ITreeDomain;
    recordRepo: IRecordRepo;
    amqpService: IAmqpService;
    updateRecordLastModif: UpdateRecordLastModifFunc;
    logger: ILogger;
    config: IConfig;
    utils: IUtils;
    filesManagerRepo: IFilesManagerRepo;
    sendRecordUpdateEvent: SendRecordUpdateEventHelper;
}

export interface IHandleFileSystemEventResources {
    library: string;
}

export type HandleFileSystemEventFunc = (
    scanMsg: IFileEventData,
    resources: IHandleFileSystemEventResources,
    ctx: IQueryInfos
) => Promise<void>;
