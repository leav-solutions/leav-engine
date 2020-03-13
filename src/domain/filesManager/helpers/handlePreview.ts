import * as Config from '_types/config';
import {IRecord} from '_types/record';
import {IAmqpManager} from '../../../infra/amqpManager/amqpManager';
import {RoutingKeys} from '../../../_types/amqp';
import {IFileEventData, IPreviewMessage, IPreviewResponseContext, IPreviewVersion} from '../../../_types/filesManager';

export const getPreviewMsg = (
    record: IRecord,
    scanMsg: IFileEventData,
    versions: IPreviewVersion[],
    context: any
): IPreviewMessage | false => {
    const input = scanMsg.pathAfter;

    const firstDigit = record.id.toString().substr(0, 1);
    const secondDigit = record.id.toString().substr(1, 1);

    const output = `${firstDigit}/${secondDigit}/${record.id}`;
    const extension = 'png';
    const multiPageFolderName = 'pages';

    // add output to version
    const versionsWithOutput = versions.map(version => ({
        ...version,
        multiPage: `${multiPageFolderName}/${output}`,
        sizes: version.sizes.map(size => ({...size, output: `${size.name}/${output}.${extension}`}))
    }));

    const previewMsg = {
        input,
        context,
        versions: versionsWithOutput
    };

    return previewMsg;
};

export const createPreview = async (
    record: IRecord,
    scanMsg: IFileEventData,
    library: string,
    versions: IPreviewVersion[],
    amqpManager: IAmqpManager,
    config: Config.IConfig
) => {
    const context: IPreviewResponseContext = {library, recordId: record.id};

    const previewMessage = getPreviewMsg(record, scanMsg, versions, context);

    if (previewMessage) {
        // send preview msg
        await _sendPreviewMessage(previewMessage, amqpManager, config);
    }

    return true;
};

export const _sendPreviewMessage = async (
    previewMessage: IPreviewMessage,
    amqpManager: IAmqpManager,
    config: Config.IConfig
) => {
    const msg = JSON.stringify(previewMessage);
    await amqpManager.publish(RoutingKeys.FILES_PREVIEW_REQUEST, config.filesManager.queues.previewRequest, msg);
};
