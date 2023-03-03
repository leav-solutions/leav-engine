// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import winston from 'winston';
import * as Config from '_types/config';
import {IPreviewMessage, IPreviewResponseContext, IPreviewVersion} from '../../../_types/filesManager';

export const sendPreviewMessage = async (
    previewMessage: IPreviewMessage,
    amqpService: IAmqpService,
    config: Config.IConfig
) => {
    const msg = JSON.stringify(previewMessage);
    await amqpService.publish(config.amqp.exchange, config.filesManager.routingKeys.previewRequest, msg);
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

export const requestPreviewGeneration = async (
    recordId: string,
    pathAfter: string,
    libraryId: string,
    versions: IPreviewVersion[],
    amqpService: IAmqpService,
    config: Config.IConfig,
    logger: winston.Winston
): Promise<void> => {
    const context: IPreviewResponseContext = {library: libraryId, recordId};

    const previewMessage = generatePreviewMsg(recordId, pathAfter, versions, context);
    sendPreviewMessage(previewMessage, amqpService, config).catch(function (e) {
        logger.warn(`[FilesManager] error sending prevew request ${e.message}`);
    });
};
