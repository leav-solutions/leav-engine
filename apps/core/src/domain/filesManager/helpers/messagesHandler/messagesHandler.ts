// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILogger} from '@leav/logger';
import {type IConfig} from '_types/config';
import {type IFileEventData} from '_types/filesManager';
import {type IQueryInfos} from '_types/queryInfos';
import {type HandleFileSystemEventFunc} from '../handleFileSystemEvent/_types';

export interface IMessagesHandlerHelper {
    handleMessage(message: IFileEventData, ctx: IQueryInfos);
}

export interface IMessagesHandlerDeps {
    'core.utils.logger': ILogger;
    'core.domain.filesManager.helpers.handleFileSystemEvent': HandleFileSystemEventFunc;
    config: IConfig;
}

// Handle messages: new messages are stacked in a queue. Then we process them one by one.
// The purpose is to make sure we process message in the same order they are received.
// Otherwise, we may have a situation where we try to add a file to a directory,
// but the directory is not yet created.
export default function ({
    'core.utils.logger': logger,
    'core.domain.filesManager.helpers.handleFileSystemEvent': handleFileSystemEvent,
    config,
}: IMessagesHandlerDeps): IMessagesHandlerHelper {
    const _messagesQueue: IFileEventData[] = [];
    let _isWorking = false;

    const _processMessage = async (ctx: IQueryInfos): Promise<void> => {
        if (_isWorking || !_messagesQueue.length) {
            return;
        }

        _isWorking = true;

        const message = _messagesQueue.shift()!;

        try {
            const library = config.filesManager.rootKeys[message.rootKey];
            await handleFileSystemEvent(message, {library}, ctx);
        } catch (e) {
            logger.error(`[FilesManager] Error when processing file event msg: ${e.stack}.`, {msgContent: message});
        }

        _isWorking = false;
        _processMessage(ctx);
    };

    return {
        handleMessage(message, ctx) {
            _messagesQueue.push(message);

            _processMessage(ctx);
        },
    };
}
