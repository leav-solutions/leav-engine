import {handleCheck} from './../check/handleCheck';
import {IConfig} from '../types/types';
import {ConsumeMessage} from 'amqplib';
import {processPreview} from './processPreview';

describe('processPreview', () => {
    const content = {
        input: 'test.jpg',
        context: 'context',
        versions: [
            {
                sizes: [
                    {
                        size: 800,
                        output: 'test.png',
                    },
                ],
            },
        ],
    };

    const msg = {
        content: Buffer.from(JSON.stringify(content)),
    };

    const config = {
        inputRootPath: '/app',
        outputRootPath: '/app',
    };

    test('process preview', async () => {
        (handleCheck as jest.FunctionLike) = global.__mockPromise();

        await processPreview(msg as ConsumeMessage, config as IConfig);

        expect(handleCheck).toBeCalledWith(JSON.parse(msg.content.toString()), config);
    });
});
