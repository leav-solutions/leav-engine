// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAmqpService} from '@leav/message-broker';
import type * as amqp from 'amqplib';
import {type UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {type ILibraryDomain} from 'domain/library/libraryDomain';
import {type SendRecordUpdateEventHelper} from 'domain/record/helpers/sendRecordUpdateEvent';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type IValueDomain} from 'domain/value/valueDomain';
import {type IRecordRepo} from 'infra/record/recordRepo';
import {type IUtils} from 'utils/utils';
import type * as Config from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
import {
    type IFileMetadata,
    type IPreviewResponse,
    type IPreviews,
    type IPreviewsStatus,
} from '../../../_types/filesManager';
import {updateRecordFile} from './handleFileUtilsHelper';
import {type ILogger} from '@leav/logger';

export interface IHandlePreviewResponseDeps {
    amqpService: IAmqpService;
    libraryDomain: ILibraryDomain;
    recordDomain: IRecordDomain;
    valueDomain: IValueDomain;
    recordRepo: IRecordRepo;
    updateRecordLastModif: UpdateRecordLastModifFunc;
    sendRecordUpdateEvent: SendRecordUpdateEventHelper;
    config: Config.IConfig;
    logger: ILogger;
    utils: IUtils;
}

const _onMessage = async (
    msg: amqp.ConsumeMessage,
    logger: ILogger,
    ctx: IQueryInfos,
    deps: IHandlePreviewResponseDeps,
) => {
    deps.amqpService.consumer.channel.ack(msg);

    let previewResponse: IPreviewResponse;

    try {
        previewResponse = JSON.parse(msg.content.toString());
    } catch (e) {
        logger.error(`[FilesManager] Preview return invalid message: ${e.stack}`, {msg});
        return;
    }

    const {library, recordId} = previewResponse.context;
    const libraryProps = await deps.libraryDomain.getLibraryProperties(library, ctx);

    // Update previews info in the record
    const previewsStatus: IPreviewsStatus = {};
    const previews: IPreviews = {};

    for (const previewResult of previewResponse.results) {
        // if possible take name from response
        if (previewResult.params && previewResult.params.name) {
            const name = previewResult.params.name;
            previewsStatus[name] = {
                status: previewResult.error,
                message: previewResult.error_detail,
            };

            previews[name] = previewResult.params.output;
        } else {
            const versions = deps.utils.previewsSettingsToVersions(libraryProps.previewsSettings);
            for (const version in versions) {
                if (previewResponse[version]) {
                    previewsStatus[version] = {
                        status: previewResult.error,
                        message: previewResult.error_detail,
                    };
                }
            }
        }
    }

    const recordData: IFileMetadata = {
        [deps.utils.getPreviewsStatusAttributeName(library)]: previewsStatus,
        [deps.utils.getPreviewsAttributeName(library)]: previews,
    };

    await updateRecordFile(
        recordData,
        recordId,
        library,
        {
            valueDomain: deps.valueDomain,
            recordRepo: deps.recordRepo,
            updateRecordLastModif: deps.updateRecordLastModif,
            sendRecordUpdateEvent: deps.sendRecordUpdateEvent,
            config: deps.config,
            logger: deps.logger,
        },
        ctx,
    );
};

export const initPreviewResponseHandler = async (
    config: Config.IConfig,
    logger: ILogger,
    ctx: IQueryInfos,
    deps: IHandlePreviewResponseDeps,
) => {
    await deps.amqpService.consumer.channel.assertQueue(config.filesManager.queues.previewResponse);
    await deps.amqpService.consumer.channel.bindQueue(
        config.filesManager.queues.previewResponse,
        config.amqp.exchange,
        config.filesManager.routingKeys.previewResponse,
    );

    await deps.amqpService.consume(
        config.filesManager.queues.previewResponse,
        config.filesManager.routingKeys.previewResponse,
        (msg: amqp.ConsumeMessage) => _onMessage(msg, logger, ctx, deps),
    );
};
