// Copyright LEAV Solutions 2017
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
import {IConfig} from '_types/config';
import {FileEvents} from '../../../../_types/filesManager';
import {handleCreateEvent} from './handleCreateEvent';
import {handleMoveEvent} from './handleMoveEvent';
import {handleRemoveEvent} from './handleRemoveEvent';
import {handleUpdateEvent} from './handleUpdateEvent';
import {HandleFileSystemEventFunc, IHandleFileSystemEventDeps} from './_types';
import winston = require('winston');

interface IDeps {
    'core.domain.library'?: ILibraryDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.helpers.updateRecordLastModif'?: UpdateRecordLastModifFunc;
    'core.domain.record.helpers.sendRecordUpdateEvent'?: SendRecordUpdateEventHelper;
    'core.infra.record'?: IRecordRepo;
    'core.infra.amqpService'?: IAmqpService;
    'core.infra.filesManager'?: IFilesManagerRepo;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
    config?: IConfig;
}

export default function (deps: IDeps): HandleFileSystemEventFunc {
    const {
        'core.domain.library': libraryDomain = null,
        'core.domain.record': recordDomain = null,
        'core.domain.value': valueDomain = null,
        'core.domain.tree': treeDomain = null,
        'core.domain.helpers.updateRecordLastModif': updateRecordLastModif = null,
        'core.domain.record.helpers.sendRecordUpdateEvent': sendRecordUpdateEvent = null,
        'core.infra.record': recordRepo = null,
        'core.infra.amqpService': amqpService = null,
        'core.infra.filesManager': filesManagerRepo = null,
        'core.utils.logger': logger = null,
        'core.utils': utils = null,
        config
    } = deps;

    return async (scanMsg, resources, ctx) => {
        const event = scanMsg.event;
        const helperDeps: IHandleFileSystemEventDeps = {
            libraryDomain,
            recordDomain,
            valueDomain,
            treeDomain,
            recordRepo,
            filesManagerRepo,
            amqpService,
            updateRecordLastModif,
            sendRecordUpdateEvent,
            logger,
            config,
            utils
        };

        switch (event) {
            case FileEvents.CREATE:
                await handleCreateEvent(scanMsg, resources, helperDeps, ctx);
                break;
            case FileEvents.REMOVE:
                await handleRemoveEvent(scanMsg, resources, helperDeps, ctx);
                break;
            case FileEvents.UPDATE:
                await handleUpdateEvent(scanMsg, resources, helperDeps, ctx);
                break;
            case FileEvents.MOVE:
                await handleMoveEvent(scanMsg, resources, helperDeps, ctx);
                break;
            default:
                logger.warn(`[FilesManager] Event ${scanMsg.event} - Event not handle`);
        }
    };
}
