import * as fs from 'fs';
import * as path from 'path';
import {type IAmqpMessage} from '@leav/message-broker';
import {processPreview} from '../processPreview/processPreview';
import {type IConfig} from '../types/types';
import {logger} from '@leav/logger';

export const startBench = async (jsonFile: string, dest: string, config: IConfig) => {
    const data: string = fs.readFileSync(jsonFile, 'utf8');
    const files: string[] = JSON.parse(data);

    const begin = Date.now();

    for (const file of files) {
        const output = path.join(dest, path.basename(file) + '.png');

        const content = Buffer.from(
            JSON.stringify({
                input: file,
                versions: [
                    {
                        sizes: [
                            {
                                size: 400,
                                output,
                            },
                        ],
                    },
                ],
            }),
        );
        await processPreview({content} as IAmqpMessage, config);
    }

    logger.info(`Time elapsed: ${(Date.now() - begin) / 1_000}`);
};
