// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import * as amqp from 'amqplib';
import {UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {SendRecordUpdateEventHelper} from 'domain/record/helpers/sendRecordUpdateEvent';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IFileMetadata, IPreviewResponse, IPreviews, IPreviewsStatus} from '../../../_types/filesManager';
import {updateRecordFile} from './handleFileUtilsHelper';
import winston = require('winston');

export interface IHandlePreviewResponseDeps {
    amqpService: IAmqpService;
    libraryDomain: ILibraryDomain;
    recordDomain: IRecordDomain;
    valueDomain: IValueDomain;
    recordRepo: IRecordRepo;
    updateRecordLastModif: UpdateRecordLastModifFunc;
    sendRecordUpdateEvent: SendRecordUpdateEventHelper;
    config: Config.IConfig;
    logger: winston.Winston;
    utils: IUtils;
}

const _onMessage = async (msg: amqp.ConsumeMessage, logger: winston.Winston, deps: IHandlePreviewResponseDeps) => {
    deps.amqpService.consumer.channel.ack(msg);

    let previewResponse: IPreviewResponse;
    const ctx: IQueryInfos = {
        userId: deps.config.filesManager.userId,
        queryId: uuidv4()
    };
    try {
        previewResponse = JSON.parse(msg.content.toString());
    } catch (e) {
        logger.error(
            `[FilesManager] Preview return invalid message:
            ${e.message}.
            Message was: ${msg}'
            `
        );
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
                message: previewResult.error_detail
            };

            previews[name] = previewResult.params.output;
        } else {
            const versions = deps.utils.previewsSettingsToVersions(libraryProps.previewsSettings);
            for (const version in versions) {
                if (previewResponse[version]) {
                    previewsStatus[version] = {
                        status: previewResult.error,
                        message: previewResult.error_detail
                    };
                }
            }
        }
    }

    const recordData: IFileMetadata = {
        [deps.utils.getPreviewsStatusAttributeName(library)]: previewsStatus,
        [deps.utils.getPreviewsAttributeName(library)]: previews
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
            logger: deps.logger
        },
        ctx
    );
};

export const initPreviewResponseHandler = async (
    config: Config.IConfig,
    logger: winston.Winston,
    deps: IHandlePreviewResponseDeps
) => {
    await deps.amqpService.consumer.channel.assertQueue(config.filesManager.queues.previewResponse);
    await deps.amqpService.consumer.channel.bindQueue(
        config.filesManager.queues.previewResponse,
        config.amqp.exchange,
        config.filesManager.routingKeys.previewResponse
    );

    await deps.amqpService.consume(
        config.filesManager.queues.previewResponse,
        config.filesManager.routingKeys.previewResponse,
        (msg: amqp.ConsumeMessage) => _onMessage(msg, logger, deps)
    );
};
