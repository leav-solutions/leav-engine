import {type AmqpMessageHandler} from '@leav/message-broker';
import {type IFilesManagerRabbitMQ} from '../../../infra/filesManager/filesManagerRabbitMQ';
import {type UpdateRecordLastModifFunc} from '../../helpers/updateRecordLastModif';
import {type ILibraryDomain} from '../../library/libraryDomain';
import {type SendRecordUpdateEventHelper} from '../../record/helpers/sendRecordUpdateEvent';
import {type IRecordDomain} from '../../record/recordDomain';
import {type IValueDomain} from '../../value/valueDomain';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type IUtils} from '../../../utils/utils';
import type * as Config from '../../../_types/config';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {
    type IFileMetadata,
    type IPreviewResponse,
    type IPreviews,
    type IPreviewsStatus,
} from '../../../_types/filesManager';
import {updateRecordFile} from './handleFileUtilsHelper';
import {type ILogger} from '@leav/logger';

export interface IHandlePreviewResponseDeps {
    filesManagerRabbitMQ: IFilesManagerRabbitMQ;
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
    msg: Parameters<AmqpMessageHandler>[0],
    logger: ILogger,
    ctx: IQueryInfos,
    deps: IHandlePreviewResponseDeps,
) => {
    const previewResponse: IPreviewResponse = JSON.parse(msg.content.toString());

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
    logger: ILogger,
    ctx: IQueryInfos,
    deps: IHandlePreviewResponseDeps,
) => {
    await deps.filesManagerRabbitMQ.consumePreviewResponses(msg => _onMessage(msg, logger, ctx, deps));
};
