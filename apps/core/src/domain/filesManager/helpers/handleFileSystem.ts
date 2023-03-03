// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {FileEvents, IFileEventData} from '../../../_types/filesManager';
import {handleCreateEvent} from './handleFileSystem/handleCreateEvent';
import {handleMoveEvent} from './handleFileSystem/handleMoveEvent';
import {handleRemoveEvent} from './handleFileSystem/handleRemoveEvent';
import {handleUpdateEvent} from './handleFileSystem/handleUpdateEvent';
import winston = require('winston');
import {IFilesManagerRepo} from 'infra/filesManager/filesManagerRepo';

export interface IHandleFileSystemDeps {
    recordDomain: IRecordDomain;
    valueDomain: IValueDomain;
    treeDomain: ITreeDomain;
    recordRepo: IRecordRepo;
    amqpService: IAmqpService;
    updateRecordLastModif: UpdateRecordLastModifFunc;
    logger: winston.Winston;
    config: Config.IConfig;
    utils: IUtils;
    filesManagerRepo: IFilesManagerRepo;
}

export interface IHandleFileSystemResources {
    library: string;
}

export const handleEventFileSystem = async (
    scanMsg: IFileEventData,
    resources: IHandleFileSystemResources,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
    const event = scanMsg.event;
    switch (event) {
        case FileEvents.CREATE:
            await handleCreateEvent(scanMsg, resources, deps, ctx);
            break;
        case FileEvents.REMOVE:
            await handleRemoveEvent(scanMsg, resources, deps, ctx);
            break;
        case FileEvents.UPDATE:
            await handleUpdateEvent(scanMsg, resources, deps, ctx);
            break;
        case FileEvents.MOVE:
            await handleMoveEvent(scanMsg, resources, deps, ctx);
            break;
        default:
            deps.logger.warn(`[FilesManager] Event ${scanMsg.event} - Event not handle`);
    }
};
