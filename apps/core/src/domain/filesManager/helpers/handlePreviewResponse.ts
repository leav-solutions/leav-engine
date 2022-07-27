// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {v4 as uuidv4} from 'uuid';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {
    IFilesAttributes,
    IPreviewResponse,
    IPreviews,
    IPreviewsStatus,
    IPreviewVersion
} from '../../../_types/filesManager';
import {updateRecordFile} from './handleFileUtilsHelper';
import winston = require('winston');

export interface IHandlePreviewResponseDeps {
    amqpService: IAmqpService;
    recordDomain: IRecordDomain;
    valueDomain: IValueDomain;
    previewVersions: IPreviewVersion[];
    config: Config.IConfig;
    logger: winston.Winston;
}

const _onMessage = async (msg: string, logger: winston.Winston, deps: IHandlePreviewResponseDeps) => {
    let previewResponse: IPreviewResponse;
    const ctx: IQueryInfos = {
        userId: deps.config.filesManager.userId,
        queryId: uuidv4()
    };
    try {
        previewResponse = JSON.parse(msg);
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
            // use systemPreviewVersions

            // else take it from the record
            for (const version in deps.previewVersions) {
                if (previewResponse[version]) {
                    previewsStatus[version] = {
                        status: previewResult.error,
                        message: previewResult.error_detail
                    };
                }
            }
        }
    }

    const recordData: IFilesAttributes = {
        PREVIEWS_STATUS: previewsStatus,
        PREVIEWS: previews
    };

    await updateRecordFile(
        recordData,
        recordId,
        library,
        {
            valueDomain: deps.valueDomain,
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
        (msg: string) => _onMessage(msg, logger, deps)
    );
};
