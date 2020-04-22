import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import * as Config from '_types/config';
import {IRecord} from '_types/record';
import {IAmqpManager} from '../../../infra/amqpManager/amqpManager';
import {RoutingKeys} from '../../../_types/amqp';
import {
    IFilesAttributes,
    IPreviewResponse,
    IPreviews,
    IPreviewsStatus,
    IPreviewVersion
} from '../../../_types/filesManager';
import {getInputData, getRecord, updateRecordFile} from './handleFileUtilsHelper';
import winston = require('winston');
import {v4 as uuidv4} from 'uuid';
import {IQueryInfos} from '_types/queryInfos';

export interface IHandlePreviewResponseDeps {
    recordDomain: IRecordDomain;
    valueDomain: IValueDomain;
    previewVersions: IPreviewVersion[];
    config: Config.IConfig;
    logger: winston.Winston;
}

const onMessage = async (msg: string, logger: winston.Winston, deps: IHandlePreviewResponseDeps) => {
    let previewResponse: IPreviewResponse;
    const ctx: IQueryInfos = {
        userId: 0,
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

export const _getOriginalRecord = async (
    input: string,
    library: string,
    deps: IHandlePreviewResponseDeps,
    ctx: IQueryInfos
): Promise<IRecord> => {
    const {fileName, filePath} = getInputData(input);

    const {list: recordFind} = await getRecord(
        fileName,
        filePath,
        library,
        false,
        {
            recordDomain: deps.recordDomain,
            config: deps.config,
            logger: deps.logger
        },
        ctx
    );

    return recordFind[0];
};

export const handlePreviewResponse = async (
    amqpManager: IAmqpManager,
    config: Config.IConfig,
    logger: winston.Winston,
    deps: IHandlePreviewResponseDeps
) => {
    await amqpManager.consume(
        config.filesManager.queues.previewResponse,
        RoutingKeys.FILES_PREVIEW_RESPONSE,
        (msg: string) => onMessage(msg, logger, deps)
    );
};
