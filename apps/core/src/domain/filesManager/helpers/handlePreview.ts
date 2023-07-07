// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {PreviewPriority} from '@leav/utils';
import * as Config from '_types/config';
import {IPreviewMessage, IPreviewResponseContext, IPreviewVersion} from '../../../_types/filesManager';

export const sendPreviewMessage = async (
    previewMessage: IPreviewMessage,
    priority: PreviewPriority,
    deps: {amqpService: IAmqpService; config: Config.IConfig}
) => {
    const msg = JSON.stringify(previewMessage);
    await deps.amqpService.publish(
        deps.config.amqp.exchange,
        deps.config.filesManager.routingKeys.previewRequest,
        msg,
        priority
    );
};

export const generatePreviewMsg = (
    recordId: string,
    pathAfter: string,
    versions: IPreviewVersion[],
    context: any
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
        sizes: version.sizes.map(size => ({...size, output: `${size.name}/${output}.${extension}`}))
    }));

    const previewMsg = {
        input,
        context,
        versions: versionsWithOutput
    };

    return previewMsg;
};

export const requestPreviewGeneration = async ({
    recordId,
    pathAfter,
    libraryId,
    versions,
    priority = PreviewPriority.LOW,
    deps
}): Promise<void> => {
    const context: IPreviewResponseContext = {library: libraryId, recordId};

    const previewMessage = generatePreviewMsg(recordId, pathAfter, versions, context);
    sendPreviewMessage(previewMessage, priority, {...deps}).catch(function (e) {
        deps.logger.warn(`[FilesManager] error sending prevew request ${e.message}`);
    });
};
