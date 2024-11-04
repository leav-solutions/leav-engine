// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {SendRecordUpdateEventHelper} from 'domain/record/helpers/sendRecordUpdateEvent';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IFilesManagerRepo} from 'infra/filesManager/filesManagerRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IFileEventData} from '_types/filesManager';
import {IQueryInfos} from '_types/queryInfos';

export interface IHandleFileSystemEventDeps {
    libraryDomain: ILibraryDomain;
    recordDomain: IRecordDomain;
    valueDomain: IValueDomain;
    treeDomain: ITreeDomain;
    recordRepo: IRecordRepo;
    amqpService: IAmqpService;
    updateRecordLastModif: UpdateRecordLastModifFunc;
    logger: winston.Winston;
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
