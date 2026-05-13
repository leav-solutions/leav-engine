import {type IAmqpService} from '@leav/message-broker';
import {type UpdateRecordLastModifFunc} from '../../../helpers/updateRecordLastModif';
import {type ILibraryDomain} from '../../../library/libraryDomain';
import {type SendRecordUpdateEventHelper} from '../../../record/helpers/sendRecordUpdateEvent';
import {type IRecordDomain} from '../../../record/recordDomain';
import {type ITreeDomain} from '../../../tree/treeDomain';
import {type IValueDomain} from '../../../value/valueDomain';
import {type IFilesManagerRepo} from '../../../../infra/filesManager/filesManagerRepo';
import {type IRecordRepo} from '../../../../infra/record/recordRepo';
import {type IUtils} from '../../../../utils/utils';
import {type IConfig} from '../../../../_types/config';
import {FileEvents} from '../../../../_types/filesManager';
import {handleCreateEvent} from './handleCreateEvent';
import {handleMoveEvent} from './handleMoveEvent';
import {handleRemoveEvent} from './handleRemoveEvent';
import {handleUpdateEvent} from './handleUpdateEvent';
import {type HandleFileSystemEventFunc, type IHandleFileSystemEventDeps} from './_types';
import {type ILogger} from '@leav/logger';

export interface IFileSystemEventDeps {
    'core.domain.library': ILibraryDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.value': IValueDomain;
    'core.domain.tree': ITreeDomain;
    'core.domain.helpers.updateRecordLastModif': UpdateRecordLastModifFunc;
    'core.domain.record.helpers.sendRecordUpdateEvent': SendRecordUpdateEventHelper;
    'core.infra.record': IRecordRepo;
    'core.infra.amqpService': IAmqpService;
    'core.infra.filesManager': IFilesManagerRepo;
    'core.utils.logger': ILogger;
    'core.utils': IUtils;
    config: IConfig;
}

export default function (deps: IFileSystemEventDeps): HandleFileSystemEventFunc {
    const {
        'core.domain.library': libraryDomain,
        'core.domain.record': recordDomain,
        'core.domain.value': valueDomain,
        'core.domain.tree': treeDomain,
        'core.domain.helpers.updateRecordLastModif': updateRecordLastModif,
        'core.domain.record.helpers.sendRecordUpdateEvent': sendRecordUpdateEvent,
        'core.infra.record': recordRepo,
        'core.infra.amqpService': amqpService,
        'core.infra.filesManager': filesManagerRepo,
        'core.utils.logger': logger,
        'core.utils': utils,
        config,
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
            utils,
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
