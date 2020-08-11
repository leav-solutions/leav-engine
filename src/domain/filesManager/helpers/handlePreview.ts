import * as Config from '_types/config';
import {IRecord} from '_types/record';
import {IAmqpService} from '../../../infra/amqp/amqpService';
import {IFileEventData, IPreviewMessage, IPreviewResponseContext, IPreviewVersion} from '../../../_types/filesManager';

export const _sendPreviewMessage = async (
    previewMessage: IPreviewMessage,
    amqpService: IAmqpService,
    config: Config.IConfig
) => {
    const msg = JSON.stringify(previewMessage);
    await amqpService.publish(config.filesManager.routingKeys.previewRequest, msg);
};

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
    amqpService: IAmqpService,
    config: Config.IConfig
): Promise<void> => {
    const context: IPreviewResponseContext = {library, recordId: record.id};

    const previewMessage = getPreviewMsg(record, scanMsg, versions, context);

    if (previewMessage) {
        // send preview msg
        await _sendPreviewMessage(previewMessage, amqpService, config);
    }
};
