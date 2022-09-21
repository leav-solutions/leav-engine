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
import winston from 'winston';
import {IConfig} from '_types/config';
import {IFileEventData} from '_types/filesManager';
import {IQueryInfos} from '_types/queryInfos';
import {handleEventFileSystem} from '../handleFileSystem';

export interface IMessagesHandlerHelper {
    handleMessage(message: IFileEventData, ctx: IQueryInfos);
}

interface IDeps {
    'core.infra.amqpService'?: IAmqpService;
    'core.utils.logger'?: winston.Winston;
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.infra.record'?: IRecordRepo;
    'core.utils'?: IUtils;
    'core.domain.helpers.updateRecordLastModif'?: UpdateRecordLastModifFunc;
    config?: IConfig;
}

// Handle messages: new messages are stacked in a queue. Then we process them one by one.
// The purpose is to make sure we process message in the same order they are received.
// Otherwise, we may have a situation where we try to add a file to a directory,
// but the directory is not yet created.
export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.utils.logger': logger = null,
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.infra.record': recordRepo = null,
    'core.domain.helpers.updateRecordLastModif': updateRecordLastModif = null,
    'core.utils': utils = null
}: IDeps): IMessagesHandlerHelper {
    const _messagesQueue: IFileEventData[] = [];
    let _isWorking: boolean = false;

    const _processMessage = async (ctx: IQueryInfos): Promise<void> => {
        if (_isWorking || !_messagesQueue.length) {
            return;
        }

        _isWorking = true;

        const message = _messagesQueue.shift();

        try {
            const library = config.filesManager.rootKeys[message.rootKey];
            await handleEventFileSystem(
                message,
                {library},
                {
                    recordDomain,
                    valueDomain,
                    treeDomain,
                    recordRepo,
                    amqpService,
                    updateRecordLastModif,
                    logger,
                    config,
                    utils
                },
                ctx
            );
        } catch (e) {
            console.error(e);
            logger.error(`[FilesManager] Error when processing file event msg:${e.message}. Message was: ${message}`);
        }

        _isWorking = false;
        _processMessage(ctx);
    };

    return {
        handleMessage(message, ctx) {
            _messagesQueue.push(message);

            _processMessage(ctx);
        }
    };
}
