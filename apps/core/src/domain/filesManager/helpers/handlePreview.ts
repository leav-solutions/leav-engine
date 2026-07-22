import {PreviewPriority} from '@leav/utils';
import {type ILogger} from '@leav/logger';
import {type IFilesManagerRabbitMQ} from '../../../infra/filesManager/filesManagerRabbitMQ';
import {type IPreviewMessage, type IPreviewResponseContext, type IPreviewVersion} from '../../../_types/filesManager';

export const sendPreviewMessage = async (
    previewMessage: IPreviewMessage,
    priority: PreviewPriority,
    deps: {filesManagerRabbitMQ: IFilesManagerRabbitMQ},
) => {
    const msg = JSON.stringify(previewMessage);
    await deps.filesManagerRabbitMQ.publishPreviewRequest(msg, priority);
};

export const generatePreviewMsg = (
    recordId: string,
    pathAfter: string,
    versions: IPreviewVersion[],
    context: any,
): IPreviewMessage => {
    const input = pathAfter;

    const recordIdAsString = recordId.toString();
    const [firstDigit, secondDigit] = [...recordIdAsString];

    const output = `${firstDigit}/${secondDigit}/${recordId}`;
    const extension = 'png';
    const pdfFolderName = 'pdf';

    // add output to version
    const versionsWithOutput = versions.map(version => ({
        ...version,
        pdf: `${pdfFolderName}/${output}.pdf`,
        sizes: version.sizes.map(size => ({...size, output: `${size.name}/${output}.${extension}`})),
    }));

    const previewMsg = {
        input,
        context,
        versions: versionsWithOutput,
    };

    return previewMsg;
};

export const requestPreviewGeneration = async ({
    recordId,
    pathAfter,
    libraryId,
    versions,
    priority = PreviewPriority.LOW,
    deps,
}: {
    recordId: string;
    pathAfter: string;
    libraryId: string;
    versions: IPreviewVersion[];
    priority?: PreviewPriority;
    deps: {logger: ILogger; filesManagerRabbitMQ: IFilesManagerRabbitMQ};
}): Promise<void> => {
    const context: IPreviewResponseContext = {library: libraryId, recordId};

    const previewMessage = generatePreviewMsg(recordId, pathAfter, versions, context);
    sendPreviewMessage(previewMessage, priority, {...deps}).catch(function (e) {
        deps.logger.warn(`[FilesManager] error sending prevew request ${e.message}`);
    });
};
