import * as fs from 'fs';
import * as path from 'path';
import {ConsumeMessage} from 'amqplib';
import {processPreview} from '../processPreview/processPreview';
import {IConfig} from '../types/types';

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
                                output
                            }
                        ]
                    }
                ]
            })
        );
        const msg: Mockify<ConsumeMessage> = {
            content
        };

        await processPreview(msg as ConsumeMessage, config);
    }

    console.info((Date.now() - begin) / 1000);
};
